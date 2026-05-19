'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactoPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('General');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          nombre: `MENSAJE DE CONTACTO: ${nombre}`,
          mensaje: `Asunto: ${asunto}\n\nMensaje: ${mensaje}` 
        }),
      });

      if (res.ok) setEnviado(true);
    } catch (err) {
      console.error("Error al enviar:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <Link href="/" className="absolute top-8 left-8 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
        ← Volver
      </Link>

      <div className="max-w-xl w-full space-y-8 bg-zinc-900/50 p-10 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-md">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white">+TESTO</h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest italic">Soporte y Alianzas Operativas</p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-800/50">
          <div className="text-center">
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Email Oficial</p>
            <p className="text-xs font-bold">mastesto3@gmail.es</p>
          </div>
          <div className="text-center border-l border-zinc-800/50">
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Línea Directa</p>
            <p className="text-xs font-bold">+34 641 68 01 71</p>
          </div>
        </div>

        {enviado ? (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
            <p className="text-orange-600 font-black uppercase tracking-widest text-sm">Transmisión Enviada</p>
            <p className="text-[10px] text-zinc-400 mt-2 uppercase">Responderemos en menos de 24 horas.</p>
            <button onClick={() => setEnviado(false)} className="mt-8 text-[9px] underline uppercase text-zinc-500">Enviar otro mensaje</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="NOMBRE"
                required
                className="bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none focus:border-orange-600"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <input
                type="email"
                placeholder="EMAIL"
                required
                className="bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none focus:border-orange-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <select 
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none focus:border-orange-600 appearance-none"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            >
              <option value="General">CONSULTA GENERAL</option>
              <option value="Soporte">PROBLEMAS TÉCNICOS</option>
              <option value="Negocios">ALIANZAS / NEGOCIOS</option>
              <option value="Disciplina">DUDA SOBRE EL PROGRAMA</option>
            </select>

            <textarea
              placeholder="MENSAJE OPERATIVO..."
              required
              rows={5}
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none focus:border-orange-600 resize-none"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-white text-black font-black text-[10px] py-4 rounded-lg uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
            >
              {cargando ? 'ENVIANDO...' : 'ESTABLECER CONTACTO'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-10 text-[8px] text-zinc-700 uppercase tracking-[0.5em]">Mastesto Engineering HQ</p>
    </div>
  );
}
