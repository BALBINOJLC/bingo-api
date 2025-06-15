-- CreateEnum
CREATE TYPE "EGameStatus" AS ENUM ('IN_PROGRESS', 'FINISHED', 'PAUSED');

-- CreateTable
CREATE TABLE "game_bingo" (
    "_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" "EGameStatus" NOT NULL,
    "numbers_event" INTEGER[],
    "numbers_called" INTEGER[],
    "winners_cartons" INTEGER[],

    CONSTRAINT "game_bingo_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "game_bingo" ADD CONSTRAINT "game_bingo_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "bingo_events"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
