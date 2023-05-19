import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PrismaClient, Podcast, Episode } from "@prisma/client";
import stringSimilarity from "string-similarity";
import usetube from "usetube";
import { YouTubeResults } from "usetube";

dotenv.config({ path: "../.env" });

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
      }
      console.log("Index is: ", index);
    } catch (e) {
      console.log("Error occurred, ignoring: ", e.message);
    }
  }
}
