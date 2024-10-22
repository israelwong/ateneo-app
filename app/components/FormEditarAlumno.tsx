'use client';
import React, { useState, useEffect } from 'react';
import { actualizarAlumno, obtenerAlumnoPorId, eliminarAlumno } from '@/app/libs/actions';
import Link from 'next/link';
import BtnSubirFotoAlumno from '@/app/components/BtnSubirFotoAlumno';
import { useRouter } from 'next/navigation';

interface AlumnoProps {
    id: number;
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
    qr?: string | null;
    estatus?: string;
    url_image?: string | null;
}

interface FormEditarAlumnoProps {
    id: string;
}

function FormEditarAlumno({ id }: FormEditarAlumnoProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [actualizando, setActualizando] = useState<boolean>(false);
    const [alumno, setAlumno] = useState<AlumnoProps>({
        id: 0,
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
        qr: '',
        estatus: '',
        url_image: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchAlumno(id);
        }
    }, [id]);

    const fetchAlumno = async (id: string) => {
        try {
            const alumno = await obtenerAlumnoPorId(parseInt(id));
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
            setActualizando(true);
            const response = await actualizarAlumno(parseInt(id), alumno);
            if (response.success) {
                setTimeout(() => {
                    router.push('/dashboard/alumnos');
                }, 3000);
            } else {
                alert(`Error: ${response.message}`);
            }
        }
    };

    const handleImageUploaded = () => {
        fetchAlumno(id);
    };

    const handleEliminarAlumno = async () => {
        console.log('Eliminar alumno:', alumno.id);
        
        if (confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
            await eliminarAlumno(alumno.id);
            router.push('/dashboard/alumnos');
        }
    }

    return (
        <div>
            {loading ? (
                <p className='text-center'>Cargando datos alumno...</p>
            ) : (
                <div className='grid grid-cols-2'>
                    <BtnSubirFotoAlumno alumno={alumno} onImageUploaded={handleImageUploaded} />

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
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                disabled={actualizando}
                            >
                                {actualizando ? 'Actualizando...' : 'Actualizar'}
                            </button>

                            <Link href="/dashboard/alumnos" className="block mt-2 text-center w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </Link>
                        </div>
                    </form>

                    <div className='text-center py-5'>
                        <button type='button' onClick={() => handleEliminarAlumno()} className='text-red-700 underline'>
                            Eliminar alumno
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormEditarAlumno;