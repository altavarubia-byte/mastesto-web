"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function BlogCliente({ blog }: { blog: any }) {
  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
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

  const fondos: any = {
    oscuro: "bg-black text-white",
    fuego: "bg-gradient-to-b from-black via-orange-950 to-black text-white",
    rojo: "bg-gradient-to-b from-black via-red-950 to-black text-white",
    oro: "bg-gradient-to-b from-black via-yellow-900 to-black text-white",
    hielo: "bg-gradient-to-b from-slate-950 via-cyan-950 to-black text-white",
    azul: "bg-gradient-to-b from-black via-blue-950 to-black text-white",
    morado: "bg-gradient-to-b from-black via-purple-950 to-black text-white",
    verde: "bg-gradient-to-b from-black via-green-950 to-black text-white",
    blanco: "bg-zinc-100 text-black",
    carbon:
      "bg-[radial-gradient(circle_at_top,#27272a,transparent_35%),linear-gradient(to_bottom,#050505,#000)] text-white",
    neon:
      "bg-[radial-gradient(circle_at_top,#22c55e55,transparent_35%),linear-gradient(to_bottom,#020617,#000)] text-white",
    amanecer: "bg-gradient-to-b from-orange-950 via-rose-950 to-black text-white",
    tormenta: "bg-gradient-to-b from-slate-950 via-zinc-800 to-black text-white",
    arena: "bg-gradient-to-b from-yellow-950 via-stone-900 to-black text-white",
    premium: "bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white",
  };

  const fondoClase = fondos[blog.fondo || "oscuro"] || fondos.oscuro;

  const canvasCompleto = blog.canvas_json || [];

  const canvasPublico = blog.solo_socios
    ? canvasCompleto.filter((item: any) => Number(item.y || 0) < 1200)
    : canvasCompleto;

  const puedeVerCompleto = !blog.solo_socios || logueado;

  const canvasVisible = puedeVerCompleto ? canvasCompleto : canvasPublico;

  const alturaCanvas = puedeVerCompleto ? 4000 : 1350;

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
    <main className={`min-h-screen px-6 py-20 ${fondoClase}`}>
      <article className="max-w-7xl mx-auto">
        <Link
          href="/blog"
          className="text-orange-500 text-xs font-black uppercase tracking-widest"
        >
          ← Volver al blog
        </Link>

        <h1 className="text-5xl font-black mt-10 mb-8">{blog.titulo}</h1>

        {blog.descripcion && (
          <p className="text-zinc-400 text-lg mb-10">{blog.descripcion}</p>
        )}

        <div
          className="relative mt-16 rounded-[2rem] overflow-hidden border border-zinc-900 bg-transparent"
          style={{ height: `${alturaCanvas}px` }}
        >
          {canvasVisible?.map((item: any) =>
            item.type === "image" ? (
              <img
                key={item.id}
                src={item.url}
                alt=""
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  objectFit: "cover",
                  zIndex: item.zIndex || 1,
                }}
                className="rounded-2xl"
              />
            ) : item.type === "shape" ? (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  zIndex: item.zIndex || 1,
                  background: item.backgroundColor || "#f97316",
                  border: `3px solid ${item.borderColor || "#ffffff"}`,
                  borderRadius:
                    item.shapeType === "circle" ? "9999px" : "24px",
                }}
              />
            ) : (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  zIndex: item.zIndex || 1,
                  fontSize: item.fontSize,
                  color: item.color,
                  fontFamily: item.fontFamily,
                  fontWeight: item.bold ? 900 : 400,
                  fontStyle: item.italic ? "italic" : "normal",
                  textDecoration: item.underline ? "underline" : "none",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.2,
                }}
              >
                {item.text}
              </div>
            )
          )}

          {!puedeVerCompleto && (
            <div className="absolute bottom-0 left-0 right-0 z-[999] bg-gradient-to-t from-black via-black/95 to-transparent pt-40 pb-10 px-6 text-center">
              <div className="max-w-2xl mx-auto rounded-[2rem] border border-orange-500/20 bg-zinc-950/95 p-8 shadow-2xl">
                <h2 className="text-3xl font-black uppercase mb-4">
                  Sigue leyendo dentro de +TESTO
                </h2>

                <p className="text-zinc-400 mb-8">
                  Este artículo completo está disponible para usuarios registrados.
                  Accede para desbloquear el contenido completo.
                </p>

                <Link
                  href="/?login=true"
                  className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest"
                >
                  Desbloquear contenido
                </Link>
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
