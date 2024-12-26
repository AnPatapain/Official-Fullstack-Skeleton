/*
  Warnings:

  - Added the required column `createdAt` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiredAt` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;
