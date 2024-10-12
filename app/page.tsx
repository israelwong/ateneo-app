import Image from "next/image";

export  default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <section className="flex flex-col gap-4 items-center sm:items-start">

          <Image
            src="https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/ateneo/logo_sin_sombra.svg"
            alt="Logo"
            width={200}
            height={200}
          />
          
        </section>
      </main>
    </div>
  );
}
