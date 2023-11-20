import * as stringSimilarity from "string-similarity";
import { Episode, Podcast, Prisma, PrismaClient } from "@prisma/client";
import * as path from "path";
import { config } from "dotenv";
import puppeteer from "puppeteer";
import { CronJob } from "cron";
import { prismaConnection } from "../connections/prismaConnection";

let isRunning: boolean = false;
const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

function extractYoutubeURL(inputString: string) {
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=[^&]+/;
  const match = inputString.match(regex);

  return match ? match[0] : null; // Return the matched URL or null if not found
}

async function makeSearchInYoutubePage(page) {
  return await page.$eval("ytd-item-section-renderer a", (node: any) => {
    const videoLink = node.getAttribute("href");
    const fullVideoLink: string = "https://www.youtube.com" + videoLink;
    console.log("fullVideoLink: ", fullVideoLink);
    return fullVideoLink || null;
  });
}

async function searchYouTube(episodes: (Episode & { podcast: Podcast })[]): Promise<(string | null)[]> {
  const noCookiesExtension: string = path.join(process.cwd(), "./puppeteerExtensions/IDontCareAboutCookies/");
  const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox", `--disable-extensions-except=${noCookiesExtension}`, `--load-extension=${noCookiesExtension}`] });
  const page = await browser.newPage();
  const youtubeUrls: (string | null)[] = [];
  let index: number = 0;

  // I need this just so tbat I can see what the hell is going on inside the $eval lol
  page.on("console", async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  for await (const episode of episodes) {
    console.log("Index is: ", index);
    const searchUrl = `https://www.youtube.com/${episode.podcast.youtubeChannelId}/search?query=${encodeURIComponent(episode.podcast.title + " " + episode.episodeTitle)}`;
    console.log("Going to : ", searchUrl);

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
    });

    // First time youtube page loads it shows a cookie banner which will block normal flow, no thanks for cookies extensions takes about 5 seconsd to click on the banner and cause youtube to renavigate.
    if (index === 0) {
      await page.waitForNetworkIdle({
        idleTime: 5000,
      });
    }

    await page.waitForSelector("ytd-item-section-renderer a", {
      timeout: 30000,
    });

    try {
      const youtubeUrl = await makeSearchInYoutubePage(page);
      youtubeUrls.push(youtubeUrl);
    } catch (e) {
      console.log("Failed, but trying again");
      // If it fails we do something stupid. We split the string in 2 and take the last bit and search for that trololo
      const splittedString: string[] = episode.episodeTitle.split(" ");
      const newSearchString: string = splittedString.slice(splittedString.length / 2).join(" ");
      const searchUrl = `https://www.youtube.com/${episode.podcast.youtubeChannelId}/search?query=${encodeURIComponent(newSearchString)}`;
      console.log("Going to : ", searchUrl);

      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
      });

      await page.waitForSelector("ytd-item-section-renderer a", {
        timeout: 30000,
      });

      const youtubeUrl = await makeSearchInYoutubePage(page);
      youtubeUrls.push(youtubeUrl);
      console.log(e);
    }

    index = index + 1;
  }

  await browser.close();
  return youtubeUrls;
}

async function main() {
  const episodes: (Episode & { podcast: Podcast })[] = await prismaConnection.episode.findMany({
    include: {
      podcast: true,
    },
    // where: {
    //   youtubeVideoLink: null,
    //   youtubeProcessed: false,
    // },
  });

  console.log("Episodes: ", episodes.length);

  if (episodes.length) {
    // Gather youtubeLinks
    const youtubeVideoLinks: (string | null)[] = await searchYouTube(episodes);
    console.log(youtubeVideoLinks);

    for (let i = 0; i < episodes.length; i++) {
      const youtubeVideoLink: string | null = youtubeVideoLinks[i];
      const episode: Episode = episodes[i];
      console.log("Processing: ", episode.episodeTitle);

      if (youtubeVideoLink) {
        console.log("Done processing that one, got youtubeLink", youtubeVideoLink);
        if (youtubeVideoLink !== episode.youtubeVideoLink) {
          console.log("🅾️No match: ", youtubeVideoLink, " and youtubeVideoLink: ", episode.youtubeVideoLink);
          await prismaConnection.episode.updateMany({
            data: {
              youtubeVideoLink: youtubeVideoLink ? youtubeVideoLink : "",
              indexed: false,
            },
            where: {
              episodeGuid: episode.episodeGuid,
            },
          });
          // Delete all segments and transcriptions that are for this episode.
          await prismaConnection.transcription.delete({
            where: {
              belongsToEpisodeGuid_isYoutube: {
                isYoutube: true,
                belongsToEpisodeGuid: episode.episodeGuid,
              },
            },
          });
          await prismaConnection.segment.deleteMany({
            where: {
              belongsToEpisodeGuid: episode.episodeGuid,
              isYoutube: true,
            },
          });
          await prismaConnection.episode.update({
            where: {
              episodeGuid: episode.episodeGuid,
            },
            data: {
              youtubeProcessed: false,
            },
          });
        } else {
          console.log("✅Found a match, so not updating...");
        }
      } else {
        console.log("No suitable match found for", episode.episodeTitle);
      }
    }
  }

  console.log("Finished!");
}

async function start(cronExpression: string) {
  const job = new CronJob(cronExpression, cronJobRunner);
  job.start();
  console.log("Cron-job YouTubeFinder is turned ON.");
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
