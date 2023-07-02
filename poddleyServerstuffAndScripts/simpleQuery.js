import { MeiliSearch } from "meilisearch";

// Load the environment variables from the .env file
async function main() {
  console.log("Running getTasks");
  const client = new MeiliSearch({ host: "localhost:7700" });
  const segmentsIndex = await client.index("segments");
  const d = await segmentsIndex.search("\"0466d540-6b19-4829-bcf4-2bccb0688857\"");
  console.log(d);
}

main();
