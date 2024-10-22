'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import { crearAlumno } from "@/app/libs/actions";
import Link from "next/link";

interface AlumnoProps {
    matricula: string;
    nombre: string;
    nivel: string;
    grado: string;
    grupo?: string;
    alergia?: string | null;
    tipo_sangre?: string | null;
    mama?: string;
    papa?: string | null;
    autorizado_1?: string | null;
    autorizado_2?: string | null; 
    autorizado_3?: string | null;
    ciclo_escolar?: string;
    qr?: string | null;
}

function UploadCSVAlumnos() {

    const [alumnos, setAlumnos] = useState<AlumnoProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveResults, setSaveResults] = useState<{ [key: number]: { success: boolean, error?: string } }>({});
    const [duplicatedMatriculas, setDuplicatedMatriculas] = useState<{ matricula: string, error: string }[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    const parsedData = results.data as AlumnoProps[];
                    if (parsedData && parsedData.length > 0) {
                        setAlumnos(parsedData);
                        setError(null);
                    } else {
                        setError("El archivo CSV no contiene datos válidos.");
                    }
                },
                error: (error) => {
                    console.error("Error al leer el archivo CSV:", error);
                    setError("Error al leer el archivo CSV.");
                },
            });
        }
    };

    async function guardarEnBaseDeDatos() {
        setIsSaving(true);
        const results: { [key: number]: { success: boolean, error?: string } } = {};
        const duplicates: { matricula: string, error: string }[] = [];
        for (const [index, alumno] of alumnos.entries()) {
            try {
                const response = await crearAlumno(alumno);
                results[index] = { success: response.success, error: response.success ? "Éxito" : response.error };
                if (!response.success && response.error === 'Matricula duplicada') {
                    duplicates.push({ matricula: alumno.matricula, error: response.error });
                }
                if (!response.success) {
                    console.error("Error al guardar el alumno:", response.error);
                }
            } catch (error) {
                console.error("Error al guardar el alumno:", error);
                results[index] = { success: false, error: (error as Error).message };
            }
            setSaveResults({ ...results }); // Actualizar el estado después de cada intento
        }
        setDuplicatedMatriculas(duplicates);
        setIsSaving(false);
    }

  return (
    <div className="mx-auto py-10 max-w-full">

    <div className="mx-auto max-w-screen-md py-10 text-center">
        <input 
        id="file_input"
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    </div>

    {error && <p style={{ color: "red" }}>{error}</p>}
    {alumnos.length > 0 && (
        <table
            className="w-full mt-5 border-collapse"
        >
            <thead>
                <tr>
                    <th className="border p-2">Matrícula</th>
                    <th className="border p-2">Nombre</th>
                    <th className="border p-2">Nivel</th>
                    <th className="border p-2">Grado</th>
                    <th className="border p-2">Grupo</th>
                    <th className="border p-2">Alergia</th>
                    <th className="border p-2">Tipo de Sangre</th>
                    <th className="border p-2">Mamá</th>
                    <th className="border p-2">Papá</th>
                    <th className="border p-2">Autorizado 1</th>
                    <th className="border p-2">Autorizado 2</th>
                    <th className="border p-2">Autorizado 3</th>
                    <th className="border p-2">Estatus</th>
                </tr>
            </thead>
            <tbody>
                {alumnos.map((alumno, index) => {
                    const result = saveResults[index];
                    const isSuccess = result?.success;
                    return (
                        <tr
                            key={index}
                            className={isSuccess === undefined ? "" : isSuccess ? "bg-green-100" : "bg-red-100"}
                        >
                            <td className="border p-2">{alumno.matricula}</td>
                            <td className="border p-2">{alumno.nombre}</td>
                            <td className="border p-2">{alumno.nivel}</td>
                            <td className="border p-2">{alumno.grado}</td>
                            <td className="border p-2">{alumno.grupo || "N/A"}</td>
                            <td className="border p-2">{alumno.alergia}</td>
                            <td className="border p-2">{alumno.tipo_sangre}</td>
                            <td className="border p-2">{alumno.mama}</td>
                            <td className="border p-2">{alumno.papa}</td>
                            <td className="border p-2">{alumno.autorizado_1}</td>
                            <td className="border p-2">{alumno.autorizado_2}</td>
                            <td className="border p-2">{alumno.autorizado_3}</td>
                            <td className="border p-2">{result?.error}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    )}

    {alumnos.length > 0 && (
        <div className="mx-auto pt-10 pb-3 items-center justify-center flex">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={guardarEnBaseDeDatos}
                disabled={isSaving}
            >
                {isSaving ? "Guardando registros..." : "Guardar en base de datos"}
            </button>
        </div>
    )}

    {duplicatedMatriculas.length > 0 && (
        <div className="mx-auto py-10 max-w-screen-md">
            <h3 className="text-2xl">Matrículas Duplicadas</h3>
            <table className="w-full mt-5 border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Matrícula</th>
                        <th className="border p-2">Estatus</th>
                    </tr>
                </thead>
                <tbody>
                    {duplicatedMatriculas.map((item, index) => (
                        <tr key={index} className="bg-red-100">
                            <td className="border p-2">{item.matricula}</td>
                            <td className="border p-2">{item.error}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}

    <div className="mx-auto items-center justify-center flex">
        <Link href="/dashboard/alumnos" className=" text-center bg-red-600 text-white px-3 py-2 rounded-sm">
        Cerrar ventana
        </Link>
    </div>
</div>
  )
}

export default UploadCSVAlumnos
