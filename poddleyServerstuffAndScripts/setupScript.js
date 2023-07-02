import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: "https://meilisearch.poddley.com" });

  const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  const episodesIndex = await client.index("episodes");
  const podcastsIndex = await client.index("podcasts");

  segmentsIndex.updateFilterableAttributes(["belongsToEpisodeGuid", "id"]);
  podcastsIndex.updateFilterableAttributes(["podcastGuid"]);
  episodesIndex.updateFilterableAttributes(["episodeGuid"]);

  //Update ranking rules for seg and tra
  segmentsIndex.updateSettings({
    searchableAttributes: ["text", "id"],
    displayedAttributes: ["*"],
    filterableAttributes: ["belongsToEpisodeGuid", "id", "belongsToPodcastGuid", "belongsToTranscriptGuid"],
    rankingRules: ["sort", "proximity", "typo", "words"],
    sortableAttributes: ["start"],
  });
  transcriptionsIndex.updateSettings({
    searchableAttributes: ["transcription"],
    displayedAttributes: ["*"],
    rankingRules: ["proximity", "typo", "words"],
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
