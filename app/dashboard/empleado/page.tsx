import React from 'react';
import { Metadata } from 'next';
import FormCrearEmpleado from '@/app/components/FormCrearEmpleado';

export const metadata: Metadata = {
  title: 'Nuevo empleado',
  description: 'Página para gestionar empleados',
};

function Page() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Registrar nuevo empleado</h1>
      <FormCrearEmpleado />
    </div>
  );
}

export default Page;