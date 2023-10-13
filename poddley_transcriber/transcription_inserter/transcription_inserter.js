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
const path_1 = __importDefault(require("path"));
const jsonPath = "../transcriber";
async function insertJsonFilesToDb(prisma) {
    await prisma.$connect();
    console.log("Checking if any new jsons have been added");
    const files = fs.readdirSync("../transcriber/");
    // Looping over all the files inside the ".jsons folder which is inside the ../transcriber "
    for (const filename of files) {
        //If file is not .json continue
        if (!filename.endsWith(".json") || filename.startsWith(".")) {
            continue;
        }
        // Starting processing json
        console.log("Processing data from filename", filename);
        const fileContent = fs.readFileSync(path_1.default.join(jsonPath, filename), "utf-8");
        const data = JSON.parse(fileContent);
        // Extract data
        const { text: transcription, segments, language, belongsToPodcastGuid, belongsToEpisodeGuid } = data;
        // Assuming episodeGuid is provided from an external source and is available globally
        const episode = await prisma.episode.findUnique({
            where: { episodeGuid: belongsToEpisodeGuid },
        });
        // If episode is null continue:
        if (episode === null)
            continue;
        // Updating that episode to have isTranscribed to true
        await prisma.episode.update({
            where: { id: episode.id },
            data: { isTranscribed: true },
        });
        // Try adding the transcription or update if it exists
        const transcriptionData = await prisma.transcription.upsert({
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
        const segmentData = segments.map((segment) => ({
            start: segment.start,
            end: segment.end,
            language,
            belongsToPodcastGuid,
            belongsToEpisodeGuid,
            belongsToTranscriptId: transcriptionId,
            text: segment.text,
        }));
        // Adding segments using a transaction and and upsert
        await prisma.$transaction(segmentData.map((segment) => prisma.segment.upsert({
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
        })));
        // Delete the file after it has been inserted into the database
        fs.unlinkSync(path_1.default.join(jsonPath, filename));
    }
}
// Main Runner
async function mainRunner() {
    // Run every 1 min
    const runDuration = 60 * 1000;
    const prisma = new client_1.PrismaClient();
    try {
        await insertJsonFilesToDb(prisma);
        console.log(`Process completed. Waiting for the next run in ${runDuration / 3600} hours.`);
    }
    catch (err) {
        console.error("Failed to run the main function:", err);
    }
    finally {
        setTimeout(mainRunner, runDuration);
    }
}
// Invoke the main function
mainRunner();
