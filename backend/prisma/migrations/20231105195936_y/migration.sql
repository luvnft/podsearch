/*
  Warnings:

  - You are about to drop the column `processed` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `processed`,
    ADD COLUMN `audioProcessed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `youtubeProcessed` BOOLEAN NOT NULL DEFAULT false;
