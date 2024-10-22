/*
  Warnings:

  - Added the required column `area` to the `personal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "personal" ADD COLUMN     "area" TEXT NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
