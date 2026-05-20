'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Page() {
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

  useEffect(() => {
    const cargarUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setCargando(false);
    };

    cargarUsuario();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#080808] text-white px-6 py-16">
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="text-orange-500 text-xs font-black uppercase tracking-widest">
          ← Volver al blog
        </Link>

        <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mt-10 mb-4">
          Mastesto Research
        </p>

        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-8">
          Beneficios reales de ducharse con agua fría: ciencia, experiencias y disciplina ❄️
        </h1>

        <p className="text-zinc-500 mb-12 italic">
          Lectura: 11 min · Hábitos · Disciplina · Bienestar
        </p>

        <section className="space-y-6 text-zinc-300 leading-relaxed text-lg">
          <p>
            Hay hábitos que parecen demasiado pequeños para cambiar algo: leer diez páginas,
            salir a caminar, apagar el móvil una hora o terminar la ducha con agua fría.
          </p>

          <p>
            La mayoría escucha promesas enormes: más energía, más motivación, más disciplina,
            menos estrés. Pero la pregunta importante no es si el agua fría es cómoda. La
            pregunta es qué ocurre cuando haces algo incómodo voluntariamente todos los días.
          </p>

          <p>
            Una ducha fría no arregla tu vida. No sustituye dormir bien, entrenar, comer mejor
            o dejar malos hábitos. Pero puede convertirse en una herramienta sencilla para
            entrenar una capacidad clave: actuar aunque no apetezca.
          </p>
        </section>

        <h2 className="text-3xl font-black mt-14 mb-5">
          Qué ocurre en tu cuerpo durante los primeros segundos
        </h2>

        <p className="text-zinc-300 leading-relaxed mb-6">
          Cuando el agua fría toca el cuerpo, se activa una respuesta inmediata de estrés.
          La respiración se acelera, el sistema nervioso simpático se activa y aparece una
          sensación intensa de alerta. Por eso muchas personas describen la ducha fría como
          un “despertador biológico”.
        </p>

        <p className="text-zinc-500 italic mb-8">
          La literatura científica sobre exposición al frío describe cambios fisiológicos
          relacionados con activación, frecuencia cardiaca, percepción de energía y adaptación
          al estrés.
        </p>

        <h2 className="text-3xl font-black mt-14 mb-5">
          Lo que muchas personas notan en la práctica
        </h2>

        <p className="text-zinc-300 leading-relaxed mb-6">
          Las experiencias reales suelen repetirse: “me siento más despierto”, “empiezo el día
          con más fuerza”, “me cuesta menos ponerme en marcha”, “me obliga a vencer la pereza”.
          No es magia. Es una combinación de activación física y victoria mental.
        </p>

        <h2 className="text-3xl font-black mt-14 mb-5">
          El beneficio más infravalorado: entrenar incomodidad
        </h2>

        <p className="text-zinc-300 leading-relaxed mb-6">
          Cada mañana sabes que no te apetece. Y aun así puedes hacerlo. Esa repetición enseña
          algo muy potente: no necesitas sentir motivación para ejecutar. En Mastesto eso se
          llama fogueo: exponerte voluntariamente a pequeñas incomodidades para reforzar tu
          disciplina.
        </p>

        {!cargando && !user ? (
          <div className="relative mt-16">
            <div className="max-h-[260px] overflow-hidden relative">
              <div className="space-y-6 text-zinc-300 leading-relaxed">
                <h2 className="text-3xl font-black">
                  La parte importante empieza aquí
                </h2>

                <p>
                  Ahora viene el protocolo completo: cómo empezar sin abandonar, qué errores
                  comete casi todo el mundo, cuántos segundos usar, qué hacer si te agobias
                  con la respiración y cómo convertirlo en un hábito sostenible.
                </p>

                <p>
                  También veremos experiencias reales, recomendaciones prácticas y una guía
                  progresiva de siete días para no convertir la ducha fría en una tortura.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#080808] to-transparent backdrop-blur-sm" />
            </div>

            <div className="mt-8 bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 md:p-10 text-center shadow-2xl">
              <p className="text-5xl mb-4">🔒</p>

              <h3 className="text-3xl font-black mb-4">
                Continúa leyendo
              </h3>

              <p className="text-zinc-400 mb-6">
                Crea una cuenta gratuita en Mastesto para desbloquear el artículo completo.
              </p>

              <Link
                href="/"
                className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
              >
                CREAR CUENTA ⚔️
              </Link>
            </div>
          </div>
        ) : (
          !cargando && (
            <section className="mt-16 space-y-10">
              <div className="border-t border-zinc-800 pt-10">
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                  Contenido desbloqueado
                </p>

                <h2 className="text-3xl font-black mb-5">
                  Protocolo Mastesto de 7 días
                </h2>

                <div className="space-y-5 text-zinc-300 leading-relaxed">
                  <p>
                    <strong>Día 1:</strong> termina tu ducha normal con 15 segundos de agua fría.
                    No busques sufrir. Busca controlar la respiración.
                  </p>

                  <p>
                    <strong>Día 2 y 3:</strong> sube a 30 segundos. La clave es no tensarte.
                    Respira lento, mantén postura firme y no negocies contigo mismo.
                  </p>

                  <p>
                    <strong>Día 4 y 5:</strong> llega a 45 segundos. Aquí empieza el entrenamiento
                    mental real: tu cuerpo quiere salir, pero tú decides quedarte.
                  </p>

                  <p>
                    <strong>Día 6 y 7:</strong> mantén 60 segundos. No hace falta más para crear
                    el hábito. La victoria está en hacerlo todos los días, no en hacer una locura
                    una vez.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black mb-5">
                  Errores frecuentes
                </h2>

                <div className="space-y-5 text-zinc-300 leading-relaxed">
                  <p>
                    <strong>1. Empezar demasiado fuerte.</strong> Mucha gente intenta aguantar
                    tres minutos el primer día. Eso no es disciplina inteligente, es falta de
                    estrategia.
                  </p>

                  <p>
                    <strong>2. Creer que más frío siempre es mejor.</strong> El objetivo no es
                    castigarte. El objetivo es crear adherencia.
                  </p>

                  <p>
                    <strong>3. Abandonar por fallar un día.</strong> Un fallo no rompe el hábito.
                    Lo rompe convertir un fallo en una excusa.
                  </p>

                  <p>
                    <strong>4. Usarlo para compensar una mala vida.</strong> La ducha fría no arregla
                    dormir cuatro horas, comer mal o vivir pegado al móvil. Es una pieza más.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black mb-5">
                  Experiencias reales: lo que cambia de verdad
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-5">
                  La experiencia más repetida no es “mi cuerpo cambió radicalmente”. Es más simple:
                  “me siento capaz de empezar el día con una victoria”. Esa sensación importa,
                  porque muchas personas no fallan por falta de información. Fallan por falta de
                  ejecución.
                </p>

                <p className="text-zinc-300 leading-relaxed">
                  Cuando haces algo incómodo nada más empezar el día, reduces el peso psicológico
                  de otras tareas: estudiar, entrenar, ordenar, trabajar, dejar el móvil. No porque
                  el agua fría tenga magia, sino porque ya has demostrado que puedes mandar sobre
                  una parte de ti que solo busca comodidad.
                </p>
              </div>

              <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8">
                <h2 className="text-3xl font-black mb-5">
                  Conclusión Mastesto
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-5">
                  La ducha fría no es el hábito definitivo. Pero sí es un símbolo perfecto de
                  disciplina: simple, incómoda, medible y diaria.
                </p>

                <p className="text-zinc-300 leading-relaxed">
                  No se trata de amar el frío. Se trata de dejar de obedecer siempre a la comodidad.
                  Ahí empieza la forja.
                </p>
              </div>
            </section>
          )
        )}
      </article>
    </main>
  );
}
