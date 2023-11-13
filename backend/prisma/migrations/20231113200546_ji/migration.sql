/*
  Warnings:

  - A unique constraint covering the columns `[belongsToEpisodeGuid,isYoutube]` on the table `Transcription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Transcription` DROP FOREIGN KEY `Transcription_belongsToPodcastGuid_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `Transcription_belongsToEpisodeGuid_isYoutube_key` ON `Transcription`(`belongsToEpisodeGuid`, `isYoutube`);

-- AddForeignKey
ALTER TABLE `Transcription` ADD CONSTRAINT `Transcription_belongsToPodcastGuid_fkey` FOREIGN KEY (`belongsToPodcastGuid`) REFERENCES `Podcast`(`podcastGuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
