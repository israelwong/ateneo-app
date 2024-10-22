import React from 'react'
import ListaEmpleados from '@/app/components/ListaEmpleados'
import NavbarEmpleados from '@/app/components/NavbarEmpleados'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Empleados',
  description: 'Página para gestionar empleados',
}

function page() {
  return (
    <div>
      <NavbarEmpleados />
      <ListaEmpleados />
    </div>
  )
}

export default page
