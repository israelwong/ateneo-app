import prisma from '@/app/libs/prisma';

interface AlumnoProps {
    nombre: string;
    nivel: string;
    grado: string | null;
    grupo: string | null;
    matricula: string;
    alergias: string | null;
    tipo_sangre: string | null;
    padre_tutor: string | null;
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
                nombre: alumno.nombre,
                nivel: alumno.nivel,
                grado: alumno.grado,
                grupo: alumno.grupo,
                matricula: alumno.matricula,
                alergias: alumno.alergias,
                tipo_sangre: alumno.tipo_sangre,
                padre_tutor: alumno.padre_tutor,
            },
        });
        response = {
            id: result.id,
            success: true,
        };
    } catch (error: unknown) {
        if ((error as { code: string }).code === 'P2002') {
            response.error = 'Matricula duplicada';
        } else {
            response.error = 'Error desconocido';
        }
    }
    return response;
}


export async function obtenerAlumno(nombre: string) {
    try {
        const alumno = await prisma.alumno.findUnique({
            where: {
                nombre: nombre,
            },
        });

        if (!alumno) {
            return { status: 'error', error: 'Alumno no encontrado' };
        }

        const urlImagen = await obtenerURLImagen(alumno);
        return { status: 'success', data: { ...alumno, urlImagen } };
    } catch (error) {
        console.error('Error al obtener alumno:', error);
        return { status: 'error', error: 'Error al obtener alumno' };
    }
}

async function obtenerURLImagen(ficha: AlumnoProps): Promise<string> {
    const baseUrl = 'https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/fotografia';
    const url = `${baseUrl}/${ficha.nivel}/${ficha.grado}${ficha.grupo ? `/${ficha.grupo}` : ''}/${ficha.nombre}.jpg`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            return url;
        } else {
            throw new Error('Imagen no encontrada');
        }
    } catch {
        return 'https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/fotografia/not-found.svg';
    }
}
