-- CreateTable
CREATE TABLE "payments" (
    "_id" TEXT NOT NULL,
    "reference_payment" TEXT NOT NULL,
    "number_payment" TEXT NOT NULL,
    "amount_payment" DOUBLE PRECISION NOT NULL,
    "validations_response" JSONB NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
