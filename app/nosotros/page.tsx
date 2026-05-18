'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function NosotrosPage() {
  const musicaRef = useRef<HTMLAudioElement>(null);
  const metalRef = useRef<HTMLAudioElement>(null);
  const [audioActivo, setAudioActivo] = useState(false);

  useEffect(() => {
    const iniciarAudio = async () => {
      const musica = musicaRef.current;
      const metal = metalRef.current;
      if (!musica || !metal) return;

      musica.volume = 0.16;
      metal.volume = 0.06;

      try {
        await Promise.all([musica.play(), metal.play()]);
        setAudioActivo(true);
      } catch {
        console.log('El navegador espera interacción del usuario.');
      }
    };

    window.addEventListener('click', iniciarAudio);
    window.addEventListener('touchstart', iniciarAudio);
    window.addEventListener('scroll', iniciarAudio);

    iniciarAudio();

    return () => {
      musicaRef.current?.pause();
      metalRef.current?.pause();
      window.removeEventListener('click', iniciarAudio);
      window.removeEventListener('touchstart', iniciarAudio);
      window.removeEventListener('scroll', iniciarAudio);
    };
  }, []);

  const toggleAudio = async () => {
    const musica = musicaRef.current;
    const metal = metalRef.current;
    if (!musica || !metal) return;

    if (audioActivo) {
      musica.pause();
      metal.pause();
      setAudioActivo(false);
    } else {
      await Promise.all([musica.play(), metal.play()]);
      setAudioActivo(true);
    }
  };

  const pilares = [
    ['CUERPO', 'Fuerza, resistencia, alimentación y descanso.'],
    ['MENTE', 'Disciplina, foco, estudio y control emocional.'],
    ['VICIOS', 'Ruptura con porno, drogas, pantallas y excusas.'],
    ['PROPÓSITO', 'Dirección, honor, liderazgo y responsabilidad.'],
  ];

  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <audio ref={musicaRef} loop preload="auto">
        <source src="/musica.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={metalRef} loop preload="auto">
        <source src="/metal.mp3" type="audio/mpeg" />
      </audio>

      <div className="fixed top-5 left-5 z-50">
        <Link
          href="/"
          className="border border-zinc-700 bg-black/80 backdrop-blur-md px-5 py-2 rounded-full uppercase text-[10px] tracking-widest font-black text-zinc-300 hover:text-white hover:border-orange-500 transition-all"
        >
          ← Volver
        </Link>
      </div>

      <button
        onClick={toggleAudio}
        className="fixed top-5 right-5 z-50 border border-orange-500 bg-black/80 backdrop-blur-md px-5 py-2 rounded-full uppercase text-[10px] font-black text-orange-500 hover:bg-orange-500 hover:text-black transition"
      >
        {audioActivo ? 'Silenciar' : 'Activar sonido'}
      </button>

      <section className="relative min-h-screen bg-[url('/fondo-nosotros.jpeg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/90 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.22),transparent_45%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
          <section className="min-h-[85vh] flex flex-col justify-center">
            <p className="text-orange-500 uppercase tracking-[0.5em] text-xs font-black mb-6">
              Academia de disciplina masculina
            </p>

            <h1 className="text-[21vw] md:text-[10rem] font-black italic tracking-tighter uppercase leading-none">
              <span className="text-orange-500">+</span>TESTO
            </h1>

            <h2 className="text-3xl md:text-6xl font-black uppercase max-w-4xl leading-tight mt-8">
              Deja de vivir en piloto automático.
              <br />
              <span className="text-orange-500">Empieza tu reconstrucción.</span>
            </h2>

            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
              Un sistema intensivo para jóvenes que quieren romper con la debilidad,
              recuperar el control y construir una vida con disciplina, cuerpo,
              honor y propósito.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/?login=true"
                className="bg-orange-500 hover:bg-orange-600 text-black font-black uppercase px-8 py-4 rounded-sm tracking-widest text-center shadow-[0_0_35px_rgba(249,115,22,0.5)] transition"
              >
                Solicitar entrevista
              </Link>

              <a
                href="#metodo"
                className="border border-zinc-600 hover:border-white text-white font-black uppercase px-8 py-4 rounded-sm tracking-widest text-center transition"
              >
                Ver método
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-2xl mt-12">
              {['Disciplina', 'Honor', 'Voluntad'].map((item) => (
                <div
                  key={item}
                  className="border border-orange-500/40 bg-black/60 p-4 text-center uppercase text-xs md:text-sm font-black tracking-widest text-orange-400"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-5 mb-20">
            {[
              ['El problema', 'Dopamina fácil, pantallas, porno, drogas, apatía y falta de dirección.'],
              ['La ruptura', 'Cortamos la excusa. Creamos rutina, presión positiva y responsabilidad diaria.'],
              ['La transformación', 'Cuerpo más fuerte, mente más firme y una identidad construida con disciplina.'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="border border-zinc-800 bg-black/75 p-7 hover:border-orange-500/70 transition"
              >
                <h3 className="text-orange-500 text-2xl font-black uppercase mb-4">
                  {title}
                </h3>
                <p className="text-zinc-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </section>

          <section id="metodo" className="border border-orange-500/30 bg-black/80 mb-20">
            <div className="p-8 md:p-12 text-center border-b border-zinc-800">
              <p className="uppercase tracking-[0.45em] text-zinc-500 text-xs font-black">
                Método Mastesto
              </p>

              <h2 className="text-3xl md:text-5xl font-black uppercase mt-4">
                Programa intensivo de
                <span className="text-orange-500"> 30 a 90 días</span>
              </h2>

              <p className="text-zinc-400 mt-5 max-w-3xl mx-auto">
                No vendemos motivación barata. Creamos una estructura diaria para
                que el joven vuelva a sentirse capaz, fuerte y responsable.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                'Despertar temprano',
                'Entrenamiento diario',
                'Estudio y foco',
                'Trabajo manual',
                'Control de vicios',
                'Seguimiento constante',
                'Evaluación semanal',
                'Mentoría directa',
              ].map((item) => (
                <div
                  key={item}
                  className="border-r border-b border-zinc-800 p-6 text-center hover:bg-orange-500 hover:text-black transition"
                >
                  <p className="text-xs uppercase font-black tracking-widest">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">
              Los 4 pilares de la forja
            </h2>

            <div className="grid md:grid-cols-4 gap-5">
              {pilares.map(([title, text], index) => (
                <div
                  key={title}
                  className="relative border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-7 min-h-[260px] hover:-translate-y-2 hover:border-orange-500 transition"
                >
                  <span className="absolute top-5 right-5 text-5xl font-black text-orange-500/20">
                    0{index + 1}
                  </span>

                  <h3 className="text-orange-500 text-2xl font-black uppercase mb-5">
                    {title}
                  </h3>

                  <p className="text-zinc-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-8 items-center mb-20">
            <div className="border-l-4 border-orange-500 pl-8">
              <p className="text-zinc-500 uppercase tracking-[0.4em] text-xs font-black mb-4">
                Esto no es para todos
              </p>

              <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">
                Es para quien está harto de fallarse a sí mismo.
              </h2>
            </div>

            <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
              <p>
                Si buscas comodidad, no es aquí. Si buscas excusas, no es aquí.
                Si quieres que alguien te diga que todo está bien mientras sigues
                perdiendo años, no es aquí.
              </p>

              <p className="text-white font-black">
                Mastesto es para quien quiere cambiar aunque duela.
              </p>
            </div>
          </section>

          <section className="relative overflow-hidden border border-orange-500/40 bg-orange-500 text-black p-8 md:p-12 mb-10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <p className="uppercase tracking-[0.35em] text-xs font-black mb-3">
                  Da el primer paso
                </p>

                <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">
                  Solicita una entrevista.
                  <br />
                  Empieza la forja.
                </h2>
              </div>

              <Link
                href="/?login=true"
                className="bg-black hover:bg-zinc-900 text-white font-black uppercase px-8 py-4 rounded-sm tracking-widest text-center transition"
              >
                Entrar ahora
              </Link>
            </div>
          </section>

          <footer className="text-center pt-10 border-t border-zinc-800">
            <p className="text-zinc-500 uppercase tracking-[0.45em] text-xs mb-4">
              Disciplina · Honor · Voluntad
            </p>

            <h2 className="text-4xl md:text-6xl font-black uppercase">
              Mastesto.es
            </h2>
          </footer>
        </div>
      </section>
    </main>
  );
}
