-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "amount_payment" DOUBLE PRECISION,
ADD COLUMN     "number_payment" TEXT,
ADD COLUMN     "reference_payment" TEXT;
