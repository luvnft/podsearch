import { MeiliSearch } from "meilisearch";

const meilisearchConnection: MeiliSearch = new MeiliSearch({
  host: process.env.MEILI_HOST_URL as string,
  // apiKey: process.env.MEILI_MASTER_KEY as string,
});


export { meilisearchConnection };
 