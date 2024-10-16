/*
  Warnings:

  - You are about to drop the column `padre_tutor` on the `Alumno` table. All the data in the column will be lost.
  - Added the required column `fecha_actualiziacion` to the `Alumno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alumno" DROP COLUMN "padre_tutor",
ADD COLUMN     "autorizado_1" TEXT,
ADD COLUMN     "autorizado_2" TEXT,
ADD COLUMN     "autorizado_3" TEXT,
ADD COLUMN     "estatus" TEXT NOT NULL DEFAULT 'Activo',
ADD COLUMN     "fecha_actualiziacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mama" TEXT,
ADD COLUMN     "papa" TEXT,
ADD COLUMN     "qr" TEXT;
