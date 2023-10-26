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
  youtubeVideoLink: string;
  deviationTime: number;
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

async function getEpisodeWithLock(): Promise<Episode | null> {
  try {
    const results = await prisma.$transaction([
      prisma.$queryRawUnsafe(`
              SELECT * FROM Episode WHERE isTranscribed = 0 AND errorCount < 1 LIMIT 1 FOR UPDATE SKIP LOCKED;
          `),
    ]);

    const episodeResult: Episode[] = results[0] as unknown as Episode[];

    if (episodeResult && episodeResult.length > 0) {
      const episode = episodeResult[0];

      await prisma.$transaction([
        prisma.episode.update({
          where: { id: episode.id },
          data: { isTranscribed: true },
        }),
      ]);

      return episode;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}
const mergeStrangeSegments = (words: TranscriptionWordType[]): TranscriptionWordType[] => {
  if (words.length === 0) return [];

  const merged: TranscriptionWordType[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const currentSegment: TranscriptionWordType = words[i];
    const lastMergedSegment: TranscriptionWordType = merged[merged.length - 1];

    if (currentSegment.start === undefined && currentSegment.end === undefined) {
      lastMergedSegment.word += " " + currentSegment.word;
    } else {
      merged.push(currentSegment);
    }
  }

  return merged;
};

function isStandardCharacter(word: string): boolean {
  // This regex matches standard Latin alphanumeric characters, feel free to modify as needed.
  const regex = /\u+[^a-zA-Z\s]+/gi;
  return regex.test(word);
}

async function insertJsonFilesToDb() {
  try {
    console.log("Checking if any new jsons have been added");

    const files = fs.readdirSync("./");

    // Looping over all the files inside the ".jsons folder which is inside the ../transcriber "
    for (const filename of files) {
      //If file is not .json continue
      if (!filename.endsWith(".json") || filename.startsWith(".")) {
        continue;
      }

      // Starting processing json
      console.log("Processing data from filename", filename);
      const fileContent = fs.readFileSync(filename, "utf-8");
      const data: JsonTranscriptionObject = JSON.parse(fileContent) as JsonTranscriptionObject;

      // Extract data
      const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid, deviationTime, youtubeVideoLink }: JsonTranscriptionObject = data;

      // Delete the existing transcription with belongsToEpisodeGuid
      console.log("==> 🗑️Deleting transcription with belongsToEpisodeGuid:", belongsToEpisodeGuid);
      try {
        await prisma.transcription.delete({
          where: { belongsToEpisodeGuid: belongsToEpisodeGuid },
        });
      } catch (e) {
        console.log("Some error1: ", e);
      }

      // Delete the segments with belongsToEpisodeGuid
      console.log("==> 🗑️Deleting segments with belongsToEpisodeGuid:", belongsToEpisodeGuid);
      try {
        await prisma.segment.deleteMany({
          where: { belongsToEpisodeGuid: belongsToEpisodeGuid },
        });
      } catch (e) {
        console.log("Some error2: ", e);
      }

      console.log("Getting EpisodeGuid from DB: ", belongsToEpisodeGuid);
      const episode: Episode | null = await prisma.episode.findUnique({
        where: { episodeGuid: belongsToEpisodeGuid },
      });

      if (episode === null) continue;

      // Update episode first
      console.log("==>👑Updating episode with deviationTime and with YoutubeLink");
      await prisma.episode.update({
        where: {
          episodeGuid: belongsToEpisodeGuid,
        },
        data: {
          youtubeVideoLink: youtubeVideoLink,
          deviationTime: deviationTime,
        },
      });

      // Add the transcription
      console.log("==>👑Adding transcription to DB");
      const transcriptionData: Transcription = await prisma.transcription.create({
        data: {
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
      // This removes junk like this:  "word": "\u0443\u0432\u0430\u0436\u0430\u0435\u043c\u044b\u0435"
      const filteredWords = words.filter((entry: TranscriptionWordType) => isStandardCharacter(entry.word));

      // The words are already sorted in ascending order based on timestamp
      words = mergeStrangeSegments(words);

      // Now we create the segments
      let word: TranscriptionWordType | undefined = undefined;
      let concatenatedWord: string = "";
      let startTime: number = words[0].start;
      let endTime: number = words[0].end;

      // Num of words
      const numberOfWords: number = words.length;

      for (let j = 0; j < numberOfWords; j++) {
        word = words[j];

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
        };
        newSegments.push(segment);
      }

      // Insert segments using createMany
      console.log(`==>👑Adding ${newSegments.length} segments to DB`);
      console.dir(newSegments, { maxArrayLength: null });

      try {
        await prisma.segment.createMany({
          data: newSegments,
          skipDuplicates: true,
        });
      } catch (e) {
        console.log("E", e);
      }

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

    // Is episode undefined
    if (!episode) {
      console.log("No episode found for transcription. Ending.");
      break;
    }

    // Call the Python script and pass the necessary arguments
    try {
      await runPythonScript(episode);
      console.log("<  ==  > Transcription completed and JSON saved <  ==  > ");
      await insertJsonFilesToDb();
      console.log("Finished adding the json to the db. Running again:");
    } catch (e) {
      console.log(e);
      await prisma.episode.update({
        where: {
          episodeGuid: episode.episodeGuid,
        },
        data: {
          isTranscribed: false,
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

async function runPythonScript(episode: Episode) {
  try {
    const response = await axios.post("http://localhost:8000/transcribe", {
      episodeLink: episode.episodeEnclosure,
      episodeTitle: episode.episodeTitle,
      episodeGuid: episode.episodeGuid,
      podcastGuid: episode.podcastGuid,
      language: "en",
    });

    console.log(`Response from API: ${response.data.result}`);
    return Promise.resolve();
  } catch (error: any) {
    console.error(`Error calling API: ${error.message}`);
    console.log("Updating episode isTranscribed back to correct false value", episode.episodeGuid);
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
insertJsonFilesToDb();
