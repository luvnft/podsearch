/*
  Warnings:

  - Added the required column `bytesPosition` to the `Segment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Segment` ADD COLUMN `bytesPosition` INTEGER NOT NULL;
