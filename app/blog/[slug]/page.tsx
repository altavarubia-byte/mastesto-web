import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!blog) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-black">No encuentra el blog</h1>
        <pre>{slug}</pre>
      </main>
    );
  }

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
  carbon: "bg-[radial-gradient(circle_at_top,#27272a,transparent_35%),linear-gradient(to_bottom,#050505,#000)] text-white",
  neon: "bg-[radial-gradient(circle_at_top,#22c55e55,transparent_35%),linear-gradient(to_bottom,#020617,#000)] text-white",
  amanecer: "bg-gradient-to-b from-orange-950 via-rose-950 to-black text-white",
  tormenta: "bg-gradient-to-b from-slate-950 via-zinc-800 to-black text-white",
  arena: "bg-gradient-to-b from-yellow-950 via-stone-900 to-black text-white",
  premium: "bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white",
};

  const fondoClase = fondos[blog.fondo || "oscuro"] || fondos.oscuro;

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

        <div className="relative h-[4000px] mt-16 bg-black rounded-[2rem] overflow-hidden border border-zinc-900">
          {blog.canvas_json?.map((item: any) =>
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
                }}
                className="rounded-2xl"
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
        </div>
      </article>
    </main>
  );
}
