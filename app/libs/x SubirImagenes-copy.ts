import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseKey:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function subirImagenes(files: File[], nivel: string, grado: string, grupo?: string): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
        const filePath = grupo 
            ? `${nivel}/${grado}/${grupo}/${file.name}` 
            : `${nivel}/${grado}/${file.name}`;
        
        const { error } = await supabase.storage
            .from('ProMedia/ateneo/fotografia/')
            .upload(filePath, file);

        if (error) {
            console.error(`Error subiendo el archivo ${file.name}:`, error.message);
            throw new Error(`Error subiendo el archivo ${file.name}`);
        }

        const { publicUrl } = supabase.storage
            .from('ProMedia/ateneo/fotografia/')
            .getPublicUrl(filePath).data;

        if (!publicUrl) {
            console.error(`Error obteniendo la URL pública para ${file.name}`);
            throw new Error(`Error obteniendo la URL pública para ${file.name}`);
        }

        urls.push(publicUrl);
    }

    return urls;
}