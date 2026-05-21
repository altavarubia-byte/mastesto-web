'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function BlogContenidoPremium({
  html,
}: {
  html: string;
}) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const comprobar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLogueado(!!user);
      setCargando(false);
    };

    comprobar();
  }, [supabase]);

  if (cargando) return null;

  if (logueado) {
    return (
      <div
        className="prose prose-invert prose-orange max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="relative">
      <div
        className="prose prose-invert prose-orange max-w-none max-h-[900px] overflow-hidden"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-black via-black/95 to-transparent" />

      <div className="relative z-10 mt-10 bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-10 text-center shadow-2xl">
        <p className="text-5xl mb-4">🔒</p>

        <h3 className="text-3xl font-black mb-4">
          Continúa leyendo
        </h3>

        <p className="text-zinc-400 mb-6">
          Crea una cuenta gratuita o inicia sesión para desbloquear el artículo completo.
        </p>

        <Link
          href="/"
          className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
        >
          CREAR CUENTA / ENTRAR ⚔️
        </Link>
      </div>
    </div>
  );
}
