// import { crearAlumno } from '@/app/libs/actions';
// import { redirect } from 'next/navigation';


async function Page() {

    // const result = await crearAlumno(
    //     {
    //         nombre: 'HERNANDEZ MARTINEZ JOSE ANTONIO',
    //         nivel: 'prepa',
    //         grado: '1',
    //         grupo: '',
    //         matricula: 'POIUYTR',
    //         alergias: 'ninguna',
    //         tipo_sangre: 'B',
    //         padre_tutor: 'HERNANDEZ REBOLLAR LEONARDO PADRE',
    //     }
    // )


    // if (result.success) {
    //     console.log('Alumno creado exitosamente con ID:', result.id);
    // } else {
    //     console.log('Error al crear alumno:', result.error);
    // }
    // redirect('/')
    // console.log(result)

    return (
        <div>
            Registrar alumno
            {/* {result.success ? 'Alumno creado exitosamente' : 'Error al crear alumno'} */}
        </div>
    );
}

export default Page;