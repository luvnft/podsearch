/*
  Warnings:

  - You are about to drop the column `addedDate` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `beingTranscribed` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `causedError` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `episodeAuthors` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `highestSimilarityVideo` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastAuthor` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastImage` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastLanguage` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastRssFeed` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastSummary` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `podcastTitle` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `reAlignedWithBigModel` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `addedDate`,
    DROP COLUMN `beingTranscribed`,
    DROP COLUMN `causedError`,
    DROP COLUMN `episodeAuthors`,
    DROP COLUMN `highestSimilarityVideo`,
    DROP COLUMN `isRead`,
    DROP COLUMN `podcastAuthor`,
    DROP COLUMN `podcastImage`,
    DROP COLUMN `podcastLanguage`,
    DROP COLUMN `podcastRssFeed`,
    DROP COLUMN `podcastSummary`,
    DROP COLUMN `podcastTitle`,
    DROP COLUMN `reAlignedWithBigModel`;
