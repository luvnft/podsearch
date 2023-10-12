"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const client_1 = require("@prisma/client");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const tar_1 = __importDefault(require("tar"));
const path_1 = __importDefault(require("path"));
function validateObjectsBeforeInsert(objectsToInsert) {
    console.log("Length is: ", objectsToInsert.length);
    if (objectsToInsert.length === 0) {
        return objectsToInsert;
    }
    const objectsToInsertCopy = [];
    objectsToInsert.forEach((object) => {
        const objectCopy = Object.assign({}, object);
        delete objectCopy["id"];
        delete object["lastUpdate"];
        delete object["oldestItemPubdate"];
        delete object["newestItemPubdate"];
        Object.keys(objectCopy).forEach((key) => {
            if (["oldestItemPubdate", "explicit", "dead", "itunesId", "episodeCount", "lastHttpStatus", "lastUpdate", "popularityScore", "newestEnclosureDuration", "priority", "createdAt", "updateFrequency"].includes(key)) {
                if (objectCopy[key] === null || objectCopy[key] === "") {
                    objectCopy[key] = 0;
                }
            }
            else {
                if (objectCopy[key] === null || objectCopy[key] === "") {
                    objectCopy[key] = "";
                }
            }
        });
        objectsToInsertCopy.push(objectCopy);
    });
    return objectsToInsertCopy;
}
async function insertPodcastsAndUpdate(objectsToInsert, prisma) {
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
        }
        catch (e) {
            console.log("ERROR: ", e.message);
            // console.log("Trying to update");
            // await prisma.podcast.update({
            //   data: object,
            //   where: {
            //     podcastGuid: object.podcastGuid,
            //   },
            // });
        }
    }
}
function fixMacrolanguage(objectsToInsert) {
    if (objectsToInsert.length === 0) {
        return objectsToInsert;
    }
    const objectsToInsertCopy = [];
    // Everything is english for now
    objectsToInsert.forEach((obj) => {
        obj.language = "en";
        objectsToInsertCopy.push(obj);
    });
    return objectsToInsertCopy;
}
function gatherPodcastsFromJsonFile(filename) {
    // Connect to the sqlite database
    const db = new better_sqlite3_1.default("./database/podcasts.db");
    db.pragma("journal_mode = WAL");
    // Open JSON file
    const jsonData = fs.readFileSync("../podcasts/podcasts.json", "utf8");
    const podcasts = JSON.parse(jsonData);
    // Create an index on the titles to make the query faster
    db.exec("CREATE INDEX IF NOT EXISTS titleIndex ON podcasts (title)");
    // Array to store all objects to insert
    const objectsToInsert = [];
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
function cleanString(str) {
    // Remove non-printable ASCII characters and some known problematic characters.
    return str.replace(/[^ -~]+/g, "");
}
async function getGuidsAndFeedUrls(prisma) {
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
async function processRssFeedUrl(rssFeedUrl, podcastGuid, language, podcastRssFeedUrlFallback) {
    var _a, _b, _c;
    const feedparser = new rss_parser_1.default();
    let episodes = [];
    let feed = undefined;
    try {
        feed = await feedparser.parseURL(rssFeedUrl);
    }
    catch (e) {
        console.log("OriginalRSS feed seemed to not have worked: ", e.message);
        try {
            feed = await feedparser.parseURL(podcastRssFeedUrlFallback);
        }
        catch (e) {
            console.log("Still doesn't work. Continuing by returning undefined");
            return undefined;
        }
    }
    for (const episodeData of feed.items) {
        if (!episodeData) {
            console.log(episodeData);
        }
        const episode = {
            title: (episodeData === null || episodeData === void 0 ? void 0 : episodeData.title) || "",
            link: (episodeData === null || episodeData === void 0 ? void 0 : episodeData.link) || ((_a = episodeData === null || episodeData === void 0 ? void 0 : episodeData.enclosure) === null || _a === void 0 ? void 0 : _a.url),
            published: new Date(episodeData.pubDate) || "",
            enclosure: ((_b = episodeData === null || episodeData === void 0 ? void 0 : episodeData.enclosure) === null || _b === void 0 ? void 0 : _b.url) || "",
            guid: (episodeData === null || episodeData === void 0 ? void 0 : episodeData.guid) || "",
            summary: (episodeData === null || episodeData === void 0 ? void 0 : episodeData.contentSnippet) || "",
            language: language || "en",
            duration: ((_c = episodeData === null || episodeData === void 0 ? void 0 : episodeData.enclosure) === null || _c === void 0 ? void 0 : _c.length) || "0",
        };
        if (Object.values(episode).some((value) => !value)) {
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
            id: (0, uuid_1.v4)(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    return episodes;
}
async function downloadWithProgress(url, outputPath) {
    const response = await axios_1.default.get(url, {
        responseType: "stream",
    });
    const totalLength = parseInt(response.headers["content-length"], 10);
    let downloaded = 0;
    let loggedPercent = 0; // Add a variable to keep track of logged percent
    response.data.on("data", (chunk) => {
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
    const prisma = new client_1.PrismaClient();
    await prisma.$connect();
    // Download the https://public.podcastindex.org/podcastindex_feeds.db.tgz and unzip it and rename it to podcasts.db if it doesnt exist in the ./database/podcasts.db folder
    const dbPath = "./database/podcasts.db";
    // If it doesn't exists.
    if (!fs.existsSync(dbPath)) {
        const downloadUrl = "https://public.podcastindex.org/podcastindex_feeds.db.tgz";
        const tempPath = path_1.default.join(__dirname, "podcastindex_feeds.db.tgz");
        await downloadWithProgress(downloadUrl, tempPath);
        console.log("\nDownload finished. Extracting...");
        await tar_1.default.x({ file: tempPath, C: path_1.default.dirname(dbPath) }); // Extract the .tgz to its folder
        fs.renameSync(path_1.default.join(path_1.default.dirname(dbPath), "podcastindex_feeds.db"), dbPath); // Rename the file
        fs.unlinkSync(tempPath); // Delete the .tgz file
        console.log("Extraction complete.");
    }
    // Get the top podcasts from the podcasts.db using the podcasts.json
    let objectsToInsert = gatherPodcastsFromJsonFile(dbPath);
    // Fix the macro language, standardizing them and not differentiating between en.ZH etc.
    objectsToInsert = fixMacrolanguage(objectsToInsert);
    // Validate the objects before inserting them,
    objectsToInsert = validateObjectsBeforeInsert(objectsToInsert);
    // Insert the podcasts validated etc to the database
    await insertPodcastsAndUpdate(objectsToInsert, prisma);
    // Getting the RSS-FeedUrls and the podcastGuids
    const podcasts = await getGuidsAndFeedUrls(prisma);
    const rssFeedUrls = podcasts.map((p) => p.originalUrl);
    const rssFeedUrlsFallback = podcasts.map((p) => p.url);
    const podcastGuids = podcasts.map((p) => p.podcastGuid);
    const podcastLanguages = podcasts.map((p) => p.language);
    const podcastTitles = podcasts.map((p) => p.title);
    // Now looping over the episodes
    for (let i = 0; i < podcasts.length; i++) {
        const podcastRssFeedUrl = rssFeedUrls[i];
        const podcastRssFeedUrlFallback = rssFeedUrlsFallback[i];
        const podcastguid = podcastGuids[i];
        const podcastLanguage = podcastLanguages[i];
        const podcastTitle = podcastTitles[i];
        console.log("Processing: ", podcastRssFeedUrl);
        const episodes = await processRssFeedUrl(podcastRssFeedUrl, podcastguid, podcastLanguage, podcastRssFeedUrlFallback);
        if (!episodes)
            continue;
        //Add the episodes lolol'
        console.log("I: ", i);
        console.log("Adding episodes for podcast: ", JSON.stringify(podcastTitle));
        await prisma.episode.createMany({ data: episodes, skipDuplicates: true });
        console.log("Done adding episodes for podcast: ", podcastTitle);
    }
    console.log("Finished crawling the rss-feeds of the db.");
}
async function mainRunner() {
    try {
        await main();
        console.log("Process completed. Waiting for the next run in 30 minutes.");
    }
    catch (err) {
        console.error("Failed to run the main function:", err);
    }
    finally {
        setTimeout(mainRunner, 30 * 60 * 1000); // 30 minutes in milliseconds 30 minutes * 60 seconds/min * 1000milliseconds/sec
    }
}
// Invoke the main function
mainRunner();
