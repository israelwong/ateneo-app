import React from 'react'
import Link from 'next/link'

function NavbarEmpleados() {

    return (
        <div>

            <div className='grid grid-cols-2 bg-gray-100 p-5'>

                <h3 className="text-4xl uppercase text-gray-600">
                    Empleados registrados
                </h3>

                <div className="flex justify-end gap-3">

                    {/* <Link href="/dashboard/empleado" className="text-blue-500  py-2 px-4 underlune block border-blue-500 rounded-md border">
                        Registrar empleado
                    </Link> */}

                    <Link href="/dashboard/" className="bg-red-600 text-white py-2 px-4 rounded-md text-center">
                        Cerrar ventana
                    </Link>
                </div>
            </div>



        </div>
    )
}

export default NavbarEmpleados
