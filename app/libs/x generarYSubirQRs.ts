'use server';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { actualizarAlumno } from './actions';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
}

interface Resultado {
  url: string;
  qrSvg: string;
  url_svg: string;
}

export async function generarYSubirQRs(alumnos: Alumno[]) {
  const resultados: Resultado[] = [];

  for (const alumno of alumnos) {
    const url = `https://ateneo-app.vercel.app/${alumno.nombre}`;
    const qrSvg = await QRCode.toString(url, { type: 'svg' });
    const width = 1200; // Ancho deseado
    const height = 1200; // Alto deseado

    // Convertir SVG a JPG con las dimensiones especificadas
    const qrJpgBuffer = await sharp(Buffer.from(qrSvg))
    .resize(width, height)
    .jpeg()
    .toBuffer();

    const fileName = `${alumno.matricula}.jpg`;
    const url_svg = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/Qrs/${fileName}`;

    // Eliminar el archivo existente si ya está presente
    await supabase.storage
      .from('ProMedia/ateneo/Qrs')
      .remove([fileName]);

    // Subir el nuevo archivo JPG
    const { error } = await supabase.storage
      .from('ProMedia/ateneo/Qrs')
      .upload(fileName, qrJpgBuffer, {
        contentType: 'image/jpeg'
      });

    if (error) {
      if (error.message.includes('Duplicate entry')) {
        console.error(`Error uploading QR for ${alumno.nombre}: Duplicate entry`);
      } else {
        console.error(`Error uploading QR for ${alumno.nombre}:`, error.message);
      }
    } else {
      const result_insert = await actualizarAlumno(alumno.id, { ...alumno, qr: url_svg });
      console.log(result_insert);
      console.log(`QR for ${alumno.nombre} uploaded successfully.`);
    }

    resultados.push({
      url,
      qrSvg,
      url_svg
    });
  }

  return resultados;
}

export async function generarYSubirQR(alumno: Alumno) {
  const resultado: {
    url: string;
    qrSvg: string;
    supabasePath: string;
    url_svg: string;
  } = {
    url: '',
    qrSvg: '',
    supabasePath: '',
    url_svg: ''
  }

  const url = `https://ateneo-app.vercel.app/${alumno.nombre}`;
  const qrSvg = await QRCode.toString(url, { type: 'svg' });
  const width = 1200; // Ancho deseado
  const height = 1200; // Alto deseado

  // Convertir SVG a JPG con las dimensiones especificadas
  const qrJpgBuffer = await sharp(Buffer.from(qrSvg))
      .resize(width, height)
      .jpeg()
      .toBuffer();

  const fileName = `${alumno.matricula}.jpg`;
  const url_svg = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/Qrs/${fileName}`;

  // Eliminar el archivo existente si ya está presente
  await supabase.storage
    .from('ProMedia/ateneo/Qrs')
    .remove([fileName]);

  // Subir el nuevo archivo JPG
  const { error } = await supabase.storage
    .from('ProMedia/ateneo/Qrs')
    .upload(fileName, qrJpgBuffer, {
      contentType: 'image/jpeg'
    });

  if (error) {
    if (error.message.includes('Duplicate entry')) {
      console.error(`Error uploading QR for ${alumno.nombre}: Duplicate entry`);
    } else {
      console.error(`Error uploading QR for ${alumno.nombre}:`, error.message);
    }
  } else {
    const result_insert = await actualizarAlumno(alumno.id, { ...alumno, qr: url_svg });
    console.log(result_insert);
    console.log(`QR for ${alumno.nombre} uploaded successfully.`);
  }

  resultado.url = url;
  resultado.qrSvg = qrSvg;
  resultado.url_svg = url_svg;


  return resultado;
}

export async function eliminarQR(alumno: Alumno) {
  const fileName = `${alumno.matricula}.jpg`;
  const filePath = `ateneo/Qrs/${fileName}`;
  const fileUrl = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/${filePath}`;

  // Verificar si el archivo existe
  try {
    const response = await fetch(fileUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.log(`File not found for ${alumno.nombre}: ${fileName}`);
      return;
    }
    console.log(`File exists for ${alumno.nombre}: ${fileName}`);
  } catch (error) {
    console.error(`Error checking file existence for ${alumno.nombre}:`, error);
    return;
  }

  // Eliminar el archivo existente si ya está presente
  const { data, error: deleteError } = await supabase.storage
    .from('ProMedia')
    .remove([filePath]);

  if (deleteError) {
    console.error(`Error deleting QR for ${alumno.nombre}:`, deleteError.message);
  } else if (data) {
    console.log(`File deleted for ${alumno.nombre}: ${fileName}`);
    // Actualizar el alumno para eliminar la referencia al QR
    const result = await actualizarAlumno(alumno.id, { ...alumno, qr: null });
    console.log(result);
  } else {
    console.error(`Unexpected error deleting QR for ${alumno.nombre}`);
  }
}
