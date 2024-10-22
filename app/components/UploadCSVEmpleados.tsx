"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { crearEmpleado } from "@/app/libs/empleados";
import Link from "next/link";

// EMPLEADOS
interface EmpleadoProps {
    id: number;
    nombre: string;
    telefono: string | null;
    email: string | null;
    area: string;
    puesto: string;
    contacto_emergencia: string | null;
    tipo_sangre: string | null;
    url_image: string | null;
    qr: string | null;
    fecha_registro: Date;
    fecha_actualiziacion: Date | null;
    estatus: string;
    fecha_actualizacion: Date
}

function UploadCSVEmpelados() {
    const [empleados, setEmpleados] = useState<EmpleadoProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveResults, setSaveResults] = useState<{
        [key: number]: { success: boolean; error?: string };
    }>({});

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    const parsedData = results.data as EmpleadoProps[];
                    if (parsedData && parsedData.length > 0) {
                        setEmpleados(parsedData);
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
        const results: { [key: number]: { success: boolean; error?: string } } = {};

        for (let i = 0; i < empleados.length; i++) {
            try {
                await crearEmpleado(empleados[i]);
                results[i] = { success: true };
            } catch (error) {
                results[i] = { success: false, error: (error as Error).message };
            }
        }
        setSaveResults(results);
        setIsSaving(false);
    }

    return (
        <div className="mx-auto py-10 max-w-full p-5">
            <div className="mx-auto max-w-screen-md text-center py-10">
                <input
                    id="file_input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {empleados.length > 0 && (
                <table className="w-full mt-5 border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">#</th>
                            <th className="border p-2">Nombre</th>
                            <th className="border p-2">Teléfono</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Área</th>
                            <th className="border p-2">Puesto</th>
                            <th className="border p-2">Contacto de Emergencia</th>
                            <th className="border p-2">Tipo de Sangre</th>
                            <th className="border p-2">URL Imagen</th>
                            <th className="border p-2">QR</th>
                            <th className="border p-2">Estatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map((empleado, index) => {
                            const result = saveResults[index];
                            const isSuccess = result?.success;
                            return (
                                <tr
                                    key={index}
                                    className={
                                        isSuccess === undefined
                                            ? ""
                                            : isSuccess
                                                ? "bg-green-100"
                                                : "bg-red-100"
                                    }
                                >
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{empleado.nombre}</td>
                                    <td className="border p-2">{empleado.telefono || "N/A"}</td>
                                    <td className="border p-2">{empleado.email || "N/A"}</td>
                                    <td className="border p-2">{empleado.area}</td>
                                    <td className="border p-2">{empleado.puesto}</td>
                                    <td className="border p-2">
                                        {empleado.contacto_emergencia || "N/A"}
                                    </td>
                                    <td className="border p-2">
                                        {empleado.tipo_sangre || "N/A"}
                                    </td>
                                    <td className="border p-2">{empleado.url_image || "N/A"}</td>
                                    <td className="border p-2">{empleado.qr || "N/A"}</td>
                                    <td className="border p-2">
                                        {result?.error || (isSuccess ? "Guardado" : "Pendiente")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {empleados.length > 0 && (
                <div className="mx-auto py-10 items-center justify-center flex">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={guardarEnBaseDeDatos}
                        disabled={isSaving}
                    >
                        {isSaving ? "Guardando registros..." : "Guardar en base de datos"}
                    </button>
                </div>
            )}

            <div className="text-center mx-auto flex items-center justify-center">
                <Link
                    href="/dashboard/empleados"
                    className="bg-blue-600 text-white p-2 rounded-md block text-center"
                >
                    Cerrar ventana
                </Link>
            </div>
        </div>
    );
}

export default UploadCSVEmpelados;
