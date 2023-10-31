import * as stringSimilarity from "string-similarity";
import { Episode, Podcast, Prisma, PrismaClient } from "@prisma/client";
import * as path from "path";
import { config } from "dotenv";
import puppeteer from "puppeteer";
import { CronJob } from "cron";

let isRunning: boolean = false;
const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });
const prisma: PrismaClient = new PrismaClient();

function extractYoutubeURL(inputString: string) {
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=[^&]+/;
  const match = inputString.match(regex);

  return match ? match[0] : null; // Return the matched URL or null if not found
}

async function searchYouTube(episode: Episode & { podcast: Podcast }): Promise<any[]> {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(episode.podcast.title + " " + episode.episodeTitle + " " + episode.podcast.title)}`;
  console.log("Going to : ", searchUrl);
  await page.goto(searchUrl);

  // You can adjust the selector based on the structure of YouTube's search results page.
  const videoResults = await page.$$eval("ytd-video-renderer,ytd-grid-video-renderer", (nodes) =>
    nodes.slice(0, 5).map((node: any) => {
      const videoTitle = node.querySelector("#video-title").innerText;
      const videoLink = node.querySelector("#video-title").getAttribute("href");
      return {
        title: videoTitle,
        url: `https://www.youtube.com${videoLink}`,
      };
    }),
  );

  await browser.close();
  return videoResults;
}

async function main() {
  const episodes: (Episode & { podcast: Podcast })[] = await prisma.episode.findMany({
    include: {
      podcast: true,
    },
    // where: {
    //   youtubeVideoLink: null,
    // },
  });

  for await (const episode of episodes) {
    console.log("Processing: ", episode.episodeTitle);

    const results = await searchYouTube(episode);

    let bestMatch: {
      title: string;
      url: string;
    } | null = null;
    let highestScore = 0;

    for (const result of results) {
      const similarity = stringSimilarity.compareTwoStrings(episode.episodeTitle, result.title);
      console.log("Episode: ", result.title, " has score: ", similarity);
      if (similarity > highestScore) {
        highestScore = similarity;
        bestMatch = result;
      }
    }

    if (bestMatch) {
      console.log("Done processing that one, got youtubeLink", bestMatch.url);
      const matchedUrl: string | null = extractYoutubeURL(bestMatch.url);
      await prisma.episode.updateMany({
        data: {
          youtubeVideoLink: matchedUrl ? matchedUrl : "",
          indexed: false,
        },
        where: {
          episodeGuid: episode.episodeGuid,
        },
      });
    } else {
      console.log("No suitable match found for", episode.episodeTitle);
    }
  }

  console.log("Finished!");
}

async function start(cronExpression: string) {
  console.log("Cron-job YouTubeFinder is turned ON.");
  const job = new CronJob(cronExpression, cronJobRunner);
  job.start();
}

async function cronJobRunner() {
  try {
    // If the job is already running, just return
    if (isRunning) {
      console.log("YouTubeFinder is already running. Skipping...");
      return;
    }

    // Set the flag to true
    isRunning = true;
    console.log("Starting the YouTubeFinder...");

    await main();
    isRunning = false;
  } catch (e) {
    console.log("Some kind of error in YouTubeFinder: ", e);
  } finally {
    isRunning = false;
  }
}

main();

export { start };
