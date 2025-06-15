/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `game_bingo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "game_bingo_event_id_key" ON "game_bingo"("event_id");
