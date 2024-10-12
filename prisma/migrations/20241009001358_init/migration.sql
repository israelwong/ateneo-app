-- CreateTable
CREATE TABLE "Alumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "grado" TEXT,
    "grupo" TEXT,
    "matricula" TEXT NOT NULL,
    "alergias" TEXT,
    "tipo_sangre" TEXT,
    "padre_tutor" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_nombre_key" ON "Alumno"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_matricula_key" ON "Alumno"("matricula");
