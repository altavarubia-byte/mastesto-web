import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: any) {
  const slug = decodeURIComponent(params.slug);

  const { data: blog } = await supabase
    .from("blogs")
    .select("titulo, descripcion, meta_title, meta_description, imagen_url")
    .eq("slug", slug)
    .maybesingle();

  if (!blog) {
    return {
      title: "Blog no encontrado | Mastesto",
    };
  }

  return {
    title: blog.meta_title || `${blog.titulo} | Mastesto`,
    description:
      blog.meta_description ||
      blog.descripcion ||
      "Artículo Mastesto sobre disciplina, hábitos y mejora personal.",
    openGraph: {
      title: blog.meta_title || blog.titulo,
      description: blog.meta_description || blog.descripcion || "",
      images: blog.imagen_url ? [blog.imagen_url] : [],
      type: "article",
    },
  };
}

export default async function BlogPost({ params }: any) {
  const slug = decodeURIComponent(params.slug);

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !blog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <article className="max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]"
        >
          ← Volver al blog
        </Link>

        {blog.imagen_url && (
          <img
            src={blog.imagen_url}
            alt={blog.titulo}
            className="w-full h-[260px] md:h-[420px] object-cover rounded-[2.5rem] border border-zinc-900 mt-10 mb-12"
          />
        )}

        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mb-5 mt-10">
          Mastesto Research
        </p>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
          {blog.titulo}
        </h1>

        {blog.descripcion && (
          <p className="text-zinc-400 text-lg uppercase font-bold italic leading-relaxed mb-12">
            {blog.descripcion}
          </p>
        )}

        <div
          className="prose prose-invert prose-orange max-w-none
          prose-p:text-zinc-300 prose-p:text-lg prose-p:leading-relaxed
          prose-h1:text-white prose-h1:font-black
          prose-h2:text-orange-500 prose-h2:font-black
          prose-blockquote:border-orange-600 prose-blockquote:text-zinc-200"
          dangerouslySetInnerHTML={{
            __html: blog.contenido_html || blog.contenido || "",
          }}
        />

        <div className="mt-20 bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 text-center">
          <h3 className="text-3xl font-black mb-4">Únete a la Forja ⚔️</h3>

          <p className="text-zinc-400 mb-6">
            Hábitos, disciplina, comunidad y progreso diario.
          </p>

          <Link
            href="/"
            className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block"
          >
            ENTRAR A MASTESTO
          </Link>
        </div>
      </article>
    </main>
  );
}
