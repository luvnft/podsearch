import * as fs from "fs";
import { Episode, Podcast, Prisma, PrismaClient, PrismaPromise, Segment, Transcription } from "@prisma/client";
import path from "path";

const jsonPath: string = "../transcriber";

async function insertJsonFilesToDb(prisma: PrismaClient) {
  await prisma.$connect();
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
    const fileContent = fs.readFileSync(path.join(jsonPath, filename), "utf-8");
    const data = JSON.parse(fileContent);

    // Extract data
    const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid } = data;

    // Assuming episodeGuid is provided from an external source and is available globally
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
    fs.unlinkSync(path.join(jsonPath, filename));
  }
}

// Main Runner
async function mainRunner() {
  // Run every 1 min
  const runDuration: number = 60 * 1000; // 60 seconds times 1000 milliseconds/second

  // Prisma instance
  const prisma = new PrismaClient();

  try {
    await insertJsonFilesToDb(prisma);
    console.log(`Process completed. Waiting for the next run in ${runDuration} hours.`);
  } catch (err) {
    console.error("Failed to run the main function:", err);
  } finally {
    setTimeout(mainRunner, runDuration);
  }
}

// Invoke the main function
mainRunner();
