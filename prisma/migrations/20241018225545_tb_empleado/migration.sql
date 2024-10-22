/*
  Warnings:

  - You are about to drop the `personal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "personal";

-- CreateTable
CREATE TABLE "empleado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "area" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "contacto_emergencia" TEXT,
    "tipo_sangre" TEXT,
    "url_image" TEXT,
    "qr" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualiziacion" TIMESTAMP(3),
    "estatus" TEXT NOT NULL DEFAULT 'Activo',

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empleado_nombre_key" ON "empleado"("nombre");
