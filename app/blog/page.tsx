import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata = {
  title: "Blog Mastesto | Disciplina, hábitos y mejora personal",
  description:
    "Artículos de Mastesto sobre disciplina, hábitos, productividad, dejar vicios, entrenamiento, mentalidad y mejora personal.",
};

export default async function BlogPage() {
 const { data: blogs } = await supabase
  .from("blogs")
  .select("id,titulo,slug,descripcion,imagen_url,tags,lectura_min,created_at")
  .eq("publicado", true)
  .order("created_at", { ascending: false });

console.log(blogs);
console.log(error);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]"
        >
          ← Volver a Mastesto
        </Link>

        <div className="mt-12 mb-14">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mb-5 italic">
            Mastesto Research
          </p>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Blog Mastesto
            <br />
            <span className="text-orange-500">Ciencia + hábitos + disciplina</span>
          </h1>

          <p className="mt-8 max-w-2xl text-zinc-400 uppercase font-bold italic leading-relaxed">
            Artículos premium sobre disciplina, procrastinación, duchas frías,
            hábitos, dejar vicios, rendimiento y mejora personal.
          </p>
        </div>

        {!blogs || blogs.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-10 text-center">
            <p className="text-zinc-500 uppercase font-black tracking-widest text-xs">
              Todavía no hay artículos publicados.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden hover:border-orange-600/60 hover:-translate-y-1 transition-all shadow-2xl"
              >
                {blog.imagen_url ? (
                  <img
                    src={blog.imagen_url}
                    alt={blog.titulo}
                    className="w-full h-52 object-cover opacity-80 group-hover:opacity-100 transition-all"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-orange-600/20 to-zinc-950 flex items-center justify-center">
                    <span className="text-5xl">⚔️</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags?.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[8px] font-black uppercase tracking-widest bg-orange-600/10 text-orange-500 px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 group-hover:text-orange-500 transition-all">
                    {blog.titulo}
                  </h2>

                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    {blog.descripcion}
                  </p>

                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black text-zinc-600">
                    <span>{blog.lectura_min || 7} min</span>
                    <span className="text-orange-500">Leer →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
