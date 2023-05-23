/*
  Warnings:

  - You are about to drop the column `isRead` on the `Podcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Episode` ADD COLUMN `isRead` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Podcast` DROP COLUMN `isRead`;
