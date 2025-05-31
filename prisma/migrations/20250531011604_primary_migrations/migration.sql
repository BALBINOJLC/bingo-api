-- CreateEnum
CREATE TYPE "EBingoStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ETicketStatus" AS ENUM ('AVAILABLE', 'SOLD', 'USED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ECartonStatus" AS ENUM ('AVAILABLE', 'SOLD', 'USED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bingo_events" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "EBingoStatus" NOT NULL,
    "prize_pool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bingo_events_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "cartons" (
    "_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "ECartonStatus" NOT NULL,
    "event_id" TEXT NOT NULL,
    "numbers" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT,

    CONSTRAINT "cartons_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "_id" TEXT NOT NULL,
    "status" "ETicketStatus" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "carton_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_carton_id_key" ON "tickets"("carton_id");

-- AddForeignKey
ALTER TABLE "cartons" ADD CONSTRAINT "cartons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "bingo_events"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "bingo_events"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_carton_id_fkey" FOREIGN KEY ("carton_id") REFERENCES "cartons"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
