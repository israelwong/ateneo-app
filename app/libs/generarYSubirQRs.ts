'use server';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import {actualizarAlumno} from './actions';

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
    const fileName = `${alumno.matricula}.svg`;
    const url_svg = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/Qrs/${fileName}`;

    const { error } = await supabase.storage
      .from('ProMedia/ateneo/Qrs')
      .upload(`/${fileName}`, qrSvg, {
        contentType: 'image/svg+xml'
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
  }={
    url: '',
    qrSvg: '',
    supabasePath: '',
    url_svg: ''
  }

    const url = `https://ateneo-app.vercel.app/${alumno.nombre}`;
    const qrSvg = await QRCode.toString(url, { type: 'svg' });
    const fileName = `${alumno.matricula}.svg`;
    const url_svg = `https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/Qrs/${fileName}`;

    const { error } = await supabase.storage
      .from('ProMedia/ateneo/Qrs')
      .upload(`/${fileName}`, qrSvg, {
        contentType: 'image/svg+xml'
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

      resultado.url=url;
      resultado.qrSvg=qrSvg;
      resultado.url_svg=url_svg;
  

  return resultado;
}

export async function eliminarQR(alumno: Alumno) {

  // console.log('Eliminando QR...', alumno);
  const fileName = `${alumno.matricula}.svg`;
  const supabasePath = `${alumno.nivel}/${alumno.grado}${alumno.grupo ? `/${alumno.grupo}` : ''}`;
  const { error } = await supabase.storage
    .from('ProMedia/ateneo/Qrs')
    .remove([`${supabasePath}/${fileName}`]);
  if (error) {
    console.error(`Error deleting QR for ${alumno.nombre}:`, error.message);
  }
  const result = await actualizarAlumno(alumno.id, { ...alumno, qr: null });
  console.log(result);
  // console.log(alumno);
  // const url = alumno.data[0].qr;
  // const { error } = await supabase.storage
  //     .from('ProMedia/ateneo/Qrs')
  //     .remove([url]);
  // if (error) {
  //   console.error(`Error deleting QR for ${matricula}:`, error.message);
  // }
  // const result = await actualizarAlumno(alumno.data[0].id, { ...alumno.data[0], qr: null });
  // console.log(result);

}