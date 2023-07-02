import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: "localhost:7700" });

  const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  const episodesIndex = await client.index("episodes");
  const podcastsIndex = await client.index("podcasts");

  //Update indexes
  segmentsIndex.updateSettings({
    searchableAttributes: ["text"],
    displayedAttributes: ["*"],
    filterableAttributes: ["belongsToEpisodeGuid", "id", "belongsToTranscriptGuid", "belongsToPodcastGuids"],
    rankingRules: ["exactness", "sort", "proximity", "typo", "words"],
    sortableAttributes: ["start"],
  });
  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: ["*"],
    rankingRules: ["exactness", "proximity", "typo", "words"],
  });
  podcastsIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["podcastGuid"],
  });
  episodesIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["episodeGuid"],
    sortableAttributes: ["addedDate"],
  });
}

main();
