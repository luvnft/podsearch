/*
  Warnings:

  - You are about to drop the column `segmentWordEntries` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the `SearchLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Segment` DROP COLUMN `segmentWordEntries`;

-- DropTable
DROP TABLE `SearchLog`;
