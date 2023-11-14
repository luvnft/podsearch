/*
  Warnings:

  - Made the column `youtubeVideoLink` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indexed` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `errorCount` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Podcast` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Podcast` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indexed` on table `Podcast` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indexed` on table `Segment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Segment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Segment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isYoutube` on table `Segment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indexed` on table `Transcription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Transcription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Transcription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Episode` MODIFY `youtubeVideoLink` VARCHAR(191) NOT NULL,
    MODIFY `indexed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `errorCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Podcast` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `indexed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Segment` MODIFY `indexed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `isYoutube` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Transcription` MODIFY `indexed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;
