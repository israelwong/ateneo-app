import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Alumno {
  nombre: string;
  nivel: string;
  grado: string;
  grupo?: string;
}

interface Resultado {
  url: string;
  qrSvg: string;
  supabasePath: string;
}

export default async function generarYSubirQRs(alumnos: Alumno[], updateStatus: (status: string) => void): Promise<Resultado[]> {
  const resultados: Resultado[] = [];

  for (const alumno of alumnos) {
    
    const url = `https://ateneo-app.vercel.app/alumno/${alumno.nombre}`;
    const qrSvg = await QRCode.toString(url, { type: 'svg' });
    const supabasePath = `${alumno.nivel}/${alumno.grado}${alumno.grupo ? `/${alumno.grupo}` : ''}`;
    const fileName = `${alumno.nombre}.svg`;

    const { error } = await supabase.storage
      .from('ProMedia/ateneo/Qrs')
      .upload(`${supabasePath}/${fileName}`, qrSvg, {
        contentType: 'image/svg+xml'
      });
      if (error) {
        if (error.message.includes('Duplicate entry')) {
            console.error(`Error uploading QR for ${alumno.nombre}: Duplicate entry`);
            updateStatus(`Error uploading QR for ${alumno.nombre}: Duplicate entry`);
        } else {
            console.error(`Error uploading QR for ${alumno.nombre}:`, error.message);
            updateStatus(`Error uploading QR for ${alumno.nombre}: ${error.message}`);
        }
    } else {
        console.log(`QR for ${alumno.nombre} uploaded successfully.`);
        updateStatus(`QR for ${alumno.nombre} uploaded successfully.`);
    }

    resultados.push({
      url,
      qrSvg,
      supabasePath
    });
  }

  return resultados;
}