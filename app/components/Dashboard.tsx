'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

function Dashboard({ user }: { user: object }) {
    const router = useRouter();

    useEffect(() => {
        sessionStorage.setItem('user', JSON.stringify(user));
        // console.log('user', user);
    }, [user]);

    const cerrarSesion = () => {
        sessionStorage.removeItem('user');
        Cookies.remove('token');
        router.push('/login');
    }

    return (
        <div>
            <div className='mx-auto max-w-screen-sm'>

                <h1 className='my-10 text-center font-bold text-5xl pt-10'>Dashboard</h1>
                <div className='items-center justify-center text-center'>

                    <Link href="dashboard/alumnos" target='_self'
                        className='
                        text-2xl font-light text-gray-600
                        block w-full bg-gray-100 py-12 rounded-md border border-dashed border-gray-500
                        mb-5 
                        '>
                        Alumnos
                    </Link>
                    <Link href="dashboard/empleados" target='_self'
                        className='
                        text-2xl font-light text-gray-600
                        block w-full bg-gray-100 py-12 rounded-md border border-dashed border-gray-500
                        mb-5 
                    '>
                        Empleados
                    </Link>

                </div>
                <div className='mx-auto text-center'>
                    <button
                        onClick={cerrarSesion}
                        className='py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600'>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;