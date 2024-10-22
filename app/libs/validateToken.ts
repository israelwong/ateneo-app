import verifyToken from '@/app/libs/verifyToken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function validateToken() {
  const token = cookies().get('token')?.value;

  if (!token) {
    redirect('/login'); // Redirige si no hay token
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect('/login'); // Redirige si no hay payload
    return null;
  }

  return payload;
}