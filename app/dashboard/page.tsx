'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import verifyToken from '@/app/libs/verifyToken';
import Cookies from 'js-cookie';

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
      if(token) {
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
    <div>
      <h1>Bienvenido al Dashboard</h1>
    </div>
  );
}