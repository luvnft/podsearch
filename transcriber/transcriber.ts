import * as fs from "fs";
import { PrismaClient, Episode, Segment, Transcription } from "@prisma/client";
import axios from "axios";

// Establish connection
const prisma: PrismaClient = new PrismaClient();

async function getEpisodeWithLock(): Promise<Episode | null> {
  try {
    const results = await prisma.$transaction([
      prisma.$queryRawUnsafe(`
              SELECT * FROM Episode WHERE isTranscribed = 0 AND errorCount < 1 LIMIT 1 FOR UPDATE SKIP LOCKED;
          `),
    ]);

    console.log("Results: ", results);

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
      const data = JSON.parse(fileContent);

      // Extract data
      const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid } = data;

      // Delete the existing transcription with belongsToEpisodeGuid
      console.log("Deleting transcription with belongsToEpisodeGuid:", belongsToEpisodeGuid);
      try {
        await prisma.transcription.delete({
          where: { belongsToEpisodeGuid: belongsToEpisodeGuid },
        });
      } catch (e) {
        console.log("Some error1: ", e);
      }

      // Delete the segments with belongsToEpisodeGuid
      console.log("Deleting segments with belongsToEpisodeGuid:", belongsToEpisodeGuid);
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

      // Add the transcription
      console.log("Adding transcription to DB");
      const transcriptionData: Transcription = await prisma.transcription.create({
        data: {
          language,
          belongsToPodcastGuid,
          belongsToEpisodeGuid,
          transcription,
        },
      });

      const transcriptionId = transcriptionData.id;

      // Prepare segments data for insertion
      const segmentData = segments.map((segment: Segment) => ({
        start: segment.start,
        end: segment.end,
        language,
        belongsToPodcastGuid,
        belongsToEpisodeGuid,
        belongsToTranscriptId: transcriptionId,
        text: segment.text,
      }));

      // Insert segments using createMany
      console.log("Adding segments to DB");
      await prisma.segment.createMany({
        data: segmentData,
      });

      // Delete the file after it has been inserted into the database
      // fs.unlinkSync(filename);
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

// Starting the transcriber here:
transcribe();
