import prismaConnection from "./prismaConnection.js";
import fs from "fs";
import { MeiliSearch } from "meilisearch";
import flattenObjectOuter from "./flattenObject.js";
import * as dotenv from "dotenv";
import JSONStream from "JSONStream";
import ndjson from "ndjson";
dotenv.config();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFileAsStreamAndInsertIntoDb(filepath, indexName) {
  const client = new MeiliSearch({ host: process.env.MEILISEARCH_IP });
  const meiliIndex = client.index(indexName);
  return new Promise(async (resolve, reject) => {
    console.log("Read file as stream");
    let count = 0;
    let preparedJsons = [];
    let ids = [];
    let batchNumber = indexName == "segments" ? 20000 : 1000;
    console.log("BatchNumber is:", batchNumber);
    const stream = fs
      .createReadStream(filepath)
      .pipe(ndjson.parse())
      .on("data", async (row) => {
        ids.push(row.id);
        preparedJsons.push(row);
        if (count % batchNumber == 0) {
          stream.pause();
          await meiliIndex.addDocumentsInBatches(preparedJsons, batchNumber, {
            primaryKey: "id",
          });
          console.log("Pausing");
          console.log("Done inserting from 'data'-section");
          console.log(
            "Sleeping for 10 seconds to avoid crashing serve updating db with isTranscribedr"
          );
          await updateIndex(ids, indexName);
          ids = [];
          preparedJsons = [];
          await sleep(2000);
          console.log("Done sleeping continuing");
          stream.resume();
          console.log("Resumed : now : updating db with isTranscribed ", count);
        }
        count++;
      })
      .on("end", async () => {
        stream.pause();
        console.log("Ending, the length of preparedJsons is:", preparedJsons.length);
        if (preparedJsons.length > 0) {
          await meiliIndex.addDocumentsInBatches(preparedJsons, batchNumber, {
            primaryKey: "id",
          });
          console.log("Done inserting from 'data'-section last time");
          console.log("Sleeping for 10 seconds to avoid crashing server last time");
          await updateIndex(ids, indexName);
          preparedJsons = [];
          ids = [];
        }
        await sleep(2000);
        console.log("Done sleeping. Finishing");
        stream.resume();
        console.log("Done");
        resolve();
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Starting...");
  const segmentCount = await prismaConnection.segment.count();
  const transcriptionCount = await prismaConnection.transcription.count();

  console.log("Segmentcount: ", segmentCount);
  console.log("TranscriptionCount: ", transcriptionCount);

  // //Segments json creation
  // let segmentTake = 50000;

  // //We loop through all the segments
  // for (let i = 0; i < segmentCount; i = i + segmentTake) {
  //   let segments = await prismaConnection.segment.findMany({
  //     take: segmentTake,
  //     skip: i,
  //     include: {
  //       Episode: true,
  //       Podcast_belongsToPodcastGuid: true,
  //     },
  //   });
  //   segments = segments.map((e) => flattenObjectOuter(e));
  //   const segmentsJsonified = segments.map((segment) => JSON.stringify(segment) + "\n");
  //   console.log(
  //     "Adding segments to ndjson, number is: ",
  //     segmentsJsonified.length,
  //     " currentTotal: ",
  //     i
  //   );

  //   //We save the entire array in a .ndjson file
  //   fs.appendFileSync(`./segments_ndjson.ndjson`, segmentsJsonified.join(""));
  // }

  // //Transcription json creation
  // let transcriptionTake = 50;

  // //We loop through all the segments
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

  //   transcriptions = transcriptions.map((e) => flattenObjectOuter(e));
  //   const transcriptionsJsonified = transcriptions.map(
  //     (transcription) => JSON.stringify(transcription) + "\n"
  //   );

  //   console.log(
  //     "Adding transcriptions to ndjson, number is:",
  //     transcriptionsJsonified.length,
  //     "currentTotal :",
  //     i
  //   );

  //   // We save the entire array in a .ndjson file
  //   fs.appendFileSync(`./transcriptions_ndjson.ndjson`, transcriptionsJsonified.join(""));
  // }

  console.log("Adding segments...");
  // await readFileAsStreamAndInsertIntoDb("./segments_ndjson.ndjson", "segments");
  if (fs.existsSync("./transcriptions_ndjson.ndjson")) {
    await readFileAsStreamAndInsertIntoDb("./transcriptions_ndjson.ndjson", "transcriptions");
    console.log("Done reading stream and inserting!");
    // await fs.unlinkSync("./transcriptions_ndjson.ndjson");
  } else {
    console.log("Not present transcriptions");
  }
  if (fs.existsSync("./segments_ndjson.ndjson")) {
    await readFileAsStreamAndInsertIntoDb("./segments_ndjson.ndjson", "segments");
    console.log("Done reading stream and inserting segments!");
    // await fs.unlinkSync("./segments_ndjson.ndjson");
  } else {
    console.log("Not present segments");
  }
}

async function updateIndex(idsToUpdate, table) {
  console.log("The number of ids to process is: ", idsToUpdate.length);
  if (table == "segments") {
    for (let i = 0; i < idsToUpdate.length; i = i + 20000) {
      const ids = idsToUpdate.slice(i, i + 20000);
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
    }
  } else if (table == "transcriptions") {
    for (let i = 0; i < idsToUpdate.length; i = i + 1000) {
      const ids = idsToUpdate.slice(i, i + 1000);
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
    }
  }
}

main();
