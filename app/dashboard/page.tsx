'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import verifyToken from '@/app/libs/verifyToken';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      console.error('No hay token disponible');
      router.push('/login'); // Redirige si no hay token
      return;
    }

    async function checkToken() {
      if (token) {
        {
          const payload = await verifyToken(token);
          if (!payload) {
            router.push('/login'); // Redirige si no hay payload
          } else {
            console.log('Usuario autenticado:', payload);
          }
        }
      }
    }

    checkToken();

  }, [router]);

  return (
    <div className='mx-auto max-w-screen-md'>
      <h1 className='my-10 text-center font-bold'>Dashboard</h1>
      <div className='grid grid-cols-1 space-y-5 gap-5'>
               <ul className="space-y-4">
          <li>
            <Link href="dashboard/alta" target='_self' className='py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600'>
              Registro masivo CSV
            </Link>
          </li>
          <li>
            <Link href="dashboard/alumnos" target='_self' className='py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600'>
              Listar Alumnos
            </Link>
          </li>
          <li>
            <Link href="dashboard/alumno" target='_self' className='py-2 px-4 bg-purple-500 text-white font-semibold rounded-md hover:bg-purple-600'>
              Registrar Alumno
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}