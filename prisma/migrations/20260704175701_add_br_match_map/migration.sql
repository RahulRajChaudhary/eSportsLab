/*
  Warnings:

  - Added the required column `mapName` to the `BRMatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BRMatch" ADD COLUMN     "mapName" TEXT NOT NULL;
