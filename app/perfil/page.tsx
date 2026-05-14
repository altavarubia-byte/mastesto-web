'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
        const metaFecha = user.user_metadata?.fecha_dejo_fumar;
        if (metaFecha) setFechaInicio(metaFecha);
      }
    };
    getUser();
  }, [supabase, router]);

  useEffect(() => {
    if (!fechaInicio) return;
    const intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const inicio = new Date(fechaInicio).getTime();
      const diferencia = ahora - inicio;
      if (diferencia > 0) {
        setTiempo({
          dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diferencia / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((diferencia / 1000 / 60) % 60),
          segundos: Math.floor((diferencia / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fechaInicio]);

  const consultarMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim() || cargandoIA) return;

    const nuevoMensaje = { role: 'user', content: mensaje };
    const historialActualizado = [...chat, nuevoMensaje];
    setChat(historialActualizado);
    setMensaje('');
    setCargandoIA(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: historialActualizado, 
          contexto: `Socio: ${user.user_metadata?.nombre}. Racha: ${tiempo.dias} días.` 
        }),
      });
      const data = await res.json();
      setChat([...historialActualizado, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setChat([...historialActualizado, { role: 'assistant', content: 'CONEXIÓN PERDIDA CON LA FORJA.' }]);
    } finally {
      setCargandoIA(false);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }
  };

  if (!user) return <div className="bg-black min-h-screen text-white flex items-center justify-center font-black italic uppercase tracking-tighter">Accediendo al servidor...</div>;

  // Datos extraídos del user_metadata del registro
  const { nombre, apellido, edad, sexo } = user.user_metadata || {};

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600 selection:text-black">
      
      {/* --- EXPEDIENTE IZQUIERDA --- */}
      <div className="fixed top-12 left-12 w-64 hidden xl:block z-40 border-l border-zinc-800 pl-8 py-4">
        <div className="mb-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 mb-2 italic">Expediente_Activo</h2>
          <div className="h-px w-full bg-gradient-to-r from-orange-600 to-transparent opacity-30" />
        </div>

        <div className="space-y-10">
          <div>
            <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Identidad de Socio</p>
            <p className="text-xs font-black uppercase tracking-widest">{nombre || 'Socio'} {apellido || ''}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Edad</p>
              <p className="text-xs font-black italic">{edad || '--'} AÑOS</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Sexo</p>
              <p className="text-xs font-black uppercase">{sexo || '--'}</p>
            </div>
          </div>

          <div>
            <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Email_Vinculado</p>
            <p className="text-[10px] font-mono text-zinc-400 break-all">{user.email}</p>
          </div>
        </div>
      </div>

      {/* --- ÁREA CENTRAL --- */}
      <main className="flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[3rem] p-16 shadow-[0_0_100px_rgba(234,88,12,0.05)] text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-orange-600 mb-12 opacity-50 italic">Estado de la Voluntad</p>
          
          <div className="flex justify-center items-baseline gap-10 mb-12">
             <div className="flex flex-col">
                <span className="text-9xl font-black tracking-tighter">{tiempo.dias}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-700 tracking-widest">Días</span>
             </div>
             <div className="h-20 w-px bg-zinc-900 mx-2" />
             <div className="flex flex-col text-orange-600">
                <span className="text-5xl font-black">{tiempo.horas.toString().padStart(2, '0')}</span>
                <span className="text-[8px] uppercase font-bold tracking-widest">H</span>
             </div>
          </div>

          <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-all">
            [ Cerrar Terminal ]
          </button>
        </motion.div>
      </main>

      {/* --- IA FLOTANTE (DRAGGABLE) --- */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div 
          drag 
          dragMomentum={false}
          className="pointer-events-auto absolute bottom-12 right-12 flex flex-col items-end"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.8, y: 20 }} 
                className="mb-6 w-80 bg-zinc-950 border-2 border-orange-600 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.2)]"
              >
                <div className="bg-orange-600 p-4 flex justify-between items-center">
                  <span className="text-[10px] font-black text-black uppercase italic">El Forjador_IA</span>
                  <button onClick={() => setIsOpen(false)} className="text-black font-black font-mono">✕</button>
                </div>
                
                <div ref={scrollRef} className="h-64 overflow-y-auto p-5 space-y-4 font-mono text-[10px] uppercase text-orange-500 bg-black">
                  {chat.length === 0 && <p className="opacity-40 italic">¿TIENES DUDAS? PREGUNTA AL FORJADOR...</p>}
                  {chat.map((msg, i) => (
                    <div key={i} className={msg.role === 'assistant' ? 'border-l border-orange-600 pl-3' : 'text-zinc-500 text-right pr-3'}>
                      {msg.content}
                    </div>
                  ))}
                  {cargandoIA && <span className="animate-pulse">ANALIZANDO...</span>}
                </div>

                <form onSubmit={consultarMentor} className="p-3 bg-zinc-950 flex gap-2 border-t border-zinc-900">
                  <input 
                    type="text" 
                    value={mensaje} 
                    onChange={(e) => setMensaje(e.target.value)} 
                    placeholder="HABLA..." 
                    className="flex-1 bg-black border border-zinc-800 p-3 text-[10px] text-white outline-none focus:border-orange-600"
                  />
                  <button type="submit" className="bg-orange-600 text-black px-4 font-black text-[10px]">OK</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center border-4 border-black shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="text-black font-black text-xl tracking-tighter italic">IA</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
