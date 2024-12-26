/*
  Warnings:

  - Added the required column `password` to the `UserModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserModel" ADD COLUMN     "password" TEXT NOT NULL;
