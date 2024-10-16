'use client'
import React, { useState, useEffect, useRef } from 'react'
import { obtenerAlumno, actualizarAlumno, obtenerAlumnos, eliminarAlumno, depurarEspaciosEnBlanco } from '@/app/libs/actions'

import { generarYSubirQRs, generarYSubirQR, eliminarQR } from '@/app/libs/generarYSubirQRs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { subirImagen } from '@/app/libs/SubirImagenes'

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

function Page() {

  const [alumnos, setAlumnos] = useState<AlumnoProps[]>([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [generandoQRs, setGenerandoQRs] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [quitandoEspacios, setQuitandoEspacios] = useState<boolean>(false);
  const [eliminandoQr, setEliminandoQr] = useState<boolean>(false);

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const filterInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const niveles = Array.from(new Set(alumnos.map(alumno => alumno.nivel)));

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleEscapeKey = (event: KeyboardEvent) => {
    console.log('Presionaste la tecla:', event.key);
    if (event.key === 'Escape' && filterInputRef.current) {
      setTerminoBusqueda('');
      filterInputRef.current.value = '';
      // Aquí puedes agregar cualquier lógica adicional para limpiar el filtro de la lista
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // DEPURAR TABLA
  async function depurar() {
    setQuitandoEspacios(true)
    await depurarEspaciosEnBlanco();
    alert('Tabla depudara')
    setQuitandoEspacios(false)
  }

  const alumnosFiltrados = alumnos.filter(alumno => {
    const matchesNivel = nivelSeleccionado ? alumno.nivel === nivelSeleccionado : true;
    const matchesBusqueda = terminoBusqueda
      ? alumno.matricula.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      alumno.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      (alumno.mama && alumno.mama.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
      (alumno.papa && alumno.papa.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
      (alumno.autorizado_1 && alumno.autorizado_1.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
      (alumno.autorizado_2 && alumno.autorizado_2.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
      (alumno.autorizado_3 && alumno.autorizado_3.toLowerCase().includes(terminoBusqueda.toLowerCase()))
      : true;
    return matchesNivel && matchesBusqueda;
  });

  const contarAlumnosPorNivel = (nivel: string) => {
    return alumnos.filter(alumno => alumno.nivel === nivel).length;
  };

  // OBTENER ALUMNOS
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

  // EDITAR ALUMNO
  const handleEdit = (id: number) => {
    router.push(`/dashboard/alumno/${id}`);
  };

  //DELETE ALUMNO
  async function handleDelete(id: number) {
    const response = confirm('¿Estás seguro de eliminar este alumno?');
    if (!response) return;
    await eliminarAlumno(id);
    setNivelSeleccionado(null);
    fetchAlumnos();
  }

  //GENERAR QR
  const handleGenerateQR = async (id: number) => {
    try {
      setGenerandoQRs(true);
      const alumno = alumnos.find(alumno => alumno.id === id);
      console.log('Generando QR para el alumno con ID:', alumno);

      if (!alumno) {
        console.error('Alumno no encontrado');
        return;
      }
      await generarYSubirQR(alumno);
      setNivelSeleccionado(null);
      fetchAlumnos();
      setGenerandoQRs(false);
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  };

  //ELIMINAR QR
  const deleteQr = async (matricula: string) => {
    setEliminandoQr(true);
    const response = confirm('¿Estás seguro de eliminar este QR?');
    if (!response) return;

    //busca alumno por matricula
    const alumno = alumnos.find(alumno => alumno.matricula === matricula);
    if (alumno) {
      await eliminarQR(alumno);
      setEliminandoQr(false);
    } else {
      console.error('Alumno no encontrado');
    }
    setNivelSeleccionado(null)
    fetchAlumnos();
  }

  //GENERAR QRS MASIVOS
  const generarQRs = async () => {

    const response = confirm('¿Estás seguro de generar los QRs?');
    if (!response) return;

    setGenerandoQRs(true);
    try {
      const alumnosVisibles = alumnosFiltrados.map(alumno => ({
        ...alumno,
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
        qr: alumno.qr?.trim(),
      }));
      await generarYSubirQRs(alumnosVisibles);
      fetchAlumnos();
    } catch (error) {
      console.error('Error al generar QRs masivos:', error);
    } finally {
      setGenerandoQRs(false);
    }
  };

  //SUBIR ARCHIVOS
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, alumnoId?: number) => {
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : [];
    if (alumnoId !== undefined) {
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles[alumnoId] = selectedFiles[0];
        return newFiles;
      });
    } else {
      setFiles(selectedFiles);
    }
  };

  //SUBIR IMAGENES
  const handleUpload = async () => {
    setUploading(true);
    if (files.length === 0) {
      setError("Por favor, selecciona al menos un archivo.");
      return;
    }

    for (const file of files) {
      //quitar la extención del archivo
      const fileName = file.name.split('.').slice(0, -1).join('.');

      //eliminar espacios duplicados entre palabras y al inicio y final
      const nombre = fileName.replace(/\s+/g, ' ').trim();

      //buscar en la base de datos
      const alumno = await obtenerAlumno(nombre);

      //actualizar url_imagen en la base de datos
      if (alumno) {
        const url = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/fotografia/${alumno.matricula}`;

        const updated = await actualizarAlumno(alumno.id, { ...alumno, url_image: url });
        if (updated.success) {

          //subir imagen
          const result_uploaded = await subirImagen(file, alumno.matricula);
          if (!result_uploaded.success) {
            setError(result_uploaded.message || "Error desconocido");
            console.log(result_uploaded);
          }
        }
      }
    }
    setSuccess("Imágenes subidas exitosamente.");
    setUploading(false);
    setFiles([]); // Restablecer el estado de los archivos a vacío
    setNivelSeleccionado(null);
    fetchAlumnos();
  };

  //SUBIR IMAGEN PARA UN ALUMNO ESPECÍFICO
  const handleUploadForAlumno = async (alumno: AlumnoProps) => {
    const file = files[alumno.id];
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }

    setUploading(true);
    try {
      const result_uploaded = await subirImagen(file, alumno.matricula);
      if (result_uploaded.success) {
        const url = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/fotografia/${alumno.matricula}`;
        await actualizarAlumno(alumno.id, { ...alumno, url_image: url });
        setSuccess("Imagen subida exitosamente.");
        fetchAlumnos();
      } else {
        setError(result_uploaded.message || "Error desconocido");
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setError('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto py-10 max-w-full p-5">

      <div className='grid grid-cols-2'>


      <h3 className="text-3xl mb-5">Listar Alumnos</h3>
      <div>
        <Link href="/dashboard/" className="bg-blue-600 text-white p-2 rounded-md">
          Cerrar ventana
        </Link>
        {/* <Link href="/dashboard/pendientes" className="bg-blue-600 text-white p-2 rounded-md">
          Pendientes foto
        </Link> */}
      </div>

      </div>
      <div className='grid-cols-4'>
        <div className="mb-5 grid grid-cols-4 gap-4">
          <div className="col-span-3">

            <input
              ref={filterInputRef}
              type="text"
              placeholder="Buscar por nombre, matrícula, mamá, papá, autorizados"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="border p-2 rounded mb-5 w-full"
            />
          </div>
          <div className="col-span-1">
            <Link href="/dashboard/alumno" className="bg-blue-600 text-white p-2 rounded-md w-full block text-center">
              Registrar nuevo alumno
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-5">

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={() => setNivelSeleccionado(null)}
        >
          TODOS ({alumnos.length})
        </button>
        {niveles.map(nivel => (
          <button
            key={nivel}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={() => setNivelSeleccionado(nivel)}
          >
            {nivel} ({contarAlumnosPorNivel(nivel)})
          </button>
        ))}

        <button
          onClick={generarQRs}
          className="bg-purple-800 text-white font-bold py-2 px-4 rounded mr-2"
          disabled={generandoQRs}
        >
          {generandoQRs ? 'Generando Qrs...' : `Generar QRs ${nivelSeleccionado == null ? 'de todos los niveles' : nivelSeleccionado}`}
        </button>

        <button onClick={() => depurar()}
          className="underline font-bold py-2 px-4 rounded mr-2" >
          {quitandoEspacios ? 'Depurando tabla...' : 'Depurar tabla'}
        </button>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="bg-gray-200 text-black font-bold py-2 px-4 rounded mr-2"
        />
        {files.length > 0 && (
          <button id="btn_subir" onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-3 py-2">
            {uploading ? "Subiendo..." : "Iniciar subida"}
          </button>
        )}
        {uploading && <p>Subiendo imágenes...</p>}
        {error && <p className="py-5" style={{ color: "red" }}>{error}</p>}
        {success && <p className="py-5" style={{ color: "green" }}>{success}</p>}

      </div>

      {loading ? (
        <div className="text-center text-xl">Cargando datos...</div>
      ) : (
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              <th className="border p-2">#</th>
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
              <tr key={alumno.id}>
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

                  <div className='text-sm flex'>

                    <button
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                      onClick={() => handleEdit(alumno.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => handleDelete(alumno.id)}
                    >
                      Eliminar
                    </button>
                    <Link href={`/${alumno.nombre}`} target='_blank' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2">
                      Ficha
                    </Link>
                  </div>
                </td>
                <td className="border p-2">
                  {alumno.qr ? (
                    <div>
                      <Image
                        src={alumno.qr} alt="QR Code" className="w-16 h-16 mb-2" width={100} height={100} />
                      <a
                        href={alumno.qr}
                        download={`qr_${alumno.matricula}.svg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Descargar
                      </a>
                      <button
                        className="text-red-700 font-bold py-1 px-2 rounded"
                        onClick={() => deleteQr(alumno.matricula)}
                      >
                        {eliminandoQr ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleGenerateQR(alumno.id)}
                      >
                        {generandoQRs ? 'Generando...' : 'Generar'}
                      </button>

                    </>
                  )}
                </td>
                <td>
                  <Image
                    src={alumno.url_image?.startsWith('http') ? alumno.url_image : 'https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/fotografia/not-found.svg'}
                    alt="Foto"
                    width={300}
                    height={300}
                    className="object-cover h-30 w-30 object-middle rounded-full"
                  />
                  <div>
                    <button
                      onClick={() => fileInputRefs.current[alumno.id]?.click()}
                      className="bg-gray-200 text-black font-bold py-2 px-4 rounded mr-2"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      type="file"
                      onChange={(event) => handleFileChange(event, alumno.id)}
                      ref={(el) => { fileInputRefs.current[alumno.id] = el; }}
                      style={{ display: 'none' }}
                    />
                    {files[alumno.id] && (
                      <div>
                        <p>{files[alumno.id]?.name}</p>
                        <button onClick={() => handleUploadForAlumno(alumno)} disabled={uploading} className='underline text-blue-600'>
                          {uploading ? 'Subiendo...' : 'Subir Imagen'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Page;