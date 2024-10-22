import UploadCSVAlumnos from "@/app/components/UploadCSVAlumnos";

function Page() {


    return (
        <div className="mx-auto pt-10 max-w-full">
            <div className="mx-auto">
                <h3 className="text-3xl text-center">Subir CSV Alumnos</h3>
            </div>
            <UploadCSVAlumnos />
        </div>
    );
}

export default Page;