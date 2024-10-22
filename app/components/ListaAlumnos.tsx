'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { actualizarAlumno, obtenerAlumnos, limpiarRegistros } from '@/app/libs/actions'
import BtnGenerarQrAlumno from './BtnGenerarQrAlumno'
import BtnSubirFotoAlumno from './BtnSubirFotoAlumno'
import { generarQr, eliminarQr } from '../libs/QRAlumno'
import { subirImagen } from '../libs/GestionarImagenes'


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

interface UserProps {
    name?: string;
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
        return matchesNivel && matchesBusqueda && matchesFotoPendiente && matchesQrPendiente && matchesConImagen;
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
            'autorizados',
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
                const rutaImagen_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Fotografia/${alumno.matricula}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/Fotografia/
                const rutaQR_local = `/Users/israelwong/Desktop/Ateneo/Recursos/QR/${alumno.matricula}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/QR/

                const autorizados = [
                    alumno.mama,
                    alumno.papa,
                    alumno.autorizado_1,
                    alumno.autorizado_2,
                    alumno.autorizado_3
                ].filter(persona => persona).join(', ');

                return [
                    alumno.matricula,
                    alumno.nombre,
                    alumno.nivel,
                    alumno.grado || 'N/A',
                    alumno.grupo || 'N/A',
                    alumno.ciclo_escolar || 'N/A',
                    alumno.alergia ? `"${alumno.alergia}"` : 'N/A', // Agregar comillas a las alergias
                    alumno.tipo_sangre || 'N/A',
                    `"${autorizados}"`, // Agrupar autorizados y agregar comillas
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

    return (
        <div className="mx-auto py-10 max-w-full p-5">
            {loading ? (
                <div className="text-center text-xl">Cargando datos...</div>
            ) : (
                <>
                    {user?.email === 'ing.israel.wong@gmail.com' && (
                        // Acciones masivas:
                        <div className='space-x-2 items-center flex'>

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

                    <div className='space-x-2 items-center py-5 flex'>
                        <button
                            className={`flex-grow ${nivelSeleccionado === null ? 'bg-yellow-500' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
                            onClick={() => setNivelSeleccionado(null)}
                        >
                            TODOS ({alumnos.length})
                        </button>
                        {niveles.map(nivel => (
                            <button
                                key={nivel}
                                className={`flex-grow ${nivelSeleccionado === nivel ? 'bg-yellow-500' : 'bg-green-500'} hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}
                                onClick={() => setNivelSeleccionado(nivel)}
                            >
                                {nivel} ({contarAlumnosPorNivel(nivel)})
                            </button>
                        ))}

                        <div className="flex items-center space-x-4">
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
                                        {filtroConImagen && <span> (Con Imagen)</span>}
                                        {terminoBusqueda && <span> (Búsqueda: {terminoBusqueda})</span>}
                                        {nivelSeleccionado && <span> (Nivel: {nivelSeleccionado})</span>}
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

                    <table className="w-full border-collapse table-auto">
                        <thead>
                            <tr>
                                <th className="border p-2 flex-grow">#</th>
                                <th className="border p-2">Matrícula</th>
                                <th className="border p-2">Nombre</th>
                                <th className="border p-2">Nivel</th>
                                <th className="border p-2">Grado</th>
                                <th className="border p-2">Grupo</th>
                                <th className="border p-2">Ciclo</th>
                                <th className="border p-2">Alergia</th>
                                <th className="border p-2">Tipo de Sangre</th>
                                <th className="border p-2">Mamá</th>
                                <th className="border p-2">Papá</th>
                                <th className="border p-2">Autorizado 1</th>
                                <th className="border p-2">Autorizado 2</th>
                                <th className="border p-2">Autorizado 3</th>
                                <th className="border p-2">Acciones</th>
                                <th className="border p-2">QR</th>
                                <th className="border p-2">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosFiltrados.map((alumno, index) => (
                                <tr key={alumno.id} className=''>
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{alumno.matricula}</td>
                                    <td className="border p-2">{alumno.nombre}</td>
                                    <td className="border p-2">{alumno.nivel}</td>
                                    <td className="border p-2">{alumno.grado || "N/A"}</td>
                                    <td className="border p-2">{alumno.grupo || "N/A"}</td>
                                    <td className="border p-2">{alumno.ciclo_escolar || "N/A"}</td>
                                    <td className="border p-2">{alumno.alergia || "N/A"}</td>
                                    <td className="border p-2">{alumno.tipo_sangre || "N/A"}</td>
                                    <td className="border p-2">{alumno.mama || "N/A"}</td>
                                    <td className="border p-2">{alumno.papa || "N/A"}</td>
                                    <td className="border p-2">{alumno.autorizado_1 || "N/A"}</td>
                                    <td className="border p-2">{alumno.autorizado_2 || "N/A"}</td>
                                    <td className="border p-2">{alumno.autorizado_3 || "N/A"}</td>
                                    <td className="border p-2">
                                        <div className='text-sm space-y-2'>

                                            <Link href={`/dashboard/alumno/${alumno.id}`} className='bg-blue-500 text-white font-bold py-1 px-2 rounded ml-2 block'>
                                                Editar alumno
                                            </Link>
                                            <Link href={`/${alumno.matricula}`} target='_blank' className="bg-black text-white font-bold py-1 px-2 rounded ml-2 block">
                                                Ficha digital
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="border p-2">
                                        <BtnGenerarQrAlumno
                                            alumno={alumno}
                                            onQrGenerated={handleQrGenerated}
                                        />
                                    </td>
                                    <td>
                                        <BtnSubirFotoAlumno
                                            alumno={alumno}
                                            onImageUploaded={handleImageUploaded}
                                        />

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

export default Page;