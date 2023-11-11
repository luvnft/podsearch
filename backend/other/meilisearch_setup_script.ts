import { MeiliSearch } from "meilisearch";
require("dotenv").config({ path: "../../.env" });

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: process.env.MEILI_HOST_URL as string, apiKey: process.env.MEILI_MASTER_KEY });

  const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  const episodesIndex = await client.index("episodes");
  const podcastsIndex = await client.index("podcasts");

  //Update indexes
  segmentsIndex.updateSettings({
    searchableAttributes: ["text"],
    displayedAttributes: ["*"],
    filterableAttributes: ["belongsToEpisodeGuid", "id", "belongsToTranscriptId", "belongsToPodcastGuid", "start", "end"],
    rankingRules: ["exactness", "words", "proximity", "typo", "sort"],
    sortableAttributes: ["start"],
    pagination: {
      maxTotalHits: 5000,
    },
    distinctAttribute: "id",
  });
  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: ["*"],
    rankingRules: ["exactness", "proximity", "typo", "words"],
    pagination: {
      maxTotalHits: 25,
    },
    distinctAttribute: "id",
  });
  podcastsIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["podcastGuid"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
    distinctAttribute: "podcastGuid",
  });
  episodesIndex.updateSettings({
    searchableAttributes: ["*"],
    displayedAttributes: ["*"],
    filterableAttributes: ["episodeGuid"],
    sortableAttributes: ["addedDate"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
    distinctAttribute: "episodeGuid",
  });
}

main();
