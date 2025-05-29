-- CreateEnum
CREATE TYPE "EUserRole" AS ENUM ('ADMIN', 'CLIENT', 'OWNER', 'USER', 'SUPER_ADMIN', 'GUEST');

-- CreateEnum
CREATE TYPE "EUserStatus" AS ENUM ('AUTORIZED', 'PENDING', 'CHEKING', 'LOCKED', 'REJECTED');

-- CreateTable
CREATE TABLE "Base" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "users" (
    "_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email_verify" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "phone_area" TEXT,
    "address" TEXT,
    "user_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_new" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "_id" TEXT NOT NULL,
    "role" "EUserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "files" (
    "_id" TEXT NOT NULL,
    "bucket" TEXT,
    "charter" TEXT,
    "color" TEXT,
    "extension" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "key" TEXT,
    "mimetype" TEXT,
    "name" TEXT NOT NULL,
    "size" INTEGER,
    "type" TEXT,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "_id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "file_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("file_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_user_id_key" ON "Avatar"("user_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
