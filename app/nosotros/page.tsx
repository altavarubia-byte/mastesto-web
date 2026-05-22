'use client';

import Link from 'next/link';

export default function NosotrosPage() {
  const pilares = [
    {
      title: 'CUERPO',
      text: 'Entrenamiento, alimentación, descanso y hábitos físicos sostenibles.',
    },
    {
      title: 'MENTE',
      text: 'Foco, estudio, disciplina, control emocional y toma de decisiones.',
    },
    {
      title: 'HÁBITOS',
      text: 'Reducción de distracciones, control de impulsos y creación de rutinas.',
    },
    {
      title: 'PROPÓSITO',
      text: 'Dirección personal, responsabilidad, objetivos y compromiso diario.',
    },
  ];

  const metodo = [
    'Diagnóstico inicial',
    'Objetivo principal',
    'Rutina diaria',
    'Seguimiento semanal',
    'Control de hábitos',
    'Plan de estudio',
    'Nutrición personalizada',
    'Comunidad privada',
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Botón volver */}
      <div className="fixed top-5 left-5 z-50">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-black/70 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300 backdrop-blur-md transition hover:border-orange-500 hover:text-white"
        >
          ← Volver
        </Link>
      </div>

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="/video-forja.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_45%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-28">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.5em] text-orange-500">
            Forja de voluntad
          </p>

          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
            No te falta potencial.
            <br />
            <span className="text-orange-500">Te sobran distracciones.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl">
            +TESTO es una plataforma para recuperar disciplina, ordenar tus hábitos
            y construir una versión más fuerte, enfocada y responsable de ti mismo.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/?login=true"
              className="bg-orange-500 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-black transition hover:bg-orange-400"
            >
              Empezar ahora
            </Link>

            <a
              href="#metodo"
              className="border border-white/15 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              Ver método
            </a>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {['Disciplina', 'Control', 'Progreso'].map((item) => (
              <div
                key={item}
                className="border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-xs font-black uppercase tracking-[0.25em] text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.45em] text-orange-500">
              Por qué existe
            </p>

            <h2 className="text-4xl font-black uppercase leading-tight md:text-6xl">
              No buscamos entretener.
              <br />
              Buscamos reconstruir.
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-relaxed text-zinc-300">
            <p>
              Vivimos rodeados de estímulos rápidos, excusas, pantallas y hábitos
              que rompen el foco. +TESTO nace para crear una estructura clara:
              objetivo, rutina, seguimiento y responsabilidad.
            </p>

            <p className="font-semibold text-white">
              La meta no es motivarte durante un día. La meta es ayudarte a crear
              un sistema que puedas sostener.
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEMA / MÉTODO / RESULTADO */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'El problema',
              text: 'Falta de foco, dopamina rápida, malos hábitos y sensación de estar perdiendo el tiempo.',
            },
            {
              title: 'El método',
              text: 'Rutinas, seguimiento, objetivos concretos, IA de apoyo y comunidad privada.',
            },
            {
              title: 'El resultado',
              text: 'Más disciplina, mejor físico, mayor claridad mental y una identidad más fuerte.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="border border-white/10 bg-zinc-950/80 p-8 transition hover:border-orange-500/60"
            >
              <h3 className="mb-4 text-2xl font-black uppercase text-orange-500">
                {card.title}
              </h3>
              <p className="leading-relaxed text-zinc-300">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MÉTODO */}
      <section id="metodo" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="border border-orange-500/30 bg-zinc-950/70">
          <div className="border-b border-white/10 p-8 text-center md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-zinc-500">
              Método +TESTO
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              Un sistema diario,
              <span className="text-orange-500"> no una frase motivacional.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-zinc-400">
              Organizamos el cambio en acciones simples: medir, ejecutar, revisar
              y repetir. Menos ruido. Más estructura.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {metodo.map((item) => (
              <div
                key={item}
                className="border-b border-r border-white/10 p-6 text-center transition hover:bg-orange-500 hover:text-black"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCKUP PANEL */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.45em] text-orange-500">
              Dentro de +TESTO
            </p>

            <h2 className="text-4xl font-black uppercase leading-tight md:text-6xl">
              Tu progreso debe verse.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              La plataforma está pensada para que cada persona tenga un objetivo,
              una rutina y una forma clara de medir si está avanzando.
            </p>
          </div>

          <div className="border border-white/10 bg-black p-6 shadow-[0_0_50px_rgba(249,115,22,0.12)]">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-500">
                Panel operativo
              </p>
              <span className="text-xs text-zinc-500">Nivel 3</span>
            </div>

            <div className="space-y-4">
              {[
                ['Entreno', 'Completado'],
                ['Estudio', 'Pendiente'],
                ['Ducha fría', 'Completado'],
                ['Sin distracciones', 'En progreso'],
              ].map(([name, state]) => (
                <div
                  key={name}
                  className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="font-semibold text-white">{name}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-orange-500">
                    {state}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-zinc-500">
                <span>Voluntad</span>
                <span>74%</span>
              </div>
              <div className="h-3 bg-zinc-900">
                <div className="h-full w-[74%] bg-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-10 text-4xl font-black uppercase md:text-6xl">
          Los 4 pilares
        </h2>

        <div className="grid gap-5 md:grid-cols-4">
          {pilares.map((pilar, index) => (
            <div
              key={pilar.title}
              className="relative min-h-[260px] border border-white/10 bg-gradient-to-b from-zinc-950 to-black p-7 transition hover:-translate-y-2 hover:border-orange-500/70"
            >
              <span className="absolute right-5 top-5 text-5xl font-black text-orange-500/15">
                0{index + 1}
              </span>

              <h3 className="mb-5 text-2xl font-black uppercase text-orange-500">
                {pilar.title}
              </h3>

              <p className="leading-relaxed text-zinc-300">{pilar.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FRASE SERIA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="border-l-4 border-orange-500 pl-8">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.45em] text-zinc-500">
            Nuestra posición
          </p>

          <h2 className="max-w-5xl text-4xl font-black uppercase leading-tight md:text-6xl">
            No prometemos cambiar tu vida en una semana.
            <br />
            Te damos una estructura para empezar a hacerlo cada día.
          </h2>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden border border-orange-500/40 bg-orange-500 p-8 text-black md:p-12">
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.35em]">
                Primer paso
              </p>

              <h2 className="text-4xl font-black uppercase leading-tight md:text-6xl">
                Entra.
                <br />
                Define tu objetivo.
              </h2>
            </div>

            <Link
              href="/?login=true"
              className="bg-black px-8 py-4 text-center text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-zinc-900"
            >
              Empezar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-12 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.45em] text-zinc-500">
          Disciplina · Control · Progreso
        </p>

        <h2 className="text-4xl font-black uppercase md:text-6xl">
          +TESTO
        </h2>
      </footer>
    </main>
  );
}
