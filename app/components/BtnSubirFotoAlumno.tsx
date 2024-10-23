import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { subirImagen, eliminarImagen } from '@/app/libs/GestionarImagenes';
import { actualizarAlumno } from '@/app/libs/actions';

interface Alumno {
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

interface BtnSubirFotoAlumnoProps {
    alumno: Alumno | undefined;
    onImageUploaded: () => void;
}

const BtnSubirFotoAlumno: React.FC<BtnSubirFotoAlumnoProps> = ({ alumno, onImageUploaded }) => {

    const [uploading, setUploading] = useState(false);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [files, setFiles] = useState<{ [key: number]: File | null }>({});
    const [imageUrl, setImageUrl] = useState<string | null>(alumno?.url_image ?? null);
    const [imageDeleted, setImageDeleted] = useState(false);

    useEffect(() => {
        if (alumno?.url_image) {
            console.log(alumno.url_image);
            setImageUrl(alumno.url_image ?? null);
        }
    }, [alumno]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, empleadoId?: number) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (empleadoId !== undefined && selectedFiles.length > 0) {
            setFiles(prevFiles => ({
                ...prevFiles,
                [empleadoId]: selectedFiles[0]
            }));
        }
    };

    const handleUploadForAlumno = async (alumno: Alumno) => {
        const file = files[alumno.id];
        if (!file) {
            console.error("Por favor, selecciona un archivo.");
            return;
        }
        try {
            setUploading(true);
            const result_uploaded = await subirImagen(file, alumno.matricula, 'Alumno/Fotografia');
            if (!result_uploaded.success) {
                console.error(result_uploaded.message || "Error desconocido");
                return;
            }

            await actualizarAlumno(alumno.id, { ...alumno, url_image: result_uploaded.publicUrl ?? null });
            setImageUrl(result_uploaded.publicUrl ?? null);
            setImageDeleted(false);
            console.log('Imagen subida:', result_uploaded);
            onImageUploaded();
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleEliminarImagen = async (matricula: string) => {
        const response = confirm('¿Estás seguro de eliminar la imagen?');
        if (!response) return;

        if (alumno) {
            console.log('Eliminando imagen para el alumno:', matricula);
            await actualizarAlumno(alumno.id, { ...alumno, url_image: null });
            setImageUrl(null);
        }

        try {
            const responseDeleteImage = await eliminarImagen(matricula, 'Alumno/Fotografia');
            if (!responseDeleteImage.success) {
                console.error(responseDeleteImage.message || "Error desconocido");
                return;
            }
            setFiles(prevFiles => ({
                ...prevFiles,
                [matricula]: null
            }));

            setImageUrl(null);
            setImageDeleted(true);
            onImageUploaded();
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
        }
    };

    return (
        <div>
            {imageUrl && !imageDeleted ? (
                <div id='imagen'>
                    <div className='flex flex-col items-center border p-2'>
                        <Image
                            src={imageUrl}
                            alt={alumno?.nombre ?? 'Alumno'}
                            width={200}
                            height={200}
                            className='object-cover mb-2'
                        />
                        <button
                            onClick={() => alumno && handleEliminarImagen(alumno.matricula ?? 0)}
                            disabled={uploading}
                            className='underline text-red-600'
                        >
                            {uploading ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => alumno && fileInputRefs.current[alumno.id]?.click()}
                        className="bg-gray-200 text-black font-bold py-2 px-4 rounded mr-2 text-sm"
                    >
                        Adjuntar
                    </button>
                    <input
                        type="file"
                        onChange={(event) => handleFileChange(event, alumno?.id)}
                        ref={(el) => { if (alumno) fileInputRefs.current[alumno.id] = el; }}
                        style={{ display: 'none' }}
                    />
                    {alumno && files[alumno.id] && (
                        <div>
                            <p>{files[alumno.id]?.name}</p>
                            <button onClick={() => handleUploadForAlumno(alumno)} disabled={uploading} className='underline text-blue-600'>
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BtnSubirFotoAlumno;