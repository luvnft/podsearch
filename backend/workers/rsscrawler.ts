import * as fs from "fs";
import { Episode, Podcast, PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";
import Parser from "rss-parser";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import tar from "tar";
import path from "path";
import FormData from "form-data";
import { CronJob } from "cron";

let isRunning: boolean = false;
const ACCOUNT_ID = "cc664ea0e464c8171ed71af53a1e3f5b";
const API_KEY = process.env.API_KEY as string;

function isUrl(url: string): boolean {
  try {
    const urlTemp: any = new URL(url);
  } catch (_) {
    return false;
  }

  return true;
}

async function uploadExternalImageToCloudflare(imageUrl: string, podcastTitle: string): Promise<any> {
  try {
    // Download the image into a buffer
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", Buffer.from(imageResponse.data), {
      filename: `${podcastTitle}.jpg`, // You might want to determine the filename dynamically
      contentType: "image/jpeg", // Change this based on the actual content type
    });

    // Set up the headers (including form data headers)
    const headers = {
      ...formData.getHeaders(),
      Authorization: `Bearer ${API_KEY}`,
    };

    // Make the request to Cloudflare
    const cloudflareResponse = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`, formData, { headers });

    console.log(cloudflareResponse.data);

    return cloudflareResponse.data;
  } catch (error) {
    console.error("An error occurred:", error);
  }

  return null;
}

function validateObjectsBeforeInsert(objectsToInsert: any[]): any[] {
  console.log("Length is: ", objectsToInsert.length);

  if (objectsToInsert.length === 0) {
    return objectsToInsert;
  }

  const objectsToInsertCopy: any[] = [];

  objectsToInsert.forEach((object) => {
    const objectCopy = { ...object };
    delete objectCopy["id"];
    delete object["lastUpdate"];
    delete object["oldestItemPubdate"];
    delete object["newestItemPubdate"];

    Object.keys(objectCopy).forEach((key) => {
      if (["oldestItemPubdate", "explicit", "dead", "itunesId", "episodeCount", "lastHttpStatus", "lastUpdate", "popularityScore", "newestEnclosureDuration", "priority", "createdAt", "updateFrequency"].includes(key)) {
        if (objectCopy[key] === null || objectCopy[key] === "") {
          objectCopy[key] = 0;
        }
      } else {
        if (objectCopy[key] === null || objectCopy[key] === "") {
          objectCopy[key] = "";
        }
      }
    });

    objectsToInsertCopy.push(objectCopy);
  });

  return objectsToInsertCopy;
}

async function insertPodcastsAndUpdate(objectsToInsert: any[], prisma: PrismaClient): Promise<void> {
  console.log("HERE=======================>");
  console.log("We are going to add: ", objectsToInsert);

  objectsToInsert.forEach((object) => {
    object.createdAt = new Date(object.createdOn * 1000).toISOString();
    delete object.createdOn;
    delete object.lastUpdate;
    delete object.oldestItemPubdate;
    delete object.newestItemPubdate;
  });

  for (const object of objectsToInsert) {
    try {
      console.log("Inserting podcast: ", object.title);
      await prisma.podcast.create({ data: object });
    } catch (e: any) {
      // For now I've decided to not consistently update the podcast and episodes that get inserted from the sqlite db from podcastindex regularly.
      console.log("ERROR: ", e.message);
    }
  }
}

function fixMacrolanguage(objectsToInsert: Array<{ [key: string]: any }>): Array<{ [key: string]: any }> {
  if (objectsToInsert.length === 0) {
    return objectsToInsert;
  }

  const objectsToInsertCopy: any[] = [];

  // Everything is english for now
  objectsToInsert.forEach((obj) => {
    obj.language = "en";
    objectsToInsertCopy.push(obj);
  });

  return objectsToInsertCopy;
}

async function gatherPodcastsFromJsonFile(): Promise<{ [key: string]: any }[]> {
  // Connect to the sqlite database
  const db = new Database("./workers/podcasts.db");
  db.pragma("journal_mode = WAL");

  // Open JSON file and grab the podcasts
  const jsonData = fs.readFileSync("./podcasts/podcasts.json", "utf8");
  const podcasts = JSON.parse(jsonData);

  // Array to store all objects to insert
  const objectsToInsert: any[] = [];

  // Loop through the podcasts.json file and get the podcasts from the database with the correct information
  for (const title of Object.keys(podcasts)) {
    console.log("====>Title: ", title);

    let stmt = db.prepare("SELECT * FROM podcasts  WHERE title = ? LIMIT 1");
    let podcast: Podcast = (await stmt.get(title)) as Podcast;

    if (!podcast) {
      continue;
    }

    objectsToInsert.push(podcast);
  }

  db.close(); // Close the database connection

  return objectsToInsert;
}

function cleanString(str: string) {
  // Remove non-printable ASCII characters and some known problematic characters.
  return str.replace(/[^ -~]+/g, "");
}

async function getPodcast(prisma: PrismaClient) {
  return await prisma.podcast.findMany();
}
async function processRssFeedUrl(rssFeedUrl: string, podcastGuid: string, language: string, podcastRssFeedUrlFallback: string): Promise<Episode[] | undefined> {
  const feedparser = new Parser();
  let episodes: Episode[] = [];
  let feed: any = undefined;
  try {
    feed = await feedparser.parseURL(rssFeedUrl);
  } catch (e: any) {
    console.log("OriginalRSS feed seemed to not have worked: ", e.message);
    try {
      feed = await feedparser.parseURL(podcastRssFeedUrlFallback);
    } catch (e: any) {
      console.log("Still doesn't work. Continuing by returning undefined");
      return undefined;
    }
  }

  for (const episodeData of feed.items) {
    if (!episodeData) {
      continue;
    }

    const episode = {
      title: episodeData?.title || "",
      link: episodeData?.link || episodeData?.enclosure?.url,
      published: new Date(episodeData.pubDate) || "",
      enclosure: episodeData?.enclosure?.url || "",
      guid: episodeData?.guid || "",
      summary: episodeData?.contentSnippet || "",
      language: language || "en",
      duration: episodeData?.enclosure?.length || "0",
    };

    episodes.push({
      episodeTitle: cleanString(episode.title),
      episodeLinkToEpisode: episode.link,
      episodeDuration: parseInt(episode.duration),
      episodeSummary: cleanString(episode.summary.substring(0, 950)),
      episodeEnclosure: episode.enclosure,
      episodeLanguage: language,
      podcastGuid: podcastGuid,
      episodeGuid: episode.guid,
      processed: false,
      youtubeVideoLink: null,
      indexed: false,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      errorCount: 0,
    });
  }

  console.log("The number of returned episodes is: ", episodes.length);
  return episodes;
}

async function downloadWithProgress(url: string, outputPath: string) {
  const response = await axios.get(url, {
    responseType: "stream",
  });

  const totalLength = parseInt(response.headers["content-length"], 10);
  let downloaded = 0;
  let loggedPercent = 0; // Add a variable to keep track of logged percent

  response.data.on("data", (chunk: any) => {
    downloaded += chunk.length;
    const currentPercent = Math.floor((downloaded / totalLength) * 100);

    // Log only when we cross a new 10% threshold
    if (currentPercent >= loggedPercent + 10) {
      loggedPercent = currentPercent;
      console.log(`Download Progress: ${loggedPercent}%`);
    }
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Main function
async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Download the https://public.podcastindex.org/podcastindex_feeds.db.tgz and unzip it and rename it to podcasts.db if it doesnt exist in the ./database/podcasts.db folder
  const dbPath = "./workers/podcasts.db";

  // If it doesn't exists.
  if (!fs.existsSync(dbPath)) {
    const downloadUrl = "https://public.podcastindex.org/podcastindex_feeds.db.tgz";
    const tempPath = path.join("./workers/podcastindex_feeds.db.tgz");
    await downloadWithProgress(downloadUrl, tempPath);
    console.log("\nDownload finished. Extracting...");

    await tar.x({ file: tempPath, C: path.dirname(dbPath) }); // Extract the .tgz to its folder
    fs.renameSync(path.join(path.dirname(dbPath), "podcastindex_feeds.db"), dbPath); // Rename the file
    // Just double check taht the temp is gone:
    if (fs.existsSync("./workers/podcastindex_feeds.db.tgz")) {
      fs.unlinkSync("./workers/podcastindex_feeds.db.tgz"); // Delete the .tgz file
    }
    console.log("Extraction complete.");
  }

  // Just double check that the temp is gone:
  if (fs.existsSync("./workers/podcastindex_feeds.db.tgz")) {
    fs.unlinkSync("./workers/podcastindex_feeds.db.tgz"); // Delete the .tgz file
  }

  // Get the top podcasts from the podcasts.db using the podcasts.json
  let objectsToInsert: any[] = await gatherPodcastsFromJsonFile();

  // Fix the macro language, standardizing them and not differentiating between en.ZH etc.
  objectsToInsert = fixMacrolanguage(objectsToInsert);

  // Validate the objects before inserting them,
  objectsToInsert = validateObjectsBeforeInsert(objectsToInsert);

  // Insert the podcasts validated etc to the database
  await insertPodcastsAndUpdate(objectsToInsert, prisma);

  // Get podcast
  const podcasts: Podcast[] = await getPodcast(prisma);

  // Upload images if they dont exist.
  console.log("Updating with images if necessary");

  for await (const podcast of podcasts) {
    console.log("Looping over: ", podcast);
    if (isUrl(podcast.imageUrl) === true) {
      console.log("Truthy);");
      const cloudflareImageId: any = await uploadExternalImageToCloudflare(podcast.imageUrl, podcast.podcastGuid);
      console.log("Halleluja", cloudflareImageId);
      console.log(cloudflareImageId.result);
      console.log(cloudflareImageId.result.id);
      if (cloudflareImageId.result.id) {
        console.log("Podcast: ", podcast);
        await prisma.podcast.update({
          data: {
            imageUrl: cloudflareImageId.result.id,
          },
          where: {
            podcastGuid: podcast.podcastGuid,
          },
        });
      }
    } else {
      console.log("Podcast: ", podcast.title, "has an image: ", podcast.imageUrl);
    }
  }

  // Getting the RSS-FeedUrls and the podcastGuids
  const rssFeedUrls: string[] = podcasts.map((p: any) => p.url);
  const rssFeedUrlsFallback: string[] = podcasts.map((p: any) => p.url);
  const podcastGuids: string[] = podcasts.map((p: any) => p.podcastGuid);
  const podcastLanguages: string[] = podcasts.map((p: any) => p.language);
  const podcastTitles: string[] = podcasts.map((p: any) => p.title);

  console.log("List of podcasts: ", podcasts.length);
  // Now looping over the episodes
  for (let i = 0; i < podcasts.length; i++) {
    const podcastRssFeedUrl: string = rssFeedUrls[i];
    const podcastRssFeedUrlFallback: string = rssFeedUrlsFallback[i];
    const podcastguid: string = podcastGuids[i];
    const podcastLanguage: string = podcastLanguages[i];
    const podcastTitle: string = podcastTitles[i];
    console.log("Processing: ", podcastRssFeedUrl);
    const episodes: Episode[] | undefined = await processRssFeedUrl(podcastRssFeedUrl, podcastguid, podcastLanguage, podcastRssFeedUrlFallback);
    if (!episodes || episodes.length === 0) continue;

    //Add the episodes lolol'
    console.log("I: ", i);
    console.log("Adding episodes for podcast: ", JSON.stringify(podcastTitle));
    console.log("Episodes to: ", episodes.length);

    await prisma.episode.createMany({
      data: episodes,
      skipDuplicates: true,
    });
    console.log("Done adding episodes for podcast: ", podcastTitle);
  }

  console.log("Finished crawling the rss-feeds of the db.");
}

async function start(cronExpression: string) {
  console.log("Cron-job RSSCrawler is turned ON.");
  const job = new CronJob(cronExpression, cronJobRunner);
  job.start();
}

async function cronJobRunner() {
  try {
    // If the job is already running, just return
    if (isRunning) {
      console.log("RSSCrawler is already running. Skipping...");
      return;
    }

    // Set the flag to true
    isRunning = true;
    console.log("Starting the RSSCrawler...");

    await main();
    isRunning = false;
  } catch (e) {
    console.log("Some kind of error in RSSCrawler: ", e);
  } finally {
    isRunning = false;
  }
}

export { start };
