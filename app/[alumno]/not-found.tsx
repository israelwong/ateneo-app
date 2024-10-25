import React from 'react'
import Link from 'next/link'

function notFound() {
    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='text-center'>

            <h2 className='mb-4'>
                La página que buscas no existe
            </h2>

            <Link 
                href={'/'}
                className='bg-blue-500 text-white px-3 py-2 rounded-md'>
                Volver al inicio
            </Link>
                    </div>
        </div>
    )
}

export default notFound
