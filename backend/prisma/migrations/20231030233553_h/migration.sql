/*
  Warnings:

  - You are about to drop the column `deletedFromMeilisearch` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `deletedFromMeilisearch` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `deletedFromMeilisearch` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `deletedFromMeilisearch` on the `Transcription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `deletedFromMeilisearch`;

-- AlterTable
ALTER TABLE `Podcast` DROP COLUMN `deletedFromMeilisearch`;

-- AlterTable
ALTER TABLE `Segment` DROP COLUMN `deletedFromMeilisearch`;

-- AlterTable
ALTER TABLE `Transcription` DROP COLUMN `deletedFromMeilisearch`;
