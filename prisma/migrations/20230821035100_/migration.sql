/*
  Warnings:

  - You are about to drop the column `episodeAuthor` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `episodeImage` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `episodePublished` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `episodeAuthor`,
    DROP COLUMN `episodeImage`,
    DROP COLUMN `episodePublished`;
