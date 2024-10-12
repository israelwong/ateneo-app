'use client'
import React, { useState } from 'react';
import Papa from 'papaparse';
import generarYSubirQRs from '@/app/libs/generarYSubirQRs'; // Asegúrate de importar la función correctamente

interface AlumnoProps {
    nombre: string;
    nivel: string;
    grado: string;
    grupo?: string;
}

function Page() {
    const [alumnos, setAlumnos] = useState<AlumnoProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [statusList, setStatusList] = useState<string[]>([]);
    const [totalGenerados, setTotalGenerados] = useState<number>(0);

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

    const handleGenerateQRs = async () => {
        setMessage(null);
        setError(null);
        setStatusList([]);
        setTotalGenerados(0);
        try {
            const qrCodes = await generarYSubirQRs(alumnos, (status: string) => {
                setStatusList(prevStatusList => [...prevStatusList, status]);
                setTotalGenerados(prevTotal => prevTotal + 1);
            });
            console.log('QRs generados:', qrCodes);
            setMessage(`Total QRs generados: ${qrCodes.length}`);
        } catch (error) {
            console.error('Error al generar los QRs:', error);
            setError('Error al generar los QRs.');
        }
    };

    return (
        <div className='mx-auto py-10 max-w-screen-lg'>

            <h3 className='text-center text-3xl uppercase py-5'>Leer CSV</h3>
            
            <input type="file" accept=".csv" onChange={handleFileUpload} 
            className='block mx-auto my-5'
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {alumnos.length > 0 && (
                <>
                    <table className='w-full table-auto my-10'>
                        <thead>
                            <tr className='text-center'>
                                <th>Nombre</th>
                                <th>Nivel</th>
                                <th>Grado</th>
                                <th>Grupo</th>
                            </tr>
                        </thead>
                        <tbody >
                            {alumnos.map((alumno, index) => (
                                <tr key={index} className='py-2'>
                                    <td>{alumno.nombre}</td>
                                    <td className='text-center'>{alumno.nivel}</td>
                                    <td className='text-center'>{alumno.grado}</td>
                                    <td className='text-center'>{alumno.grupo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className='bg-gray-800 text-white px-3 py-2' onClick={handleGenerateQRs}>Generar QRs</button>
                    {statusList.length > 0 && (
                        <ul className='my-5'>
                            {statusList.map((status, index) => (
                                <li key={index}>{status}</li>
                            ))}
                        </ul>
                    )}
                    {message && <p>{message}</p>}
                    <p className='py-5'>Total QRs generados: {totalGenerados}</p>
                </>
            )}
        </div>
    );
}

export default Page;