import { meilisearchConnection } from "../connections/meilisearchConnection";

// Load the environment variables from the .env file
async function main() {
  console.log("Running meilisearch purger");

  const transcriptionsIndex = meilisearchConnection.index("transcriptions");
  const segmentsIndex = meilisearchConnection.index("segments");
  const episodesIndex = meilisearchConnection.index("episodes");
  const podcastsIndex = meilisearchConnection.index("podcasts");

  transcriptionsIndex.deleteAllDocuments();
  segmentsIndex.deleteAllDocuments();
  episodesIndex.deleteAllDocuments();
  podcastsIndex.deleteAllDocuments();
}

main();
