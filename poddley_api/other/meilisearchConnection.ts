import { MeiliSearch } from "meilisearch";

const meilisearchConnection: MeiliSearch = new MeiliSearch({
  host: "https://meilisearch.poddley.com",
  apiKey: process.env.MEILI_MASTER_KEY || "",
});

export default meilisearchConnection;
