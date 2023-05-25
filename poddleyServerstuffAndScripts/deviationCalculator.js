import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import stringSimilarity from "string-similarity";
import fs from "fs";
import fetch from "node-fetch";
import { promisify } from "util";
import { exec, spawn } from "child_process";
import ytdl from "ytdl-core";
import Ffmpeg from "fluent-ffmpeg";
import youtube from "@yimura/scraper";
import path from "path";

const execPromisified = promisify(exec);
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadYouTubeAudio(link) {
  const fileSuffix = ".mp3";
  const filePrefix = new Date().getTime().toString();
  const file = `${filePrefix}${fileSuffix}`;

  try {
    console.log(`Starting download of YouTube audio from: ${link}`);

    const stream = ytdl(link, {
      filter: "audioonly",
    });

    const writeStream = fs.createWriteStream(file);

    stream.on("progress", (chunkLength, downloaded, total) => {
      const percent = ((downloaded / total) * 100).toFixed(2);
      process.stdout.write(`Downloaded ${percent}% \r`);
    });

    return await new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log(`Download complete: ${file}`);
        resolve(file);
      });
      writeStream.on("error", reject);
      stream.on("error", reject);

      stream.pipe(writeStream);
    });
  } catch (error) {
    console.error(`An error occurred while downloading the YouTube audio from: ${link}`, error);
    throw error;
  }
}

async function downloadAudioFile(url) {
  console.log("Downloading audio from: ", url);
  const filename = new Date().getTime().toString() + ".mp3";

  const response = await fetch(url);
  const writeStream = fs.createWriteStream(filename);
  response?.body?.pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve(filename));
    writeStream.on("error", reject(null));
  });
}

function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [scriptPath, ...args]);
    let dataToSend = "";
    python.stdout.on("data", (data) => {
      dataToSend = dataToSend + data.toString();
    });

    python.on("close", (code) => {
      return resolve(dataToSend);
    });

    python.stderr.on("data", (data) => {
      console.log("DATA: ", data.toString());
      reject(new Error(`Python Error: ${data}`));
    });
  });
}

async function getYoutubeLink(episode) {
  let videoLink = "";
  let data = null;
  const yt = new youtube.default();

  async function findYoutubeLink(title) {
    //Find youtube link
    data = await yt.search(title);
    if (data && data.videos && data.videos.length > 0) {
      const video = data.videos[0];
      const calculatedStringSimilarity = stringSimilarity.compareTwoStrings(title, video.title);
      if (calculatedStringSimilarity > 0.7) {
        console.log(video);
        return video.link;
      } else return "";
    }
    return "";
  }

  //Find youtube link
  videoLink = await findYoutubeLink(episode.episodeTitle);
  if (videoLink === "") {
    const titleWithoutDash = episode.episodeTitle.split("-").slice(-1)[0];
    videoLink = await findYoutubeLink(titleWithoutDash);
  }

  return videoLink;
}

async function findYoutubeLinkForEpisode(episode) {
  console.log("SEARCHING 🔎 EpisodeTitle==> ", episode?.episodeTitle || "NONE???");
  let videoLink = await getYoutubeLink(episode);
  if (videoLink) console.log("Found one⭐");
  else console.log("Didn't find one⛔");
  return videoLink;
}

function deleteAudioFiles() {
  const directory = "./"; // Replace with the actual directory path

  fs.readdirSync(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      if (file.endsWith(".mp3")) {
        const filePath = path.join(directory, file);

        fs.unlinkSync(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${filePath} - ${err}`);
          } else {
            console.log(`Deleted file: ${filePath}`);
          }
        });
      }
    });
  });
}

async function calculateDeviationForEpisode(foundVideoLink, episode) {
  if (!foundVideoLink) return null;
  console.log("HERE");
  //Download podcastAudio and videoAudio
  const audioFileName = await downloadAudioFile(episode.episodeEnclosure);
  const videoFileName = await downloadYouTubeAudio(foundVideoLink);

  console.log(audioFileName, "......", videoFileName);

  if (!audioFileName || !videoFileName) return null;

  //Calculate deviation
  console.log("Calculating deviation for episode: ", episode.episodeTitle);
  let data = await runPythonScript("findDeviationInt.py", [audioFileName, videoFileName]);

  //Update episodeDeviation
  //Deleting old audio files
  if (data) {
    const offset = data.trim();
    console.log("Offset is: ", offset);
    return parseFloat(offset);
  } else {
    return null;
  }
}

async function main() {
  while (true) {
    try {
      //Get a random episode
      const episode = await prisma.episode.findFirst({
        where: {
          isTranscribed: true,
          youtubeVideoLink: null,
          isRead: false,
        },
      });
      if (!episode) {
        console.log("No episode, quitting.");
        return;
      }
      const recentEpisode = await prisma.episode.findUnique({
        where: {
          episodeGuid: episode.episodeGuid,
        },
      });

      if (recentEpisode.isRead === true) continue;

      await prisma.episode.update({
        where: {
          episodeGuid: episode.episodeGuid,
        },
        data: {
          isRead: true,
        },
      });

      const foundVideoLink = await findYoutubeLinkForEpisode(episode);
      console.log(foundVideoLink);
      const deviationTime = await calculateDeviationForEpisode(foundVideoLink, episode);

      //Updating episode values
      await prisma.episode.update({
        where: {
          episodeGuid: episode.episodeGuid,
        },
        data: {
          deviationTime: deviationTime,
          youtubeVideoLink: foundVideoLink,
        },
      });
    } catch (e) {
      console.log("Some error occureed, not giving a fuck");
    }

    deleteAudioFiles();
  }
}

main();
