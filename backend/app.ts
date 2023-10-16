import express, { Express } from "express";
import cors from "cors";
import transcriptionsRouter from "./routes/transcriptions";
import compression from "compression";
import { start as startIndexer } from "./workers/indexer";
import { start as startRssCrawler } from "./workers/rsscrawler";
import { config } from 'dotenv';
import path from 'path';

console.log("Trigger 2" )

// Ref to the env
config({ path: path.resolve(__dirname, '.env') });

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
    startIndexer(600)
    console.log("Indexer started!");

    // rsscrawler.start(3600);
    // console.log("RSS Crawler started!");
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
};

// Start the app
initializeApp();

// Export them
export { app };
