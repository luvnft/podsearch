import { Segment } from "@prisma/client";
import { meilisearchConnection } from "../connections/meilisearchConnection";
import { prismaConnection } from "../connections/prismaConnection";
import cron from "node-cron";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitSegments(segments: Segment[], maxChars: number): Segment[] {
  const newSegments: Segment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment: Segment = segments[i];

    // Another alternative is to use the wordtimestamps instead to generate the segments.

    // Essentially. You loop through all the segments.
    // For each segment you loop over the words within and you append the words to a new temporary array.

    // You concatenate a string and you count the lenght of chars, if it's 38 then you generate a segment and you add it ot the generatedSegments list Where the startValue is the startValue of the wfirst wordTimeStamp segment and the last end value is the last wordTimeStamp value .

    //  And then you just continue with thi and in this way ytou will get very nice segments for the entire thing :)))))) ) ) ) ) )
  }
  return newSegments;
}

async function main() {
  const transcriptionsIndex = meilisearchConnection.index("transcriptions");
  const segmentsIndex = meilisearchConnection.index("segments");
  const podcastsIndex = meilisearchConnection.index("podcasts");
  const episodesIndex = meilisearchConnection.index("episodes");

  console.log("Starting: Getting episodes and podcasts, we always update all podcasts and episodes from db due to the small amount of rows and also due to the changes in the db most often being related to them and not the segments");
  const podcasts = await prismaConnection.podcast.findMany();
  const episodes = await prismaConnection.episode.findMany();

  //Always updating these as they have important values which may change
  console.log("Adding podcasts, the number to add is:", podcasts.length, "we're overwriting all of them essentially");
  await podcastsIndex.deleteAllDocuments();
  await podcastsIndex.addDocumentsInBatches(podcasts, 500, {
    primaryKey: "id",
  });
  console.log("Adding episodes, the number to add is:", episodes.length, "we're overwriting all of them essentially.");
  await episodesIndex.deleteAllDocuments();
  await episodesIndex.addDocumentsInBatches(episodes, 500, {
    primaryKey: "id",
  });

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

  console.log("Segments with indexed value === false which we have to index now is: ", segmentCount);
  console.log("Transcriptions with indexed value === false  which we have to index now is: ", transcriptionCount);
  console.log("Adding transcriptions first");

  // The number of transcriptions to take at a time due to the size of the responses
  let transcriptionTake = 50;

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
      console.log("No more transcriptions to process, breaking out.");
      break;
    }
    console.log("Adding transcriptions: ", transcriptions.length, "i is: ", i);

    var ids = transcriptions.map((e) => e.id);
    await transcriptionsIndex.addDocumentsInBatches(transcriptions, 10, {
      primaryKey: "id",
    });

    // Updating the transcriptions we added with indexes = true
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

    console.log("Waiting 10 seconds before next batch to not override OS as meilisearch has kinda shitty indexing capabilities.");
    await sleep(10000);
  }

  console.log("Now adding segments...");

  // Number of segments to index at a time
  let segmentTake = 4000;

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
    console.log("Number of segments now going to add is: ", segments.length, " and the i is: ", i);

    // We gotta preprocess the segments to do the following:
    // We gotta sort them by "start" from 0 => and up
    // Then we gotta pick 1 segment, check if it has more than 5 words, if it doesnt we just add it to the segments
    // If it doesn't we have to slice it down to 5 words and change the currentValue to the startValue to keep the correct

    const segmentData: any[] = [];
    segments.forEach((segment: Segment) => {
      const subSegments = splitSegment(segment);
      subSegments.forEach((subSegment) => {
        segmentData.push({
          start: subSegment.start,
          end: subSegment.end,
          language,
          belongsToPodcastGuid,
          belongsToEpisodeGuid,
          belongsToTranscriptId: transcriptionId,
          text: subSegment.text,
          indexed: false,
        });
      });
    });

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

    console.log("Sleeping 10 seconds until taking a new batch of un-indexed segments");
    await sleep(10000);
  }
}

let isRunning = false;

function start(cronExpression: string) {
  console.log("Cron-job rsscrawler is turned ON.");

  if (!cron.validate(cronExpression)) {
    console.error("Invalid cron expression.");
    return;
  }

  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      console.warn("Previous Indexer is still running. Skipping this run.");
      return;
    }

    isRunning = true;
    try {
      await main();
      console.log(`Indexer completed. Scheduled for next run as per ${cronExpression}.`);
    } catch (err) {
      console.error("Failed to run the main function:", err);
    } finally {
      isRunning = false; // Ensure that the flag is reset even if there's an error.
    }
  });
}
process.on("SIGINT", () => {
  console.log("Received SIGINT. Cleaning up...");
  // Your cleanup code here, e.g., closing database connections, servers, etc.
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Cleaning up...");
  // Your cleanup code here.
  process.exit(0);
});

export { start };
