/*
  Warnings:

  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "EUserRole" NOT NULL DEFAULT 'CLIENT';

-- DropTable
DROP TABLE "user_profiles";
