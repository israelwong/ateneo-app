import React, { useState, useEffect } from 'react';
import { generarQr, eliminarQr } from '@/app/libs/QRAlumno';
import { actualizarAlumno } from '@/app/libs/actions';
import Image from 'next/image';

interface Alumno {
    id: number;
    matricula: string;
    nombre: string;
    nivel: string;
    grado?: string | null;
    grupo?: string | null;
    alergia?: string | null;
    tipo_sangre?: string | null;
    mama?: string | null;
    papa?: string | null;
    autorizado_1?: string | null;
    autorizado_2?: string | null;
    autorizado_3?: string | null;
    ciclo_escolar?: string | null;
    qr?: string | null;
    estatus?: string;
    url_image?: string | null;
}

interface BtnGenerarQrAlumnoProps {
    alumno: Alumno | undefined;
    onQrGenerated: () => void;
}

const BtnGenerarQrEmpleado: React.FC<BtnGenerarQrAlumnoProps> = ({ alumno, onQrGenerated }) => {
    const [generandoQR, setGenerandoQR] = useState(false);
    const [eliminandoQR, setEliminandoQR] = useState(false);
    const [qrAvailable, setQrAvailable] = useState(false);

    useEffect(() => {
        if (alumno?.qr) {
            setQrAvailable(true);
        }
    }, [alumno]);

    async function handleEliminarQR(id: number) {
        const response = confirm('¿Estás seguro de eliminar el QR?');
        if (!response) return;

        if (alumno) {
            setEliminandoQR(true);
            const res = await eliminarQr(alumno);
            console.log('QR eliminado:', res);
            await actualizarAlumno(id, { ...alumno, qr: null });
            setEliminandoQR(false);
            setQrAvailable(false);
        }
    }

    const handleGenerateQR = async () => {
        if (!alumno) return;

        try {
            setGenerandoQR(true);
            const result_qr_generate = await generarQr(alumno);
            console.log('QR generado:', result_qr_generate);
            const response = await actualizarAlumno(alumno.id, { ...alumno, qr: result_qr_generate.url_svg });
            console.log('Empleado actualizado:', response);
            setQrAvailable(true);
            onQrGenerated();
        } catch (error) {
            console.error('Error al generar QR:', error);
        } finally {
            setGenerandoQR(false);
        }
    };

    return (
        <div className="text-center border p-2">
            { qrAvailable && alumno?.qr ? (
                <div className="mb-2">
                    <Image
                        src={alumno.qr}
                        alt={`QR Code for ${alumno.nombre}`}
                        width={200}
                        height={200}
                        className="mx-auto"
                    />
                    <button
                        onClick={() => handleEliminarQR(alumno.id)}
                        className="text-center text-red-500"
                        disabled={eliminandoQR}
                    >
                        {eliminandoQR ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            ) : (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleGenerateQR}
                    disabled={generandoQR}
                >
                    {generandoQR ? 'Generando...' : 'Generar QR'}
                </button>
            )}
        </div>
    );
};

export default BtnGenerarQrEmpleado;