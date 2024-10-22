'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { actualizarEmpleado, obtenerEmpleados } from '@/app/libs/empleados'
import BtnGenerarQrEmpleado from './BtnGenerarQrEmpleado'
import BtnSubirFotoEmpleado from './BtnSubirFotoEmpleado'
import { generarQr, eliminarQr } from '../libs/QREmpleado'
import { subirImagen } from '../libs/GestionarImagenes'

interface EmpleadoProps {
    id: number;
    nombre: string;
    telefono: string | null;
    email: string | null;
    area: string;
    puesto: string;
    contacto_emergencia: string | null;
    tipo_sangre: string | null;
    url_image: string | null;
    qr: string | null;
    fecha_registro: Date;
    fecha_actualiziacion: Date | null;
    estatus: string;
}

interface UserProps {
    email: string;
}

function Page() {

    const [empleados, setEmpleados] = useState<EmpleadoProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const filterInputRef = useRef<HTMLInputElement>(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
    const [areaSeleccionada, setAreaSeleccionada] = useState<string | null>(null);
    const areas = Array.from(new Set(empleados.map(empleado => empleado.area)));

    const [filtroFotoPendiente, setFiltroFotoPendiente] = useState<boolean>(false);
    const [filtroQrPendiente, setFiltroQrPendiente] = useState<boolean>(false);
    const [filtroConImagen, setFiltroConImagen] = useState<boolean>(false);

    const [generandoQrs, setGenerandoQrs] = useState<boolean>(false);
    const [eliminandoQRs, setEliminandoQRs] = useState<boolean>(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [copiando, setCopiando] = useState<boolean>(false);

    const [user, setUser] = useState<UserProps>();

    const router = useRouter();

    useEffect(() => {

        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        console.log('user', user);
        setUser(user);
        fetchEmpleados();
    }, []);

    const hayFiltrosAplicados = () => {
        return filtroFotoPendiente || filtroQrPendiente || filtroConImagen || terminoBusqueda || areaSeleccionada;
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

    /* COPIAR EN PORTA PAPALES PENDIENTES FOTO*/
    const copiarAlPortapapeles = () => {
        setCopiando(true);
        const datos = empleadosFiltrados.map(empleado =>
            `ID: ${empleado.id}\nNombre: ${empleado.nombre}\nÁrea: ${empleado.area}\nPuesto: ${empleado.puesto}`
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

    /* OBTENER EMPLEADOS */
    async function fetchEmpleados() {
        try {
            const empleados = await obtenerEmpleados();
            setEmpleados(empleados);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
        } finally {
            setLoading(false);
        }
    }

    const contarEmpleadosPorArea = (area: string) => {
        return empleados.filter(empleado => empleado.area === area).length;
    };

    /* FILTRAR EMPLEADOS */
    const empleadosFiltrados = empleados.filter(empleado => {
        const matchesArea = areaSeleccionada ? empleado.area === areaSeleccionada : true;
        const matchesBusqueda = terminoBusqueda
            ? empleado.id.toString().includes(terminoBusqueda) ||
            empleado.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            empleado.area?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            empleado.puesto?.toLowerCase().includes(terminoBusqueda.toLowerCase())
            : true;
        const matchesFotoPendiente = filtroFotoPendiente ? !empleado.url_image : true;
        const matchesQrPendiente = filtroQrPendiente ? !empleado.qr : true;
        const matchesConImagen = filtroConImagen ? !!empleado.url_image : true;
        return matchesArea && matchesBusqueda && matchesFotoPendiente && matchesQrPendiente && matchesConImagen;
    });

    const handleEdit = (id: number) => {
        router.push(`/dashboard/empleado/${id}`);
    };

    const handleQrGenerated = () => {
        fetchEmpleados();
    };

    const handleImageUploaded = () => {
        fetchEmpleados();
    }

    // GENERAR QRS MASIVOS
    const generarQrsMasivos = async () => {
        const result = confirm('¿Estás seguro de que deseas generar los QRs para todos los empleados?');
        if (!result) return;

        setGenerandoQrs(true);
        for (const empleado of empleados) {
            if (!empleado.qr) {
                const result = await generarQr(empleado);
                await actualizarEmpleado(empleado.id, { ...empleado, qr: result.url_svg });
                fetchEmpleados();
            }
        }
        setGenerandoQrs(false);
    };

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

        // setSubiendoImagenes(true);

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
                const empleadoCoincidencia = empleados.find(empleado => {
                    let empleadoNombre: string = empleado?.nombre.trim() || '';
                    empleadoNombre = empleadoNombre.replace(/\s+/g, ' ');
                    empleadoNombre = empleadoNombre.replace(/^-+|-+$/g, '');
                    return empleadoNombre === fileName;
                });

                if (empleadoCoincidencia) {
                    const result = await subirImagen(files[i], empleadoCoincidencia.id.toString(), 'Empleado/Fotografia');
                    console.log('result', result);

                    await actualizarEmpleado(empleadoCoincidencia.id, { ...empleadoCoincidencia, url_image: result.publicUrl || null });

                    fetchEmpleados();
                } else {
                    console.error('No se encontró un alumno con el nombre:', fileName);
                }
            }
        }
        alert('Subida de imágenes finalizada');
        // setSubiendoImagenes(false);

    };

    const generarNombreArchivo = () => {
        let nombreArchivo = 'csv_empleados';

        if (filtroConImagen) {
            nombreArchivo += '_conImagen';
        }

        if (terminoBusqueda) {
            nombreArchivo += `_Busqueda_${terminoBusqueda}`;
        }

        if (areaSeleccionada) {
            nombreArchivo += `_Nivel_${areaSeleccionada}`;
        }

        return nombreArchivo;
    };

    const exportarCSV = () => {
        const nombreArchivo = generarNombreArchivo();

        const columnas = [
            'id',
            'nombre',
            'telefono',
            'area',
            'puesto',
            'contacto_emergencia',
            'tipo_sangre',
            '@qr',
            '@url_image'
        ];

        // Reemplazar espacios con guiones bajos en los nombres de las columnas
        const encabezados = columnas.map(columna => columna.replace(/\s+/g, '_')).join(',');

        const csv = [
            encabezados,
            ...empleadosFiltrados.map(empleado => {

                const rutaImagen_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Empleado/Fotografia/${empleado.id}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/Fotografia/
                const rutaQR_local = `/Users/israelwong/Desktop/Ateneo/Recursos/Empleado/QR/${empleado.id}.jpg`;// /Users/israelwong/Desktop/Ateneo/Recursos/QR/

                return [
                    empleado.id,
                    empleado.nombre,
                    empleado.telefono || 'N/A',
                    empleado.area || 'N/A',
                    empleado.puesto || 'N/A',
                    empleado.contacto_emergencia || 'N/A',
                    empleado.tipo_sangre || 'N/A',
                    rutaQR_local || 'N/A',
                    rutaImagen_local || 'N/A',
                ].join(',');
            })
        ].join('\n');


        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const eliminarQrMasivos = async () => {
        const result = confirm('¿Estás seguro de que deseas eliminar todos los QRs?');
        if (!result) return;

        setEliminandoQRs(true);
        for (const empleado of empleados) {
            if (empleado.qr) {
                await eliminarQr(empleado);
                await actualizarEmpleado(empleado.id, { ...empleado, qr: null });
                fetchEmpleados();
            }
        }
        setEliminandoQRs(false);
    }


    return (
        <div className="mx-auto max-w-full p-5">
            {loading ? (
                <div className="text-center text-xl">Cargando datos...</div>
            ) : (
                <>

                    {user?.email === 'ing.israel.wong@gmail.com' && (
                        <div className='gap-3 space-x-2'>
                            <button onClick={() => exportarCSV()}
                                className='border-2 border-gray-500 px-3 py-2 text-black rounded-md'>
                                Exportar CSV
                            </button>

                            <button
                                className='border-2 border-gray-500 px-3 py-2 text-black rounded-md'
                                id="fotosMasivas" onClick={handleFotosMasivasClick}>Subir Fotos Masivas</button>
                            <input
                                type="file"
                                ref={inputFileRef}
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileChange}
                            />

                            <button className='bg-black px-3 py-2 text-white rounded-md'
                                onClick={() => generarQrsMasivos()}
                            >
                                {generandoQrs ? 'Generando QRs...' : 'Generar QRs Masivos'}
                            </button>

                            <button
                                onClick={copiarAlPortapapeles}
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${copiando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={copiando}
                            >
                                {copiando ? 'Copiando datos...' : 'Copiar datos en portapapeles'}
                            </button>

                            <button className="bg-gray-600 text-white p-2 rounded-md  text-center"
                                onClick={() => eliminarQrMasivos()}
                            >
                                {eliminandoQRs ? 'Eliminando QRs...' : 'Eliminar QRs Masivos'}
                            </button>

                        </div>
                    )}



                    {/* FILTRO EMPLEADOS  */}
                    <div className='space-x-2 items-center my-10 flex'>
                        <button
                            className={`flex-grow ${areaSeleccionada === null ? 'bg-yellow-500' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
                            onClick={() => setAreaSeleccionada(null)}
                        >
                            TODOS ({empleados.length})
                        </button>
                        {areas.map(area => (
                            <button
                                key={area}
                                className={`flex-grow ${areaSeleccionada === area ? 'bg-yellow-500' : 'bg-green-500'} hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}
                                onClick={() => setAreaSeleccionada(area)}
                            >
                                {area} ({contarEmpleadosPorArea(area)})
                            </button>
                        ))}


                    </div>
                    <div className='pb-5'>
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
                                {empleadosFiltrados.length !== 0 ? (
                                    <div>
                                        Coincidencias: {empleadosFiltrados.length}
                                        {filtroFotoPendiente && <span> (Foto Pendiente)</span>}
                                        {filtroQrPendiente && <span> (QR Pendiente)</span>}
                                        {filtroConImagen && <span> (Con Imagen)</span>}
                                        {terminoBusqueda && <span> (Búsqueda: {terminoBusqueda})</span>}
                                        {areaSeleccionada && <span> (Área: {areaSeleccionada})</span>}
                                    </div>
                                ) : (
                                    <div>No hay coincidencias</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='flex mb-5 items-center justify-center'>
                        <input
                            ref={filterInputRef}
                            type="text"
                            placeholder="Buscar por nombre, ID, área, puesto"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            className="flex-grow border-2 p-2 rounded"
                        />
                    </div>

                    <table className="w-full border-collapse table-auto">
                        <thead>
                            <tr>
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Nombre</th>
                                <th className="border p-2">Teléfono</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">Área</th>
                                <th className="border p-2">Puesto</th>
                                <th className="border p-2">Contacto de Emergencia</th>
                                <th className="border p-2">Tipo de Sangre</th>
                                <th className="border p-2">Acciones</th>
                                <th className="border p-2">QR</th>
                                <th className="border p-2">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleadosFiltrados.map((empleado) => (
                                <tr key={empleado.id}>
                                    <td className="border p-2">{empleado.id}</td>
                                    <td className="border p-2">{empleado.nombre}</td>
                                    <td className="border p-2">{empleado.telefono || "N/A"}</td>
                                    <td className="border p-2">{empleado.email || "N/A"}</td>
                                    <td className="border p-2">{empleado.area}</td>
                                    <td className="border p-2">{empleado.puesto}</td>
                                    <td className="border p-2">{empleado.contacto_emergencia || "N/A"}</td>
                                    <td className="border p-2">{empleado.tipo_sangre || "N/A"}</td>
                                    <td className="border p-2">
                                        <div className='text-sm space-y-3 text-center items-center justify-center'>
                                            <button
                                                className="bg-yellow-500 text-white font-bold py-1 px-2 rounded block w-full h-14"
                                                onClick={() => handleEdit(empleado.id)}
                                            >
                                                Editar empleado
                                            </button>
                                            <Link href={`/empleado/${empleado.id}`} target='_blank' 
                                                className="bg-black text-white font-bold py-1 px-2 rounded  w-full h-10 flex items-center justify-center">
                                                Ficha digital
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="border p-2">
                                        <BtnGenerarQrEmpleado
                                            empleado={empleado}
                                            onQrGenerated={handleQrGenerated}
                                        />
                                    </td>
                                    <td className='text-center items-center'>
                                        <BtnSubirFotoEmpleado empleado={empleado}
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