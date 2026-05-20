'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function LaTrampaDelMananaPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    cargarUsuario();
  }, [supabase]);

  return (
    <>
      <Head>
        <title>La trampa del mañana | Mastesto</title>
        <meta
          name="description"
          content="La ciencia detrás de la procrastinación: estudios, neurociencia, regulación emocional, casos reales y protocolo Mastesto para empezar hoy."
        />
      </Head>

      <main className="min-h-screen bg-black text-white selection:bg-orange-600 selection:text-white">
        <section className="relative overflow-hidden px-6 py-28 border-b border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.22),transparent_35%),linear-gradient(to_bottom,#050505,#000)]" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <Link
              href="/blog"
              className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px]"
            >
              ← Volver al blog
            </Link>

            <p className="mt-10 text-orange-500 font-black tracking-[0.5em] uppercase text-[10px]">
              Psicología · Productividad · Neurociencia
            </p>

            <h1 className="text-5xl md:text-7xl font-black leading-none mt-6 mb-8 uppercase tracking-tighter">
              La trampa
              <br />
              <span className="text-orange-500">del mañana</span>
            </h1>

            <p className="text-zinc-400 max-w-3xl uppercase font-bold italic leading-relaxed">
              Lo que la ciencia lleva décadas descubriendo sobre la procrastinación
              y por qué la mayoría de consejos no funcionan.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 text-[9px] uppercase tracking-widest font-black text-zinc-500">
              <span>Lectura estimada: 14 minutos</span>
              <span>•</span>
              <span>Basado en investigación científica</span>
              <span>•</span>
              <span>Mastesto Research</span>
            </div>
          </div>
        </section>

        <article className="max-w-4xl mx-auto px-6 py-16">
          <section className="space-y-7 text-zinc-300 leading-relaxed text-lg">
            <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed border-l-4 border-orange-600 pl-6">
              Todos la conocemos. Esa tarea que lleva semanas en tu lista. El correo
              que “mandarás luego”. El proyecto que empezarás “cuando tengas más tiempo”.
            </p>

            <p>
              La procrastinación no es simplemente pereza ni falta de voluntad. Es uno de
              los fenómenos psicológicos más estudiados y peor entendidos del último siglo.
            </p>

            <p>
              En Mastesto lo llamamos la trampa del mañana: ese lugar mental donde todo
              parece más fácil después, pero donde nada se ejecuta hoy.
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-white pt-8">
              No es un problema de tiempo. Es un problema de emociones.
            </h2>

            <p>
              Durante décadas se creyó que procrastinar era simplemente mala gestión del
              tiempo. Los libros de productividad ofrecían agendas, calendarios y sistemas
              de priorización. El problema era que no funcionaban a largo plazo.
            </p>

            <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 my-10">
              <p className="text-orange-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4">
                Estudio clave
              </p>

              <p className="text-xl italic text-zinc-200 leading-relaxed">
                En 2013, Fuschia Sirois y Timothy Pychyl encontraron que la procrastinación
                crónica estaba más relacionada con la regulación emocional que con la gestión
                del tiempo.
              </p>

              <p className="text-zinc-500 text-sm mt-5">
                Sirois, F. & Pychyl, T. (2013). Procrastination and the Priority of
                Short-Term Mood Regulation.
              </p>
            </div>

            <p>
              La lógica cerebral es sencilla: cuando una tarea genera ansiedad, aburrimiento,
              frustración o miedo al fracaso, el cerebro busca alivio inmediato. Revisar redes,
              ordenar la habitación o ver “solo un episodio” produce una recompensa rápida.
            </p>

            <p>
              El alivio es real. El coste aparece después.
            </p>
          </section>

          {!loading && !user ? (
            <section className="relative mt-16">
              <div className="max-h-[280px] overflow-hidden relative">
                <div className="space-y-6 text-zinc-300 leading-relaxed">
                  <h2 className="text-3xl font-black text-white">
                    La parte importante empieza aquí
                  </h2>

                  <p>
                    Ahora viene el análisis completo: datos reales, neurociencia, amígdala,
                    coste psicológico, experiencias documentadas, perfeccionismo y las siete
                    intervenciones con evidencia.
                  </p>

                  <p>
                    También verás el protocolo Mastesto para dejar de prometer y empezar a
                    ejecutar hoy.
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-black to-transparent backdrop-blur-sm" />
              </div>

              <div className="mt-8 bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 md:p-10 text-center shadow-2xl">
                <p className="text-5xl mb-4">🔒</p>

                <h3 className="text-3xl font-black mb-4">
                  Continúa leyendo
                </h3>

                <p className="text-zinc-400 mb-6">
                  Inicia sesión o crea una cuenta gratuita para desbloquear el artículo completo.
                </p>

                <Link
                  href="/"
                  className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
                >
                  CREAR CUENTA / ENTRAR ⚔️
                </Link>
              </div>
            </section>
          ) : (
            !loading && (
              <>
                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Los números que nadie quiere ver
                  </h2>

                  <p>
                    El alcance del problema es mayor de lo que parece. Las investigaciones de
                    Piers Steel, de la Universidad de Calgary, muestran que la procrastinación
                    es un fenómeno masivo y recurrente.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-10">
                    {[
                      ['95%', 'admite procrastinar ocasionalmente'],
                      ['20%', 'de adultos son procrastinadores crónicos'],
                      ['50%', 'de universitarios lo considera un problema grave'],
                      ['3x', 'más riesgo de estrés crónico y problemas de salud'],
                    ].map(([num, text]) => (
                      <div
                        key={text}
                        className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 text-center"
                      >
                        <p className="text-4xl font-black text-orange-500">{num}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mt-4">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p>
                    Steel recopiló más de 800 estudios en su meta-análisis de 2007 publicado
                    en Psychological Bulletin. Su conclusión fue clara: la procrastinación ha
                    aumentado en las últimas décadas, impulsada en parte por distracciones
                    digitales de recompensa inmediata.
                  </p>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8">
                    <p className="text-xl italic text-zinc-200 leading-relaxed">
                      “La procrastinación es el robo que le hacemos a nuestro yo futuro.
                      Y el ladrón siempre somos nosotros mismos.”
                    </p>
                    <p className="text-zinc-500 text-sm mt-4">
                      — Timothy Pychyl, Carleton University
                    </p>
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    El cerebro procrastinador bajo el microscopio
                  </h2>

                  <p>
                    En 2018, Caroline Schlüter y su equipo de la Universidad de Münster
                    publicaron un estudio de neuroimagen sobre procrastinación crónica.
                  </p>

                  <p>
                    Descubrieron que los procrastinadores crónicos presentaban una amígdala
                    significativamente más grande. La amígdala participa en el procesamiento
                    del miedo y de emociones negativas. También observaron una conexión más
                    débil con regiones de control ejecutivo implicadas en la toma de decisiones
                    orientada a metas.
                  </p>

                  <div className="bg-orange-600/10 border border-orange-600/30 rounded-[2rem] p-8">
                    <p className="text-orange-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4">
                      Hallazgo clave
                    </p>

                    <p className="text-xl text-white font-semibold leading-relaxed">
                      Una amígdala más reactiva puede generar mayor respuesta emocional ante
                      tareas percibidas como amenazantes. Si la conexión con las áreas de control
                      es débil, convertir intención en acción se vuelve más difícil.
                    </p>
                  </div>

                  <p>
                    Esto no significa que estés condenado. El cerebro es plástico. Puede cambiar.
                    Pero cambia con entrenamiento, no con frases motivacionales.
                  </p>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    El coste real que no aparece en los libros de contabilidad
                  </h2>

                  <p>
                    Solemos medir el coste de procrastinar en horas perdidas. Pero los estudios
                    sobre bienestar muestran algo más profundo: la procrastinación crónica se
                    asocia con más síntomas de depresión, ansiedad y estrés percibido.
                  </p>

                  <p>
                    La paradoja es cruel: procrastinamos para evitar el malestar de una tarea,
                    pero la acumulación de tareas postergadas genera un malestar mucho mayor.
                  </p>

                  <div className="border-l-4 border-orange-600 bg-zinc-950 rounded-r-2xl p-6">
                    <p className="text-xl italic text-zinc-200">
                      “El procrastinador no evita el sufrimiento. Solo lo redistribuye en el
                      tiempo, con intereses.”
                    </p>
                    <p className="text-zinc-500 text-sm mt-4">
                      — Piers Steel, The Procrastination Equation
                    </p>
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Experiencias reales: cuando postergar tiene nombre
                  </h2>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8">
                    <h3 className="text-2xl font-black text-white mb-4">
                      El caso de Ángela, 34 años, arquitecta
                    </h3>

                    <p>
                      Ángela llevaba tres años postergando la creación de su propio estudio.
                      Tenía el nombre, los primeros clientes potenciales e incluso el logo. Pero
                      siempre aparecía una razón para esperar.
                    </p>

                    <p className="mt-4">
                      En terapia identificó el patrón: cada vez que intentaba dar el primer paso
                      real, sentía ansiedad y la interpretaba como señal de que todavía no estaba
                      lista. La intervención que funcionó no fue organizarse mejor, sino tolerar
                      esa ansiedad durante los minutos necesarios para ejecutar.
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8">
                    <h3 className="text-2xl font-black text-white mb-4">
                      El testimonio de David, 28 años, desarrollador
                    </h3>

                    <p>
                      David llevaba cuatro años sin ascender porque postergaba todo lo que implicaba
                      visibilidad: presentaciones, informes y pedir una revisión salarial.
                    </p>

                    <p className="mt-4">
                      La raíz era el perfeccionismo: si no podía hacerlo perfecto, prefería no
                      hacerlo. Lo que le ayudó fue el umbral de suficiencia: trabajar 25 minutos
                      aunque el resultado no fuera impecable.
                    </p>
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Por qué la fuerza de voluntad es el peor consejo
                  </h2>

                  <p>
                    El mito más peligroso sobre la procrastinación es que se soluciona con
                    “esforzarse más”. Esta idea puede ser contraproducente porque aumenta culpa,
                    autocrítica y malestar emocional.
                  </p>

                  <p>
                    Kristin Neff, pionera en el estudio de la autocompasión, encontró que los
                    estudiantes con mayor autocompasión después de procrastinar tendían a
                    procrastinar menos en el siguiente examen. La culpa severa no siempre corrige.
                    Muchas veces mantiene el problema.
                  </p>

                  <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8">
                    <p className="text-orange-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4">
                      Lo que dicen las intervenciones eficaces
                    </p>

                    <p>
                      Una revisión de 2021 en Frontiers in Psychology señaló como enfoques con
                      mayor eficacia: terapia cognitivo-conductual centrada en regulación emocional,
                      mindfulness, autocompasión y compromisos previos.
                    </p>
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Las siete intervenciones con evidencia real
                  </h2>

                  <div className="space-y-5">
                    {[
                      [
                        '1',
                        'Concretar el coste real',
                        'El cerebro descuenta el futuro. Escribir qué perderás si no actúas hoy hace visible el daño que ahora parece lejano.',
                      ],
                      [
                        '2',
                        'Primer paso mínimo',
                        'No “escribir el informe”, sino abrir el documento y escribir una frase. El objetivo es romper el umbral de activación.',
                      ],
                      [
                        '3',
                        'Nombrar la emoción',
                        'Decir “siento miedo a hacerlo mal” reduce la intensidad emocional y activa mayor conciencia.',
                      ],
                      [
                        '4',
                        'Compromiso previo',
                        'Crear obstáculos externos contra la postergación: informar de un plazo, bloquear redes o comprometerte públicamente.',
                      ],
                      [
                        '5',
                        'Distanciamiento del yo',
                        'Preguntarte “¿qué haría Vicente ahora?” ayuda a ganar perspectiva y reduce la reacción emocional.',
                      ],
                      [
                        '6',
                        'Autocompasión activa',
                        'No es excusarte. Es dejar de castigarte para volver a actuar con más claridad.',
                      ],
                      [
                        '7',
                        'Regular el cuerpo antes de empezar',
                        'Respiración lenta, movimiento suave o cinco minutos de calma pueden reducir la activación de la amígdala.',
                      ],
                    ].map(([n, title, text]) => (
                      <div key={n} className="flex gap-5 border-b border-zinc-900 pb-5">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-black font-black flex items-center justify-center shrink-0">
                          {n}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white mb-2">{title}</h3>
                          <p className="text-zinc-400">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    El perfeccionismo: el primo elegante de la procrastinación
                  </h2>

                  <p>
                    Gordon Flett y Paul Hewitt llevan décadas estudiando la relación entre
                    perfeccionismo y procrastinación. El perfeccionismo socialmente prescrito
                    —creer que los demás esperan de ti un rendimiento impecable— se vincula de
                    forma directa con la procrastinación paralizante.
                  </p>

                  <p>
                    La lógica es circular: si no puedo hacerlo perfecto, no lo empiezo. Si no lo
                    empiezo, no hay riesgo de hacerlo mal. Mientras tanto, el proyecto vive en la
                    imaginación, donde puede parecer brillante.
                  </p>

                  <div className="bg-orange-600/10 border border-orange-600/30 rounded-[2rem] p-8">
                    <p className="text-xl font-semibold text-white">
                      Un trabajo terminado e imperfecto vale más que diez proyectos perfectos que
                      solo existen en tu cabeza.
                    </p>
                  </div>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Cuando procrastinar es una señal de otra cosa
                  </h2>

                  <p>
                    La procrastinación crónica, resistente a estrategias habituales, puede ser síntoma
                    de condiciones subyacentes como TDAH, depresión, ansiedad generalizada o trastornos
                    del estado de ánimo.
                  </p>

                  <p>
                    Si interfiere gravemente con tu vida y nada funciona tras un esfuerzo consistente,
                    consultar con un profesional de salud mental no es debilidad. Es estrategia.
                  </p>
                </section>

                <section className="border-t border-zinc-900 pt-14 mt-16 space-y-8 text-zinc-300 leading-relaxed text-lg">
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Protocolo Mastesto: el hoy imperfecto
                  </h2>

                  <p>
                    No esperes el momento perfecto. El cerebro siempre encontrará razones para esperar,
                    porque esperar reduce la ansiedad de forma inmediata.
                  </p>

                  <p>
                    El presente, con ansiedad, cansancio y caos, es el único lugar donde la acción
                    existe.
                  </p>

                  <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8">
                    <h3 className="text-2xl font-black text-white mb-5">
                      La regla Mastesto
                    </h3>

                    <p>
                      No tienes que terminarlo hoy. Solo tienes que iniciar el movimiento.
                    </p>

                    <p className="mt-4">
                      Dos minutos. Una frase. Una llamada. Un documento abierto. Una repetición.
                      La acción pequeña rompe la trampa del mañana.
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 text-center mt-10">
                    <h3 className="text-3xl font-black mb-4">
                      No mañana. Hoy.
                    </h3>

                    <p className="text-zinc-400 mb-6">
                      La disciplina no empieza cuando estás listo. Empieza cuando actúas sin estarlo.
                    </p>

                    <Link
                      href="/perfil"
                      className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
                    >
                      IR A MI PANEL ⚔️
                    </Link>
                  </div>
                </section>
              </>
            )
          )}
        </article>
      </main>
    </>
  );
}
