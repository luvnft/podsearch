/*
  Warnings:

  - You are about to alter the column `deviationTime` on the `Episode` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Episode` MODIFY `deviationTime` DOUBLE NULL;
