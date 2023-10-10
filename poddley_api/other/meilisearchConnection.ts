import { MeiliSearch } from "meilisearch";

const meilisearchConnection: MeiliSearch = new MeiliSearch({
  host: "https://meilisearch.poddley.com",
  apiKey: process.env.MEILISEARCH_API_KEY || "",
});

export default meilisearchConnection;
