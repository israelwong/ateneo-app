'use client'
import React, { useState } from 'react';
import Papa from 'papaparse';
import Image from 'next/image';


/*
    COMENTARIOS 
*/

interface AlumnoProps {
    nombre: string;
    nivel: string;
    grado: string;
    grupo?: string; // Hacer que grupo sea opcional
    matricula: string;
    alergias: string;
    tipo_sangre: string;
    padre_tutor: string;
}

function Page() {
    const [alumnos, setAlumnos] = useState<AlumnoProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [imagenesNoEncontradas, setImagenesNoEncontradas] = useState<Set<number>>(new Set());

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
                        setError('El archivo CSV no contiene datos válidos.');
                    }
                },
                error: (error) => {
                    console.error('Error al leer el archivo CSV:', error);
                    setError('Error al leer el archivo CSV.');
                }
            });
        }
    };

    const handleImageError = (index: number) => {
        setImagenesNoEncontradas((prev) => new Set(prev).add(index));
    };

    return (
        <div>
            <h3>Leer CSV para generar QRs y subir a supabase</h3>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {alumnos.length > 0 && (
                <table style={{ border: '1px solid black', width: '100%', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Nivel</th>
                            <th>Grado</th>
                            <th>Grupo</th>
                            <th>Matrícula</th>
                            <th>Alergias</th>
                            <th>Tipo de Sangre</th>
                            <th>Padre/Tutor</th>
                            <th>Imagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.map((alumno, index) => {
                            const imagePath = alumno.grupo
                                ? `/${alumno.nivel}/${alumno.grado}/${alumno.grupo}/${alumno.nombre}.jpg`
                                : `/${alumno.nivel}/${alumno.grado}/${alumno.nombre}.jpg`;

                            return (
                                <tr key={index}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.nivel}</td>
                                    <td>{alumno.grado}</td>
                                    <td>{alumno.grupo || 'N/A'}</td>
                                    <td>{alumno.matricula}</td>
                                    <td>{alumno.alergias}</td>
                                    <td>{alumno.tipo_sangre}</td>
                                    <td>{alumno.padre_tutor}</td>
                                    <td>
                                        {imagenesNoEncontradas.has(index) ? (
                                            <span>Sin imagen</span>
                                        ) : (
                                            <Image
                                                src={imagePath}
                                                alt={alumno.nombre}
                                                style={{ width: '100px' }}
                                                onError={() => handleImageError(index)}
                                                width={100}
                                                height={100}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Page;