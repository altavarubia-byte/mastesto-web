'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function BlogAguaFriaPage() {
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
    <>
<Head>

<title>
Beneficios reales de ducharse con agua fría | Mastesto
</title>

<meta
name="description"
content="Qué dice la ciencia sobre las duchas frías: estudios, beneficios reales, disciplina, energía y experiencias."
/>

<meta
name="keywords"
content="ducha fría, beneficios agua fría, disciplina, hábitos, estudios agua fría, Mastesto"
/>

<meta
property="og:title"
content="Beneficios reales de ducharse con agua fría | Mastesto"
/>

<meta
property="og:description"
content="Ciencia, experiencias y beneficios reales de ducharse con agua fría."
/>

</Head>
    <main className="min-h-screen bg-black text-white selection:bg-orange-600 selection:text-white">
      <section className="relative overflow-hidden px-6 py-24 text-center border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.22),transparent_35%),linear-gradient(to_bottom,#050505,#000)]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link href="/blog" className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">
            ← Volver al Blog
          </Link>

          <p className="mt-10 text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">
            Mastesto Research
          </p>

          <h1 className="mt-6 text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            El poder del frío:
            <br />
            <span className="text-orange-500">beneficios de ducharse con agua fría</span>
          </h1>

          <p className="mt-8 max-w-2xl mx-auto text-zinc-400 text-sm md:text-base uppercase font-bold italic leading-relaxed">
            Lo que durante siglos fue intuición, hoy la ciencia empieza a analizarlo con datos:
            cuerpo, mente, estrés, disciplina y bienestar.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-[9px] uppercase font-black tracking-widest text-zinc-500">
            <span>Mayo 2026</span>
            <span>•</span>
            <span>Lectura 7 min</span>
            <span>•</span>
            <span>Basado en evidencia</span>
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-6 py-16">
        <section className="space-y-6 text-zinc-300 leading-relaxed text-lg">
          <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed border-l-4 border-orange-600 pl-6">
            Ducharse con agua fría puede parecer una práctica incómoda, pero unos minutos de frío
            pueden convertirse en una herramienta potente para entrenar cuerpo, mente y disciplina.
          </p>

          <p>
            Desde la antigua Grecia hasta los rituales nórdicos contemporáneos, muchas culturas han
            intuido que la exposición al frío fortalece el cuerpo. Hoy, investigadores en Países Bajos,
            Alemania y Estados Unidos han estudiado algunos de los mecanismos fisiológicos detrás de
            esa intuición.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-14">
          {[
            ['29%', 'Menos días de baja laboral'],
            ['250%', 'Aumento de dopamina'],
            ['3.018', 'Participantes en estudio holandés'],
          ].map(([num, label]) => (
            <div key={label} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 text-center">
              <p className="text-4xl font-black text-orange-500">{num}</p>
              <p className="mt-3 text-[9px] uppercase tracking-widest text-zinc-500 font-black">{label}</p>
            </div>
          ))}
        </div>

        <section className="border-t border-zinc-900 pt-12">
          <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
            Beneficio 01
          </p>

          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Sistema inmunológico más fuerte
          </h2>

          <p className="text-zinc-300 leading-relaxed mb-6">
            Uno de los hallazgos más conocidos en la investigación sobre el frío es su posible
            relación con la reducción de ausencias por enfermedad. Cuando el cuerpo se expone al agua
            fría, experimenta un estrés térmico controlado que activa una respuesta fisiológica intensa.
          </p>

          <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 my-10">
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.35em] mb-4">
              Estudio clave — PLOS One, 2016
            </p>

            <p className="text-xl italic text-zinc-200 leading-relaxed">
              Una ducha diaria de agua fría se asoció con una reducción del 29% en ausencias laborales
              por enfermedad durante el periodo de seguimiento.
            </p>

            <p className="mt-5 text-xs text-zinc-500 leading-relaxed">
              Buijze et al. estudiaron 3.018 voluntarios entre 18 y 65 años. El protocolo consistía en
              terminar la ducha habitual con 30, 60 o 90 segundos de agua fría durante 30 días.
            </p>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Lo interesante del estudio es que la duración de la fase fría no pareció cambiar demasiado
            el resultado: incluso 30 segundos fueron suficientes para observar diferencias.
          </p>
        </section>

        {!cargando && !user ? (
          <section className="relative mt-16">
            <div className="max-h-[280px] overflow-hidden relative">
              <div className="space-y-6 text-zinc-300 leading-relaxed">
                <h2 className="text-3xl font-black">
                  La parte importante empieza aquí
                </h2>

                <p>
                  Ahora viene la parte completa: dopamina, noradrenalina, estrés, circulación,
                  experiencias reales, errores frecuentes, protocolo progresivo y precauciones.
                </p>

                <p>
                  Este contenido está reservado para usuarios registrados de Mastesto. Crear cuenta
                  es gratis y desbloquea el artículo completo.
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
          !cargando && (
            <>
              <section className="border-t border-zinc-900 pt-12 mt-16">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
                  Beneficio 02
                </p>

                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Dopamina, noradrenalina y bienestar mental
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  Quizás el área donde más interés ha despertado el frío es en su relación con la
                  química cerebral. Los practicantes suelen describir una sensación inmediata de
                  energía, foco y claridad mental.
                </p>

                <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 my-10">
                  <h3 className="text-2xl font-black mb-6">
                    El cóctel neuroquímico del frío
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <p className="text-orange-500 font-black uppercase text-xs tracking-widest mb-2">
                        Dopamina
                      </p>
                      <p className="text-zinc-300 leading-relaxed">
                        La exposición voluntaria al frío se ha relacionado con aumentos relevantes
                        de dopamina, asociados a motivación, concentración y bienestar subjetivo.
                      </p>
                    </div>

                    <div>
                      <p className="text-orange-500 font-black uppercase text-xs tracking-widest mb-2">
                        Noradrenalina
                      </p>
                      <p className="text-zinc-300 leading-relaxed">
                        La noradrenalina participa en el estado de alerta, atención y respuesta al
                        estrés. Por eso el frío se percibe como un interruptor natural de activación.
                      </p>
                    </div>

                    <div>
                      <p className="text-orange-500 font-black uppercase text-xs tracking-widest mb-2">
                        Endorfinas
                      </p>
                      <p className="text-zinc-300 leading-relaxed">
                        El estrés térmico también puede generar liberación de endorfinas, ayudando a
                        explicar la sensación posterior de bienestar.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  Muchas personas no describen la ducha fría como placer, sino como reinicio. Durante
                  unos segundos no hay móvil, no hay excusas y no hay negociación mental. Solo hay
                  respiración, incomodidad y decisión.
                </p>

                <div className="border-l-4 border-orange-600 bg-zinc-950 p-6 rounded-r-2xl my-8">
                  <p className="text-xl italic text-zinc-200 leading-relaxed">
                    “Lo que cambia no es solo la temperatura. Cambia la percepción de control: haces
                    algo difícil antes de que el día empiece.”
                  </p>
                </div>
              </section>

              <section className="border-t border-zinc-900 pt-12 mt-16">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
                  Beneficio 03
                </p>

                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Circulación sanguínea y salud cardiovascular
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-8">
                  El agua fría provoca vasoconstricción: los vasos sanguíneos se contraen. Después,
                  cuando el cuerpo recupera temperatura, se produce vasodilatación. Ese contraste
                  térmico estimula la circulación periférica y central.
                </p>

                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    ['🩸', 'Mejor oxigenación celular', 'La variación térmica favorece el bombeo de sangre hacia órganos y tejidos.'],
                    ['🌿', 'Reducción de inflamación', 'La exposición al frío se usa en recuperación deportiva por su posible papel antiinflamatorio.'],
                    ['✨', 'Piel más firme', 'El frío puede ayudar a evitar sequedad excesiva y preservar mejor la barrera cutánea frente al agua muy caliente.'],
                    ['⚡', 'Energía inmediata', 'El impacto activa terminaciones nerviosas y genera sensación rápida de alerta.'],
                  ].map(([icon, title, text]) => (
                    <div key={title} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6">
                      <p className="text-3xl mb-4">{icon}</p>
                      <h3 className="font-black text-xl mb-3">{title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-zinc-900 pt-12 mt-16">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
                  Beneficio 04
                </p>

                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Gestión del estrés: entrenar resiliencia
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  Una ducha fría es un microestrés voluntario y controlado. El cuerpo entra en modo
                  alerta, pero tú aprendes a respirar, mantenerte presente y no escapar al primer
                  impulso.
                </p>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  Esa es la parte psicológica más potente: practicar incomodidad en un entorno seguro.
                  No se trata de sufrir. Se trata de entrenar la respuesta ante el malestar.
                </p>

                <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 my-10">
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.35em] mb-4">
                    Investigación sobre cortisol y estrés
                  </p>

                  <p className="text-xl italic text-zinc-200 leading-relaxed">
                    Algunas investigaciones sobre inmersión en agua fría han observado cambios en
                    marcadores asociados al estrés, incluyendo variaciones posteriores en cortisol.
                  </p>
                </div>
              </section>

              <section className="border-t border-zinc-900 pt-12 mt-16">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
                  Guía práctica
                </p>

                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Cómo incorporarlo a tu rutina
                </h2>

                <div className="space-y-5">
                  {[
                    ['1', 'Ducha normal primero', 'Empieza con tu temperatura habitual. La fase fría llega al final para reducir resistencia psicológica.'],
                    ['2', '30 segundos de frío', 'No necesitas heroicidades. El estudio holandés ya usaba tramos breves al final de la ducha.'],
                    ['3', 'Mantén 30 días', 'La constancia supera a la intensidad. Un hábito pequeño sostenido gana a una locura de dos días.'],
                    ['4', 'Aumenta gradualmente', 'Si quieres avanzar, aumenta tiempo o baja temperatura poco a poco. Sin competir con nadie.'],
                  ].map(([n, title, text]) => (
                    <div key={n} className="flex gap-5 border-b border-zinc-900 pb-5">
                      <div className="w-10 h-10 rounded-full bg-orange-600 text-black font-black flex items-center justify-center shrink-0">
                        {n}
                      </div>
                      <div>
                        <h3 className="font-black text-xl mb-2">{title}</h3>
                        <p className="text-zinc-400 leading-relaxed">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-yellow-950/20 border border-yellow-700/30 rounded-[2rem] p-8 mt-16">
                <h2 className="text-2xl font-black mb-5 text-yellow-500">
                  ⚠️ Precauciones importantes
                </h2>

                <ul className="space-y-3 text-zinc-300 leading-relaxed">
                  <li>• No se recomienda en personas con problemas cardiovasculares sin consultar antes con un médico.</li>
                  <li>• Evita exposiciones prolongadas al inicio. El objetivo no es la hipotermia ni el sufrimiento.</li>
                  <li>• Si estás embarazada o tienes condiciones médicas crónicas, consulta con un profesional.</li>
                  <li>• El frío no sustituye sueño, ejercicio, alimentación ni tratamiento médico.</li>
                </ul>
              </section>

              <section className="border-t border-zinc-900 pt-12 mt-16">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">
                  Conclusión Mastesto
                </p>

                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Una práctica simple con impacto real
                </h2>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  La ducha fría no es una panacea. No cambia tu vida por sí sola. Pero puede convertirse
                  en un símbolo diario de disciplina: algo simple, incómodo, medible y repetible.
                </p>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  El verdadero beneficio no está solo en el agua. Está en la decisión de no obedecer
                  siempre a la comodidad.
                </p>

                <div className="bg-zinc-950 border border-orange-600/30 rounded-[2rem] p-8 mt-10 text-center">
                  <h3 className="text-3xl font-black mb-4">
                    Únete a la Forja ⚔️
                  </h3>

                  <p className="text-zinc-400 mb-6">
                    Hábitos, disciplina, comunidad y progreso diario.
                  </p>

                  <Link
                    href="/perfil"
                    className="bg-orange-600 text-black px-8 py-4 rounded-xl font-black inline-block hover:scale-105 transition-all"
                  >
                    IR A MI PANEL
                  </Link>
                </div>
              </section>
            </>
          )
        )}
      </article>
    </main>
  );
}
