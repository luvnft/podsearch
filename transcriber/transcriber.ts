import * as fs from "fs";
import { Episode, Podcast, Prisma, PrismaClient, PrismaPromise, Segment, Transcription } from "@prisma/client";
import { spawn } from "child_process";

async function getEpisodeWithLock(prisma: PrismaClient): Promise<Episode | null> {
  let episode: Episode = undefined;
  try {
    // Start a transaction
    await prisma.$executeRaw`START TRANSACTION;`;

    // Fetch and lock an episode that hasn't been transcribed yet
    episode = await prisma.$executeRawUnsafe<Episode[]>(`
      SELECT * FROM episode WHERE transcribed = false LIMIT 1 FOR UPDATE SKIP LOCKED;
    `);

    if (episode && episode.length > 0) {
      // Once done, update the episode as transcribed
      await prisma.episode.update({
        where: { id: episode[0].id },
        data: { transcribed: true },
      });
    }

    // Commit the transaction
    await prisma.$executeRaw`COMMIT;`;
  } catch (error) {
    // If something went wrong, rollback the transaction
    await prisma.$executeRaw`ROLLBACK;`;
    throw error;
  }
  return episode;
}

async function insertJsonFilesToDb(prisma: PrismaClient) {
  console.log("Checking if any new jsons have been added");

  const files = fs.readdirSync("../transcriber/");

  // Looping over all the files inside the ".jsons folder which is inside the ../transcriber "
  for (const filename of files) {
    //If file is not .json continue
    if (!filename.endsWith(".json") || filename.startsWith(".")) {
      continue;
    }

    // Starting processing json
    console.log("Processing data from filename", filename);
    const fileContent = fs.readFileSync(jsonPath + filename, "utf-8");
    const data = JSON.parse(fileContent);

    // Extract data
    const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid } = data;

    // Assuming episodeGuid is provided from an external source and is available globally
    console.log("EpisodeGuid: ", belongsToEpisodeGuid);
    const episode: Episode | null = await prisma.episode.findUnique({
      where: { episodeGuid: belongsToEpisodeGuid },
    });

    // If episode is null continue:
    if (episode === null) continue;

    // Updating that episode to have isTranscribed to true
    await prisma.episode.update({
      where: { id: episode.id },
      data: { isTranscribed: true },
    });

    // Try adding the transcription or update if it exists
    const transcriptionData: Transcription = await prisma.transcription.upsert({
      where: {
        belongsToEpisodeGuid: belongsToEpisodeGuid,
      },
      create: {
        language,
        belongsToPodcastGuid,
        belongsToEpisodeGuid,
        transcription,
      },
      update: {
        language,
        belongsToPodcastGuid,
        belongsToEpisodeGuid,
        transcription,
      },
    });

    // The transcription
    const transcriptionId = transcriptionData.id;

    // Insert segments to the db
    const segmentData = segments.map((segment: Segment) => ({
      start: segment.start,
      end: segment.end,
      language,
      belongsToPodcastGuid,
      belongsToEpisodeGuid,
      belongsToTranscriptId: transcriptionId,
      text: segment.text,
    }));

    // Adding segments using a transaction and and upsert
    await prisma.$transaction(
      segmentData.map((segment: Segment) =>
        prisma.segment.upsert({
          where: { id: segment.id },
          update: {
            start: segment.start,
            end: segment.start,
            language: segment.language,
            belongsToPodcastGuid: segment.belongsToPodcastGuid,
            belongsToEpisodeGuid: segment.belongsToEpisodeGuid,
            belongsToTranscriptId: segment.belongsToTranscriptId,
            text: segment.text,
            indexed: segment.indexed,
            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
          },
          create: {
            start: segment.start,
            end: segment.start,
            language: segment.language,
            belongsToPodcastGuid: segment.belongsToPodcastGuid,
            belongsToEpisodeGuid: segment.belongsToEpisodeGuid,
            belongsToTranscriptId: segment.belongsToTranscriptId,
            text: segment.text,
            indexed: segment.indexed,
            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
          },
        })
      )
    );

    // Delete the file after it has been inserted into the database
    fs.unlinkSync(jsonPath + filename);
  }
}

const transcribe = async () => {
  // Establish connection
  const prisma: PrismaClient = new PrismaClient();

  // Grab an episode that has transcribedValue = false
  // Lock the row such that no other scripts can grab it.
  const episode: Episode | undefined = await getEpisodeWithLock(prisma);

  // Is episode undefined
  if (!episode) {
    console.log("No episode found for transcription.");
    return;
  }

  // Call the Python script and pass the necessary arguments
  const pythonProcess = spawn("python3", ["transcriber.py", episode.enclosureUrl, episode.title, episode.guid, episode.podcast.guid, "en"]); // assuming language is 'en' for English
  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python Output: ${data}`);
  });
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });
  pythonProcess.on("close", async (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      // If the Python script failed, revert the 'transcribed' status back to false so that the episode can be processed again later.
      await prisma.episode.update({
        where: {
          guid: episode.guid,
        },
        data: {
          transcribed: false,
        },
      });
    } else {
      console.log("Transcription completed and JSON saved.");
      // Process the saved JSON or perform any other necessary actions.
    }
  });

  // Run insertJsonFilesToDb
  insertJsonFilesToDb(prisma);
};
