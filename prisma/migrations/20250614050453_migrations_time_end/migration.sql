/*
  Warnings:

  - You are about to drop the column `commission` on the `bingo_events` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `bingo_events` table. All the data in the column will be lost.
  - Added the required column `time_end` to the `bingo_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bingo_events" DROP COLUMN "commission",
DROP COLUMN "end_date",
ADD COLUMN     "time_end" TEXT NOT NULL;
