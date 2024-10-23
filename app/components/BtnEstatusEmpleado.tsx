import React, {useState} from 'react'
import { actualizarEmpleado } from '@/app/libs/empleados'

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
}

interface BtnEstatusEmpleadoProps {
    empleado: EmpleadoProps;
    onStatusUpdated?: () => void; // Hacer opcional si no se usa

}

export default function BtnEstatusEmpleado( { empleado, onStatusUpdated }: BtnEstatusEmpleadoProps ) {

    const [activando, setActivando] = useState<boolean>(false);

    const toggleEstatus = async (empleado: EmpleadoProps) => {
        const newStatus = empleado.estatus === 'activo' ? 'inactivo' : 'activo';

        try {
            setActivando(true);
            await actualizarEmpleado(empleado.id, { ...empleado, estatus: newStatus });
            if (onStatusUpdated) onStatusUpdated(); // Llamar a la función si está definida
            setActivando(false);
        } catch (error) {
            console.error('Error al actualizar el estatus:', error);
        }
    };

    return (
        <div>

            <button
                onClick={() => toggleEstatus(empleado)}
                className={`px-2 py-1 rounded ${empleado.estatus === 'activo' ? 'bg-green-500' : 'bg-red-500'} text-white`}
            >
                {
                    activando ? 'Cambiando' : empleado.estatus === 'activo' ? 'Activo' : 'Inactivo'
                }
            </button>

        </div>
    )
}
