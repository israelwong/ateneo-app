import React, { useState, useEffect } from 'react';
import { generarQr, eliminarQr } from '@/app/libs/QREmpleado';
import { actualizarEmpleado } from '@/app/libs/empleados';
import Image from 'next/image';

interface Empleado {
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
}

interface BtnGenerarQrEmpleadoProps {
    empleado: Empleado | undefined;
    onQrGenerated: () => void;
}

const BtnGenerarQrEmpleado: React.FC<BtnGenerarQrEmpleadoProps> = ({ empleado, onQrGenerated }) => {
    const [generandoQR, setGenerandoQR] = useState(false);
    const [eliminandoQR, setEliminandoQR] = useState(false);
    const [qrAvailable, setQrAvailable] = useState(false);

    useEffect(() => {
        if (empleado?.qr) {
            setQrAvailable(true);
        }
    }, [empleado]);

    async function handleEliminarQR(id: number) {
        const response = confirm('¿Estás seguro de eliminar el QR?');
        if (!response) return;

        if (empleado) {
            setEliminandoQR(true);
            await eliminarQr(empleado);
            await actualizarEmpleado(id, { ...empleado, qr: null });
            setEliminandoQR(false);
            setQrAvailable(false);
        }
    }

    const handleGenerateQR = async () => {
        if (!empleado) return;

        try {
            setGenerandoQR(true);
            const result_qr_generate = await generarQr(empleado);
            console.log('QR generado:', result_qr_generate);
            const response = await actualizarEmpleado(empleado.id, { ...empleado, qr: result_qr_generate.url_svg });
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
        <div className="text-center">
            { qrAvailable && empleado?.qr ? (
                <div className="mb-4">
                    <Image
                        src={empleado.qr}
                        alt={`QR Code for ${empleado.nombre}`}
                        width={100}
                        height={100}
                        className="mx-auto"
                    />
                    <button
                        onClick={() => handleEliminarQR(empleado.id)}
                        className="text-center text-red-800 mt-2"
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