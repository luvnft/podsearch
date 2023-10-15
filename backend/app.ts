//Average stuff needed
import express, { Express } from "express";
import cors from "cors";
import transcriptionsRouter from "./routes/transcriptions";
import compression from "compression";
import { Prisma, PrismaClient } from "@prisma/client";
import { MeiliSearch } from "meilisearch";
import { indexer } from "./workers/indexer";
import { rsscrawler } from "./workers/rsscrawler";

// Declare connections in outer scope to export later
let prismaConnection: PrismaClient;
let meilisearchConnection: MeiliSearch;

//Setup
const app: Express = express();
const port: number = 3000;

//Enable CORS for front-end use and compression
app.use(compression());
app.use(cors());

//Enabling body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//Use the routes
app.use("/transcriptions", transcriptionsRouter);

// Define a function to initialize connections and server
async function initializeApp() {
  try {
    // 1. Connect to MeiliSearch
    meilisearchConnection = new MeiliSearch({
      host: process.env.MEILI_HOST_URL,
      apiKey: process.env.MEILI_MASTER_KEY,
    });
    console.log("Connected to MeiliSearch");

    // 2. Connect to Prisma
    prismaConnection = new PrismaClient();
    await prismaConnection.$connect();
    console.log("Connected to Prisma");

    // 3. Start the API server
    app.listen(port, () => {
      console.log(`Poddley API is listening at http://localhost:${port}`);
    });

    // 4. Start the workers
    indexer.start(600);
    console.log("Indexer started!");

    rsscrawler.start(3600);
    console.log("RSS Crawler started!");
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
}

// Start the app
initializeApp();

//Export them
export { app, prismaConnection, meilisearchConnection };
