/*
  Warnings:

  - You are about to drop the column `createdOnPazam` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `createdOnPazam` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `createdOnPazam` on the `Transcription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `createdOnPazam`;

-- AlterTable
ALTER TABLE `Podcast` DROP COLUMN `createdOnPazam`;

-- AlterTable
ALTER TABLE `Transcription` DROP COLUMN `createdOnPazam`;
