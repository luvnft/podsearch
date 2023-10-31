/*
  Warnings:

  - You are about to drop the column `isTranscribed` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `isTranscribed`,
    ADD COLUMN `processed` BOOLEAN NOT NULL DEFAULT false;
