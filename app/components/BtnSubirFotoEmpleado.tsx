import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { subirImagen, eliminarImagen } from '@/app/libs/GestionarImagenes';
import { actualizarEmpleado } from '@/app/libs/empleados';

interface Empleado {
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

interface BtnSubirFotoEmpleadoProps {
    empleado: Empleado | undefined | null;
    onImageUploaded: () => void;
}

const BtnSubirFotoEmpleado: React.FC<BtnSubirFotoEmpleadoProps> = ({ empleado, onImageUploaded }) => {

    const [uploading, setUploading] = useState(false);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [files, setFiles] = useState<{ [key: number]: File | null }>({});
    const [imageUrl, setImageUrl] = useState<string | null>(empleado?.url_image ?? null);
    const [imageDeleted, setImageDeleted] = useState(false);

    useEffect(() => {
        if (empleado?.url_image) {
            console.log( empleado.url_image);
            setImageUrl(empleado.url_image ?? null);
        }
    }, [empleado]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, empleadoId?: number) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (empleadoId !== undefined && selectedFiles.length > 0) {
            setFiles(prevFiles => ({
                ...prevFiles,
                [empleadoId]: selectedFiles[0]
            }));
        }
    };

    const handleUploadForEmpleado = async (empleado: Empleado) => {
        const file = files[empleado.id];
        if (!file) {
            console.error("Por favor, selecciona un archivo.");
            return;
        }
        try {
            setUploading(true);
            const result_uploaded = await subirImagen(file, empleado.id.toString(), 'Empleado/Fotografia');
            if (!result_uploaded.success) {
                console.error(result_uploaded.message || "Error desconocido");
                return;
            }

            await actualizarEmpleado(empleado.id, { ...empleado, url_image: result_uploaded.publicUrl ?? null });
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

    const handleEliminarImagen = async (id: string) => {
        const response = confirm('¿Estás seguro de eliminar la imagen?');
        if (!response) return;

        if (empleado) {
            console.log('Eliminando imagen para el empleado:', empleado.id);
            await actualizarEmpleado(empleado.id, { ...empleado, url_image: null });
            setImageUrl(null);
        }
        
        try {
            const responseDeleteImage = await eliminarImagen(id, 'Empleado/Fotografia');
            if (!responseDeleteImage.success) {
                console.error(responseDeleteImage.message || "Error desconocido");
                return;
            }
            setFiles(prevFiles => ({
                ...prevFiles,
                [id]: null
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
                    <Image
                        src={imageUrl}
                        alt={empleado?.nombre ?? 'Empleado'}
                        width={200}
                        height={400}
                        style={{ width: 'auto', height: 'auto' }}
                        className='rounded-full'
                    />
                    <button onClick={() => handleEliminarImagen(empleado?.id?.toString() ?? '')} disabled={uploading} className='underline text-red-600'>
                        {uploading ? 'Eliminando...' : 'Eliminar foto'}
                    </button>
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => empleado && fileInputRefs.current[empleado.id]?.click()}
                        className="bg-gray-200 text-black font-bold py-2 px-4 rounded mr-2 text-sm"
                    >
                        Adjuntar
                    </button>
                    <input
                        type="file"
                        onChange={(event) => handleFileChange(event, empleado?.id)}
                        ref={(el) => { if (empleado) fileInputRefs.current[empleado.id] = el; }}
                        style={{ display: 'none' }}
                    />
                    {empleado && files[empleado.id] && (
                        <div>
                            <p>{files[empleado.id]?.name}</p>
                            <button onClick={() => handleUploadForEmpleado(empleado)} disabled={uploading} className='underline text-blue-600'>
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BtnSubirFotoEmpleado;