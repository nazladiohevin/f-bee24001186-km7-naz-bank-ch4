/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `identityNumber` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `identityType` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `destinationAccountId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAccountId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `bank_account_number` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_name` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_number` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_type` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination_account_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_account_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Bank_Name" AS ENUM ('bri', 'bni', 'mandiri', 'bca', 'muamalat');

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_destinationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_sourceAccountId_fkey";

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName",
DROP COLUMN "userId",
ADD COLUMN     "bank_account_number" TEXT NOT NULL,
ADD COLUMN     "bank_name" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3),
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "identityNumber",
DROP COLUMN "identityType",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "identity_number" TEXT NOT NULL,
ADD COLUMN     "identity_type" "Identity_Type" NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "destinationAccountId",
DROP COLUMN "sourceAccountId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "destination_account_id" INTEGER NOT NULL,
ADD COLUMN     "source_account_id" INTEGER NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_account_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
