
import FormCrearAlumno from "@/app/components/FormCrearAlumno"

function Page() {


  return (

    <div className="mx-auto mt-10 max-w-screen-sm px-5" >

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-10">Registrar nuevo alumno</h2>
      </div>

      <FormCrearAlumno />

    </div>
  );
}

export default Page;