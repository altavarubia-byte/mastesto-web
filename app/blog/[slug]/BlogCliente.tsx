"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function BlogCliente({ blog }: { blog: any }) {
  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const comprobarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLogueado(!!session);
      setCargando(false);
    };

    comprobarSesion();
  }, [supabase]);

  const contenido = blog.contenido || "";

  const partePublica = contenido
    .split("\n")
    .slice(0, 8)
    .join("\n");

  const puedeVerCompleto = !blog.solo_socios || logueado;

  if (cargando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-600 uppercase font-black tracking-widest">
          Cargando...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <article className="max-w-4xl mx-auto">
        <p className="text-orange-500 text-xs font-black uppercase tracking-[0.4em] mb-5">
          {blog.categoria || "Mastesto"}
        </p>

        <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-8">
          {blog.titulo}
        </h1>

        {blog.descripcion && (
          <p className="text-xl text-zinc-400 leading-relaxed mb-10">
            {blog.descripcion}
          </p>
        )}

        {blog.imagen && (
          <img
            src={blog.imagen}
            alt={blog.titulo}
            className="w-full rounded-3xl border border-zinc-800 mb-12"
          />
        )}

        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed whitespace-pre-line">
          {puedeVerCompleto ? contenido : partePublica}
        </div>

        {!puedeVerCompleto && (
          <div className="mt-14 rounded-[2rem] border border-orange-500/20 bg-zinc-950 p-10 text-center">
            <h2 className="text-3xl font-black uppercase mb-4">
              Sigue leyendo dentro de +TESTO
            </h2>

            <p className="text-zinc-400 max-w-xl mx-auto">
              Este artículo completo está disponible para usuarios registrados.
              Accede para desbloquearlo.
            </p>

            <Link
              href="/?login=true"
              className="mt-8 inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest"
            >
              Desbloquear contenido
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}
