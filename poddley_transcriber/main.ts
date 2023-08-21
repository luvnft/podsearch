import * as fs from "fs";
import { Episode, Podcast, Prisma, PrismaClient, PrismaPromise } from "@prisma/client";
import Database from "better-sqlite3";
import tags from "language-tags";
import Parser from "rss-parser";
import { v4 as uuidv4 } from "uuid";

interface GuidAndFeedAndLangAndTitle {
  podcastGuid: string;
  originalUrl: string;
  url: string;
  language: string;
  title: string;
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
      if (
        [
          "oldestItemPubdate",
          "explicit",
          "dead",
          "itunesId",
          "episodeCount",
          "lastHttpStatus",
          "lastUpdate",
          "popularityScore",
          "newestEnclosureDuration",
          "priority",
          "createdAt",
          "updateFrequency",
        ].includes(key)
      ) {
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
      console.log("ERROR: ", e.message);
      console.log("Trying to update");
      await prisma.podcast.update({
        data: object,
        where: {
          podcastGuid: object.podcastGuid,
        },
      });
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

function gatherPodcastsFromJsonFile(filename: string): { [key: string]: any }[] {
  // Connect to the sqlite database
  const db = new Database("./database/podcasts.db");
  db.pragma("journal_mode = WAL");

  // Open JSON file
  const jsonData = fs.readFileSync("./podcasts/podcasts.json", "utf8");
  const podcasts = JSON.parse(jsonData);

  // Create an index on the titles to make the query faster
  db.exec("CREATE INDEX IF NOT EXISTS titleIndex ON podcasts (title)");

  // Array to store all objects to insert
  const objectsToInsert: any[] = [];

  // Loop through the podcasts.json file and get the podcasts from the database with the correct information
  for (const title of Object.keys(podcasts)) {
    console.log("====>Title: ", title);

    const stmt = db.prepare("SELECT * FROM podcasts INDEXED BY titleIndex WHERE title LIKE ? LIMIT 1");
    const podcast = stmt.get(`%${title}%`);

    if (!podcast) {
      console.log("Didn't find title: ", title);
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

async function getGuidsAndFeedUrls(prisma: PrismaClient) {
  return await prisma.podcast.findMany({
    select: {
      originalUrl: true,
      podcastGuid: true,
      language: true,
      title: true,
      url: true,
    },
  });
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
      console.log(episodeData);
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

    if (Object.values(episode).some((value: any) => !value)) {
      continue;
    }

    episodes.push({
      episodeTitle: cleanString(episode.title),
      episodeLinkToEpisode: episode.link,
      episodeDuration: parseInt(episode.duration),
      episodeSummary: cleanString(episode.summary.substring(0, 950)),
      episodeEnclosure: episode.enclosure,
      episodeLanguage: language,
      podcastGuid: podcastGuid,
      episodeGuid: episode.guid,
      isTranscribed: false,
      youtubeVideoLink: null,
      deviationTime: null,
      indexed: false,
      id: uuidv4(),
      createdAt: null,
      updatedAt: null,
    });
  }
  return episodes;
}

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Get the top podcasts from the podcasts.db using the podcasts.json
  let objectsToInsert: any[] = gatherPodcastsFromJsonFile("./database/podcasts.db");

  // Fix the macro language, standardizing them and not differentiating between en.ZH etc.
  objectsToInsert = fixMacrolanguage(objectsToInsert);

  // Validate the objects before inserting them,
  objectsToInsert = validateObjectsBeforeInsert(objectsToInsert);

  // Insert the podcasts validated etc to the database
  await insertPodcastsAndUpdate(objectsToInsert, prisma);

  // Getting the RSS-FeedUrls and the podcastGuids
  const podcasts: GuidAndFeedAndLangAndTitle[] = await getGuidsAndFeedUrls(prisma);
  const rssFeedUrls: string[] = podcasts.map((p: any) => p.originalUrl);
  const rssFeedUrlsFallback: string[] = podcasts.map((p: any) => p.url);
  const podcastGuids: string[] = podcasts.map((p: any) => p.podcastGuid);
  const podcastLanguages: string[] = podcasts.map((p: any) => p.language);
  const podcastTitles: string[] = podcasts.map((p: any) => p.title);

  // Now looping over the episodes
  for (let i = 0; i < podcasts.length; i++) {
    const podcastRssFeedUrl: string = rssFeedUrls[i];
    const podcastRssFeedUrlFallback: string = rssFeedUrlsFallback[i];
    const podcastguid: string = podcastGuids[i];
    const podcastLanguage: string = podcastLanguages[i];
    const podcastTitle: string = podcastTitles[i];
    console.log("Processing: ", podcastRssFeedUrl);
    const episodes: Episode[] | undefined = await processRssFeedUrl(podcastRssFeedUrl, podcastguid, podcastLanguage, podcastRssFeedUrlFallback);
    if (!episodes) continue;

    //Add the episodes lolol'
    console.log("I: ", i);
    console.log("Adding episodes for podcast: ", JSON.stringify(podcastTitle));
    await prisma.episode.createMany({ data: episodes, skipDuplicates: true });
    console.log("Done adding episodes for podcast: ", podcastTitle);
  }

  // //  Get the top podcasts from the podcasts.db
  // sub1 = sp.Popen(["python3", "./getAndAddEpisodes.py"])
  // sub1.wait()

  // //  Get the top podcasts from the podcasts.db
  // sub1 = sp.Popen(["python3", "./transcribeAndDump.py"])
  // sub1.wait()
}

main();