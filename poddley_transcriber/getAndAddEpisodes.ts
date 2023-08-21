import axios from "axios";
import { PrismaClient, Podcast, Episode } from "@prisma/client";
import * as safeCast from "safe-cast";
import * as moment from "moment";

function fetchResponse(url: string): Promise<string | null> {
  return axios
    .get(url, { timeout: 30000 })
    .then((response) => {
      return response.data;
    })
    .catch((error) => null);
}

async function getTheEpisodes(requests, urls, guids) {
  let episodes = [];

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    if (!request) continue;

    let feed;
    try {
      feed = await feedparser.parse(request); // Assuming this is a valid function.
    } catch {
      continue;
    }

    if (!feed || feed.bozo === 1 || !feed.entries || feed.entries.length === 0 || (feed.status && feed.status !== 200)) {
      continue;
    }

    const podcastInfo = {
      author: feed.feed.author || "",
      title: feed.feed.title || "",
      summary: feed.feed.summary || "",
      language: feed.feed.language || "",
      image: (feed.feed.image && feed.feed.image.href) || null,
      rssFeed: urls[i],
      guid: guids[i],
    };

    if (!podcastInfo.author && !podcastInfo.title) {
      continue;
    }

    for (const episodeData of feed.entries) {
      const episode = {
        author: episodeData.author || podcastInfo.author,
        title: episodeData.title || null,
        image: (episodeData.image && episodeData.image.href) || "",
        link: episodeData.link || null,
        published: (episodeData.published_parsed && new Date(episodeData.published_parsed).getTime()) || "",
        enclosure: (episodeData.links && episodeData.links.find((link) => link.rel === "enclosure") && link.href) || null,
        guid: episodeData.id || null,
        authors: (episodeData.authors && episodeData.authors.map((author) => author.name)) || [podcastInfo.author],
        summary: episodeData.summary || "",
        language: episodeData.language || podcastInfo.language,
        duration: episodeData.itunes_duration || null,
      };

      if (episode.duration && episode.duration.includes(":")) {
        const parts = episode.duration.split(":").map((part) => parseInt(part));
        if (parts.length === 3) {
          episode.duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          episode.duration = parts[0] * 3600 + parts[1] * 60;
        }
      } else {
        episode.duration = safeCastToInt(episode.duration); // Assuming this function exists.
      }

      if (!episode.author || !episode.title || !episode.link || !episode.enclosure || !podcastInfo.rssFeed || !podcastInfo.author || !podcastInfo.title || !podcastInfo.guid || !episode.guid) {
        continue;
      }

      episodes.push({
        episodeAuthor: episode.author,
        episodeTitle: episode.title,
        episodeImage: episode.image,
        episodeLinkToEpisode: episode.link,
        episodePublished: episode.published,
        episodeDuration: episode.duration,
        episodeAuthors: episode.authors.join(","),
        episodeSummary: episode.summary.substring(0, 950),
        episodeEnclosure: episode.enclosure,
        episodeLanguage: episode.language,
        podcastRssFeed: podcastInfo.rssFeed,
        podcastAuthor: podcastInfo.author,
        podcastSummary: podcastInfo.summary.substring(0, 950),
        podcastLanguage: podcastInfo.language,
        podcastTitle: podcastInfo.title,
        podcastGuid: podcastInfo.guid,
        podcastImage: podcastInfo.image,
        episodeGuid: episode.guid,
      });
    }
  }

  return episodes;
}

async function addEpisodesToDatabase(episodes) {
  episodes.forEach((episode) => {
    try {
      const macroLanguageEpisode = langcodes.standardizeTag(episode["episodeLanguage"], true).split("-")[0];
      const macroLanguagePodcast = langcodes.standardizeTag(episode["podcastLanguage"], true).split("-")[0];

      const obj = {
        episodeAuthor: String(episode["episodeAuthor"]),
        episodeTitle: String(episode["episodeTitle"]),
        episodeImage: String(episode["episodeImage"]),
        episodeLinkToEpisode: String(episode["episodeLinkToEpisode"]),
        episodeAuthors: String(episode["episodeAuthors"]),
        episodeSummary: String(episode["episodeSummary"]),
        episodeEnclosure: String(episode["episodeEnclosure"]),
        episodeLanguage: "en",
        podcastRssFeed: String(episode["podcastRssFeed"]),
        podcastAuthor: String(episode["podcastAuthor"]),
        podcastSummary: String(episode["podcastSummary"]),
        podcastLanguage: "en",
        podcastTitle: String(episode["podcastTitle"]),
        podcastGuid: String(episode["podcastGuid"]),
        podcastImage: String(episode["podcastImage"]),
        episodeGuid: String(episode["episodeGuid"]),
        episodePublished: Number(episode["episodePublished"]) || 0,
        episodeDuration: Number(episode["episodeDuration"]) || 0,
      };

      obj["episodePublished"] = new Date(obj["episodePublished"] * 1000).toISOString(); // Convert to datetime in JavaScript
      requests.push(obj);
    } catch (e) {
      console.error(e);
    }
  });

  try {
    await prisma.episode.createMany({ data: requests, skipDuplicates: true });
  } catch (e) {
    console.error(e);
    console.error("Error:", e);
  }

  console.log(`Done inserting. Length of episodes is ${requests.length}\n`);
  console.log("Done adding this batch of episodes to database...");
}

async function main() {
  // Get all the rss-feeds and loop over all of the episodes and push the episodes to the db. THe uniqueConstraint blocks same episodes to overwrite each other
  const episodes: Episode[] = await Prisma.episode.findMany();
  episodes = getTheEpisodes(responses, urls, guids);
  await addEpisodesToDatabase(episodes);
}
