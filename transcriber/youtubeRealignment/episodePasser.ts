import * as fs from "fs";
import { Episode, PrismaClient, Segment, Transcription } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { config } from "dotenv";
import { exec } from "child_process"; // <-- Add this

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Establish connection
const prisma: PrismaClient = new PrismaClient();

async function somePythonScript(episodeTitle: string, episodeEnclosure: string, episodeGuid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = exec(`python3 ./findYoutubeAndRealign.py "${episodeTitle}" "${episodeEnclosure}" "${episodeGuid}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const result = JSON.parse(stdout); // Assuming your Python script returns a JSON string.
      resolve(result);
    });
  });
}

async function main() {
  const episodes: Episode[] = await prisma.episode.findMany();

  for await (const episode of episodes) {
    const { youtubeVideoLink, deviationTime } = await somePythonScript(episode.episodeTitle, episode.episodeEnclosure, episode.episodeGuid);

    // Update episode
    await prisma.episode.updateMany({
      data: {
        youtubeVideoLink: youtubeVideoLink,
        deviationTime: deviationTime,
      },
      where: {
        episodeGuid: episode.episodeGuid,
      },
    });
  }

  // Finished
  console.log("Finished!");
}

main();
