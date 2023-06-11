import * as dotenv from "dotenv";
dotenv.config("./");
console.log(process.env.MEILISEARCH_IP); // remove this after you've confirmed it is working

import prismaConnection from "./prismaConnection.js";
import fs from "fs";
import { MeiliSearch } from "meilisearch";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const client = await new MeiliSearch({ host: "localhost:7700" });
  const transcriptionsIndex = client.index("transcriptions");
  const segmentsIndex = client.index("segments");
  const podcastsIndex = client.index("podcasts");
  const episodesIndex = client.index("episodes");

  console.log("Starting...");
  await prismaConnection.segment.updateMany({
    data: {
      indexed: false,
    },
  });
  await prismaConnection.transcription.updateMany({
    data: {
      indexed: false,
    },
  });
  await prismaConnection.podcast.updateMany({
    data: {
      indexed: false,
    },
  });
  await prismaConnection.episode.updateMany({
    data: {
      indexed: false,
    },
  });

  // segmentsIndex.deleteAllDocuments();
  // transcriptionsIndex.deleteAllDocuments();
  // episodesIndex.deleteAllDocuments();
  // podcastsIndex.deleteAllDocuments();

  console.log("Getting episodes stuff and podcasts");
  const podcasts = await prismaConnection.podcast.findMany();
  const episodes = await prismaConnection.episode.findMany();

  console.log("Adding podcasts");
  await podcastsIndex.addDocumentsInBatches(podcasts, 1000, {
    primaryKey: "id",
  });
  await episodesIndex.addDocumentsInBatches(episodes, 1000, {
    primaryKey: "id",
  });
  const podcastIds = podcasts.map((e) => e.id);
  // const episodesIds = episodes.map((e) => e.id);

  await prismaConnection.podcast.updateMany({
    where: {
      id: {
        in: podcastIds,
      },
    },
    data: {
      indexed: true,
    },
  });
  // await prismaConnection.episode.updateMany({
  //   where: {
  //     id: {
  //       in: episodesIds,
  //     },
  //   },
  //   data: {
  //     indexed: true,
  //   },
  // });

  const segmentCount = await prismaConnection.segment.count({
    where: {
      indexed: false,
    },
  });
  const transcriptionCount = await prismaConnection.transcription.count({
    where: {
      indexed: false,
    },
  });

  console.log("Segmentcount: ", segmentCount);
  console.log("TranscriptionCount: ", transcriptionCount);

  //Transcription json creation
  let transcriptionTake = 500;

  //We loop through all the transcriptions
  for (let i = 0; i < transcriptionCount; i = i + transcriptionTake) {
    let transcriptions = await prismaConnection.transcription.findMany({
      take: transcriptionTake,
      skip: i,
      where: {
        indexed: false,
      },
    });
    if (!transcriptions || transcriptions.length === 0) {
      console.log("Breaking out??");
      break;
    }
    console.log("Adding transcriptions: ", transcriptions.length, "I is: ", i);

    var ids = transcriptions.map((e) => e.id);
    await transcriptionsIndex.addDocumentsInBatches(transcriptions, 500, {
      primaryKey: "id",
    });
    await prismaConnection.transcription.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        indexed: true,
      },
    });
    console.log("Sleeping");
    await sleep(5000);
  }

  let segmentTake = 10000;

  //We loop through all the segments
  for (let i = 0; i < segmentCount; i = i + segmentTake) {
    let segments = await prismaConnection.segment.findMany({
      take: segmentTake,
      skip: i,
      where: {
        indexed: false,
      },
    });

    if (!segments || segments.length === 0) break;
    console.log("Adding Segments: ", segments.length, "I is: ", i);

    var ids = segments.map((e) => e.id);
    await segmentsIndex.addDocumentsInBatches(segments, segmentTake, {
      primaryKey: "id",
    });
    await prismaConnection.segment.updateMany({
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
    await sleep(5000);
  }
}

main();
