-- AlterTable
ALTER TABLE `Episode` ADD COLUMN `indexed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Podcast` ADD COLUMN `indexed` BOOLEAN NOT NULL DEFAULT false;
