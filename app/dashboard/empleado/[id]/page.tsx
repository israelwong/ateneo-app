import React from 'react'
import FormEditarEmpleado from '@/app/components/FormEditarEmpleado'

interface pageProps {
  params: {
    id: number
  }
}

function page({ params }: pageProps) {

  return (
    <div className='mx-auto'>

      <h1 className='text-center text-3xl py-10'>
        Editar empleado
      </h1>
      <div className='max-w-screen-sm mx-auto'>
        <FormEditarEmpleado id={params.id} />
      </div>

    </div>
  )
}

export default page
