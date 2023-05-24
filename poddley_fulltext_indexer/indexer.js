import * as dotenv from "dotenv";
dotenv.config("./");
console.log(process.env.MEILISEARCH_IP); // remove this after you've confirmed it is working

import prismaConnection from "./prismaConnection.js";
import fs from "fs";
import { MeiliSearch } from "meilisearch";
import flattenObjectOuter from "./flattenObject.js";
import JSONStream from "JSONStream";
import ndjson from "ndjson";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const client = await new MeiliSearch({ host: process.env.MEILISEARCH_IP });
  const transcriptionsIndex = client.index("transcriptions");
  const segmentsIndex = client.index("segments");

  console.log("Starting...");
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

  // //Transcription json creation
  // let transcriptionTake = 1000;

  // //We loop through all the transcriptions
  // for (let i = 0; i < transcriptionCount; i = i + transcriptionTake) {
  //   let transcriptions = await prismaConnection.transcription.findMany({
  //     take: transcriptionTake,
  //     skip: i,
  //     include: {
  //       Episode_belongsToEpisodeGuid: true,
  //       Podcast_belongsToPodcastGuid: true,
  //     },
  //     where: {
  //       indexed: false,
  //     },
  //   });
  //   if (!transcriptions || transcriptions.length === 0) break;
  //   console.log("Before flattening and filtering: ", transcriptions.length);
  //   transcriptions = transcriptions.map((e) => flattenObjectOuter(e));
  //   transcriptions = transcriptions.filter(
  //     (e) =>
  //       e.isRead && (e.youtubeVideoLink === "" || e.youtubeVideoLink !== null) && e.deviationTime
  //   );
  //   console.log("After flattening and filtering: ", transcriptions.length);

  //   var ids = transcriptions.map((e) => e.id);
  //   await transcriptionsIndex.addDocumentsInBatches(transcriptions, 10, {
  //     primaryKey: "id",
  //   });
  //   transcriptions = [];
  //   await prismaConnection.transcription.updateMany({
  //     where: {
  //       id: {
  //         in: ids,
  //       },
  //     },
  //     data: {
  //       indexed: true,
  //     },
  //   });
  //   await sleep(5000);
  // }

  let segmentTake = 40000;

  //We loop through all the segments
  for (let i = 0; i < segmentCount; i = i + segmentTake) {
    let segments = await prismaConnection.segment.findMany({
      take: segmentTake,
      skip: i,
      include: {
        Episode: true,
        Podcast_belongsToPodcastGuid: true,
      },
      where: {
        indexed: false,
      },
    });

    if (!segments || segments.length === 0) break;

    console.log("Before mapping: ", segments.length);
    segments = segments.map((e) => flattenObjectOuter(e));
    segments = segments.filter(
      (e) =>
        e.isRead && (e.youtubeVideoLink === "" || e.youtubeVideoLink !== null) && e.deviationTime
    );
    console.log("After flattening and filtering: ", segments.length);

    var ids = segments.map((e) => e.id);
    await segmentsIndex.addDocumentsInBatches(segments, 40000, {
      primaryKey: "id",
    });
    segments = [];
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
    await sleep(5000);
  }
}

main();
