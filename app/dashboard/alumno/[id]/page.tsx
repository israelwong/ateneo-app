import { Metadata } from "next";
import FormEditarAlumno from "@/app/components/FormEditarAlumno";

export const metadata: Metadata = {
    title: 'Editar Alumno',
    description: 'Página para editar un alumno',
};

interface PageProps {
    params: {
        id: string;
    };
}

function Page({ params }: PageProps) {

    const id = params.id;
    
    return (
        <div className="max-w-screen-lg mx-auto mt-10">

            <h2 className="font-bold mb-5 text-center text-4xl py-10">Editar Alumno</h2>
            <FormEditarAlumno id={id} />
        </div>
    );
}

export default Page;