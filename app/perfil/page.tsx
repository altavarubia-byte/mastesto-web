'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// --- COMPONENTE DE TAREA (Misión individual con cronómetro) ---
function CardTarea({ tarea, userNick, supabase }: any) {
  const [segundos, setSegundos] = useState(tarea.duracion_minutos * 60);
  const [activo, setActivo] = useState(false);
  const [completada, setCompletada] = useState(tarea.completada_por?.includes(userNick));

  useEffect(() => {
    let timer: any;
    if (activo && segundos > 0) {
      timer = setInterval(() => setSegundos((s: number) => s - 1), 1000);
    } else if (segundos === 0 && activo) {
      finalizarMision();
    }
    return () => clearInterval(timer);
  }, [activo, segundos]);

  const finalizarMision = async () => {
    setActivo(false);
    setCompletada(true);
    const { error } = await supabase.rpc('array_append_completada', { 
      tarea_id: tarea.id, 
      nuevo_nick: userNick 
    });
    if (!error) window.location.reload();
  };

  const formatear = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`p-5 rounded-2xl border ${completada ? 'border-green-500/20 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/10'} transition-all mb-3 group`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{tarea.titulo}</h3>
        <div className={`w-2 h-2 rounded-full ${completada ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-800'}`} />
      </div>
      {!completada ? (
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-black text-orange-600 w-16">{formatear(segundos)}</div>
          <button onClick={() => setActivo(!activo)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${activo ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:bg-orange-600 hover:text-white'}`}>
            {activo ? 'EN CURSO...' : 'EJECUTAR'}
          </button>
        </div>
      ) : (
        <div className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em] text-right italic">Misión Cumplida</div>
      )}
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function PerfilPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  
  // IA - El Forjador
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [temp, setTemp] = useState(0.7);
  const [words, setWords] = useState(40);

  // Admin
  const [tituloTarea, setTituloTarea] = useState('');
  const [minutosTarea, setMinutosTarea] = useState(30);
  const [socioId, setSocioId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAdmin = user?.email === 'altava.rubia@gmail.com';
  const nivel = Math.floor((tiempo.dias || 0) / 5) + 1;
  const progresoNivel = ((tiempo.dias || 0) % 5) * 20;

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setUser(user);
      const metaFecha = user.user_metadata?.fecha_dejo_fumar || user.created_at;
      setFechaInicio(metaFecha);

      const { data: tasks } = await supabase.from('tareas').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (tasks) setTareas(tasks);
      setLoading(false);
    };
    getData();
  }, [supabase, router]);

  useEffect(() => {
    if (!fechaInicio) return;
    const intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const inicio = new Date(fechaInicio).getTime();
      const dif = ahora - inicio;
      if (dif > 0) {
        setTiempo({
          dias: Math.floor(dif / (1000 * 60 * 60 * 24)),
          horas: Math.floor((dif / (1000 * 60 * 60)) % 24),
          min: Math.floor((dif / 1000 / 60) % 60),
          seg: Math.floor((dif / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fechaInicio]);

  const consultarMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim() || cargandoIA) return;
    const historial = [...chat, { role: 'user', content: mensaje }];
    setChat(historial);
    setMensaje('');
    setCargandoIA(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: historial, temp, words,
          contexto: `SOCIO: ${user?.user_metadata?.nombre || 'Socio'}. PROGRESO: ${tiempo.dias} DÍAS.`
        }),
      });
      const data = await res.json();
      setChat([...historial, { role: 'assistant', content: data.content }]);
    } catch (e) { console.error(e); } finally {
      setCargandoIA(false);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
    }
  };

  const enviarTareaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarea || !socioId) return;
    const { error } = await supabase.from('tareas').insert([{ 
      titulo: tituloTarea, 
      duracion_minutos: minutosTarea, 
      user_id: socioId 
    }]);
    if (!error) {
      setStatusMsg('TAREA DESPLEGADA');
      setTituloTarea(''); setSocioId('');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const reiniciarCronometro = async () => {
    const nuevaFecha = new Date().toISOString();
    const { error } = await supabase.auth.updateUser({ data: { fecha_dejo_fumar: nuevaFecha } });
    if (!error) { setFechaInicio(nuevaFecha); setConfirmarReinicio(false); }
  };

  if (loading) return <div className="bg-black min-h-screen text-orange-600 flex items-center justify-center font-black uppercase tracking-[1em]">Cargando Sistema...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      
      {/* HEADER PROFESIONAL */}
      <nav className="fixed top-0 left-0 w-full h-20 border-b border-zinc-900 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black italic text-orange-600 tracking-tighter">+TESTO</span>
          <div className="flex flex-col border-l border-zinc-800 pl-4">
            <span className="text-[7px] text-zinc-500 uppercase font-black">Nivel Actual</span>
            <span className="text-[10px] font-black uppercase">RANGO {nivel}</span>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black hover:border-orange-600 transition-all">
            {(user?.user_metadata?.nombre?.[0] || 'S').toUpperCase()}
          </button>
          {menuAbierto && (
            <div className="absolute top-14 right-0 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2">
              <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Usuario</p>
              <p className="text-[10px] font-bold mb-4 truncate text-orange-600">{user?.email}</p>
              <div className="space-y-1">
                <button onClick={() => setMenuAbierto(false)} className="w-full text-left p-2 text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-colors">Ajustes de Perfil</button>
                <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full text-left p-2 text-[9px] font-black uppercase text-red-600 italic mt-2 border-t border-zinc-900 pt-4">Finalizar Sesión</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="mt-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        
        {/* COLUMNA IZQUIERDA: PROGRESO */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Siguiente Rango</p>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: `${progresoNivel}%` }} />
            </div>
            <div className="flex justify-between text-[7px] text-zinc-600 font-black">
              <span>NIVEL {nivel}</span>
              <span>XP: {progresoNivel}%</span>
            </div>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] font-mono">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-4">Registro_Terminal</p>
            <p className="text-[7px] text-zinc-700 mb-1">› NÚCLEO ACTIVO</p>
            <p className="text-[7px] text-zinc-700 mb-1">› USUARIO: {user?.user_metadata?.nombre?.toUpperCase()}</p>
            <p className="text-[7px] text-orange-900 animate-pulse">› ESPERANDO ÓRDENES...</p>
          </div>
        </div>

        {/* COLUMNA CENTRAL: CRONÓMETRO Y ADMIN */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="w-full bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 text-center shadow-2xl border-t-orange-600/20 border-t-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-12 italic">Tiempo de Disciplina Acumulado</p>
            
            <div className="grid grid-cols-4 gap-4 mb-12 text-white font-black tracking-tighter">
              <div><p className="text-5xl md:text-7xl">{tiempo.dias}</p><p className="text-[8px] text-zinc-600 mt-2">DÍAS</p></div>
              <div><p className="text-5xl md:text-7xl text-orange-600">{tiempo.horas.toString().padStart(2,'0')}</p><p className="text-[8px] text-zinc-600 mt-2">HORAS</p></div>
              <div><p className="text-5xl md:text-7xl">{tiempo.min.toString().padStart(2,'0')}</p><p className="text-[8px] text-zinc-600 mt-2">MIN</p></div>
              <div><p className="text-5xl md:text-7xl text-orange-600">{tiempo.seg.toString().padStart(2,'0')}</p><p className="text-[8px] text-zinc-600 mt-2">SEG</p></div>
            </div>

            <div className="pt-8 border-t border-zinc-900">
              {!confirmarReinicio ? (
                <button onClick={() => setConfirmarReinicio(true)} className="text-[8px] font-black uppercase text-zinc-800 hover:text-red-600 transition-all tracking-[0.2em]">[ REPORTAR FALLO CRÍTICO ]</button>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in">
                  <p className="text-red-600 font-black text-[9px] uppercase tracking-widest">¿Confirmar reinicio de contador?</p>
                  <div className="flex gap-4">
                    <button onClick={reiniciarCronometro} className="bg-red-600 text-black px-8 py-3 rounded-xl text-[9px] font-black uppercase">SI, HE FALLADO</button>
                    <button onClick={() => setConfirmarReinicio(false)} className="bg-zinc-800 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase">VOLVER</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PANEL ADMIN: LANZAMIENTO DE MISIONES */}
          {isAdmin && (
            <div className="w-full bg-orange-600/5 border border-orange-600/20 p-8 rounded-[3rem]">
               <h4 className="text-[10px] font-black text-orange-600 uppercase mb-6 text-center tracking-[0.3em]">Centro de Despliegue de Misiones</h4>
               <form onSubmit={enviarTareaAdmin} className="flex flex-col gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <input 
                     value={tituloTarea} 
                     onChange={e => setTituloTarea(e.target.value)} 
                     placeholder="TÍTULO" 
                     className="md:col-span-2 bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] text-white focus:border-orange-600 outline-none transition-all" 
                   />
                   <input 
                     type="number"
                     value={minutosTarea} 
                     onChange={e => setMinutosTarea(parseInt(e.target.value))} 
                     placeholder="MINUTOS" 
                     className="bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] text-white focus:border-orange-600 outline-none transition-all" 
                   />
                 </div>
                 <input 
                   value={socioId} 
                   onChange={e => setSocioId(e.target.value)} 
                   placeholder="ID SOCIO (UUID)" 
                   className="bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] text-white focus:border-orange-600 outline-none transition-all" 
                 />
                 <button className="bg-orange-600 hover:bg-orange-500 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                   LANZAR MISIÓN AL SOCIO
                 </button>
                 {statusMsg && <p className="text-[9px] text-green-500 text-center font-black animate-pulse">{statusMsg}</p>}
               </form>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: MISIONES */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] min-h-[400px]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-6 tracking-widest">Objetivos Activos</p>
            <div className="space-y-1">
              {tareas.length > 0 ? (
                tareas.map((t: any) => (
                  <CardTarea key={t.id} tarea={t} userNick={user?.user_metadata?.nombre || 'Socio'} supabase={supabase} />
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2rem]">
                  <p className="text-[8px] text-zinc-800 font-black uppercase">Esperando Misiones...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* IA - EL FORJADOR */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl group ${isOpen ? 'bg-orange-600 rotate-90' : 'bg-white hover:bg-orange-600'}`}
        >
          <span className={`font-black text-xs ${isOpen ? 'text-white' : 'text-black'}`}>IA</span>
        </button>
        
        {isOpen && (
          <div className="absolute bottom-20 left-0 w-80 bg-zinc-950 border-2 border-orange-600 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.3)] animate-in slide-in-from-bottom-6">
            <div className="p-4 bg-orange-600 flex justify-between items-center text-black font-black text-[10px] italic">
              <span>EL FORJADOR v1.0</span>
              <button onClick={() => setIsOpen(false)} className="hover:scale-125 transition-transform">✕</button>
            </div>
            
            <div className="p-4 border-b border-zinc-900 space-y-3 bg-zinc-900/50 backdrop-blur-sm">
              <div className="flex justify-between items-center"><span className="text-[7px] font-black uppercase text-zinc-500">Temperatura (Fuego)</span><span className="text-[7px] text-orange-600 font-black">{temp}</span></div>
              <input type="range" min="0.1" max="1.5" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full accent-orange-600" />
              
              <div className="flex justify-between items-center"><span className="text-[7px] font-black uppercase text-zinc-500">Brevedad (Palabras)</span><span className="text-[7px] text-orange-600 font-black">{words}</span></div>
              <input type="range" min="10" max="100" step="5" value={words} onChange={(e) => setWords(parseInt(e.target.value))} className="w-full accent-orange-600" />
            </div>

            <div ref={scrollRef} className="h-56 overflow-y-auto p-5 font-mono text-[10px] uppercase text-orange-500 space-y-5 bg-black custom-scrollbar">
              <p className="text-zinc-800 text-center text-[8px]">[ CONEXIÓN ESTABLECIDA ]</p>
              {chat.map((msg, i) => (
                <div key={i} className={msg.role === 'assistant' ? 'border-l-2 border-orange-600 pl-3 py-1' : 'text-zinc-600 text-right italic'}>
                  {msg.content}
                </div>
              ))}
              {cargandoIA && <p className="animate-pulse">CARGANDO RESPUESTA...</p>}
            </div>

            <form onSubmit={consultarMentor} className="p-4 bg-zinc-950 flex gap-2 border-t border-zinc-900">
              <input 
                type="text" 
                value={mensaje} 
                onChange={e => setMensaje(e.target.value)} 
                className="flex-1 bg-black border border-zinc-800 p-3 text-[10px] text-white rounded-xl outline-none focus:border-orange-600 transition-all" 
                placeholder="REPORTE DE ESTADO..." 
              />
              <button className="bg-orange-600 text-black px-4 rounded-xl font-black text-[10px] hover:bg-orange-500">ENVIAR</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
