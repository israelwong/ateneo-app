import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function subirImagen(file: File, nombre: string, directorio: string) {
    try {

        const filename = `${directorio}/${nombre}.jpg`;

        //remover si existe
        const { error: errorDelete } = await supabase.storage
            .from('Ateneo')
            .remove([filename]);
            if (errorDelete) {
                console.error('Error al eliminar la imagen:', errorDelete.message);
            }
            console.log('Imagen eliminada exitosamente');

            console.log('Subiendo imagen:', filename);
        const { error } = await supabase.storage
            .from('Ateneo')
            .upload(filename, file);
        if (error) {
            console.error('Error al subir la imagen:', error.message);
        } else {
            console.log('Imagen subida exitosamente');
        }
        if (error) {
            // console.error(`Error subiendo el archivo ${file.name}:`, error.message);
            return { success: false, message: `Error subiendo el archivo ${file.name}: ${error.message}` };
        }

        const { data } = supabase.storage
            .from('Ateneo')
            .getPublicUrl(filename);

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

export async function eliminarImagen(id: string, directorio: string) {
    console.log('Eliminando imagen:', id);
    try {
        const filename = `${directorio}/${id}.jpg`;
        console.log('Eliminando imagen:', filename);

        const { error } = await supabase.storage
            .from('Ateneo')
            .remove([filename]);

        if (error) {
            console.error('Error al eliminar la imagen:', error.message);
            return { success: false, message: `Error eliminando el archivo ${id}: ${error.message}` };
        } else {
            console.log('Imagen eliminada exitosamente');
            return { success: false};
        }

    } catch (error) {
        if (error instanceof Error) {
            // console.error('Error en eliminarImagen:', error.message);
            return { success: false, message: `Error en eliminarImagen: ${error.message}` };
        } else {
            // console.error('Error en eliminarImagen:', error);
            return { success: false, message: 'Error en eliminarImagen: Error desconocido' };
        }
    }

}