import dotenv from "dotenv";
import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
dotenv.config();

async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: process.env.MEILISEARCH_IP });

  // await client.deleteIndex("segments");
  // await client.deleteIndex("transcriptions");

  const segmentsIndex = await client.index("segments");
  const transcriptionsIndex = await client.index("transcriptions");
  segmentsIndex.deleteAllDocuments();
  transcriptionsIndex.deleteAllDocuments();

  await client.tasks.deleteTasks({
    statuses: ["failed", "succeeded", "canceled", "enqueued"],
  });

  transcriptionsIndex.updateTypoTolerance({
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 10,
    },
  });

  segmentsIndex.updateTypoTolerance({
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 10,
    },
  });

  segmentsIndex.updateFilterableAttributes(["belongsToTranscriptId"]);

  //Update ranking rules for seg and tra
  segmentsIndex.updateSettings({
    rankingRules: ["proximity", "typo", "words"],
  });
  transcriptionsIndex.updateSettings({
    rankingRules: ["proximity", "typo", "words"],
  });
  segmentsIndex.updateSettings({
    searchableAttributes: ["text"],
    displayedAttributes: [
      "id",
      "text",
      "podcastTitle",
      "episodeTitle",
      "podcastSummary",
      "episodeSummary",
      "description",
      "url",
      "link",
      "start",
      "end",
      "podcastAuthor",
      "imageUrl",
      "episodeLinkToEpisode",
      "episodeEnclosure",
      "podcastLanguage",
      "episodeGuid",
      "podcastGuid",
      "belongsToTranscriptId",
    ],
  });

  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: [
      "id",
      "transcription",
      "podcastTitle",
      "episodeTitle",
      "podcastSummary",
      "episodeSummary",
      "description",
      "url",
      "link",
      "start",
      "end",
      "podcastAuthor",
      "imageUrl",
      "episodeLinkToEpisode",
      "episodeEnclosure",
      "podcastLanguage",
      "episodeGuid",
      "podcastGuid",
    ],
  });
}

main();
