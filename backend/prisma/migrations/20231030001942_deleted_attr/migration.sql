-- AlterTable
ALTER TABLE `Episode` ADD COLUMN `deletedFromMeilisearch` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Podcast` ADD COLUMN `deletedFromMeilisearch` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Segment` ADD COLUMN `deletedFromMeilisearch` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Transcription` ADD COLUMN `deletedFromMeilisearch` BOOLEAN NOT NULL DEFAULT false;
