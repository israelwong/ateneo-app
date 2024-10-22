import React from 'react';
import { obtenerEmpleado } from '@/app/libs/empleados';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ficha de empleado',
    description: 'Ficha de empleado',
};


interface PageProps {
    params: {
        nombre: string;
    };
}

async function Page({ params }: PageProps) {
    const { nombre } = params;
    const nombre_url = decodeURIComponent(nombre);
    const ficha = await obtenerEmpleado(nombre_url);

    return (
        <>
            <div className='max-w-sm mx-auto'>
                <div className='flex items-center justify-center mt-10'>
                    <div className='text-center'>
                        <Image
                            src='https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/logo_sin_sombra.svg'
                            alt='Logo'
                            width={200}
                            height={200}
                        />
                    </div>
                </div>

                {ficha ? (
                    <div className='rounded-md my-10'>

                        <Image
                            src={ficha.url_image || ''}
                            alt="Avatar"
                            width={200}
                            height={200}
                            className="rounded-full object-cover h-90 w-60 object-middle border-8 border-gray-200 mx-auto drop-shadow-lg"
                        />

                        <h3 className="text-center text-3xl font-bold px-16 mt-2 mb-3 text-pink-900">
                            {ficha.nombre}
                        </h3>

                        <div className='text-center text-gray-800 py-5'>
                            <p className='font-bold'>Área</p>
                            {ficha.area}
                        </div>
                        <div className='text-center text-gray-800 py-5'>
                            <p className='font-bold'>Puesto:</p>
                            {ficha.puesto}
                        </div>
                        <div className='py-5 text-center'>
                            <p className='font-bold'>Contacto de emergencia</p>
                            {ficha.contacto_emergencia}
                        </div>
                        <div className='py-5 text-center'>
                            <p className='font-bold'>Tipo de sangre</p>
                            {ficha.tipo_sangre}
                        </div>
                    </div>
                ) : (
                    <div className='text-center text-2xl text-red-500'>
                        <p>
                            El empleado no existe
                        </p>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className='text-center text-white bg-blue-950 py-10 w-full'>
                <p className='max-w-screen-sm mx-auto'>
                    Boulevard Los Olivos No. 3 San Francisco Cuautliquixca Tecámac de Felipe Villanueva Estado de México.
                </p>
            </div>
        </>
    );
}

export default Page;