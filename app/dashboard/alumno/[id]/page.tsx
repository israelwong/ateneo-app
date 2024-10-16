'use client'
import React, { useState, useEffect } from 'react'
import { actualizarAlumno, obtenerAlumnoPorId } from '@/app/libs/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AlumnoProps {
    id?: number;
    matricula: string;
    nombre: string;
    nivel: string;
    grado: string | null;
    grupo?: string | null;
    alergia?: string | null;
    tipo_sangre?: string | null;
    mama?: string | null;
    papa?: string | null;
    autorizado_1?: string | null;
    autorizado_2?: string | null;
    autorizado_3?: string | null;
    ciclo_escolar?: string | null;
    qr?: string | null;
}

interface PageProps {
    params: {
        id: string;
    };
}



function Page({ params }: PageProps) {

    const [loading, setLoading] = useState<boolean>(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [alumno, setAlumno] = useState<AlumnoProps>({
        matricula: '',
        nombre: '',
        nivel: '',
        grado: '',
        grupo: '',
        alergia: '',
        tipo_sangre: '',
        mama: '',
        papa: '',
        autorizado_1: '',
        autorizado_2: '',
        autorizado_3: '',
        ciclo_escolar: '',
        qr: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const { id } = params


    useEffect(() => {
        if (id) {
            fetchAlumno(id);
        }
    }, [id]);

    const fetchAlumno = async (id: string) => {
        try {
            const alumno = await obtenerAlumnoPorId(parseInt(id));
            console.log(alumno);
            if (alumno) {
                setAlumno(alumno);
            }
        } catch (error) {
            console.error('Error al obtener el alumno:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAlumno({ ...alumno, [name]: value });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!alumno.matricula) newErrors.matricula = 'La matrícula es requerida';
        if (!alumno.nombre) newErrors.nombre = 'El nombre es requerido';
        if (!alumno.nivel) newErrors.nivel = 'El nivel es requerido';
        if (!alumno.grado) newErrors.grado = 'El grado es requerido';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            const response = await actualizarAlumno(parseInt(id), alumno);
            if (response.success) {
                setSuccessMessage('Alumno actualizado correctamente');
                setTimeout(() => {
                    router.push('/dashboard/alumnos');
                }, 3000);
            } else {
                alert(`Error: ${response.message}`);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-5">Editar Alumno</h2>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5" role="alert">
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}

            {loading ? (<p>Cargando...</p>) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                        <input
                            type="text"
                            name="matricula"
                            value={alumno.matricula}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${errors.matricula ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        />
                        {errors.matricula && <p className="text-red-500 text-sm">{errors.matricula}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={alumno.nombre}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        />
                        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nivel</label>
                            <input
                                type="text"
                                name="nivel"
                                value={alumno.nivel}
                                onChange={handleChange}
                                className={`mt-1 block w-full border ${errors.nivel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                            />
                            {errors.nivel && <p className="text-red-500 text-sm">{errors.nivel}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ciclo Escolar</label>
                            <input
                                type="text"
                                name="ciclo_escolar"
                                value={alumno.ciclo_escolar || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grado</label>
                            <input
                                type="text"
                                name="grado"
                                value={alumno.grado || ''}
                                onChange={handleChange}
                                className={`mt-1 border ${errors.grado ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 w-full`}
                            />
                            {errors.grado && <p className="text-red-500 text-sm">{errors.grado}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grupo</label>
                            <input
                                type="text"
                                name="grupo"
                                value={alumno.grupo || ''}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-md shadow-sm p-2 w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alergia</label>
                        <input
                            type="text"
                            name="alergia"
                            value={alumno.alergia || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                        <input
                            type="text"
                            name="tipo_sangre"
                            value={alumno.tipo_sangre || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mamá</label>
                        <input
                            type="text"
                            name="mama"
                            value={alumno.mama || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Papá</label>
                        <input
                            type="text"
                            name="papa"
                            value={alumno.papa || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Autorizado 1</label>
                        <input
                            type="text"
                            name="autorizado_1"
                            value={alumno.autorizado_1 || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Autorizado 2</label>
                        <input
                            type="text"
                            name="autorizado_2"
                            value={alumno.autorizado_2 || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Autorizado 3</label>
                        <input
                            type="text"
                            name="autorizado_3"
                            value={alumno.autorizado_3 || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">QR alumno</label>
                        <input
                            type="text"
                            name="qr"
                            value={alumno.qr || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Actualizar
                        </button>
                        <Link href="/dashboard/alumnos"
                            className="block mt-2 text-center w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Cancelar
                        </Link>
                    </div>

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5" role="alert">
                            <span className="block sm:inline">{successMessage}</span>
                        </div>
                    )}

                </form>
            )}
        </div>
    );
}

export default Page;