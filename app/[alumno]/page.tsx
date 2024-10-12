import React from 'react';
import { obtenerAlumno } from '@/app/libs/actions';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
    params: {
        alumno: string;
    };
}

async function Page({ params }: PageProps) {
    const { alumno } = params;
    const nombre_url = decodeURIComponent(alumno).toUpperCase();
    const ficha = await obtenerAlumno(nombre_url);

   

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

                {ficha.status === 'success'? (
                    <div className='rounded-md my-5'>

                        <div className="px-10 mb-4 max-w-screen-sm mx-auto">
                            <p className="bg-blue-500 text-center py-3 text-white rounded-full uppercase tracking-wide font-bold">
                                <span className="font-light">{ficha.data?.nivel}: </span>{ficha.data?.matricula}
                            </p>
                        </div>

                        <Image
                            src={ficha.data?.urlImagen|| ''}
                            alt="Avatar"
                            width={200}
                            height={200}
                            className="rounded-full object-cover h-60 w-60 object-middle border-8 border-gray-200 mx-auto drop-shadow-lg"
                        />

                        <h3 className="text-center text-3xl font-bold px-16 mt-2 mb-3 text-pink-900">
                            {ficha.data?.nombre}
                        </h3>

                        <div className='bg-blue-100 p-5 mb-1'>
                            <h2 className='text-center font-semibold text-sm'>Padre / tutor</h2>
                            <ul className='list-disc list-outside p-3 space-y-2'>
                                {
                                    //buca comas y las reemplaza por saltos de linea y crea ua lista ul
                                    ficha.data?.padre_tutor && ficha.data?.padre_tutor.split(',').map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))
                                }
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 mx-auto max-w-screen-sm gap-1">

                            {ficha.data?.nivel === 'prepa' ? (
                                <div className="col-span-2 text-center text-2xl border-r-white bg-gray-300 p-5">
                                    Grado: <span className="font-bold">{ficha.data?.grado}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center text-2xl border-r-white bg-gray-300 p-5">
                                        Grado: <span className="font-bold">{ficha.data?.grado}</span>
                                    </div>
                                    <div className="text-center text-2xl border-r-white bg-gray-300 p-5">
                                        Grupo: <span className="font-bold">{ficha.data?.grupo}</span>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2 text-center text-xl bg-gray-300 p-5">
                                Ciclo escolar: <span className="font-bold">{ficha.data?.ciclo_escolar}</span>
                            </div>

                            <div className="col-span-2 text-center text-xl bg-gray-300 p-5">
                                Alergias: <span className="font-bold">{ficha.data?.alergias}</span>
                            </div>


                        </div>
                    </div>

                ) : (
                    <div className='my-28 text-center px-8'>
                        <h2 className='text-center text-2xl mt-5'>Alumno</h2>
                        <p className='text-3xl'>{nombre_url}</p>
                        <p className='text-red-700 font-bold py-5'>No encontrado</p>
                        <p className='p-5 bg-amber-200 rounded-md'>Si crees que esto es un error, por favor de contactar a control escolar.</p>
                    </div>
                )}
            </div>

            {/* CONTACTO */}
            <div className='bg-gray-200 p-12 w-full'>
                <div className='max-w-sm mx-auto'>

                    <h2 className='text-2xl mb-3'>Contactanos fácilmente</h2>

                    <div className='mb-5'>

                        <p className='font-semibold'>Llamar a:</p>
                        <ul className='list-disc list-inside underline'>
                            <li>
                                <Link href="tel: 5559350018">55 5935 0018</Link>
                            </li>
                            <li>
                                <Link href="tel: 5559350018">55 5934 9626</Link>
                            </li>
                        </ul>
                    </div>

                    <div className='pb-5'>
                        <p className='font-semibold'>Enviar correo a:</p>
                        <ul className='list-disc list-inside underline'>
                            <li>
                                <a href="mailto:colegioateneomexicano.edu.mx">colegioateneomexicano.edu.mx</a>
                            </li>
                            <li>
                                <a href="mailto:futurumformatsc@hotmail.com">futurumformatsc@hotmail.com</a>
                            </li>

                        </ul>

                    </div>

                </div>
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