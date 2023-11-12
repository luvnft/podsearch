/*
  Warnings:

  - You are about to drop the column `bytesPosition` on the `Segment` table. All the data in the column will be lost.
  - Added the required column `surroundingText` to the `Segment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Segment` DROP COLUMN `bytesPosition`,
    ADD COLUMN `surroundingText` VARCHAR(500) NOT NULL;
