import prismaConnection from "./prismaConnection.js";
import fs from "fs";
import { MeiliSearch } from "meilisearch";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

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
  console.log("Getting episodes and podcasts");
  await podcastsIndex.deleteAllDocuments();
  const podcasts = await prismaConnection.podcast.findMany();
  const episodes = await prismaConnection.episode.findMany();



  //Always updating these as they have important values which may change
  console.log("Adding podcasts, the number to add is:", podcasts.length);
  await podcastsIndex.addDocumentsInBatches(podcasts, 1000, {
    primaryKey: "id",
  });
  console.log("Adding episodes, the number to add is:", episodes.length);
  await episodesIndex.addDocumentsInBatches(episodes, 1000, {
    primaryKey: "id",
  });

  // const segmentCount = await prismaConnection.segment.count({
  //   where: {
  //     indexed: false,
  //   },
  // });
  // const transcriptionCount = await prismaConnection.transcription.count({
  //   where: {
  //     indexed: false,
  //   },
  // });

  // console.log("Segments with indexed value === false: ", segmentCount);
  // console.log("Transcriptions with indexed value === false: ", transcriptionCount);

  // console.log("Adding transcriptions...")
  // let transcriptionTake = 50;

  // //We loop through all the transcriptions
  // for (let i = 0; i < transcriptionCount; i = i + transcriptionTake) {
  //   let transcriptions = await prismaConnection.transcription.findMany({
  //     take: transcriptionTake,
  //     skip: i,
  //     where: {
  //       indexed: false,
  //     },
  //   });
  //   if (!transcriptions || transcriptions.length === 0) {
  //     console.log("Breaking out??");
  //     break;
  //   }
  //   console.log("Adding transcriptions: ", transcriptions.length, "I is: ", i);

  //   var ids = transcriptions.map((e) => e.id);
  //   await transcriptionsIndex.addDocumentsInBatches(transcriptions, 50, {
  //     primaryKey: "id",
  //   });
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
  //   console.log("Sleeping");
  //   await sleep(5000);
  // }

  // console.log("Adding segments...")
  // let segmentTake = 10000;

  // //We loop through all the segments
  // for (let i = 0; i < segmentCount; i = i + segmentTake) {
  //   let segments = await prismaConnection.segment.findMany({
  //     take: segmentTake,
  //     skip: i,
  //     where: {
  //       indexed: false,
  //     },
  //   });   

  //   if (!segments || segments.length === 0) break;
  //   console.log("Adding Segments: ", segments.length, "I is: ", i); 
 
  //   var ids = segments.map((e) => e.id);
  //   await segmentsIndex.addDocumentsInBatches(segments, segmentTake, {
  //     primaryKey: "id", 
  //   });
  //   await prismaConnection.segment.updateMany({
  //     where: {
  //       id: {
  //         in: ids,
  //       },
  //     },
  //     data: {
  //       indexed: true,
  //     },
  //   });
  //   segments = [];
  //   await sleep(5000);
  // }
}

main();
