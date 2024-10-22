'use client';

import React, { useState } from 'react';
import { crearEmpleado } from '@/app/libs/empleados';
import Link from 'next/link';

interface Empleado {
    nombre: string;
    telefono: string | null;
    email: string | null;
    area: string;
    puesto: string;
    contacto_emergencia: string | null;
    tipo_sangre: string | null;
}

function FormCrearEmpleado() {
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    function manejarEnvioFormulario(event: React.FormEvent<HTMLFormElement>) {
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

        // Crear un objeto Empleado
        const nuevoEmpleado: Empleado = {
            nombre,
            telefono,
            email,
            area,
            puesto,
            contacto_emergencia,
            tipo_sangre
        };

        // Llamar a la función crearEmpleado
        crearEmpleado(nuevoEmpleado);
    }

    return (
        <form id="formulario-empleado" onSubmit={manejarEnvioFormulario} className="space-y-4">

            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input type="text" id="nombre" name="nombre" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {errores.nombre && <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>}
            </div>

            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <input type="email" id="email" name="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">Área:</label>
                <input type="text" id="area" name="area" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {errores.area && <p className="mt-1 text-sm text-red-600">{errores.area}</p>}
            </div>

            <div>
                <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">Puesto:</label>
                <input type="text" id="puesto" name="puesto" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {errores.puesto && <p className="mt-1 text-sm text-red-600">{errores.puesto}</p>}
            </div>

            <div>
                <label htmlFor="contacto_emergencia" className="block text-sm font-medium text-gray-700">Contacto de Emergencia:</label>
                <input type="text" id="contacto_emergencia" name="contacto_emergencia" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
                <label htmlFor="tipo_sangre" className="block text-sm font-medium text-gray-700">Tipo de Sangre:</label>
                <input type="text" id="tipo_sangre" name="tipo_sangre" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div className=''>
                <button 
                type="submit"
                className="flex-grow py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Crear Empleado</button>
                
                <Link 
                className="flex-grow py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm" 
                href="empleados">
                    Cancelar
                    </Link>
            </div>
        </form>
    );
}

export default FormCrearEmpleado;