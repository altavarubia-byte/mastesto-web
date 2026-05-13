'use client';

import Link from 'next/link';

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8 md:p-24 font-sans selection:bg-white selection:text-black">
      
      {/* Navegación de retorno */}
      <nav className="mb-16">
        <Link 
          href="/" 
          className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al inicio
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto">
        {/* Título Principal Actualizado */}
        <header className="mb-20">
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4 font-bold">Nuestra Especialidad</h2>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Sistemas de <br />
            <span className="text-zinc-700">Alta Disponibilidad</span>
          </h1>
          <div className="h-1 w-20 bg-white"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <section className="space-y-8">
            <h3 className="text-xl text-white font-light leading-relaxed">
              Desarrollamos soluciones de software donde la <span className="font-bold">precisión técnica</span> y el <span className="font-bold">rendimiento</span> son la máxima prioridad.
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed tracking-wide">
              Como equipo con base en la ingeniería de telecomunicaciones, nos especializamos en el procesamiento de datos, la arquitectura de redes y el desarrollo de interfaces minimalistas que eliminan el ruido innecesario para el usuario final.
            </p>
          </section>

          {/* Bloque de servicios/dedicación */}
          <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl space-y-10">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-white font-bold mb-4">Lo que hacemos</h4>
              <ul className="text-xs text-zinc-400 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-white">01</span>
                  <span>Arquitecturas escalables para plataformas digitales de alto tráfico.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">02</span>
                  <span>Implementación de sistemas de seguridad y gestión de datos críticos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>03</span>
                  <span>Optimización de señal y procesamiento digital orientado a la web.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="mt-32 pt-8 border-t border-zinc-900 flex justify-between items-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-700">Ingeniería • 2026</p>
          <a href="https://discord.gg/KwznUHYp7" target="_blank" className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Comunidad Discord</a>
        </footer>
      </main>
    </div>
  );
}
