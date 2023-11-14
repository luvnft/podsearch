-- CreateTable
CREATE TABLE `Episode` (
    `id` VARCHAR(191) NOT NULL,
    `episodeTitle` VARCHAR(500) NOT NULL,
    `episodeLinkToEpisode` VARCHAR(500) NOT NULL,
    `episodeSummary` TEXT NOT NULL,
    `episodeEnclosure` VARCHAR(500) NOT NULL,
    `episodeLanguage` VARCHAR(500) NOT NULL,
    `podcastGuid` VARCHAR(500) NOT NULL,
    `episodeGuid` VARCHAR(500) NOT NULL,
    `episodeDuration` INTEGER NOT NULL,
    `youtubeVideoLink` VARCHAR(191) NULL,
    `indexed` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `errorCount` INTEGER NULL DEFAULT 0,
    `audioProcessed` BOOLEAN NOT NULL DEFAULT false,
    `youtubeProcessed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Episode_episodeGuid_key`(`episodeGuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Podcast` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `link` VARCHAR(500) NOT NULL,
    `contentType` VARCHAR(500) NOT NULL,
    `originalUrl` VARCHAR(500) NOT NULL,
    `itunesAuthor` VARCHAR(500) NOT NULL,
    `itunesOwnerName` VARCHAR(500) NOT NULL,
    `itunesType` VARCHAR(500) NOT NULL,
    `generator` VARCHAR(500) NOT NULL,
    `language` VARCHAR(500) NOT NULL,
    `chash` VARCHAR(500) NOT NULL,
    `host` VARCHAR(500) NOT NULL,
    `category1` VARCHAR(500) NOT NULL,
    `category2` VARCHAR(500) NOT NULL,
    `category3` VARCHAR(500) NOT NULL,
    `category4` VARCHAR(500) NOT NULL,
    `category5` VARCHAR(500) NOT NULL,
    `category6` VARCHAR(500) NOT NULL,
    `category7` VARCHAR(500) NOT NULL,
    `category8` VARCHAR(500) NOT NULL,
    `category9` VARCHAR(500) NOT NULL,
    `category10` VARCHAR(500) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `newestEnclosureUrl` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `podcastGuid` VARCHAR(191) NOT NULL,
    `explicit` INTEGER NOT NULL,
    `dead` INTEGER NOT NULL,
    `itunesId` INTEGER NOT NULL,
    `episodeCount` INTEGER NOT NULL,
    `lastHttpStatus` INTEGER NOT NULL,
    `popularityScore` INTEGER NOT NULL,
    `newestEnclosureDuration` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL,
    `updateFrequency` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `indexed` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `Podcast_podcastGuid_key`(`podcastGuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Segment` (
    `id` VARCHAR(191) NOT NULL,
    `start` DOUBLE NOT NULL,
    `end` DOUBLE NOT NULL,
    `language` VARCHAR(500) NOT NULL,
    `belongsToPodcastGuid` VARCHAR(500) NOT NULL,
    `belongsToEpisodeGuid` VARCHAR(500) NOT NULL,
    `belongsToTranscriptId` VARCHAR(500) NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `indexed` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isYoutube` BOOLEAN NULL DEFAULT false,
    `surroundingText` VARCHAR(500) NOT NULL,

    UNIQUE INDEX `Segment_belongsToEpisodeGuid_start_end_isYoutube_key`(`belongsToEpisodeGuid`, `start`, `end`, `isYoutube`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transcription` (
    `id` VARCHAR(191) NOT NULL,
    `language` VARCHAR(500) NOT NULL,
    `belongsToPodcastGuid` VARCHAR(500) NOT NULL,
    `belongsToEpisodeGuid` VARCHAR(500) NOT NULL,
    `transcription` MEDIUMTEXT NOT NULL,
    `indexed` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isYoutube` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Transcription_belongsToEpisodeGuid_isYoutube_key`(`belongsToEpisodeGuid`, `isYoutube`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_podcastGuid_fkey` FOREIGN KEY (`podcastGuid`) REFERENCES `Podcast`(`podcastGuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Segment` ADD CONSTRAINT `Segment_belongsToEpisodeGuid_fkey` FOREIGN KEY (`belongsToEpisodeGuid`) REFERENCES `Episode`(`episodeGuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Segment` ADD CONSTRAINT `Segment_belongsToPodcastGuid_fkey` FOREIGN KEY (`belongsToPodcastGuid`) REFERENCES `Podcast`(`podcastGuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Segment` ADD CONSTRAINT `Segment_belongsToTranscriptId_fkey` FOREIGN KEY (`belongsToTranscriptId`) REFERENCES `Transcription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transcription` ADD CONSTRAINT `Transcription_belongsToEpisodeGuid_fkey` FOREIGN KEY (`belongsToEpisodeGuid`) REFERENCES `Episode`(`episodeGuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transcription` ADD CONSTRAINT `Transcription_belongsToPodcastGuid_fkey` FOREIGN KEY (`belongsToPodcastGuid`) REFERENCES `Podcast`(`podcastGuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
