'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { actualizarAlumno, obtenerAlumnos, limpiarRegistros } from '@/app/libs/actions'
import BtnGenerarQrAlumno from './BtnGenerarQrAlumno'
import BtnSubirFotoAlumno from './BtnSubirFotoAlumno'
import { generarQr, eliminarQr } from '../libs/QRAlumno'
import { subirImagen } from '../libs/GestionarImagenes'
import BtnEstatusAlumno from './BtnEstatusAlumno'
import { ImagenResponsables } from '../libs/ImagenResponsables'


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
    estatus: string;
    url_image?: string | null;
}

interface UserProps {
    email: string;
}

function Page() {

    const [alumnos, setAlumnos] = useState<AlumnoProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const filterInputRef = useRef<HTMLInputElement>(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
    const [nivelSeleccionado, setNivelSeleccionado] = useState<string | null>(null);
    const niveles = Array.from(new Set(alumnos.map(alumno => alumno.nivel)));
    const [generandoQrs, setGenerandoQrs] = useState<boolean>(false);
    const [eliminadodoQrs, setEliminandoQrs] = useState<boolean>(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [filtroFotoPendiente, setFiltroFotoPendiente] = useState<boolean>(false);
    const [filtroQrPendiente, setFiltroQrPendiente] = useState<boolean>(false);
    const [filtroConImagen, setFiltroConImagen] = useState<boolean>(false);
    const [copiando, setCopiando] = useState<boolean>(false);
    const [subiendoImagenes, setSubiendoImagenes] = useState<boolean>(false);
    const [eliminandoDashBaseDatos, setEliminandoDashBaseDatos] = useState<boolean>(false);
    const [user, setUser] = useState<UserProps>();
    const [imagenesResponsables, setImagenesResponsables] = useState<boolean>(false);
    const [filtroInactivo, setFiltroInactivo] = useState<boolean>(false);
    const [filtroActivo, setFiltroActivo] = useState<boolean>(false);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        setUser(user);
        fetchAlumnos();
    }, []);

    const hayFiltrosAplicados = () => {
        return filtroFotoPendiente || filtroQrPendiente || filtroConImagen || terminoBusqueda || nivelSeleccionado;
    };

    /* ESCAPE KEY */
    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && filterInputRef.current) {
            setTerminoBusqueda('');
            filterInputRef.current.value = '';
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    /* PORTAPAPALES PENDIENTES FOTO*/
    const copiarAlPortapapeles = () => {
        setCopiando(true);
        const datos = alumnosFiltrados.map(alumno =>
            `Matrícula: ${alumno.matricula}\nNombre: ${alumno.nombre}\nNivel: ${alumno.nivel}\nGrado: ${alumno.grado || 'N/A'}\nGrupo: ${alumno.grupo || 'N/A'}`
        ).join('\n\n');

        navigator.clipboard.writeText(datos)
            .then(() => {
                alert('Datos copiados al portapapeles');
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
            })
            .finally(() => {
                setCopiando(false);
            });
    };

    async function fetchAlumnos() {
        try {
            const alumnos = await obtenerAlumnos();
            setAlumnos(alumnos);
        } catch (error) {
            console.error('Error al obtener alumnos:', error);
        } finally {
            setLoading(false);
        }
    }

    const contarAlumnosPorNivel = (nivel: string) => {
        return alumnos.filter(alumno => alumno.nivel === nivel).length;
    };

    const alumnosFiltrados = alumnos.filter(alumno => {
        const matchesNivel = nivelSeleccionado ? alumno.nivel === nivelSeleccionado : true;
        const matchesBusqueda = terminoBusqueda
            ? alumno.matricula.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            alumno.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            (alumno.mama && alumno.mama.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
            (alumno.papa && alumno.papa.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
            alumno.nivel.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            alumno.grado?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            (alumno.autorizado_1 && alumno.autorizado_1.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
            (alumno.autorizado_2 && alumno.autorizado_2.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
            (alumno.autorizado_3 && alumno.autorizado_3.toLowerCase().includes(terminoBusqueda.toLowerCase()))
            : true;
        const matchesFotoPendiente = filtroFotoPendiente ? !alumno.url_image : true;
        const matchesQrPendiente = filtroQrPendiente ? !alumno.qr : true;
        const matchesConImagen = filtroConImagen ? !!alumno.url_image : true;
        const matchesInactivo = filtroInactivo ? alumno.estatus.toLowerCase() === 'inactivo' : true;
        const matchesActivo = filtroActivo ? alumno.estatus.toLowerCase() === 'activo' : true;
        return matchesNivel && matchesBusqueda && matchesFotoPendiente && matchesQrPendiente && matchesConImagen && matchesInactivo && matchesActivo;
    });

    const handleQrGenerated = () => {
        fetchAlumnos();
    };

    const handleImageUploaded = () => {
        fetchAlumnos();
    }

    // GENERAR QRS MASIVOS
    const generarQrsMasivos = async () => {


        const result = confirm('¿Estás seguro de que deseas generar los QRs para todos los empleados?');
        if (!result) return;

        setGenerandoQrs(true);

        for (const alumno of alumnos) {
            // if (!alumno.qr) {
            const result = await generarQr(alumno);
            const response = await actualizarAlumno(alumno.id, { ...alumno, qr: result.url_svg });
            console.log('QR generado para:', response);
            fetchAlumnos();
            // }
        }
        alert('Generación de QRs finalizada');
        setGenerandoQrs(false);
    };

    // ELIMINAR QRS MASIVOS
    const eliminarQrsMasivos = async () => {
        const result = confirm('¿Estás seguro de que deseas eliminar los QRs para todos los empleados?');
        if (!result) return;

        setEliminandoQrs(true);

        for (const alumno of alumnos) {
            if (alumno.qr) {
                const response = await actualizarAlumno(alumno.id, { ...alumno, qr: null });
                await eliminarQr(alumno);
                console.log('QR eliminado para:', response);
                fetchAlumnos();
            }
        }
        alert('Eliminación de QRs finalizada');
        setEliminandoQrs(false)
    }

    //SUBIR IMAGENES MASIVAS
    const handleFotosMasivasClick = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

        const files = event.target.files;

        const result = confirm('¿Estás seguro de que deseas subir las imágenes masivas?');
        if (!result) return;

        setSubiendoImagenes(true);

        if (files) {
            for (let i = 0; i < files.length; i++) {
                let fileName = files[i].name;

                // Eliminar espacios en blanco al principio y al final
                fileName = fileName.trim();

                // Eliminar espacios en blanco duplicados
                fileName = fileName.replace(/\s+/g, ' ');

                // Eliminar guiones al principio y al final
                fileName = fileName.replace(/^-+|-+$/g, '');

                //eliminar extension
                fileName = fileName.replace(/\.[^/.]+$/, "");

                // Formatear los nombres de los alumnos de la misma manera
                const alumno = alumnos.find(alumno => {
                    let alumnoNombre = alumno.nombre.trim();
                    alumnoNombre = alumnoNombre.replace(/\s+/g, ' ');
                    alumnoNombre = alumnoNombre.replace(/^-+|-+$/g, '');

                    //coindicdencias mayusculas y minusculas
                    return alumnoNombre.toLocaleLowerCase() === fileName.toLocaleLowerCase();
                });

                if (alumno) {
                    const result = await subirImagen(files[i], alumno.matricula, 'Alumno/Fotografia');
                    console.log('result', result);

                    await actualizarAlumno(alumno.id, { ...alumno, url_image: result.publicUrl });

                    fetchAlumnos();
                } else {
                    console.error('No se encontró un alumno con el nombre:', fileName);
                }
            }
        }
        alert('Subida de imágenes finalizada');
        setSubiendoImagenes(false);

    };

    // CSV
    const generarNombreArchivo = () => {
        let nombreArchivo = 'csv_alumnos';

        if (filtroConImagen) {
            nombreArchivo += '_conImagen';
        }

        if (terminoBusqueda) {
            nombreArchivo += `_Busqueda_${terminoBusqueda}`;
        }

        if (nivelSeleccionado) {
            nombreArchivo += `_Nivel_${nivelSeleccionado}`;
        }

        return nombreArchivo;
    };

    const exportarCSV = () => {
        const nombreArchivo = generarNombreArchivo();

        const columnas = [
            'matricula',
            'nombre',
            'nivel',
            'grado',
            'grupo',
            'ciclo_escolar',
            'alergia',
            'tipo_sangre',
            '@responsables',
            '@qr',
            '@url_image'
        ];

        // Reemplazar espacios con guiones bajos en los nombres de las columnas
        const encabezados = columnas.map(columna => columna.replace(/\s+/g, '_')).join(',');

        // Generar el contenido del CSV
        const csv = [
            encabezados,
            ...alumnosFiltrados.map(alumno => {
                // Asignar las rutas obtenidas a alumno.qr y alumno.url_image
                const rutaResponsales_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Alumno/Responsables/${alumno.matricula}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/QR/
                const rutaImagen_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Alumno/Fotografia/${alumno.matricula}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/Fotografia/
                const rutaQR_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Alumno/QR/${alumno.matricula}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/QR/

                return [
                    alumno.matricula,
                    alumno.nombre,
                    alumno.nivel,
                    alumno.grado || 'N/A',
                    alumno.grupo || 'N/A',
                    alumno.ciclo_escolar || 'N/A',
                    alumno.alergia ? `"${alumno.alergia}"` : 'N/A', // Agregar comillas a las alergias
                    alumno.tipo_sangre || 'N/A',
                    rutaResponsales_local || 'N/A',
                    rutaQR_local || 'N/A',
                    rutaImagen_local || 'N/A'
                ].join(',');
            })
        ].join('\n');

        // Crear el archivo CSV y descargarlo
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    //UTILIDADES
    const LimpiarBaseDatos = async () => {
        const result = confirm('¿Estás seguro de que deseas limpiar la base de datos?');
        if (!result) return;

        setEliminandoDashBaseDatos(true);
        await limpiarRegistros();
        setEliminandoDashBaseDatos(false);
        alert('Se limpiaron los registros');
        fetchAlumnos();
    }

    const generarImagenResponsables = async (alumno: AlumnoProps) => {
        const result = confirm('¿Estás seguro de que deseas generar la imagen de los responsables?');
        if (!result) return;
        const response = await ImagenResponsables({ alumno });
        console.log(response);
    }

    const generarImagenResponsablesMasivas = async () => {

        const result = confirm('¿Estás seguro de que deseas generar la imagen de los responsables?');
        if (!result) return;

        setImagenesResponsables(true);
        for (const alumno of alumnos) {
            const response = await ImagenResponsables({ alumno });
            console.log(response);
        }
        setImagenesResponsables(false);
        alert('Generación de imágenes de responsables finalizada');
    }


    return (
        <div className="mx-auto py-10 p-5 w-screen">
            {loading ? (
                <div className="text-center text-xl">Cargando datos...</div>
            ) : (
                <>
                    {user?.email === 'ing.israel.wong@gmail.com' && (
                        // Acciones masivas:
                        <div className='space-x-2 items-center flex flex-wrap space-y-2'>

                            <button onClick={() => generarImagenResponsablesMasivas()}>
                                {imagenesResponsables ? 'Generando imágenes...' : 'Generar imágenes de responsables'}
                            </button>

                            <button
                                onClick={() => LimpiarBaseDatos()}
                                className={`flex-grow bg-slate-600 text-white rounded-md px-3 py-2 ${eliminandoDashBaseDatos ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={eliminandoDashBaseDatos}
                            >
                                {eliminandoDashBaseDatos ? 'Limpiando registros...' : 'Limpiar base de datos'}
                            </button>

                            <button
                                className={`flex-grow border-2 border-gray-500 px-3 py-2 text-black rounded-md ${subiendoImagenes ? 'opacity-50 cursor-not-allowed' : ''}`}
                                id="fotosMasivas"
                                onClick={handleFotosMasivasClick}
                                disabled={subiendoImagenes}
                            >
                                {subiendoImagenes ? 'Subiendo fotos...' : 'Adjuntar fotos masivas'}
                            </button>

                            <input
                                type="file"
                                ref={inputFileRef}
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileChange}
                            />

                            <button
                                className={`flex-grow bg-black px-3 py-2 text-white rounded-md ${generandoQrs ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => generarQrsMasivos()}
                                disabled={generandoQrs}
                            >
                                {generandoQrs ? 'Generando QRs...' : 'Generar QRs Masivos'}
                            </button>
                            <button
                                className={`flex-grow bg-red-700 px-3 py-2 text-white rounded-md ${eliminadodoQrs ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => eliminarQrsMasivos()}
                                disabled={eliminadodoQrs}
                            >
                                {eliminadodoQrs ? 'Eliminando QRs...' : 'Eliminar QRs Masivos'}
                            </button>

                            <button
                                onClick={copiarAlPortapapeles}
                                className={`flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${copiando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={copiando}
                            >
                                {copiando ? 'Copiando datos...' : 'Copiar datos en portapapeles'}
                            </button>

                            <button
                                onClick={() => exportarCSV()}
                                className='flex-grow bg-purple-300 rounded-md px-3 py-2'
                            >
                                Exportar CSV
                            </button>

                            <Link href="/dashboard/csv/alumnos" className="bg-gray-600 text-white p-2 rounded-md block">
                                Registro masivo CSV
                            </Link>
                        </div>
                    )}

                    <div className='flex flex-wrap items-center py-5 gap-5'>
                        <button
                            className={`flex-grow ${nivelSeleccionado === null ? 'bg-yellow-500' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-3 rounded`}
                            onClick={() => setNivelSeleccionado(null)}
                        >
                            TODOS ({alumnos.length})
                        </button>
                        {niveles.map(nivel => (
                            <button
                                key={nivel}
                                className={`flex-grow ${nivelSeleccionado === nivel ? 'bg-yellow-500' : 'bg-green-500'} hover:bg-green-700 text-white font-bold py-2 px-3 rounded`}
                                onClick={() => setNivelSeleccionado(nivel)}
                            >
                                {nivel} ({contarAlumnosPorNivel(nivel)})
                            </button>
                        ))}

                        <div className="flex flex-wrap items-center space-x-4 mt-4 w-full">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filtroConImagen}
                                    onChange={() => setFiltroConImagen(!filtroConImagen)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-800 font-bold">Con foto</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filtroFotoPendiente}
                                    onChange={() => setFiltroFotoPendiente(!filtroFotoPendiente)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-700 font-bold">Sin foto</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filtroQrPendiente}
                                    onChange={() => setFiltroQrPendiente(!filtroQrPendiente)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-800 font-bold">QR Pendiente</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filtroInactivo}
                                    onChange={() => setFiltroInactivo(!filtroInactivo)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-800 font-bold">Inactivo</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filtroActivo}
                                    onChange={() => setFiltroActivo(!filtroActivo)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-800 font-bold">Activo</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        {hayFiltrosAplicados() && (
                            <div className="text-center text-xl pb-5">
                                {alumnosFiltrados.length !== 0 ? (
                                    <div>
                                        Coincidencias: {alumnosFiltrados.length}
                                        {filtroFotoPendiente && <span> (Foto Pendiente)</span>}
                                        {filtroQrPendiente && <span> (QR Pendiente)</span>}
                                        {filtroConImagen && <span> (Con foto)</span>}
                                        {terminoBusqueda && <span> (Búsqueda: {terminoBusqueda})</span>}
                                        {nivelSeleccionado && <span> (Nivel: {nivelSeleccionado})</span>}
                                        {filtroActivo && <span> (Estatus Activo)</span>}
                                        {filtroInactivo && <span> (Estatus Inactivo)</span>}
                                    </div>
                                ) : (
                                    <div>No hay coincidencias</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FILTRAR RESULTADOS */}
                    <div className='flex mb-5 items-center justify-center'>
                        <input
                            ref={filterInputRef}
                            type="text"
                            placeholder="Buscar por nombre, matrícula, mamá, papá, autorizados"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            className="flex-grow border-2 p-2 rounded"
                        />
                    </div>

                    <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>

                        {alumnosFiltrados.map((alumno, index) => (
                            <div id={`fecha_${index}`} key={index} className='border gap-6 p-5 rounded-md bg-gray-50'>

                                <div className='grid grid-cols-2 gap-2 mb-4'>
                                    <div className='text-2xl font-semibold'>{alumno.matricula}</div>
                                    <div className='flex space-x-2'>
                                        <Link href={`/dashboard/alumno/${alumno.id}`} className='bg-blue-500 text-white font-bold py-1 px-2 rounded block'>
                                            Editar
                                        </Link>
                                        <BtnEstatusAlumno
                                            alumno={alumno}
                                            onStatusUpdated={fetchAlumnos}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3 gap-2'>
                                    <div className='col-span-2'>
                                        <ul>
                                            <li className="border p-1"><b>Alumno:</b> {alumno.nombre}</li>
                                            <li className="border p-1"><b>Nivel:</b> {alumno.nivel}</li>
                                            <li className="border p-1"><b>Grado:</b> {alumno.grado || "N/A"}</li>
                                            <li className="border p-1"><b>Grupo:</b> {alumno.grupo || "N/A"}</li>
                                            <li className="border p-1"><b>Ciclo </b>escolar: {alumno.ciclo_escolar || "N/A"}</li>
                                            <li className="border p-1"><b>Tipo </b>de Sangre: {alumno.tipo_sangre || "N/A"}</li>
                                            <li className="border p-1"><b>Alergias:</b> {alumno.alergia || "N/A"}</li>
                                            <li className="border p-1"><b>Mamá:</b> {alumno.mama || "N/A"}</li>
                                            <li className="border p-1"><b>Papá:</b> {alumno.papa || "N/A"}</li>
                                            <li className="border p-1"><b>Autorizado:</b> {alumno.autorizado_1 || "N/A"}</li>
                                            <li className="border p-1"><b>Autorizado:</b> {alumno.autorizado_2 || "N/A"}</li>
                                            <li className="border p-1"><b>Autorizado:</b> {alumno.autorizado_3 || "N/A"}</li>
                                        </ul>

                                    </div>

                                    <div className='flex flex-col items-center'>
                                        <BtnSubirFotoAlumno
                                            alumno={alumno}
                                            onImageUploaded={handleImageUploaded}
                                        />
                                        <BtnGenerarQrAlumno
                                            alumno={alumno}
                                            onQrGenerated={handleQrGenerated}
                                        />
                                        <Link href={`/${alumno.matricula}`} target='_blank' className="
                                        bg-black text-white font-bold p-5 rounded block mt-2 text-center
                                        ">
                                            Ficha digital
                                        </Link>
                                        {user?.email === 'ing.israel.wong@gmail.com' && (
                                            <button className='px-3 py-3' onClick={() => generarImagenResponsables(alumno)}>
                                                Generar imagen responsables
                                            </button>
                                        )}
                                    </div>


                                </div>


                            </div>
                        ))}

                    </div>
                </>
            )}
        </div>
    );
}

export default Page;