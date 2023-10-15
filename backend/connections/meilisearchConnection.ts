import { MeiliSearch } from "meilisearch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });

const meilisearchConnection: MeiliSearch = new MeiliSearch({
  host: process.env.MEILI_HOST_URL as string,
  apiKey: process.env.MEILI_MASTER_KEY as string,
});

export { meilisearchConnection };
 