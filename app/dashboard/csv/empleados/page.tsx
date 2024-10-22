import UploadCSVEmpleados from "@/app/components/UploadCSVEmpleados";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Registro masivo de empleados",
    description: "Subir un archivo CSV para registrar empleados",
};

function Page() {
    
    return (
        <div className="mx-auto py-10 max-w-full">
            <div className="mx-auto max-w-screen-md pt-5 text-center">
                <h3 className="text-3xl">Subir CSV empelados </h3>
            </div>
            <UploadCSVEmpleados />
        </div>
    );
}

export default Page;