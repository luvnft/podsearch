import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fetch from "node-fetch";
import FormData from "form-data";
import axios from "axios";
dotenv.config({ path: "./.env" });
const prisma = new PrismaClient();
const apiUrl = "http://api.poddley.com/images/";
const imagesPath = "https://images.poddley.com/";

async function main() {
  const podcasts = await prisma.podcast.findMany();

  for await (const podcast of podcasts) {
    const count = await prisma.episode.count({
      where: {
        podcastGuid: podcast.podcastGuid,
      },
    });
    console.log("Podcast is: ", podcast.title, " has: ", count);

    const episode = await prisma.episode.findFirst({
      where: {
        podcastGuid: podcast.podcastGuid,
        AND: {
          podcastImage: {
            not: {
              contains: "images.poddley.com",
            },
          },
        },
      },
    });

    //Updating podcast with correct image
    console.log("Updating image");
    if (episode?.podcastImage) {
      await prisma.podcast.update({
        where: {
          podcastGuid: podcast.podcastGuid,
        },
        data: {
          imageUrl: episode.podcastImage,
        },
      });
    } else {
        console.log("PODDLEY???", podcast.title);
      continue;
    }
  }
}

main();
