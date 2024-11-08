/*
  Warnings:

  - You are about to drop the column `avatar_description` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "avatar_description",
ADD COLUMN     "avatarId" INTEGER;
