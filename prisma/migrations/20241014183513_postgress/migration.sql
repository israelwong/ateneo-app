-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "grado" TEXT,
    "grupo" TEXT,
    "matricula" TEXT NOT NULL,
    "alergias" TEXT,
    "tipo_sangre" TEXT,
    "padre_tutor" TEXT,
    "ciclo_escolar" TEXT,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_nombre_key" ON "Alumno"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_matricula_key" ON "Alumno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
