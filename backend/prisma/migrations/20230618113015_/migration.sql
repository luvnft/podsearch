-- CreateTable
CREATE TABLE `SearchLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `searchQuery` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Episode` (
    `id` VARCHAR(191) NOT NULL,
    `episodeAuthor` VARCHAR(500) NOT NULL,
    `episodeTitle` VARCHAR(500) NOT NULL,
    `episodeImage` VARCHAR(500) NOT NULL,
    `episodeLinkToEpisode` VARCHAR(500) NOT NULL,
    `episodeAuthors` VARCHAR(500) NOT NULL,
    `episodeSummary` TEXT NOT NULL,
    `episodeEnclosure` VARCHAR(500) NOT NULL,
    `episodeLanguage` VARCHAR(500) NOT NULL,
    `podcastRssFeed` VARCHAR(500) NOT NULL,
    `podcastAuthor` VARCHAR(500) NOT NULL,
    `podcastSummary` TEXT NOT NULL,
    `podcastLanguage` VARCHAR(500) NOT NULL,
    `podcastTitle` VARCHAR(500) NOT NULL,
    `podcastGuid` VARCHAR(500) NOT NULL,
    `podcastImage` VARCHAR(500) NOT NULL,
    `episodeGuid` VARCHAR(500) NOT NULL,
    `episodePublished` DATETIME(3) NOT NULL,
    `episodeDuration` INTEGER NOT NULL,
    `isTranscribed` BOOLEAN NOT NULL DEFAULT false,
    `beingTranscribed` BOOLEAN NOT NULL DEFAULT false,
    `causedError` BOOLEAN NOT NULL DEFAULT false,
    `addedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reAlignedWithBigModel` BOOLEAN NOT NULL DEFAULT false,
    `youtubeVideoLink` VARCHAR(191) NULL,
    `deviationTime` DOUBLE NULL,
    `highestSimilarityVideo` DOUBLE NULL,
    `isRead` BOOLEAN NULL DEFAULT false,
    `indexed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Episode_episodeGuid_key`(`episodeGuid`),
    INDEX `Episode_podcastGuid_fkey`(`podcastGuid`),
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `youtubeChannel` VARCHAR(191) NULL,
    `indexed` BOOLEAN NOT NULL DEFAULT false,

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
    `indexed` BOOLEAN NOT NULL DEFAULT false,
    `segmentWordEntries` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Segment_belongsToPodcastGuid_fkey`(`belongsToPodcastGuid`),
    INDEX `Segment_belongsToTranscriptId_fkey`(`belongsToTranscriptId`),
    UNIQUE INDEX `Segment_belongsToEpisodeGuid_start_end_key`(`belongsToEpisodeGuid`, `start`, `end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transcription` (
    `id` VARCHAR(191) NOT NULL,
    `language` VARCHAR(500) NOT NULL,
    `belongsToPodcastGuid` VARCHAR(500) NOT NULL,
    `belongsToEpisodeGuid` VARCHAR(500) NOT NULL,
    `transcription` MEDIUMTEXT NOT NULL,
    `indexed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transcription_belongsToEpisodeGuid_key`(`belongsToEpisodeGuid`),
    INDEX `Transcription_belongsToPodcastGuid_fkey`(`belongsToPodcastGuid`),
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
ALTER TABLE `Transcription` ADD CONSTRAINT `Transcription_belongsToPodcastGuid_fkey` FOREIGN KEY (`belongsToPodcastGuid`) REFERENCES `Podcast`(`podcastGuid`) ON DELETE CASCADE ON UPDATE CASCADE;
