import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: any) {
  const { data: blog } = await supabase
    .from("blogs")
    .select("titulo, descripcion, imagen_url")
    .eq("slug", params.slug)
    .eq("publicado", true)
    .single();

  if (!blog) {
    return {
      title: "Blog no encontrado | Mastesto",
    };
  }

  return {
    title: `${blog.titulo} | Mastesto`,
    description: blog.descripcion || "Artículo Mastesto sobre disciplina, hábitos y mejora personal.",
    openGraph: {
      title: `${blog.titulo} | Mastesto`,
      description: blog.descripcion || "",
      images: blog.imagen_url ? [blog.imagen_url] : [],
      type: "article",
    },
  };
}

function formatearContenido(contenido: string) {
  return contenido.split("\n").map((linea, i) => {
    if (linea.startsWith("# ")) {
      return (
        <h2 key={i} className="text-4xl md:text-5xl font-black mt-16 mb-6 tracking-tighter">
          {linea.replace("# ", "")}
        </h2>
      );
    }

    if (linea.startsWith("## ")) {
      return (
        <h3 key={i} className="text-2xl md:text-3xl font-black mt-12 mb-5 text-orange-500">
          {linea.replace("## ", "")}
        </h3>
      );
    }

    if (linea.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="border-l-4 border-orange-600 bg-zinc-950 rounded-r-2xl p-6 my-8 text-xl italic text-zinc-200"
        >
          {linea.replace("> ", "")}
        </blockquote>
      );
    }

    if (linea.trim() === "") {
      return <div key={i} className="h-4" />;
    }

    return (
      <p key={i} className="text-zinc-300 text-lg leading-relaxed mb-5">
        {linea}
      </p>
    );
  });
}

export default async function BlogPost({ params }: any) {
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .eq("publicado", true)
    .single();

  if (!blog) notFound();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-600 selection:text-white">
      <section className="relative overflow-hidden px-6 py-24 border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.22),transparent_35%),linear-gradient(to_bottom,#050505,#000)]" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <Link
            href="/blog"
            className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            ← Volver al Blog
          </Link>

          <p className="mt-10 text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
            Mastesto Research
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none max-w-4xl">
            {blog.titulo}
          </h1>

          {blog.descripcion && (
            <p className="mt-8 max-w-3xl text-zinc-400 text-sm md:text-base uppercase font-bold italic leading-relaxed">
              {blog.descripcion}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4 text-[9px] uppercase tracking-widest font-black text-zinc-500">
            <span>{blog.lectura_min || 7} min lectura</span>
            <span>•</span>
            <span>{new Date(blog.created_at).toLocaleDateString("es-ES")}</span>
            <span>•</span>
            <span>Disciplina Mastesto</span>
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-6 py-16">
        {blog.imagen_url && (
          <img
            src={blog.imagen_url}
            alt={blog.titulo}
            className="w-full h-[260px] md:h-[420px] object-cover rounded-[2.5rem] border border-zinc-900 mb-14 shadow-2xl"
          />
        )}

        <div className="prose prose-invert max-w-none">
          {formatearContenido(blog.contenido)}
        </div>

        <div className="mt-20 bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 text-center">
          <h3 className="text-3xl font-black mb-4">
            Únete a la Forja ⚔️
          </h3>

          <p className="text-zinc-400 mb-6">
            Hábitos, disciplina, comunidad y progreso diario.
          </p>

          <Link
            href="/"
            className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
          >
            ENTRAR A MASTESTO
          </Link>
        </div>
      </article>
    </main>
  );
}
