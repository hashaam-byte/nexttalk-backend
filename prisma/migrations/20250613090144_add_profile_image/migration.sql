/*
  Warnings:

  - You are about to drop the column `Image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Image",
ADD COLUMN     "profileImage" TEXT;
