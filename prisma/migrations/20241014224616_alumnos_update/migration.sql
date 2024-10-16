/*
  Warnings:

  - You are about to drop the column `alergias` on the `Alumno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Alumno" DROP COLUMN "alergias",
ADD COLUMN     "alergia" TEXT,
ADD COLUMN     "url_image" TEXT,
ALTER COLUMN "ciclo_escolar" SET DEFAULT '2024-2025';
