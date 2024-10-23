"use server";
import prisma from "@/app/libs/prisma";

// ALUMNOS
interface AlumnoProps {
    id?: number;
    matricula: string;
    nombre: string;
    nivel: string;
    grado?: string | null;
    grupo?: string | null;
    alergia?: string | null;
    tipo_sangre?: string | null;
    mama?: string | null;
    papa?: string | null;
    autorizado_1?: string | null;
    autorizado_2?: string | null;
    autorizado_3?: string | null;
    ciclo_escolar?: string | null;
    url_image?: string | null;
    qr?: string | null;
    estatus?: string;
}


export async function obtenerAlumno(nombre: string) {
    return await prisma.alumno.findFirst({
        where: {
            matricula: nombre,
        }
    });
}

export async function crearAlumno(alumno: AlumnoProps) {
    let response: {
        id: number;
        success: boolean;
        error?: string;
    } = {
        id: 0,
        success: false,
    };

    try {
        const result = await prisma.alumno.create({
            data: {
                matricula: alumno.matricula.trim(),
                nombre: alumno.nombre.trim(),
                nivel: alumno.nivel.trim(),
                grado: alumno.grado?.trim(),
                grupo: alumno.grupo?.trim(),
                alergia: alumno.alergia?.trim(),
                tipo_sangre: alumno.tipo_sangre?.trim(),
                mama: alumno.mama?.trim(),
                papa: alumno.papa?.trim(),
                autorizado_1: alumno.autorizado_1?.trim(),
                autorizado_2: alumno.autorizado_2?.trim(),
                autorizado_3: alumno.autorizado_3?.trim(),
                ciclo_escolar: alumno.ciclo_escolar?.trim(),
            },
        });
        response = {
            id: result.id,
            success: true,
        };
    } catch (error: unknown) {
        if ((error as { code: string }).code === "P2002") {
            response.error = "Matricula duplicada";
        } else {
            response.error = `Error desconocido: ${(error as Error).message}`;
        }
    }
    return response;
}

export async function obtenerAlumnos() {
    return await prisma.alumno.findMany({
        orderBy: {
            id: 'asc'
        }
    });
}

export async function obtenerAlumnoPorId(id: number) {
    return await prisma.alumno.findUnique({
        where: {
            id,
        },
    });
}

export const eliminarAlumno = async (id: number): Promise<{ success: boolean, message?: string }> => {
    try {
        await prisma.alumno.delete({
            where: {
                id,
            },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function actualizarAlumno(id: number, alumno: AlumnoProps) {
    const result = {
        success: false,
        message: "",
    };

    try {
        await prisma.alumno.update({
            where: {
                id,
            },
            data: {
                matricula: alumno.matricula,
                nombre: alumno.nombre,
                nivel: alumno.nivel,
                grado: alumno.grado,
                grupo: alumno.grupo,
                alergia: alumno.alergia,
                tipo_sangre: alumno.tipo_sangre,
                mama: alumno.mama,
                papa: alumno.papa,
                autorizado_1: alumno.autorizado_1,
                autorizado_2: alumno.autorizado_2,
                autorizado_3: alumno.autorizado_3,
                ciclo_escolar: alumno.ciclo_escolar,
                fecha_actualiziacion: new Date(),
                qr: alumno.qr,
                url_image: alumno.url_image,
                estatus: alumno.estatus,
            },
        });
        result.success = true;
        result.message = "Alumno actualizado correctamente";
    } catch (error) {
        result.message = `Error al actualizar el alumno: ${(error as Error).message
            }`;
    }

    return result;
}



export async function obtenerAlumnosPendientes(filtro:'' | 'qr' | 'url_image') {
    let whereClause;

    if (filtro === 'qr') {
        whereClause = {
            OR: [
                { qr: null },
                { qr: '' }
            ]
        };
    } else if (filtro === 'url_image') {
        whereClause = {
            OR: [
                { url_image: null },
                { url_image: '' }
            ]
        };
    } else {
        whereClause = {
            OR: [
                { qr: null },
                { qr: '' },
                { url_image: null },
                { url_image: '' }
            ]
        };
    }

    return await prisma.alumno.findMany({
        where: whereClause
    });
}

export async function limpiarRegistros() {
    const alumnos = await prisma.alumno.findMany();

    function eliminarEspacios(texto: string): string {
        return texto.trim();
    }

    function eliminarCaracteresEspeciales(texto: string): string {
        return texto.replace(/[-_]/g, '');
    }

    function limpiarGrado(grado: string | null): string | null {
        if (grado === null) return null;
        grado = eliminarEspacios(grado);
        grado = eliminarCaracteresEspeciales(grado);
        return grado.length > 1 ? grado.charAt(0) : grado;
    }

    for (const alumno of alumnos) {
        await prisma.alumno.update({
            where: {
                id: alumno.id,
            },
            data: {
                matricula: eliminarEspacios(alumno.matricula),
                nombre: eliminarEspacios(alumno.nombre),
                nivel: eliminarEspacios(alumno.nivel),
                grado: limpiarGrado(alumno.grado),
                grupo: eliminarEspacios(eliminarCaracteresEspeciales(alumno.grupo || '')),
                alergia: eliminarEspacios(alumno.alergia || ''),
                tipo_sangre: eliminarEspacios(alumno.tipo_sangre || ''),
                mama: eliminarEspacios(alumno.mama || ''),
                papa: eliminarEspacios(alumno.papa || ''),
                autorizado_1: eliminarEspacios(alumno.autorizado_1 || ''),
                autorizado_2: eliminarEspacios(alumno.autorizado_2 || ''),
                autorizado_3: eliminarEspacios(alumno.autorizado_3 || ''),
                ciclo_escolar: eliminarEspacios(alumno.ciclo_escolar || ''),
                url_image: eliminarEspacios(alumno.url_image || ''),
                qr: eliminarEspacios(alumno.qr || ''),
            },
        });
    }

    return 'Espacios en blanco eliminados, caracteres especiales eliminados, y grado ajustado';
}