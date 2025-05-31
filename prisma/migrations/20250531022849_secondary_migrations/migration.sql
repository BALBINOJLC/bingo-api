/*
  Warnings:

  - The values [SCHEDULED,COMPLETED,CANCELLED] on the enum `EBingoStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `cartons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `number` on the `cartons` table. All the data in the column will be lost.
  - The `_id` column on the `cartons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `carton_id` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EBingoStatus_new" AS ENUM ('INACTIVE', 'IN_PROGRESS', 'ACTIVE');
ALTER TABLE "bingo_events" ALTER COLUMN "status" TYPE "EBingoStatus_new" USING ("status"::text::"EBingoStatus_new");
ALTER TYPE "EBingoStatus" RENAME TO "EBingoStatus_old";
ALTER TYPE "EBingoStatus_new" RENAME TO "EBingoStatus";
DROP TYPE "EBingoStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "ETicketStatus" ADD VALUE 'PROCESSING_SOLD';

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_carton_id_fkey";

-- AlterTable
ALTER TABLE "bingo_events" ADD COLUMN     "numbers" INTEGER[];

-- AlterTable
ALTER TABLE "cartons" DROP CONSTRAINT "cartons_pkey",
DROP COLUMN "number",
DROP COLUMN "_id",
ADD COLUMN     "_id" SERIAL NOT NULL,
ADD CONSTRAINT "cartons_pkey" PRIMARY KEY ("_id");

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "carton_id",
ADD COLUMN     "carton_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "tickets_carton_id_key" ON "tickets"("carton_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_carton_id_fkey" FOREIGN KEY ("carton_id") REFERENCES "cartons"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
