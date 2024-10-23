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

export function ImagenResponsables({ alumno }: ImagenResponsablesProps) {

    const canvas = document.createElement('canvas');
    const scaleFactor = 4; // Factor de escala para aumentar la resolución
    const padding = 40 * scaleFactor; // Aumentar el padding para hacer la imagen más grande
    const lineHeight = 50 * scaleFactor; // Aumentar la altura de línea para hacer la imagen más grande
    const fontSize = 40 * scaleFactor; // Aumentar el tamaño de fuente para hacer la imagen más grande
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('No se pudo obtener el contexto 2D');
        return;
    }

    ctx.font = `${fontSize}px Arial`;

    const responsables = [
        alumno.mama,
        alumno.papa,
        alumno.autorizado_1,
        alumno.autorizado_2,
        alumno.autorizado_3
    ].filter(persona => persona);

    const responsablesUnicos = Array.from(new Set(responsables)).filter((responsable): responsable is string => !!responsable);

    // Calcular el ancho del texto más largo
    const maxTextWidth = Math.max(...responsablesUnicos.map(responsable => ctx.measureText(responsable).width));

    const totalTextHeight = responsablesUnicos.length * lineHeight;
    canvas.width = (maxTextWidth + 2 * padding);
    canvas.height = (totalTextHeight + 2 * padding);

    // Rellenar el fondo con color blanco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calcular la posición inicial para centrar el texto verticalmente
    const startY = padding + lineHeight / 2;

    responsablesUnicos.forEach((responsable, index) => {
        ctx.fillText(responsable, canvas.width / 2, startY + index * lineHeight);
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // Cambiar a JPG con calidad máxima
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'responsables.jpg'; // Cambiar la extensión a JPG
    link.click();
}