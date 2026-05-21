'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const BlogEditor = dynamic(() => import('../../components/BlogEditor'), {
  ssr: false,
});
export default function CrearBlogPage() {
  const router = useRouter();

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [user, setUser] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [contenido, setContenido] = useState('');
  const [tags, setTags] = useState('');
  const [lectura, setLectura] = useState(7);
  const [imagen, setImagen] = useState<File | null>(null);
  const [fondo, setFondo] = useState('oscuro');
  const [publicado, setPublicado] = useState(true);
  const [destacado, setDestacado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .single();

      if (data?.role !== 'admin') {
        router.push('/perfil');
        return;
      }

      setCargando(false);
    };

    cargar();
  }, [supabase, router]);

  const generarSlug = (texto: string) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const publicarBlog = async () => {
    if (!titulo.trim() || !contenido.trim()) {
      alert('Falta título o contenido');
      return;
    }

    setGuardando(true);

    const slugFinal = slug.trim() || generarSlug(titulo);

    let imagenUrl = '';
    let imagenPath = '';

    if (imagen) {
      const ext = imagen.name.split('.').pop();
      imagenPath = `${slugFinal}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(imagenPath, imagen);

      if (uploadError) {
        alert(uploadError.message);
        setGuardando(false);
        return;
      }

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(imagenPath);

      imagenUrl = data.publicUrl;
    }

    const textoPlano = contenido.replace(/<[^>]+>/g, ' ');

    const { error } = await supabase.from('blogs').insert({
      titulo,
      slug: slugFinal,
      descripcion,
      contenido: textoPlano,
      contenido_html: contenido,
      imagen_url: imagenUrl || null,
      imagen_path: imagenPath || null,
      fondo,
      meta_title: metaTitle || titulo,
      meta_description: metaDescription || descripcion,
      publicado,
      destacado,
      autor_email: user.email,
      lectura_min: lectura,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    if (error) {
      alert(error.message);
      setGuardando(false);
      return;
    }

    alert('Blog publicado correctamente');
    router.push(`/blog/${slugFinal}`);
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500 uppercase font-black text-xs animate-pulse">
          Cargando editor premium...
        </p>
      </main>
    );
  }

  const subirImagenContenido = async (file: File) => {
  const slugFinal = slug.trim() || generarSlug(titulo || 'blog');
  const ext = file.name.split('.').pop();
  const path = `contenido/${slugFinal}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, file);

  if (error) {
    alert(error.message);
    throw error;
  }

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(path);

  return data.publicUrl;
};
  const fondosPreview:any={

oscuro:
'bg-black',

fuego:
'bg-gradient-to-br from-black via-orange-950 to-black',

hielo:
'bg-gradient-to-br from-black via-cyan-950 to-black',

premium:
'bg-gradient-to-br from-zinc-950 via-black to-zinc-950',

rojo:
'bg-gradient-to-br from-black via-red-950 to-black',

verde:
'bg-gradient-to-br from-black via-green-950 to-black',

morado:
'bg-gradient-to-br from-black via-purple-950 to-black',

blanco:
'bg-zinc-100 text-black',

oro:
'bg-gradient-to-br from-black via-yellow-900 to-black'

};

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 selection:bg-orange-600 selection:text-black">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/perfil')}
          className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]"
        >
          ← Volver al panel
        </button>

        <div className="mt-10 mb-10">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            Mastesto CMS
          </p>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Editor Premium
            <br />
            <span className="text-orange-500">de Blogs</span>
          </h1>

          <p className="text-zinc-500 uppercase font-bold text-xs mt-6 max-w-2xl leading-relaxed">
            Crea artículos con SEO, imagen de portada, fondo visual, tags, negrita, títulos,
            citas, enlaces e imágenes dentro del contenido.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
          <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl h-fit">
            <h2 className="text-xl font-black uppercase mb-6">
              Configuración
            </h2>

            <input
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setSlug(generarSlug(e.target.value));
              }}
              placeholder="Título del artículo"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 text-sm outline-none focus:border-orange-600"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(generarSlug(e.target.value))}
              placeholder="slug-del-articulo"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 text-sm outline-none focus:border-orange-600"
            />

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción visible del blog"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 h-24 text-sm outline-none focus:border-orange-600 resize-none"
            />

            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Meta title SEO opcional"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 text-sm outline-none focus:border-orange-600"
            />

            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Meta description SEO opcional"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 h-20 text-sm outline-none focus:border-orange-600 resize-none"
            />

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags separados por coma: disciplina, hábitos, ciencia"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 text-sm outline-none focus:border-orange-600"
            />

            <input
              type="number"
              value={lectura}
              onChange={(e) => setLectura(Number(e.target.value))}
              placeholder="Minutos de lectura"
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4 text-sm outline-none focus:border-orange-600"
            />

           <select
  value={fondo}
  onChange={(e) => setFondo(e.target.value)}
  className="
  w-full
  bg-black
  border
  border-zinc-800
  rounded-xl
  p-4
  mb-4
  text-sm
  outline-none
  focus:border-orange-600
  "
>

<option value="oscuro">
⚫ Oscuro Mastesto
</option>

<option value="fuego">
🔥 Fuego
</option>

<option value="hielo">
🧊 Hielo
</option>

<option value="premium">
💎 Premium elegante
</option>

<option value="rojo">
🩸 Rojo agresivo
</option>

<option value="verde">
🟢 Verde militar
</option>

<option value="morado">
🟣 Morado nocturno
</option>

<option value="blanco">
⚪ Blanco limpio
</option>

<option value="oro">
🟡 Dorado
</option>

</select>

            <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-4">
              <p className="text-[9px] uppercase font-black text-zinc-500 mb-3">
                Imagen de portada
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files?.[0] || null)}
                className="w-full text-xs text-zinc-400"
              />

              {imagen && (
                <p className="text-[9px] text-orange-500 mt-3 uppercase font-black">
                  {imagen.name}
                </p>
              )}
            </div>

            <label className="flex items-center gap-3 text-xs text-zinc-400 uppercase font-black mb-4">
              <input
                type="checkbox"
                checked={publicado}
                onChange={(e) => setPublicado(e.target.checked)}
              />
              Publicar directamente
            </label>

            <label className="flex items-center gap-3 text-xs text-zinc-400 uppercase font-black mb-6">
              <input
                type="checkbox"
                checked={destacado}
                onChange={(e) => setDestacado(e.target.checked)}
              />
              Marcar como destacado
            </label>

            <button
              onClick={publicarBlog}
              disabled={guardando}
              className="w-full bg-orange-600 text-black rounded-xl py-4 font-black uppercase disabled:opacity-40 hover:bg-orange-500 transition-all"
            >
              {guardando ? 'Publicando...' : 'Publicar blog ⚔️'}
            </button>
          </section>

          <section>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-orange-500 text-[10px] uppercase font-black tracking-[0.4em]">
                  Editor tipo Word
                </p>

                <p className="text-zinc-600 text-[9px] uppercase font-black mt-1">
                  Negrita · cursiva · subrayado · títulos · citas · enlaces
                </p>
              </div>

              <div className="text-[9px] text-zinc-600 uppercase font-black">
                Fondo seleccionado: <span className="text-orange-500">{fondo}</span>
              </div>
            </div>

            <BlogEditor
  content={contenido}
  setContent={setContenido}
  onUploadImage={subirImagenContenido}
/>

            <div className="mt-6 bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-3">
                Vista previa HTML guardado
              </p>

              <div
                className="prose prose-invert max-w-none text-zinc-300"
                dangerouslySetInnerHTML={{ __html: contenido || '<p>Empieza a escribir...</p>' }}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
