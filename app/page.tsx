import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (

      

                <section className="flex flex-col gap-4 items-center justify-center min-h-screen">
        
          <Image
            src="https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/logo_sin_sombra.svg"
            alt="Logo"
            width={200}
            height={200}
            className="pr-6 mb-3"
          />
        
          <div className="flex items-center justify-center">
            <Link href="/login" className="bg-blue-600 text-white text-center px-3 py-2 rounded-md">
              Iniciar sesión
            </Link>
          </div>
        
        </section>


  );
}
