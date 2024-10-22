'use server';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

export async function generarQr(empleado: Empleado) {

    const resultado: {
        url: string;
        qrSvg: string;
        url_svg: string;
    } = {
        url: '',
        qrSvg: '',
        url_svg: ''
    }

    const url = `https://ateneo-app.vercel.app/empleado/${empleado.id}`;
    const qrSvg = await QRCode.toString(url, { type: 'svg' });
    const width = 1200; // Ancho deseado
    const height = 1200; // Alto deseado

    // Convertir SVG a JPG con las dimensiones especificadas
    const qrJpgBuffer = await sharp(Buffer.from(qrSvg))
        .resize(width, height)
        .jpeg()
        .toBuffer();
    const fileName = `Empleado/QR/${empleado.id}.jpg`;
    const url_svg = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/Ateneo/${fileName}`;

    // Eliminar el archivo existente si ya está presente
    await supabase.storage
        .from('Ateneo')
        .remove([fileName]);

    // Subir el nuevo archivo JPG
    const { error } = await supabase.storage
        .from('Ateneo')
        .upload(fileName, qrJpgBuffer, {
            contentType: 'image/jpeg'
        });
    if (error) {
        if (error.message.includes('Duplicate entry')) {
            console.error(`Error uploading QR for ${empleado.nombre}: Duplicate entry`);
        } else {
            console.error(`Error uploading QR for ${empleado.nombre}:`, error.message);
        }
    } else {
        console.log(`QR for ${empleado.nombre} uploaded successfully.`);
    }

    resultado.url = url
    resultado.qrSvg = qrSvg
    resultado.url_svg = url_svg

    return resultado;

}

export async function eliminarQr(empleado: Empleado) {
    const fileName = `Empleado/QR/${empleado.id}.jpg`;

    const { data, error: deleteError } = await supabase.storage
    .from('Ateneo')
    .remove([fileName]);
    if (deleteError) {
        console.error(`Error deleting QR for ${empleado.nombre}:`, deleteError.message);
    } else if (data) {
        console.log(`File deleted for ${empleado.nombre}: ${fileName}`);
    } else {
        console.error(`Unexpected error deleting QR for ${empleado.nombre}`);
    }
}
