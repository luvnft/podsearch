import * as fs from "fs";
import { Episode, PrismaClient, Segment, Transcription } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { config } from "dotenv";

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Establish connection
const prisma: PrismaClient = new PrismaClient();

// Function to update JSON content by adding the "name" key
async function updateJsonContent(file: string) {
  try {
    // Read the content of the file synchronously
    const data = fs.readFileSync(file, "utf8");
    // Parse JSON file content
    const jsonContent: {
      segments: any[];
      belongsToPodcastGuid: string;
      belongsToEpisodeGuid: string;
      text: string;
      language: string;
      youtubeVideoLink: string;
    } = JSON.parse(data);

    // Get the stuff from the db
    const episode: Episode = (await prisma.episode.findUnique({
      where: {
        episodeGuid: jsonContent.belongsToEpisodeGuid,
      },
    })) as Episode;

    // Add the "name" key
    jsonContent.youtubeVideoLink = episode.youtubeVideoLink as string;

    // Convert it back to a string with pretty formatting
    const updatedJsonContent = JSON.stringify(jsonContent, null, 2);
    // Write it back to the file synchronously
    fs.writeFileSync(file, updatedJsonContent, "utf8");
    console.log(`File is updated successfully: ${file}`);
  } catch (err) {
    console.error(`Error processing file ${file}: ${err}`);
  }
}

// Function to read the current directory and find all .json files
async function addNameToJsonFiles() {
  try {
    // Read the current directory synchronously
    const files = fs.readdirSync(process.cwd());

    // Filter out all files with .json extension
    const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json");

    // Update each JSON file with the new "name" key
    for await (const file of jsonFiles) {
      await updateJsonContent(file);
    }
  } catch (err) {
    console.error(`Error reading directory: ${err}`);
  }
}

// Run the function to start the process
addNameToJsonFiles();
