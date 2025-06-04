-- AlterEnum
ALTER TYPE "ETicketStatus" ADD VALUE 'GAIN';

-- AlterTable
ALTER TABLE "bingo_events" ADD COLUMN     "image_url" TEXT;
