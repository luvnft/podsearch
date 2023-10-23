import { MeiliSearch } from "meilisearch";
require("dotenv").config({ path: "../../.env" });

// Load the environment variables from the .env file
async function main() {
  console.log("Running meilisearch purger");
  const client = new MeiliSearch({ host: process.env.MEILI_HOST_URL as string, apiKey: process.env.MEILI_MASTER_KEY });

  const transcriptionsIndex = await client.index("transcriptions");
  const segmentsIndex = await client.index("segments");
  const episodesIndex = await client.index("episodes");
  const podcastsIndex = await client.index("podcasts");

  transcriptionsIndex.deleteAllDocuments();
  segmentsIndex.deleteAllDocuments();
  episodesIndex.deleteAllDocuments();
  podcastsIndex.deleteAllDocuments();
}

main();
