"use server";
import prisma from "@/app/libs/prisma";

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
}


export async function obtenerAlumno(nombre: string) {
    return await prisma.alumno.findFirst({
        where: {
            nombre
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
                url_image: alumno.url_image?.trim(),
                qr: alumno.qr?.trim(),
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

export async function eliminarAlumno(id: number) {
    return await prisma.alumno.delete({
        where: {
            id,
        },
    });
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

export async function depurarEspaciosEnBlanco() {
    const alumnos = await prisma.alumno.findMany();

    function eliminarEspaciosDuplicados(texto: string): string {
        return texto.replace(/\s+/g, ' ');
    }

    for (const alumno of alumnos) {
        let grado = alumno.grado?.trim();
        if (grado && grado.length === 2) {
            grado = grado.charAt(0);
        }

        await prisma.alumno.update({
            where: {
                id: alumno.id,
            },
            data: {
                matricula: eliminarEspaciosDuplicados(alumno.matricula.trim()),
                nombre: eliminarEspaciosDuplicados(alumno.nombre.trim()),
                nivel: eliminarEspaciosDuplicados(alumno.nivel.trim()),
                grado: grado,
                grupo: eliminarEspaciosDuplicados(alumno.grupo?.trim() || ''),
                alergia: eliminarEspaciosDuplicados(alumno.alergia?.trim() || ''),
                tipo_sangre: eliminarEspaciosDuplicados(alumno.tipo_sangre?.trim() || ''),
                mama: eliminarEspaciosDuplicados(alumno.mama?.trim() || ''),
                papa: eliminarEspaciosDuplicados(alumno.papa?.trim() || ''),
                autorizado_1: eliminarEspaciosDuplicados(alumno.autorizado_1?.trim() || ''),
                autorizado_2: eliminarEspaciosDuplicados(alumno.autorizado_2?.trim() || ''),
                autorizado_3: eliminarEspaciosDuplicados(alumno.autorizado_3?.trim() || ''),
                ciclo_escolar: eliminarEspaciosDuplicados(alumno.ciclo_escolar?.trim() || ''),
                url_image: eliminarEspaciosDuplicados(alumno.url_image?.trim() || ''),
                qr: eliminarEspaciosDuplicados(alumno.qr?.trim() || ''),
            },
        });
    }
    return 'Espacios en blanco y duplicados eliminados, y grado ajustado';
}