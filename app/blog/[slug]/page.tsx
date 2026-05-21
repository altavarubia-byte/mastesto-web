import BlogContenidoPremium from "@/components/BlogContenidoPremium";
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

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!blog) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-black mb-6">No encuentra el blog</h1>
        <p className="text-orange-500 mb-4">Slug buscado:</p>
        <pre className="bg-zinc-950 p-4 rounded-xl mb-6">{slug}</pre>
        <p className="text-orange-500 mb-4">Error Supabase:</p>
        <pre className="bg-zinc-950 p-4 rounded-xl">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  const fondos:any = {

oscuro:
'bg-black text-white',

fuego:
'bg-gradient-to-b from-black via-orange-950 to-black text-white',

hielo:
'bg-gradient-to-b from-slate-950 via-cyan-950 to-black text-white',

premium:
'bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white',

rojo:
'bg-gradient-to-b from-black via-red-950 to-black text-white',

verde:
'bg-gradient-to-b from-black via-green-950 to-black text-white',

morado:
'bg-gradient-to-b from-black via-purple-950 to-black text-white',

blanco:
'bg-zinc-100 text-black',

oro:
'bg-gradient-to-b from-black via-yellow-900 to-black text-white'

};

const fondoClase =
fondos[blog.fondo || 'oscuro']
|| fondos.oscuro;

  return (
    <main
className={`
min-h-screen
px-6
py-20
transition-all
duration-700
${fondoClase}
`}
>
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="text-orange-500 text-xs font-black uppercase tracking-widest">
          ← Volver al blog
        </Link>

        <h1 className="text-5xl font-black mt-10 mb-8">{blog.titulo}</h1>

        {blog.descripcion && (
          <p className="text-zinc-400 text-lg mb-10">{blog.descripcion}</p>
        )}

       // <BlogContenidoPremium
  //html={blog.contenido_html || blog.contenido || ""}
// />
{blog.canvas_json && blog.canvas_json.length > 0 && (
  <div className="relative h-[4000px] mt-16 bg-black rounded-[2rem] overflow-hidden border border-zinc-900">
    {blog.canvas_json.map((item: any) =>
      item.type === 'image' ? (
        <img
          key={item.id}
          src={item.url}
          alt=""
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            objectFit: 'cover',
          }}
          className="rounded-2xl"
        />
      ) : (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            fontSize: item.fontSize,
            color: item.color,
            fontFamily: item.fontFamily,
            fontWeight: item.bold ? 900 : 400,
            fontStyle: item.italic ? 'italic' : 'normal',
            textDecoration: item.underline ? 'underline' : 'none',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2,
          }}
        >
          {item.text}
        </div>
      )
    )}
  </div>
)}
      </article>
    </main>
  );
}
