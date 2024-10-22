'use server';

import { jwtVerify } from 'jose';

export default async function verifyToken(token: string) {

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET no está definido');
    return null; // Devuelve null si no hay secreto
  }

  const encodedSecret = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    // console.log('Usuario autenticado:', payload);
    return payload; // Devuelve el payload si la verificación es exitosa
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null; // Devuelve null si hay un error en la verificación
  }
}