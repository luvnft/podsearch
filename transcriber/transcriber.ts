import * as fs from "fs";
import { Episode, PrismaClient, Segment, Transcription } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { config } from "dotenv";

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Establish connection
const prisma: PrismaClient = new PrismaClient();

interface JsonTranscriptionObject {
  segments: TranscriptionSegmentType[];
  belongsToPodcastGuid: string;
  belongsToEpisodeGuid: string;
  text: string;
  language: string;
  isYoutube: boolean;
}

interface TranscriptionSegmentType {
  start: number;
  end: number;
  text: string;
  words: TranscriptionWordType[];
}

interface TranscriptionWordType {
  word: string;
  start: number;
  end: number;
  score: number;
}

async function retryOnConflict(fn: any, maxRetries = 3, delay = 1000) {
  let retries = maxRetries;
  let lastError;

  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      retries--;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw lastError; // If all retries exhausted, throw the last encountered error
}

async function getEpisodeWithLock(): Promise<Episode | null> {
  try {
    // Begin transcription
    return await prisma.$transaction(async (prisma) => {
      // AudioEpisode first check
      const audioEpisodes: Episode[] = await prisma.$queryRaw`
        SELECT *
        FROM Episode
        WHERE audioProcessed = false AND errorCount < 3
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;
      // Return if available audio.
      if (audioEpisodes.length > 0) {
        const episodeId = audioEpisodes[0].id;
        console.log("EpisodeID:", episodeId);
        await prisma.$executeRaw`
          UPDATE Episode
          SET audioProcessed = true
          WHERE id = ${episodeId};
        `;
        const updatedEpisode: Episode[] = await prisma.$queryRaw`
          SELECT * FROM Episode WHERE id = ${episodeId};
        `;
        console.log("Returned updatedEpisode: ", updatedEpisode);
        return updatedEpisode[0] || null;
      }

      // YoutubeEpisode second check
      const youtubeEpisodes: Episode[] = await prisma.$queryRaw`
        SELECT *
        FROM Episode
        WHERE youtubeProcessed = false AND errorCount < 1
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      // Return if available youtube.
      if (youtubeEpisodes.length > 0) {
        const episodeId = youtubeEpisodes[0].id;
        console.log("EpisodeID:", episodeId);
        await prisma.$executeRaw`
          UPDATE Episode
          SET youtubeProcessed = true
          WHERE id = ${episodeId};
        `;
        const updatedEpisode: Episode[] = await prisma.$queryRaw`
          SELECT * FROM Episode WHERE id = ${episodeId};
        `;
        console.log("Returned updatedEpisode: ", updatedEpisode);
        return updatedEpisode[0] || null;
      }

      // Return null if nothing
      return null;
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}

function mergeStrangeSegmentsAndCreateNewSegments(segments: TranscriptionWordType[]) {
  if (segments.length === 0) return [];

  const merged: TranscriptionWordType[] = [];
  let tempText: string = ""; // Temporary storage for text of segments without start and end

  // We are looping over all the words
  for (let i = 0; i < segments.length; i++) {
    // Setting the currentSegment to the one we are looping over
    const currentSegment: TranscriptionWordType = segments[i];

    // Strange situation where start value is undefined lol:
    if (i === 0 && currentSegment.start === undefined) currentSegment.start = 0; // Dont blame me, blame whisperx and the dev of that repo

    // If the currentSegment doesnt have the start and end values
    if (currentSegment.start === undefined && currentSegment.end === undefined) {
      // Then we add the textvalue of that segment which is always present to the tempText.
      // If the tempText is '' (falsy) then we just set the text to the value
      // If the tempText is truthy then we set tempText to the tempText with the space and the new text and continue
      tempText = tempText ? `${tempText} ${currentSegment.word}` : currentSegment.word;
    }
    // If the currentSegment does have start and end value then we are here
    else {
      // We check if tempText is defined, because if it is then we want to add the tempText to the text of that segment which has the start and end values
      // And we reset the tempText and then we add it to the merged array
      if (tempText) {
        currentSegment.word = `${tempText} ${currentSegment.word}`;
        tempText = "";
      }
      // Here we add it do the merged array
      // If the tempText is '' falsy then this will still work because the point of tempText is to place tempText as part of the segment which has the start and end values
      merged.push(currentSegment);
    }
    // Everything in this loop essentially makes it so tempText is saved up and then saved to the next segment which has start and end value
    // It doesn't really matter if it's before or after.
    // If the start and end value are present then we just add the segment really
    // If the start and end values are not prersent then we just add the text to the tempText and we keep saving that text till we find a currentSegment which has start and end value and then we add that text to that segment and save the segment
    // If it happens that we never find a segment which has start and end values then the tempText will be large
    // In that case we will add the tempText to the last merged segment will either be the first one (if that is the one which has start and end), or it will be an empty array
  }

  // On some occasions we will reach a point where all the upcoming segments dont have start and end value and in that case the tempText will be truthy as we havent been able to add it to the lastSegmentHit before we finished looping
  // In that case we add the tempText to the lastElement of the merge
  // If there are remaining segments without start and end after processing all segments
  if (tempText && merged.length > 0) {
    const lastMergedSegment = merged[merged.length - 1];
    lastMergedSegment.word = lastMergedSegment.word + " " + tempText;
  }

  console.log("Returning merged: ", merged.length);
  return merged;
}

async function insertJsonFilesToDb() {
  try {
    console.log("Checking if any new jsons have been added");

    const files = fs.readdirSync("./");

    // Looping over all the files inside the ".jsons folder which is inside the ../transcriber "
    for await (const filename of files) {
      //If file is not .json continue
      if (!filename.endsWith(".json") || filename.startsWith(".")) {
        continue;
      }

      // Starting processing json
      console.log("Processing data from filename", filename);
      const fileContent = fs.readFileSync(filename, "utf-8");
      const data: JsonTranscriptionObject = JSON.parse(fileContent) as JsonTranscriptionObject;

      // Extract data
      const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid, isYoutube }: JsonTranscriptionObject = data;

      console.log("Getting EpisodeGuid from DB: ", belongsToEpisodeGuid);
      const episode: Episode | null = await prisma.episode.findUnique({
        where: { episodeGuid: belongsToEpisodeGuid },
      });

      if (episode === null) continue;

      // Add the transcription
      console.log("==>👑Adding transcription to DB");
      const transcriptionData = await prisma.transcription.upsert({
        create: {
          language,
          belongsToPodcastGuid,
          belongsToEpisodeGuid,
          transcription,
        },
        where: {
          belongsToEpisodeGuid: episode.episodeGuid,
        },
        update: {
          language,
          belongsToPodcastGuid,
          belongsToEpisodeGuid,
          transcription,
        },
      });

      const transcriptionId = transcriptionData.id;

      // Prepare segments data for insertionsegment
      let words: TranscriptionWordType[] = [];
      const lengthOfSegments: number = segments.length;
      const newSegments: Segment[] = [];
      const MAX_CHARS: number = 38;

      // We loop over all the segments and gather all the words
      for (let i = 0; i < lengthOfSegments; i++) {
        const segment: TranscriptionSegmentType = segments[i];
        words.push(...segment.words);
      }

      // Filtered words
      console.log("Length of words: ", words.length);

      // The words are already sorted in ascending order based on timestamp
      // Due to whisperx not being able to align numbers, special characters and such we have to merge these words which lack the start and end attribute with some previous word
      const newWords: TranscriptionWordType[] = mergeStrangeSegmentsAndCreateNewSegments(words);
      console.log("New words are: ", newWords.length);

      // Now we create the segments
      let word: TranscriptionWordType | undefined = undefined;
      let concatenatedWord: string = "";
      let startTime: number = words[0].start;
      let endTime: number = words[0].end;

      // Num of words
      const numberOfWords: number = newWords.length;

      for (let j = 0; j < numberOfWords; j++) {
        word = newWords[j];

        if (concatenatedWord.length + word.word.length <= MAX_CHARS) {
          concatenatedWord = concatenatedWord + " " + word.word;
          endTime = word.end;
        } else {
          const segment: Segment = {
            start: startTime,
            end: endTime,
            language: language,
            belongsToPodcastGuid: belongsToPodcastGuid,
            belongsToEpisodeGuid: belongsToEpisodeGuid,
            belongsToTranscriptId: transcriptionId,
            text: concatenatedWord,
            createdAt: null,
            id: uuidv4(),
            indexed: false,
            updatedAt: null,
            isYoutube: isYoutube,
          };

          newSegments.push(segment);
          startTime = word.end;
          concatenatedWord = word.word;
          endTime = word.end;
        }
      }

      // Dealing with leftovers
      if (word && concatenatedWord) {
        const segment: Segment = {
          start: startTime,
          end: word.end,
          language: language,
          belongsToPodcastGuid: belongsToPodcastGuid,
          belongsToEpisodeGuid: belongsToEpisodeGuid,
          belongsToTranscriptId: transcriptionId,
          text: concatenatedWord,
          createdAt: null,
          id: uuidv4(),
          indexed: false,
          updatedAt: null,
          isYoutube: isYoutube,
        };
        newSegments.push(segment);
      }

      // Insert segments using createMany
      console.log(`==>👑Adding ${newSegments.length} segments to DB`);

      await retryOnConflict(async () => {
        await prisma.segment.createMany({
          data: newSegments,
          skipDuplicates: true,
        });
      });

      // Rename the file after it has been inserted into the database successfully
      const newFilename = path.join(path.dirname(filename), new Date().getTime() + "_deleted");
      fs.renameSync(filename, newFilename);
    }
  } catch (e) {
    console.log("Error: ", e);
  }
}

const transcribe = async () => {
  // Grab an episode that has transcribedValue = false
  // Lock the row such that no other scripts can grab it.
  while (true) {
    const episode: Episode | null = await getEpisodeWithLock();

    console.log("Received episode: ", episode);

    // Is episode undefined
    if (!episode) {
      console.log("No episode found for transcription. Ending.");
      break;
    }

    // Call the Python script and pass the necessary arguments
    try {
      console.log("Going to transcribe: ", episode.episodeTitle);
      await callPythonTranscribeAPI(episode);
      console.log("<  ==  > Transcription completed and JSON saved <  ==  > ");
      // await insertJsonFilesToDb();
      console.log("Finished adding the json to the db. Running again:");
    } catch (e) {
      console.log(e);
      await prisma.episode.update({
        where: {
          episodeGuid: episode.episodeGuid,
        },
        data: {
          errorCount: { increment: 1 }, // assuming errorCount is a field you want to increment
          // This increment is important because we could face the scenario where lets say 3 machines are transcribing. First machine grabs an episode to transcribe it, and fails doing so for whatever reason, then another machine will pick it up again and transcribe it again causing meaningless work. So once an episode fail we can avoid trying it again. Also the SKIP LOCK makes sure there wont mbe many machines that are waiting for another machine to release the lock on a specific row.
        },
      });
    }

    // Here we delete all .wav and .mp3 and .audio or .mp4 files
    const targetDirectory = "./";
    const targetExtensions = [".wav", ".mp3", ".audio", ".mp4"];
    deleteFilesByExtensions(targetDirectory, targetExtensions);
  }
};

async function callPythonTranscribeAPI(episode: Episode) {
  try {
    const response = await axios.post("http://localhost:8000/transcribe", {
      episodeLink: episode.episodeEnclosure,
      episodeTitle: episode.episodeTitle,
      episodeGuid: episode.episodeGuid,
      podcastGuid: episode.podcastGuid,
      language: episode.episodeLanguage,
      episodeYoutubeLink: episode.youtubeVideoLink,
      audioProcessed: episode.audioProcessed,
      youtubeProcessed: episode.youtubeProcessed,
    });

    return Promise.resolve();
  } catch (error: any) {
    console.error(`Error calling API: ${error.message}`);
    return Promise.reject(error);
  }
}

function deleteFilesByExtensions(directoryPath: string, extensions: string[]): void {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const fileExtension = "." + file.split(".").pop()?.toLowerCase();

    if (extensions.includes(fileExtension)) {
      fs.unlinkSync(`${directoryPath}/${file}`);
    }
  }
}

// Starting the transcriber here:
transcribe();
