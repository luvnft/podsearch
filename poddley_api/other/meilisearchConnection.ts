import { MeiliSearch } from "meilisearch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../.env" });

const meilisearchConnection: MeiliSearch = new MeiliSearch({
  host: process.env.MEILISEARCH_IP || "",
});

export default meilisearchConnection;