import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: "https://meilisearch.poddley.com" });

  const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  const episodesIndex = await client.index("episodes");
  const podcastsIndex = await client.index("podcasts");

  //Update indexes
  segmentsIndex.updateSettings({
    searchableAttributes: ["text"],
    displayedAttributes: ["*"],
    filterableAttributes: ["belongsToEpisodeGuid", "id", "belongsToTranscriptGuid", "belongsToPodcastGuid", "start", "end"],
    rankingRules: ["exactness", "sort", "proximity", "typo", "words"],
    sortableAttributes: ["start"],
    pagination: {
      maxTotalHits: 5000,
    },
  });
  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: ["*"],
    rankingRules: ["exactness", "proximity", "typo", "words"],
    pagination: {
      maxTotalHits: 1,
    },
  });
  podcastsIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["podcastGuid"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  });
  episodesIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["episodeGuid"],
    sortableAttributes: ["addedDate"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  });
}

main();
