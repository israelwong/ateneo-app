"use client";
import React, { useState } from "react";
// import Image from "next/image";
// import { subirImagenes } from "@/app/libs/SubirImagenes"; // Importar la función de subida

function Page() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [nivel, setNivel] = useState("");
    const [grado, setGrado] = useState("");
    const [grupo, setGrupo] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
            ? Array.from(event.target.files)
            : [];
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Por favor, selecciona al menos un archivo.");
            return;
        }

        if (!nivel || !grado) {
            setError("Por favor, completa los campos de nivel y grado.");
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            // const urls = await subirImagenes(files, nivel, grado, grupo);
            // setImageUrls(urls);
            setSuccess("Imágenes subidas exitosamente.");
        } catch {
            setError("Error al subir las imágenes.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto my-10 max-w-screen-lg p-5">
            <h3 className="text-2xl text-center my-5">Subir Imágenes a Supabase</h3>
            <form action="">

            <input type="file" multiple onChange={handleFileChange} />
            <input
                className="form-control flex border border-gray-300 rounded p-2 my-2 text-black"
                type="text"
                placeholder="Nivel"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                />
            <input
                className="form-control flex border border-gray-300 rounded p-2 my-2 text-black"
                type="text"
                placeholder="Grado"
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                />
            <input
                className="form-control flex border border-gray-300 rounded p-2 my-2 text-black"
                type="text"
                placeholder="Grupo (opcional)"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                />
            <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-3 py-2">
                {uploading ? "Subiendo..." : "Inicar subida"}
            </button>
            </form>
            {uploading && <p>Subiendo imágenes...</p>}
            {error && <p className="py-5" style={{ color: "red" }}>{error}</p>}
            {success && <p className="py-5" style={{ color: "green" }}>{success}</p>}
            {/* {imageUrls.length > 0 && (
                <div>
                    <h4 className="font-semibold">Imágenes subidas:</h4>
                    <div className="grid grid-cols-3 gap-3">
                    
                    {imageUrls.map((url, index) => (
                        <Image
                        key={index}
                        src={url}
                        alt={`Imagen subida ${index + 1}`}
                        width={300}
                        height={300}
                        style={{ margin: "10px" }}
                        />
                    ))}
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default Page;