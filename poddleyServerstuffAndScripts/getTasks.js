import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: "localhost:7700"});

  // await client.deleteIndex("segments");
  // await client.deleteIndex("transcriptions");

  // const transcriptionsIndex = await client.index("transcriptions");
  // const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  // const episodesIndex = await client.index("episodes");
  // const podcastsIndex = await client.index("podcasts");

  // segmentsIndex.deleteAllDocuments();
  // transcriptionsIndex.deleteAllDocuments();
  // episodesIndex.deleteAllDocuments();
  // podcastsIndex.deleteAllDocuments();

  // await client.tasks.deleteTasks({
  //   statuses: ["failed", "succeeded", "canceled", "enqueued"],
  // });

  // transcriptionsIndex.updateTypoTolerance({
  //   minWordSizeForTypos: {
  //     oneTypo: 4,
  //     twoTypos: 10,
  //   },
  // });

  // transcriptionsIndex.updateTypoTolerance({
  //   minWordSizeForTypos: {
  //     oneTypo: 4,
  //     twoTypos: 10,
  //   },
  // });

  // segmentsIndex.updateFilterableAttributes(["belongsToEpisodeGuid", "id"]);
  // podcastsIndex.updateFilterableAttributes(["podcastGuid"]);
  // episodesIndex.updateFilterableAttributes(["episodeGuid"]);

  //Update ranking rules for seg and tra
  segmentsIndex.updateSettings({
    searchableAttributes: ["text"],
    displayedAttributes: ["*"],
    rankingRules: ["sort", "proximity", "typo", "words"],
  });
  // transcriptionsIndex.updateSettings({
  //   searchableAttributes: ["transcription"],
  //   displayedAttributes: ["*"],
  //   rankingRules: ["proximity", "typo", "words"],
  // });
  // podcastsIndex.updateSettings({
  //   searchableAttributes: ["*"],
  //   displayedAttributes: ["*"],
  // });
  // episodesIndex.updateSettings({
  //   searchableAttributes: ["*"],
  //   displayedAttributes: ["*"],
  // });
}

main();
