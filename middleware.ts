'use server';
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    if (!token || !secret) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    
    try {
        const { payload } = await jwtVerify(token, secret);
        console.log('Usuario autenticado:', payload);
        return NextResponse.next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/dashboard/:path*'], // Protege todas las rutas bajo /dashboard
};