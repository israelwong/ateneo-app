-- CreateTable
CREATE TABLE "personal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url_image" TEXT,
    "qr" TEXT,
    "contacto_emergencia" TEXT,
    "tipo_sangre" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualiziacion" TIMESTAMP(3),
    "estatus" TEXT NOT NULL DEFAULT 'Activo',

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_nombre_key" ON "personal"("nombre");
