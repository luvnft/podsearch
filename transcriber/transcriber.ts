import * as fs from "fs";
import { PrismaClient, Episode, Segment, Transcription } from "@prisma/client";
import { spawnSync } from "child_process";

async function getEpisodeWithLock(prisma: PrismaClient): Promise<Episode | null> {
  let episode: Episode;

  try {
    // Start a transaction
    await prisma.$executeRaw`START TRANSACTION;`;

    // Fetch and lock an episode that hasn't been transcribed yet
    const episodeResult: Episode[] = (await prisma.$executeRawUnsafe(`
      SELECT * FROM episode WHERE transcribed = false AND errorCount < 1 LIMIT 1 FOR UPDATE SKIP LOCKED;
    `)) as unknown as Episode[];

    if (episodeResult && episodeResult.length > 0) {
      episode = episodeResult[0];
      // Once done, update the episode as transcribed
      await prisma.episode.update({
        where: { id: episodeResult[0].id },
        data: {
          isTranscribed: true,
        },
      });
    } else {
      return null;
    }

    // Commit the transaction
    await prisma.$executeRaw`COMMIT;`;
  } catch (error) {
    // If something went wrong, rollback the transaction
    await prisma.$executeRaw`ROLLBACK;`;
    throw error;
  }
  return episode ? episode : null;
}

async function insertJsonFilesToDb(prisma: PrismaClient) {
  console.log("Checking if any new jsons have been added");

  const files = fs.readdirSync("./");

  // Looping over all the files inside the ".jsons folder which is inside the ../transcriber "
  for (const filename of files) {
    //If file is not .json continue
    if (!filename.endsWith(".json") || filename.startsWith(".")) {
      continue;
    }

    // Starting processing json
    console.log("Processing data from filename", filename);
    const fileContent = fs.readFileSync(filename, "utf-8");
    const data = JSON.parse(fileContent);

    // Extract data
    const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid } = data;

    // Assuming episodeGuid is provided from an external source and is available globally
    console.log("EpisodeGuid: ", belongsToEpisodeGuid);
    const episode: Episode | null = await prisma.episode.findUnique({
      where: { episodeGuid: belongsToEpisodeGuid },
    });

    // If episode is null continue:
    if (episode === null) continue;

    // Try adding the transcription or update if it exists
    const transcriptionData: Transcription = await prisma.transcription.upsert({
      where: {
        belongsToEpisodeGuid: belongsToEpisodeGuid,
      },
      create: {
        language,
        belongsToPodcastGuid,
        belongsToEpisodeGuid,
        transcription,
      },
      update: {
        language,
        belongsToPodcastGuid,
        belongsToEpisodeGuid,
        transcription,
      },
    });

    // The transcription
    const transcriptionId = transcriptionData.id;

    // Insert segments to the db
    const segmentData = segments.map((segment: Segment) => ({
      start: segment.start,
      end: segment.end,
      language,
      belongsToPodcastGuid,
      belongsToEpisodeGuid,
      belongsToTranscriptId: transcriptionId,
      text: segment.text,
    }));

    // Adding segments using a transaction and and upsert
    await prisma.$transaction(
      segmentData.map((segment: Segment) =>
        prisma.segment.upsert({
          where: { id: segment.id },
          update: {
            start: segment.start,
            end: segment.start,
            language: segment.language,
            belongsToPodcastGuid: segment.belongsToPodcastGuid,
            belongsToEpisodeGuid: segment.belongsToEpisodeGuid,
            belongsToTranscriptId: segment.belongsToTranscriptId,
            text: segment.text,
            indexed: segment.indexed,
            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
          },
          create: {
            start: segment.start,
            end: segment.start,
            language: segment.language,
            belongsToPodcastGuid: segment.belongsToPodcastGuid,
            belongsToEpisodeGuid: segment.belongsToEpisodeGuid,
            belongsToTranscriptId: segment.belongsToTranscriptId,
            text: segment.text,
            indexed: segment.indexed,
            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
          },
        })
      )
    );

    // Delete the file after it has been inserted into the database
    fs.unlinkSync(filename);
  }
}

const transcribe = async () => {
  // Establish connection
  const prisma: PrismaClient = new PrismaClient();

  // Grab an episode that has transcribedValue = false
  // Lock the row such that no other scripts can grab it.
  const episode: Episode | null = await getEpisodeWithLock(prisma);

  // Is episode undefined
  if (!episode) {
    console.log("No episode found for transcription.");
    return;
  }

  // Call the Python script and pass the necessary arguments
  const pythonProcess = spawnSync("python3", ["transcriber.py", episode.episodeEnclosure, episode.episodeTitle, episode.episodeGuid, episode.podcastGuid, "en"]);

  // If it values we gotta set the isTranscribed back to fale and increment the errorCount value to keep track of how many times the script has failed in case we are doing this across many machines
  if (pythonProcess.status !== 0) {
    console.log(`Python script exited with code ${pythonProcess.status}`);
    await prisma.episode.update({
      where: {
        episodeGuid: episode.episodeGuid,
      },
      data: {
        isTranscribed: false,
        errorCount: { increment: 1 }, // assuming errorCount is a field you want to increment
        // This increment is important because we could face the scenario where lets say 3 machines are transcribing. First machine grabs an episode to transcribe it, and fails doing so for whatever reason, then another machine will pick it up again and transcribe it again causing meaningless work. So once an episode fail we can avoid trying it again. Also the SKIP LOCK makes sure there wont mbe many machines that are waiting for another machine to release the lock on a specific row.
      },
    });
  } else {
    console.log("Transcription completed and JSON saved.");
    insertJsonFilesToDb(prisma);
  }
};

