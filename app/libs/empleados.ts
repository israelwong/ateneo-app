"use server";
import prisma from "@/app/libs/prisma";

// EMPLEADOS
interface EmpleadoProps {
    id?: number;
    nombre: string;
    telefono: string | null;
    email: string | null;
    area: string;
    puesto: string;
    contacto_emergencia: string | null;
    tipo_sangre: string | null;
    url_image?: string | null;
    qr?: string | null;
}

function limpiarTexto(texto: string | null | undefined): string {
    if (texto === null || texto === undefined) return '';
    return texto.trim().replace(/\s+/g, ' ');
}


export async function obtenerEmpleado(id: number) {
    return await prisma.empleado.findFirst({
        where: {
            id: Number(id)
        }
    });
}

export async function crearEmpleado(empleado: EmpleadoProps) {
    let response: {
        id: number;
        success: boolean;
        error?: string;
    } = {
        id: 0,
        success: false,
    };

    try {

        const result = await prisma.empleado.create({
            data: {
                nombre: limpiarTexto(empleado.nombre),
                telefono: limpiarTexto(empleado.telefono),
                email: limpiarTexto(empleado.email),
                area: limpiarTexto(empleado.area),
                puesto: limpiarTexto(empleado.puesto),
                contacto_emergencia: limpiarTexto(empleado.contacto_emergencia),
                tipo_sangre: limpiarTexto(empleado.tipo_sangre),
            },
        });
        response = {
            id: result.id,
            success: true,
        };
    } catch (error: unknown) {
        if ((error as { code: string }).code === "P2002") {
            response.error = "Empleado duplicado";
        } else {
            response.error = `Error desconocido: ${(error as Error).message}`;
        }
    }
    return response;
}

export async function obtenerEmpleados() {
    return await prisma.empleado.findMany({
        orderBy: {
            id: 'asc'
        }
    });
}

export async function actualizarEmpleado(id: number, empleado: EmpleadoProps) {
    let response: {
        success: boolean;
        error?: string;
    } = {
        success: false,
    };

    console.log(empleado);

    try {
        await prisma.empleado.update({
            where: {
                id: empleado.id
            },
            data: {
                nombre: empleado.nombre.trim(),
                telefono: empleado.telefono?.trim(),
                email: empleado.email?.trim(),
                area: empleado.area.trim(),
                puesto: empleado.puesto.trim(),
                contacto_emergencia: empleado.contacto_emergencia?.trim(),
                tipo_sangre: empleado.tipo_sangre?.trim(),
                url_image: empleado.url_image,
                qr: empleado.qr,
                fecha_actualiziacion: new Date(),
            },
        });
        response = {
            success: true,
        };
    } catch (error: unknown) {
        response.error = `Error desconocido: ${(error as Error).message}`;
    }
    return response;
}

export async function eliminarEmpleado(id: number) {
    try {
        await prisma.empleado.delete({
            where: {
                id,
            },
        });
        return { success: true, message: 'Empleado eliminado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar el empleado', error };
    }
}

