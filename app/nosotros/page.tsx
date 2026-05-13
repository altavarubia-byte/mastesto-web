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

      musica.volume = 0.18;
      metal.volume = 0.08;

      try {
        await Promise.all([musica.play(), metal.play()]);

        setAudioActivo(true);

        window.removeEventListener('click', iniciarAudio);
        window.removeEventListener('touchstart', iniciarAudio);
        window.removeEventListener('scroll', iniciarAudio);
      } catch {
        console.log('Esperando interacción del usuario...');
      }
    };

    iniciarAudio();

    window.addEventListener('click', iniciarAudio);
    window.addEventListener('touchstart', iniciarAudio);
    window.addEventListener('scroll', iniciarAudio);

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
      return;
    }

    await Promise.all([musica.play(), metal.play()]);
    setAudioActivo(true);
  };

  const pilares = [
    {
      title: 'Forja del cuerpo',
      items: [
        'Entrenamiento de fuerza',
        'Carrera y resistencia',
        'Trabajo físico exigente',
        'Hábitos de descanso',
        'Alimentación y orden corporal',
      ],
    },
    {
      title: 'Destrucción de vicios',
      items: [
        'Pornografía',
        'Cannabis y alcohol',
        'Dependencia digital',
        'Procrastinación',
        'Rutinas de debilidad',
      ],
    },
    {
      title: 'Dominio social y conquista',
      items: [
        'Presencia firme',
        'Comunicación clara',
        'Autoridad personal',
        'Relación sana con el entorno',
        'Capacidad de liderar',
      ],
    },
    {
      title: 'Honor, deber y propósito',
      items: [
        'Honor',
        'Lealtad',
        'Responsabilidad',
        'Voluntad de hierro',
        'Dirección vital',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <audio ref={musicaRef} loop preload="auto">
        <source src="/musica.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={metalRef} loop preload="auto">
        <source src="/metal.mp3" type="audio/mpeg" />
      </audio>

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="border border-zinc-700 bg-black/70 backdrop-blur-sm px-5 py-2 rounded-full uppercase text-[10px] tracking-widest font-bold text-zinc-400 hover:text-white hover:border-white transition-all"
        >
          ← Volver
        </Link>
      </div>

      <button
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 border border-orange-500 bg-black/70 px-5 py-2 rounded-full uppercase text-[10px] font-bold text-orange-500 hover:bg-orange-500 hover:text-black transition"
      >
        {audioActivo ? 'Silenciar' : 'Activar sonido'}
      </button>

      <section className="relative min-h-screen bg-[url('/fondo-nosotros.jpeg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/75"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
          <header className="mb-14">
            <h1 className="text-[18vw] md:text-[9rem] font-black italic tracking-tighter uppercase leading-none">
              <span className="text-orange-500">+</span>TESTO
            </h1>

            <p className="uppercase tracking-[0.45em] text-zinc-300 text-xs md:text-lg font-semibold mt-2">
              Disciplina · Honor · Voluntad de Hierro
            </p>
          </header>

          <section className="grid lg:grid-cols-2 gap-10 items-start mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-6">
                No ofrecemos consuelo.
                <br />
                Ofrecemos <span className="text-orange-500">forja.</span>
              </h2>

              <div className="space-y-5 text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl">
                <p>
                  Hay miles de jóvenes perdidos: enganchados al porno, a la
                  dopamina fácil, al exceso de pantallas, sin disciplina, sin
                  rumbo y con cuerpos débiles.
                </p>

                <p>
                  Viven como niños grandes, sin honor, sin propósito y sin
                  control sobre sí mismos.
                </p>

                <p className="text-white font-bold">
                  Nosotros no les ofrecemos comodidad. Les ofrecemos forja.
                </p>
              </div>
            </div>

            <div className="border border-orange-500/40 bg-black/70 p-8 backdrop-blur-sm">
              <h3 className="text-orange-500 text-2xl md:text-3xl font-black uppercase mb-5 leading-tight">
                No somos una app.
                <br />
                No somos un PDF.
              </h3>

              <p className="uppercase text-lg md:text-2xl font-black leading-relaxed">
                Somos hombres que han pasado por el barro y que van a obligarte
                a pasar por él también.
              </p>
            </div>
          </section>

          <section className="border border-zinc-800 bg-black/75 mb-12">
            <div className="text-center border-b border-zinc-800 p-6">
              <p className="uppercase tracking-[0.35em] text-zinc-400 text-xs">
                Nuestro método
              </p>

              <h2 className="text-2xl md:text-4xl font-black uppercase mt-3 text-orange-500">
                Programa intensivo de 30 a 90 días
              </h2>

              <p className="uppercase text-xs text-zinc-400 mt-3">
                Un sistema de reconstrucción basado en exigencia diaria
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              {[
                'Despertar temprano',
                'Entrenamiento físico diario',
                'Técnicas de estudio',
                'Trabajo manual',
                'Seguimiento constante',
                'Evaluación semanal',
                'Mentoría directa',
              ].map((item) => (
                <div
                  key={item}
                  className="border-r border-b border-zinc-800 p-5 text-center"
                >
                  <p className="text-xs uppercase font-black text-zinc-200">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {pilares.map((pilar) => (
              <div
                key={pilar.title}
                className="border border-zinc-800 bg-black/75 p-6 min-h-[330px] flex flex-col justify-between backdrop-blur-sm"
              >
                <div>
                  <h3 className="text-orange-500 text-xl font-black uppercase mb-5">
                    {pilar.title}
                  </h3>

                  <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed">
                    {pilar.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>

          <section className="grid lg:grid-cols-3 gap-5 mb-16">
            <InfoBox
              title="Modalidad"
              text="Bootcamps intensivos, programas de seguimiento y academia de hombres."
            />

            <InfoBox
              title="Para quién es"
              text="Para jóvenes que sienten que están perdiendo tiempo, fuerza y dirección."
            />

            <InfoBox
              title="Lo que no hacemos"
              text="No damos excusas. No alimentamos victimismo. No maquillamos el problema."
            />
          </section>

          <section className="border-t border-zinc-800 pt-10 pb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div>
              <p className="text-zinc-500 uppercase text-xs tracking-[0.45em]">
                Somos 3 socios. Una misión.
              </p>

              <h2 className="text-3xl md:text-5xl font-black uppercase mt-4 leading-tight">
                Rescatar jóvenes atrapados
                <br />
                en la debilidad.
              </h2>
            </div>

            <Link
              href="/?login=true"
              className="bg-orange-500 hover:bg-orange-600 transition-all text-black font-black uppercase px-8 py-4 rounded-sm tracking-widest inline-flex items-center justify-center"
            >
              Solicita una entrevista
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-zinc-800 bg-black/75 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-black uppercase mb-4">{title}</h3>

      <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
    </div>
  );
}