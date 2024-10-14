'use server';
// pages/api/auth/login.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function authenticateUser(email: string, password: string) {
    try{

        const res: {
            token: string;
            error: string;
        } = { token: '', error: '' };
        
        // Busca el usuario en la base de datos
        const user = await prisma.user.findUnique({
            where: { email },
        });
        
        // Verifica si el usuario existe y la contraseña es correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.token
        }
        
        // Crear JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.log('JWT_SECRET no está definido en las variables de entorno');
            return res.token
        }
        
        // Crea token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            secret,
            {
                expiresIn: '1h'
            }
        );
        res.token = token;
        
        // Devuelve el token
        return res
    } catch (error: unknown) {
        if (error instanceof Error) {
            return error.message;
        } else {
            return 'Error desconocido';
        }
    }


};
