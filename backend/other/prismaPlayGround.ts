import { prismaConnection } from "../connections/prismaConnection";

async function main() {
  await prismaConnection.episode.updateMany({
    data: {
      youtubeProcessed: true,
    },

    where: {
      transcription: {
        some: {
          AND: {
            isYoutube: true,
          },
        },
      },
    },
  });
}

main();
