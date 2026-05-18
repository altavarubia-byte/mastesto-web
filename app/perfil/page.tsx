'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// --- COMPONENTE DE TAREA ---
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
    <div className={`p-5 rounded-2xl border ${completada ? 'border-green-500/20 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/10'} transition-all mb-3 group hover:border-orange-600/50`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{tarea.titulo}</h3>
        <div className={`w-2 h-2 rounded-full ${completada ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-800'}`} />
      </div>
      {!completada ? (
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-black text-orange-600 w-16">{formatear(segundos)}</div>
          <button onClick={() => setActivo(!activo)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${activo ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:bg-orange-600 hover:text-white'}`}>
            {activo ? 'OPERANDO...' : 'EJECUTAR'}
          </button>
        </div>
      ) : (
        <div className="text-[8px] font-black text-green-500 uppercase tracking-widest text-right italic">Objetivo Neutralizado</div>
      )}
    </div>
  );
}

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
  
  // ESTADOS AJUSTES PERFIL
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

  // IA
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [temperatura, setTemperatura] = useState(0.7);
  const [brevedad, setBrevedad] = useState(40);

  // ADMIN
  const [tituloTarea, setTituloTarea] = useState('');
  const [minutosTarea, setMinutosTarea] = useState(30);
  const [socioId, setSocioId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAdmin = user?.email === 'altava.rubia@gmail.com';
  
  const obtenerRango = () => {
    const d = tiempo.dias || 0;
    if (d < 3) return "RECLUTA";
    if (d < 10) return "SOLDADO DE ÉLITE";
    if (d < 30) return "SARGENTO DE HIERRO";
    return "COMANDANTE +TESTO";
  };

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setUser(user);
      
      const metaFecha = user.user_metadata?.fecha_dejo_fumar || user.created_at;
      setFechaInicio(metaFecha);
      setNuevaFecha(new Date(metaFecha).toISOString().split('T')[0]);
      setNuevoNombre(user.user_metadata?.nombre || '');

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

  // GUARDAR CAMBIOS PERFIL
  const guardarAjustes = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { 
        nombre: nuevoNombre,
        fecha_dejo_fumar: new Date(nuevaFecha).toISOString() 
      }
    });
    if (!error) {
      setEditandoPerfil(false);
      window.location.reload();
    }
  };

  const enviarTareaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarea || !socioId) return;
    const { error } = await supabase.from('tareas').insert([{ titulo: tituloTarea, duracion_minutos: minutosTarea, user_id: socioId }]);
    if (!error) {
      setStatusMsg('ORDEN DESPLEGADA');
      setTituloTarea(''); setSocioId('');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const consultarMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim() || cargandoIA) return;
    const historial = [...chat, { role: 'user', content: mensaje }];
    setChat(historial); setMensaje(''); setCargandoIA(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial, contexto: `SOCIO: ${user?.user_metadata?.nombre}. RACHA: ${tiempo.dias} DÍAS.` }),
      });
      const data = await res.json();
      setChat([...historial, { role: 'assistant', content: data.content }]);
    } catch (e) { console.error(e); } finally {
      setCargandoIA(false);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
    }
  };

  if (loading) return <div className="bg-black min-h-screen text-orange-600 flex items-center justify-center font-black uppercase tracking-[1em] animate-pulse">Sincronizando...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-orange-600">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 border-b border-zinc-900 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-between px-8">
        <span className="text-xl font-black italic text-orange-600 tracking-tighter cursor-pointer">+TESTO</span>
        <div className="relative">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black hover:border-orange-600 transition-all text-[10px]">
            {(user?.user_metadata?.nombre?.[0] || 'V').toUpperCase()}
          </button>
          {menuAbierto && (
            <div className="absolute top-14 right-0 w-72 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-[110]">
               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Socio Conectado</p>
               <p className="text-[10px] font-bold text-orange-600 truncate mb-4">{user?.email}</p>
               <div className="space-y-1 border-t border-zinc-900 pt-4">
                 <button onClick={() => { setEditandoPerfil(true); setMenuAbierto(false); }} className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Ajustes de Perfil</button>
                 <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full text-left p-3 text-[9px] font-black uppercase text-red-600 mt-2 border-t border-zinc-900 pt-4 italic">Finalizar Sesión</button>
               </div>
            </div>
          )}
        </div>
      </nav>

      <main className="mt-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-4 tracking-widest italic">Biometría</p>
            <div className="flex justify-between text-[10px] font-black mb-1 uppercase italic">
              <span>{user?.user_metadata?.nombre || 'SOCIO'}</span>
              <span className="text-orange-600">{obtenerRango()}</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: `${((tiempo.dias || 0) % 7) * 14.2}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-12 text-center shadow-2xl relative">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500 mb-12 italic">Tiempo de Disciplina Absoluta</p>
            <div className="grid grid-cols-4 gap-2 mb-12">
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.dias}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Días</p></div>
              <div><p className="text-5xl md:text-7xl font-black text-orange-600">{tiempo.horas.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Horas</p></div>
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.min.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Min</p></div>
              <div><p className="text-5xl md:text-7xl font-black text-orange-600">{tiempo.seg.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Seg</p></div>
            </div>
            <button onClick={() => setConfirmarReinicio(true)} className="text-[8px] font-black uppercase text-zinc-800 hover:text-red-600 italic tracking-widest">[ Reportar Fallo ]</button>
          </div>

          {isAdmin && (
            <div className="bg-zinc-950 border border-orange-600/30 p-8 rounded-[2.5rem]">
               <h4 className="text-[10px] font-black text-orange-600 uppercase mb-6 text-center italic tracking-widest">Admin: Despliegue de Misiones</h4>
               <form onSubmit={enviarTareaAdmin} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                   <input value={tituloTarea} onChange={e => setTituloTarea(e.target.value)} placeholder="TÍTULO" className="md:col-span-9 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] outline-none uppercase font-bold" />
                   <input type="number" value={minutosTarea} onChange={e => setMinutosTarea(parseInt(e.target.value))} className="md:col-span-3 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono text-orange-600" />
                 </div>
                 <input value={socioId} onChange={e => setSocioId(e.target.value)} placeholder="UUID SOCIO" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono" />
                 <button className="w-full bg-orange-600 text-black py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white transition-all">Lanzar Objetivo</button>
                 {statusMsg && <p className="text-center text-[8px] font-black text-green-500 animate-pulse">{statusMsg}</p>}
               </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2.5rem] min-h-[350px]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-6 tracking-widest text-center italic">Misiones_Asignadas</p>
            {tareas.map((t: any) => <CardTarea key={t.id} tarea={t} userNick={user?.user_metadata?.nombre || 'Socio'} supabase={supabase} />)}
          </div>
        </div>
      </main>

      {/* MODAL AJUSTES DE PERFIL */}
      {editandoPerfil && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em] mb-8 italic text-center">Configuración de Operativo</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block tracking-widest italic">Nombre de Socio</label>
                <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-white focus:border-orange-600 outline-none transition-all uppercase font-bold" />
              </div>
              <div>
                <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block tracking-widest italic">Inicio de Disciplina</label>
                <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-orange-600 focus:border-orange-600 outline-none transition-all font-mono" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={guardarAjustes} className="flex-1 bg-orange-600 text-black py-4 rounded-xl font-black text-[9px] uppercase hover:bg-white transition-all">Sincronizar</button>
                <button onClick={() => setEditandoPerfil(false)} className="px-6 bg-zinc-900 text-zinc-500 py-4 rounded-xl font-black text-[9px] uppercase hover:text-white transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IA */}
      <div className="fixed bottom-8 left-8 z-[120]">
        <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-orange-600 rotate-90' : 'bg-white text-black'}`}>
          <span className="font-black text-xs">IA</span>
        </button>
        {isOpen && (
          <div className="absolute bottom-20 left-0 w-80 bg-zinc-950 border-2 border-orange-600 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-4 bg-orange-600 text-black font-black text-[10px] flex justify-between italic items-center">
              <span>EL FORJADOR v1.0</span>
              <button onClick={()=>setIsOpen(false)}>✕</button>
            </div>
            <div className="p-5 border-b border-zinc-900 space-y-4">
              <div>
                <div className="flex justify-between text-[7px] font-black text-zinc-500 mb-2"><span>FUEGO</span><span className="text-orange-600">{temperatura}</span></div>
                <input type="range" min="0" max="1" step="0.1" value={temperatura} onChange={(e)=>setTemperatura(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-900 accent-orange-600 appearance-none" />
              </div>
            </div>
            <div ref={scrollRef} className="h-48 overflow-y-auto p-5 font-mono text-[10px] uppercase text-orange-500 bg-black">
              {chat.map((msg, i) => <div key={i} className={msg.role === 'assistant' ? 'border-l-2 border-orange-600 pl-3 py-1 mb-2' : 'text-zinc-600 text-right italic mb-2'}>{msg.content}</div>)}
            </div>
            <form onSubmit={consultarMentor} className="p-4 bg-zinc-950 flex gap-2">
              <input type="text" value={mensaje} onChange={e => setMensaje(e.target.value)} className="flex-1 bg-black border border-zinc-900 p-3 text-[10px] text-white rounded-xl outline-none" placeholder="Reporte..." />
              <button className="bg-orange-600 text-black px-4 rounded-xl font-black text-[10px]">OK</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
