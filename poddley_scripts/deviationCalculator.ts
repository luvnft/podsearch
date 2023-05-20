import * as dotenv from "dotenv";
import { PrismaClient, Podcast, Episode } from "@prisma/client";
import stringSimilarity from "string-similarity";
import usetube from "usetube";
import { YouTubeResults } from "usetube";
import fs from "fs";
import fetch, { Response } from "node-fetch";
import { downloadYouTubeAudio } from "./downloadYT";
import { promisify } from "util";
import { exec } from "child_process";
const execPromisified = promisify(exec);

dotenv.config({ path: "../.env" });

async function downloadAudioFile(url: string, filename: string) {
  const response: Response = await fetch(url);
  const writeStream = fs.createWriteStream(filename);

  response?.body?.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}


async function runPythonScript(scriptPath: any) {
  const command = `python ${scriptPath}`;

  try {
    const { stdout, stderr } = await execPromisified(command);

    if (stderr) {
      console.error(`Python script execution failed: ${stderr}`);
      throw new Error(stderr);
    }

    return stdout;
  } catch (error) {
    console.error(`Error executing Python script: ${error.message}`);
    throw error;
  }
}

//Grab all podcasts
const prisma = new PrismaClient();
const podcasts: Podcast[] = await prisma.podcast.findMany();

//Loop over the youtube channels and grab the youtube videos with their titles
for await (const podcast of podcasts) {
  if (!podcast.youtubeChannel) continue;
  console.log("Processing podcast: ", podcast.title);

  const episodes: Episode[] = await prisma.episode.findMany({
    where: {
      podcastGuid: podcast.podcastGuid,
      youtubeVideoLink: null,
      isTranscribed: true,
    },
  });

  if (!episodes) continue;

  console.log("Number of episodes to process is: ", episodes.length);
  let index = 0;

  //Looping over every episode and adding the correct videolink to each of them and then updating them at the end
  for (const episode of episodes) {
    try {
      index = index + 1;
      const data: YouTubeResults = await usetube.searchVideo(episode.episodeTitle);
      const correctResponse = data.videos[0];

      if (!episode?.episodeTitle || !correctResponse?.title) continue;
      const calculatedStringSimilarity: number = stringSimilarity.compareTwoStrings(episode.episodeTitle, correctResponse.title);

      const videoLink = "https://www.youtube.com/watch?v=" + correctResponse.id;

      if (calculatedStringSimilarity > 0.6) {
        console.log("Updating episode: ", episode.episodeTitle);
        await prisma.episode.update({
          where: {
            episodeGuid: episode.episodeGuid,
          },
          data: {
            youtubeVideoLink: videoLink,
          },
        });
      } else {
        await prisma.episode.update({
          where: {
            episodeGuid: episode.episodeGuid,
          },
          data: {
            youtubeVideoLink: "",
          },
        });
      }
      console.log("Index is: ", index, "now calculating deviations.");

      if (episode.youtubeVideoLink && !episode.deviationTime) {
        //Delete previous audioFiles
        if (fs.existsSync("./podcastAudio.mp3")) {
          fs.unlinkSync("./podcastAudio.mp3");
        }
        if (fs.existsSync("./videoAudio.mp3")) {
          fs.unlinkSync("./videoAudio.mp3");
        }
        //Download podcastAudio and videoAudio
        await downloadAudioFile(episode.episodeEnclosure, "podcastAudio.mp3");
        await downloadYouTubeAudio(episode.youtubeVideoLink, "videoAudio.mp3");

        //Calculate deviation
        await runPythonScript("./findDeviationInt.py")

      }
    } catch (e) {
      console.log("Error occurred, ignoring: ", e.message);
    }
  }
}
