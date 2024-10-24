import { toPng } from 'html-to-image';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

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
    estatus: string;
    url_image?: string | null;
}

interface ImagenResponsablesProps {
    alumno: Alumno;
}

export async function ImagenResponsables({ alumno }: ImagenResponsablesProps) {

    const responsables = [
        alumno.mama,
        alumno.papa,
        alumno.autorizado_1,
        alumno.autorizado_2,
        alumno.autorizado_3
    ].filter(persona => persona);

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '400px';
    container.style.backgroundColor = 'white';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.fontSize = '20px';
    container.style.fontWeight = 'bold';
    container.style.fontFamily = 'Arial';
    container.style.padding = '20px';
    container.style.alignContent = 'center';
    container.style.textAlign = 'center';
    container.style.alignItems = 'center';

    responsables.forEach(responsable => {
        const textElement = document.createElement('div');
        textElement.textContent = responsable || '';
        container.appendChild(textElement);

        // Añadir un salto de línea adicional
        const lineBreak = document.createElement('div');
        lineBreak.style.height = '20px'; // Ajustar la altura del salto de línea
        container.appendChild(lineBreak);
    });

    document.body.appendChild(container);

    const dataUrl = await toPng(container);
    document.body.removeChild(container);

    // Convertir dataUrl a Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Convertir Blob a File
    const file = new File([blob], `${alumno.matricula}.png`, { type: 'image/png' });

    // // Convertir PNG a JPG usando browser-image-compression
    // const jpgBlob = await imageCompression(file, {
    //     maxWidthOrHeight: 400,
    //     useWebWorker: true,
    //     fileType: 'image/jpeg',
    //     initialQuality: 1.0 // Máxima calidad
    // });

    // Subir la imagen JPG a Supabase
    const { data, error } = await supabase.storage
        .from('Ateneo/Alumno/Responsables')
        .upload(`${alumno.matricula}.jpg`, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error('Error al subir la imagen:', error);
        return { success: false, message: `Error al subir la imagen: ${error.message}` };
    } else {
        console.log('Imagen subida con éxito:', data);
        return { success: true, message: 'Imagen subida con éxito' };
    }
}