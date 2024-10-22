'use client';

import React, { useEffect, useState } from 'react';
import { actualizarEmpleado, obtenerEmpleado, eliminarEmpleado } from '@/app/libs/empleados';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BtnSubirFotoEmpleado from './BtnSubirFotoEmpleado';

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

interface FormEditarEmpleadoProps {
    id: number;
}

function FormEditarEmpleado({ id }: FormEditarEmpleadoProps) {
    const [empleado, setEmpleado] = useState<Empleado | null>(null);
    const [errores, setErrores] = useState<{ [key: string]: string }>({});
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const router = useRouter();

    async function manejarEnvioFormulario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Capturar los datos del formulario
        const form = event.currentTarget;
        const nombre = (form.nombre as unknown as HTMLInputElement).value;
        const telefono = (form.telefono as unknown as HTMLInputElement).value || null;
        const email = (form.email as unknown as HTMLInputElement).value || null;
        const area = (form.area as unknown as HTMLInputElement).value;
        const puesto = (form.puesto as unknown as HTMLInputElement).value;
        const contacto_emergencia = (form.contacto_emergencia as unknown as HTMLInputElement).value || null;
        const tipo_sangre = (form.tipo_sangre as unknown as HTMLInputElement).value || null;

        // Validaciones adicionales
        const nuevosErrores: { [key: string]: string } = {};

        if (!nombre.trim()) {
            nuevosErrores.nombre = 'Nombre es requerido.';
        }

        if (!area.trim()) {
            nuevosErrores.area = 'Área es requerida.';
        }

        if (!puesto.trim()) {
            nuevosErrores.puesto = 'Puesto es requerido.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        // Asignar los valores al objeto empleado
        const empleadoActualizado: Empleado = {
            ...empleado!,
            nombre,
            telefono,
            email,
            area,
            puesto,
            contacto_emergencia,
            tipo_sangre
        };

        // Llamar a la función actualizarEmpleado
        setGuardando(true);
        const response = await actualizarEmpleado(id, empleadoActualizado);
        if (response.success) {
            router.push('/dashboard/empleados');
        }
    }

    const cargarEmpleado = async (id: number) => {
        setCargando(true);
        const empleado = await obtenerEmpleado(id);
        setEmpleado(empleado);
        setCargando(false);
    }

    const handleEliminar = async (id: number) => {
        const confirmar = confirm('¿Estás seguro de eliminar este empleado?');
        if (confirmar) {
            const response = await eliminarEmpleado(id);
            if (response.success) {
                router.push('/dashboard/empleados');
            } else {
                alert('Error al eliminar el empleado.');
            }
        }
    }

    useEffect(() => {
        const empleadoId = Number(id); // Convertir id a número
        cargarEmpleado(empleadoId);
    }, [id]);

    if (cargando) {
        return <p className='text-center'>Cargando empleado...</p>;
    }

    const handleImageUploaded = () => {
        cargarEmpleado(id);
    };

    return (
        <div className='grid grid-cols-2 gap-4'>

            <div className='justify-end text-center mx-auto'>
                <BtnSubirFotoEmpleado
                    empleado={empleado}
                    onImageUploaded={handleImageUploaded}
                />
            </div>

            <form id="formulario-empleado" onSubmit={manejarEnvioFormulario} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        defaultValue={empleado?.nombre || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errores.nombre && <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>}
                </div>

                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono:</label>
                    <input
                        type="text"
                        id="telefono"
                        name="telefono"
                        defaultValue={empleado?.telefono || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={empleado?.email || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700">Área:</label>
                    <input
                        type="text"
                        id="area"
                        name="area"
                        defaultValue={empleado?.area || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errores.area && <p className="mt-1 text-sm text-red-600">{errores.area}</p>}
                </div>

                <div>
                    <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">Puesto:</label>
                    <input
                        type="text"
                        id="puesto"
                        name="puesto"
                        defaultValue={empleado?.puesto || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errores.puesto && <p className="mt-1 text-sm text-red-600">{errores.puesto}</p>}
                </div>

                <div>
                    <label htmlFor="contacto_emergencia" className="block text-sm font-medium text-gray-700">Contacto de Emergencia:</label>
                    <input
                        type="text"
                        id="contacto_emergencia"
                        name="contacto_emergencia"
                        defaultValue={empleado?.contacto_emergencia || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="tipo_sangre" className="block text-sm font-medium text-gray-700">Tipo de Sangre:</label>
                    <input
                        type="text"
                        id="tipo_sangre"
                        name="tipo_sangre"
                        defaultValue={empleado?.tipo_sangre || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className='space-y-4'>
                    <button
                        type="submit"
                        className={`w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 block
                    ${guardando ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Actualizar'}
                    </button>

                    <Link
                        className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm block text-center"
                        href="/dashboard/empleados">
                        Cancelar
                    </Link>

                    <div className='text-center'>
                        <button className='text-center text-red-600 underline'
                            onClick={() => empleado && handleEliminar(empleado.id)}
                        >
                            Eliminar empleado
                        </button>
                    </div>
                </div>
            </form>

        </div>
    );
}

export default FormEditarEmpleado;