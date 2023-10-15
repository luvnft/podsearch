import { Episode, Podcast, Prisma, PrismaClient, PrismaPromise } from "@prisma/client";
import fs from "fs";
import { MeiliSearch } from "meilisearch";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  const client = new MeiliSearch({ host: "localhost:7700" });
  const transcriptionsIndex = client.index("transcriptions");
  const segmentsIndex = client.index("segments");
  const podcastsIndex = client.index("podcasts");
  const episodesIndex = client.index("episodes");

  console.log("Starting: Getting episodes and podcasts, we always update all podcasts and episodes from db due to the small amount of rows and also due to the changes in the db most often being related to them and not the segments");
  const podcasts = await prisma.podcast.findMany();
  const episodes = await prisma.episode.findMany();

  //Always updating these as they have important values which may change
  console.log("Adding podcasts, the number to add is:", podcasts.length, "we're overwriting all of them essentially");
  await podcastsIndex.addDocumentsInBatches(podcasts, 1000, {
    primaryKey: "id",
  });
  console.log("Adding episodes, the number to add is:", episodes.length, "we're overwriting all of them essentially.");
  await episodesIndex.addDocumentsInBatches(episodes, 1000, {
    primaryKey: "id",
  });

  const segmentCount = await prisma.segment.count({
    where: {
      indexed: false,
    },
  });
  const transcriptionCount = await prisma.transcription.count({
    where: {
      indexed: false,
    },
  });

  console.log("Segments with indexed value === false which we have to index now is: ", segmentCount);
  console.log("Transcriptions with indexed value === false  which we have to index now is: ", transcriptionCount);
  console.log("Adding transcriptions first");

  // The number of transcriptions to take at a time due to the size of the responses
  let transcriptionTake = 50;

  //We loop through all the transcriptions
  for (let i = 0; i < transcriptionCount; i = i + transcriptionTake) {
    let transcriptions = await prisma.transcription.findMany({
      take: transcriptionTake,
      skip: i,
      where: {
        indexed: false,
      },
    });
    if (!transcriptions || transcriptions.length === 0) {
      console.log("No more transcriptions to process, breaking out.");
      break;
    }
    console.log("Adding transcriptions: ", transcriptions.length, "i is: ", i);

    var ids = transcriptions.map((e) => e.id);
    await transcriptionsIndex.addDocumentsInBatches(transcriptions, 50, {
      primaryKey: "id",
    });

    // Updating the transcriptions we added with indexes = true
    await prisma.transcription.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        indexed: true,
      },
    });

    console.log("Waiting 10 seconds before next batch to not override OS as meilisearch has kinda shitty indexing capabilities.");
    await sleep(10000);
  }

  console.log("Now adding segments...");

  // Number of segments to index at a time
  let segmentTake = 10000;

  //We loop through all the segments
  for (let i = 0; i < segmentCount; i = i + segmentTake) {
    let segments = await prisma.segment.findMany({
      take: segmentTake,
      skip: i,
      where: {
        indexed: false,
      },
    });

    if (!segments || segments.length === 0) break;
    console.log("Number of segments now going to add is: ", segments.length, " and the i is: ", i);

    var ids = segments.map((e) => e.id);
    await segmentsIndex.addDocumentsInBatches(segments, segmentTake, {
      primaryKey: "id",
    });
    await prisma.segment.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        indexed: true,
      },
    });
    segments = [];

    console.log("Sleeping 10 seconds until taking a new batch of un-indexed segments");
    await sleep(10000);
  }
}

async function start(cronTimeInSeconds: number) {
  try {
    await main();
    console.log(`Indexing completed. Waiting for the next run in ${cronTimeInSeconds} seconds.`);
  } catch (err) {
    console.error("Failed to run the main function:", err);
  } finally {
    setTimeout(() => start(cronTimeInSeconds), cronTimeInSeconds * 1000);
  }
}

export const indexer = {
  start,
};
