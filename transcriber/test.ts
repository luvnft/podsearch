import * as fs from "fs";
import { Episode, PrismaClient, Segment, Transcription } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { config } from "dotenv";

const envPath = path.resolve(__dirname, "../.env");
config({ path: envPath });

// Establish connection
const prisma: PrismaClient = new PrismaClient();

async function getEpisodeWithLock() {
  try {
    return await prisma.$transaction(async (prisma) => {
      const episodes: {
        id: string;
      }[] = await prisma.$queryRaw`
        SELECT id
        FROM Episode
        WHERE processed = false AND errorCount < 1
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    `;
      if (episodes.length > 0) {
        const episodeId = episodes[0].id;
        console.log("EpisodeID:", episodeId);

        await prisma.$executeRaw`
            UPDATE Episode
            SET processed = true
            WHERE id = ${episodeId};
        `;

        const updatedEpisode: Episode = await prisma.$queryRaw`
            SELECT * FROM Episode WHERE id = ${episodeId};
        `;

        return updatedEpisode;
      }

      return null;
    });
  } catch (e) {
    console.log(e);
  }
}

getEpisodeWithLock();
