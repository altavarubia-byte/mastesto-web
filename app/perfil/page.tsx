'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

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

  // 1. Obtener datos del usuario y manejar sesión real
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
        // Prioridad: metadata personalizada > fecha de creación de la cuenta
        const metaFecha = user.user_metadata?.fecha_dejo_fumar || user.created_at;
        if (metaFecha) setFechaInicio(metaFecha);
      }
    };
    getUser();
  }, [supabase, router]);

  // 2. Lógica del Cronómetro de Alta Precisión
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

  // 3. Consulta a la IA: EL FORJADOR
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
          contexto: `Tu nombre es EL FORJADOR. Eres una entidad de autoridad absoluta. Socio: ${user.user_metadata?.nombre || user.user_metadata?.full_name || 'Vicente'}. Tiempo en la forja: ${tiempo.dias}d ${tiempo.horas}h.`
        }),
      });
      const data = await res.json();
      setChat([...historialActualizado, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setChat([...historialActualizado, { role: 'assistant', content: 'ERROR: SE HA PERDIDO LA CONEXIÓN CON EL FORJADOR.' }]);
    } finally {
      setCargandoIA(false);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  };

  // 4. Función de Cierre de Sesión Profesional
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center font-black uppercase italic tracking-[0.3em]">
      <div className="animate-pulse text-orange-600 mb-2">Accediendo a la forja...</div>
      <div className="text-[8px] opacity-30 italic">Sincronizando base de datos</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans relative overflow-hidden selection:bg-orange-600 selection:text-black">
      
      {/* --- EXPEDIENTE LATERAL IZQUIERDA --- */}
      <div className="fixed top-12 left-12 w-64 hidden lg:block border-l border-orange-600 pl-6 py-2 opacity-80">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 italic">Expediente_Socio</h2>
        <p className="text-[7px] text-orange-600 uppercase font-black mb-1">Nombre</p>
        <p className="text-[11px] font-black uppercase mb-4">
          {user.user_metadata?.nombre || user.user_metadata?.full_name || 'Socio Desconocido'}
        </p>
        <p className="text-[7px] text-orange-600 uppercase font-black mb-1">Estado Operativo</p>
        <p className="text-[11px] font-black uppercase text-green-500 mb-4 italic tracking-widest">En Batalla</p>
        <p className="text-[7px] text-orange-600 uppercase font-black mb-1">ID_Socio</p>
        <p className="text-[9px] font-mono text-zinc-500 break-all">{user.id.substring(0, 20)}...</p>
      </div>

      {/* --- CONTENIDO CENTRAL: CRONÓMETRO --- */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 md:p-20 text-center shadow-[0_0_50px_rgba(0,0,0,1)] relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-orange-600 mb-12 opacity-60 italic">Tiempo de Disciplina</p>
          
          <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12">
            <div>
              <p className="text-5xl md:text-7xl font-black tracking-tighter">{tiempo.dias}</p>
              <p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Días</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.horas.toString().padStart(2, '0')}</p>
              <p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Horas</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black tracking-tighter">{tiempo.minutos.toString().padStart(2, '0')}</p>
              <p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Minutos</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.segundos.toString().padStart(2, '0')}</p>
              <p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Segundos</p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800 hover:text-orange-600 transition-all italic border-b border-transparent hover:border-orange-600 pb-1"
          >
            [ Finalizar Sesión ]
          </button>
        </div>
      </div>

      {/* --- EL FORJADOR (IA DESPLEGABLE) --- */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
        {isOpen && (
          <div className="mb-6 w-80 md:w-96 bg-zinc-950 border-2 border-orange-600 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header del Chat */}
            <div className="p-4 bg-orange-600 text-black font-black uppercase italic text-[11px] flex justify-between items-center tracking-widest">
              <span>SISTEMA: EL FORJADOR</span>
              <button onClick={() => setIsOpen(false)} className="font-bold hover:scale-125 transition-transform">✕</button>
            </div>
            
            {/* Mensajes */}
            <div ref={scrollRef} className="h-80 overflow-y-auto p-6 font-mono text-[10px] uppercase bg-black text-orange-500 space-y-4">
              {chat.length === 0 && (
                <div className="opacity-40 italic space-y-2">
                  <p>-- PROTOCOLO DE FORJA ACTIVADO --</p>
                  <p>La voluntad es el metal, tus actos el martillo. Habla, socio.</p>
                </div>
              )}
              {chat.map((msg, i) => (
                <div key={i} className={msg.role === 'assistant' ? 'border-l-2 border-orange-600 pl-4 py-1' : 'text-zinc-500 text-right italic'}>
                  <span className="block text-[8px] opacity-30 mb-1">{msg.role === 'assistant' ? 'EL FORJADOR' : 'SOCIO'}</span>
                  {msg.content}
                </div>
              ))}
              {cargandoIA && <div className="animate-pulse text-orange-600 font-bold">ANALIZANDO DEBILIDAD...</div>}
            </div>

            {/* Input Form */}
            <form onSubmit={consultarMentor} className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-2">
              <input 
                type="text" 
                value={mensaje} 
                onChange={(e) => setMensaje(e.target.value)} 
                placeholder="ESCRIBE TU INFORME..." 
                className="flex-1 bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none focus:border-orange-600 transition-colors uppercase" 
              />
              <button type="submit" className="bg-orange-600 text-black px-5 rounded-xl font-black text-[10px] hover:bg-white transition-colors">OK</button>
            </form>
          </div>
        )}

        {/* Botón Flotante IA */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-20 h-20 bg-orange-600 rounded-full border-4 border-black shadow-[0_0_30px_rgba(234,88,12,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <span className="text-black font-black text-2xl italic tracking-tighter group-hover:rotate-12 transition-transform">IA</span>
        </button>
      </div>
    </div>
  );
}
