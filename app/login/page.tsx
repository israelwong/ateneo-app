'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import authenticateUser from '@/app/libs/login';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const data = await authenticateUser(email, password);

        console.log(data);
        

        if (typeof data === 'string' || !data.token) {
            setError('Error al autenticar usuario');
            console.error('Error al autenticar usuario');
            return;
        }
        console.log('Login correcto');
        Cookies.set('token', data.token);
        router.push('/dashboard');

    };

    return (
        <div className='mx-auto flex h-screen justify-center items-center max-w-screen-sm'>
            <div>
                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-gray-800'>Iniciar sesión</h1>
                </div>
                <form onSubmit={handleSubmit} className='flex flex-col items-center bg-white p-6 rounded-lg shadow-md'>
                    <input
                        name="email"
                        className='border-2 border-gray-300 p-3 rounded-md mb-4 w-full max-w-xs focus:outline-none focus:border-blue-500'
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        name="password"
                        className='border-2 border-gray-300 p-3 rounded-md mb-4 w-full max-w-xs focus:outline-none focus:border-blue-500'
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className='text-red-500'>{error}</p>}
                    <button type="submit" className='bg-blue-500 text-white p-3 rounded-md w-full max-w-xs'>
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    );
}