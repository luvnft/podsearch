import { meilisearchConnection } from "../connections/meilisearchConnection";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");

  const transcriptionsIndex = meilisearchConnection.index("transcriptions");
  const segmentsIndex = meilisearchConnection.index("segments");
  const episodesIndex = meilisearchConnection.index("episodes");
  const podcastsIndex = meilisearchConnection.index("podcasts");

  //Update indexes
  segmentsIndex.updateSettings({
    searchableAttributes: ["text", "surroundingText"],
    displayedAttributes: ["*"],
    filterableAttributes: ["belongsToEpisodeGuid", "id", "belongsToTranscriptId", "belongsToPodcastGuid", "start", "end"],
    rankingRules: ["text", "surroundingText", "words", "proximity", "exactness", "typo", "sort"],
    sortableAttributes: ["start"],
    pagination: {
      maxTotalHits: 5000,
    },
    stopWords: [],
  });
  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: ["*"],
    rankingRules: ["exactness", "proximity", "words"],
    pagination: {
      maxTotalHits: 25,
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
