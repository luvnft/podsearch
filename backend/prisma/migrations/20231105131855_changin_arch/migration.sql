/*
  Warnings:

  - You are about to drop the column `endYoutube` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `startYoutube` on the `Segment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Segment` DROP COLUMN `endYoutube`,
    DROP COLUMN `startYoutube`,
    ADD COLUMN `isYoutube` BOOLEAN NULL DEFAULT false;
