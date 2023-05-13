import axios from "axios";
import tar from "tar";
import fs from "fs";
import path from "path";
import ProgressBar from "progress";
import sqlite from "better-sqlite3";
import { open } from "fs/promises";
import tags, { Subtag } from "language-tags";
import { Podcast, PrismaClient, Episode } from "@prisma/client";
import Parser from "rss-parser";
import { Feed } from "types";
import { v4 as uuidv4 } from "uuid";
import { spawnSync } from "child_process";

const prisma = new PrismaClient();

async function downloadPodcastIndex() {
  console.log("Downloading");

  const podcastsURL = "https://public.podcastindex.org/podcastindex_feeds.db.tgz";
  const response = await axios.get(podcastsURL, { responseType: "stream" });
  const totalLength = parseInt(response.headers["content-length"], 10);
  const progressBar = new ProgressBar("-> downloading [:bar] :percent :etas", {
    width: 40,
    complete: "=",
    incomplete: " ",
    renderThrottle: 1,
    total: totalLength,
  });

  const writer = fs.createWriteStream("./podcastindex_feeds.db.tgz");
  response.data.on("data", (chunk: any) => progressBar.tick(chunk.length));
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function extractPodcastData() {
  console.log("Extracting .tgz");

  await tar.extract({
    file: "./podcastindex_feeds.db.tgz",
  });

  const files = fs.readdirSync(".");
  const name = files.find((file) => path.extname(file) === ".db");
  if (name) {
    fs.renameSync(name, "./podcasts.db");
  }
  console.log("Extracted podcastindex_feeds.db.tgz");
}

function cleanUpPodcastData() {
  fs.unlinkSync("./podcastindex_feeds.db.tgz");
}

async function prepareObjectsToInsert() {
  // Connect to the sqlite database
  const db = new sqlite("./podcasts.db");

  // Loop through the podcasts.json file and add the podcasts to the database with the correct information, these are the podcasts that we got from podcharts.com
  const file = await open("./podcasts.json");
  const jsonString = (await file.readFile()).toString();
  const parsedJson = JSON.parse(jsonString);
  file.close();

  // Array to store all objects to insert
  const objectsToInsert: any[] = [];
  console.log("Processing: ", Object.keys(parsedJson).length, " podcasts");
  for (let i = 0; i < Object.keys(parsedJson).length; i++) {
    const title = Object.keys(parsedJson)[i];
    const author = Object.values(parsedJson)[i];
    let rows: any = db.prepare("SELECT * FROM podcasts WHERE title LIKE ? AND itunesAuthor LIKE ? AND episodeCount > 0 LIMIT 5").all("%" + title + "%", "%" + author + "%");
    let podcasts = rows;
    if (podcasts.length === 0) {
      // console.log("Failed on: ", title, "trying with author");
      let rows: any = db.prepare("SELECT * FROM podcasts WHERE title LIKE ? AND itunesAuthor LIKE ? AND episodeCount > 0 LIMIT 5").all("%" + title + "%", "%" + author + "%");
      podcasts = rows;
    }
    if (podcasts.length === 0) {
      continue;
    }
    for (const podcast of podcasts) {
      console.log("====>Podcast: ", podcast.title);
      const objectToInsert: { [key: string]: any } = {};
      for (const key in podcast) {
        if (podcast.hasOwnProperty(key)) {
          objectToInsert[key] = podcast[key];
        }
      }
      if (objectToInsert.itunesId === "" || objectToInsert.itunesId === "" || objectToInsert.itunesId === null) {
        objectToInsert.itunesId = 0;
      }
      objectsToInsert.push(objectToInsert);
    }
  }

  console.log("Processed: ", objectsToInsert.length);

  return objectsToInsert;
}

function fixMacrolanguage(objectsToInsert: any[]): void {
  for (let i = 0; i < objectsToInsert.length; i++) {
    let obj = objectsToInsert[i];
    if (obj["language"] != null && obj["language"] != "") {
      try {
        let macroLanguages: Subtag[] = tags.subtags(obj["language"].trim().split("-")[0]);
        let macroLanguage: string = macroLanguages[0].format();
        console.log(macroLanguage);
      } catch (e) {
        console.log("error:", e);
      }
    }
  }
}

function validateObjectsBeforeInsert(objectsToInsert: any[]) {
  for (let object of objectsToInsert) {
    object["createdOn"] = new Date(object["createdOn"] * 1000);
    delete object["id"];
    delete object["lastUpdate"];
    delete object["oldestItemPubdate"];
    delete object["newestItemPubdate"];
  }
}

async function insertPodcastsToDatabase(objectsToInsert: any[]) {
  try {
    for (let object of objectsToInsert) {
      try {
        console.log("Inserting podcasts...: ", object["title"], "GUID: ", object.podcastGuid);
        const err = await prisma.podcast.create({ data: object });
      } catch (e: any) {
        console.log("ERROR: ", e);
      }
    }
  } catch (e) {
    console.error("Prisma connection error: ", e);
  }
  console.log("Done");
}

// Function that takes a podcast database and gets all the episodes from the feed for every podcast in the db
async function getAllPodcasts(): Promise<Podcast[]> {
  const podcasts: Podcast[] = await prisma.podcast.findMany();
  return podcasts || [];
}

async function parseRssGetEpisodes(podcast: Podcast): Promise<Episode[]> {
  console.log("Processing feed: ", podcast.title);
  const rssFeed: string = podcast.url;
  const parser = new Parser();
  const feed: Feed = (await parser.parseURL(rssFeed)) as unknown as Feed;
  const episodes: Episode[] = [];

  for (const item of feed.items) {
    let episode: Episode;
    try {
      episode = {
        episodeAuthor: item?.creator ? item?.creator : podcast.itunesAuthor,
        episodeTitle: item?.title,
        episodeImage: item?.itunes?.image ? item?.itunes?.image : podcast.imageUrl,
        episodeLinkToEpisode: item?.link ? item?.link : item?.enclosure.url,
        episodePublished: new Date(),
        episodeDuration: parseInt((item?.itunes?.duration || "0").toString()),
        episodeAuthors: item?.creator ? item?.creator : podcast.itunesAuthor,
        episodeSummary: item?.itunes?.summary ? item?.itunes?.summary : podcast.description,
        episodeEnclosure: item?.enclosure?.url,
        episodeLanguage: podcast.language,
        episodeGuid: item?.guid,

        podcastRssFeed: podcast.url,
        podcastAuthor: podcast.itunesAuthor,
        podcastSummary: podcast.description,
        podcastLanguage: podcast.language,
        podcastTitle: podcast.title,
        podcastGuid: podcast.podcastGuid,
        podcastImage: podcast.imageUrl,

        id: uuidv4(),
        createdOnPazam: new Date(),
        isTranscribed: false,
        causedError: false,
        beingTranscribed: false,
      };
    } catch (e) {
      console.log("Couldn't create that episode, skipping .... ");
      console.log(e);
      continue;
    }

    episodes.push(episode);
  }

  return episodes;
}

async function main() {
  // // Download the podcast, extract and rename, and delete leftovers
  // await downloadPodcastIndex();
  // await extractPodcastData();
  // cleanUpPodcastData();

  // Prepare and insert podcasts to database, skip duplicates
  // let objectsToInsert: any[] = await prepareObjectsToInsert();
  // fixMacrolanguage(objectsToInsert);
  // validateObjectsBeforeInsert(objectsToInsert);
  // await insertPodcastsToDatabase(objectsToInsert);

  // // Get all podcasts, parse rss-feed and add episodes to db
  // const podcasts: Podcast[] = await getAllPodcasts();
  // for (let i = 0; i < podcasts.length; i++) {
  //   const podcast: Podcast = podcasts[i];
  //   const episodes: Episode[] = await parseRssGetEpisodes(podcast);
  //   console.log("Episodes length: ", episodes.length, "for: ", podcast.title);

  //   await prisma.episode.createMany({
  //     data: episodes,
  //     skipDuplicates: true,
  //   });
  // }

  // Start transcribing them
  while (true) {
    const episode: Episode | null = await prisma.episode.findFirst({
      where: {
        beingTranscribed: false,
        isTranscribed: false,
        causedError: false,
      },
    });
    if(!episode) return;
    
    //Transcribe it.
    const python = spawnSync("python", ["./transcribe.py", JSON.stringify(episode)]);
    
  }
}

main();
