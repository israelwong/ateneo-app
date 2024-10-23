import React, { useState } from 'react';
import { actualizarAlumno } from '@/app/libs/actions';

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
    estatus: string;
    url_image?: string | null;
}

interface BtnGenerarQrAlumnoProps {
    alumno: Alumno | undefined;
    onStatusUpdated?: () => void; // Hacer opcional si no se usa
}

function BtnEstatusAlumno({ alumno, onStatusUpdated }: BtnGenerarQrAlumnoProps) {
    const [activando, setActivando] = useState<boolean>(false);

    const toggleEstatus = async (alumno: Alumno) => {
        const newStatus = alumno.estatus === 'activo' ? 'inactivo' : 'activo';

        try {
            setActivando(true);
            await actualizarAlumno(alumno.id, { ...alumno, estatus: newStatus });
            setActivando(false);
            if (onStatusUpdated) onStatusUpdated(); // Llamar a la función si está definida
        } catch (error) {
            console.error('Error al actualizar el estatus:', error);
            setActivando(false); // Asegurarse de restablecer el estado en caso de error
        }
    };

    return (
        <div>
            <button
                onClick={() => alumno && toggleEstatus(alumno)}
                className={`px-2 py-1 rounded ${alumno && alumno.estatus === 'activo' ? 'bg-green-500' : 'bg-red-500'} text-white`}
            >
                {activando ? 'Cambiando' : alumno && alumno.estatus === 'activo' ? 'Activo' : 'Inactivo'}
            </button>
        </div>
    );
}

export default BtnEstatusAlumno;