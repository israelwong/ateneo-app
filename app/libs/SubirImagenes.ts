import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function subirImagen(file: File, nombre: string) {
    try {
        const { error } = await supabase.storage
            .from('ProMedia/ateneo/fotografia')
            .upload(nombre, file);

        if (error) {
            // console.error(`Error subiendo el archivo ${file.name}:`, error.message);
            return { success: false, message: `Error subiendo el archivo ${file.name}: ${error.message}` };
        }

        const { data } = supabase.storage
            .from('ProMedia/ateneo/fotografia')
            .getPublicUrl(nombre);

        if (!data) {
            // console.error(`Error obteniendo la URL pública del archivo ${file.name}`);
            return { success: false, message: `Error obteniendo la URL pública del archivo ${file.name}` };
        }

        return { success: true, publicUrl: data.publicUrl };
    } catch (error) {
        if (error instanceof Error) {
            // console.error('Error en subirImagen:', error.message);
            return { success: false, message: `Error en subirImagen: ${error.message}` };
        } else {
            // console.error('Error en subirImagen:', error);
            return { success: false, message: 'Error en subirImagen: Error desconocido' };
        }
    }
}