/*
  Warnings:

  - Added the required column `time_end` to the `bingo_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_start` to the `bingo_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bingo_events" ADD COLUMN     "time_end" TEXT NOT NULL,
ADD COLUMN     "time_start" TEXT NOT NULL,
ALTER COLUMN "start_date" SET DATA TYPE TEXT,
ALTER COLUMN "end_date" SET DATA TYPE TEXT;
