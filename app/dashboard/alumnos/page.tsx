import React from 'react'

import { Metadata } from 'next'
import NavbarAlumnos from '@/app/components/NavbarAlumnos'
import ListaAlumnos from '@/app/components/ListaAlumnos'

export const metadata: Metadata = {
  title: 'Alumnos registrados',
  description: 'Página para gestionar alumnos',
}

function Page() {

  return (
    <div className="mx-auto max-w-full">
      <NavbarAlumnos />
      <ListaAlumnos />
    </div>
  )

}

export default Page;