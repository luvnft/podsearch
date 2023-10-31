import { config } from 'dotenv';
import path from "path";
import express, { Express } from "express";
import cors from "cors";
import transcriptionsRouter from "./routes/transcriptions";
import compression from "compression";
import { start as startIndexer } from "./workers/indexer";
import { start as startRssCrawler } from "./workers/rsscrawler";
import { start as startYoutubeFinder } from "./workers/rsscrawler";

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Setup
const app: Express = express();
const port: number = 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Use the routes
app.use("/transcriptions", transcriptionsRouter);

// Initialize App
const initializeApp = async () => {
  try {
    // API Server
    app.listen(port, () => {
      console.log(`API is listening at http://localhost:${port}`);
    });

    // Workers
    console.log("Indexer started!"); 
    startIndexer("* * * * *");

    console.log("RSSCrawler started!");
    startRssCrawler("* * * * *");

    console.log("YoutubeFinder started!");
    startYoutubeFinder("* * * * *");
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
};

// Start the app
initializeApp();

// Export them
export { app };
