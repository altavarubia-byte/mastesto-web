'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// --- COMPONENTE DE TAREA ---
function CardTarea({ tarea, userNick, supabase, colorAcento }: any) {
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
    <div 
      className="p-5 rounded-2xl border transition-all mb-3 group"
      style={{ borderColor: completada ? `${colorAcento}33` : '#1f1f23', backgroundColor: completada ? `${colorAcento}05` : 'transparent' }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{tarea.titulo}</h3>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: completada ? colorAcento : '#1f1f23' }} />
      </div>
      {!completada ? (
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-black w-16" style={{ color: colorAcento }}>{formatear(segundos)}</div>
          <button 
            onClick={() => setActivo(!activo)} 
            className="flex-1 py-2 rounded-lg text-[8px] font-black uppercase bg-white text-black hover:opacity-80 transition-all"
          >
            {activo ? 'OPERANDO...' : 'EJECUTAR'}
          </button>
        </div>
      ) : (
        <div className="text-[8px] font-black uppercase tracking-widest text-right italic" style={{ color: colorAcento }}>Misión Cumplida</div>
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
  
  // CONFIGURACIÓN PERFIL
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [colorAcento, setColorAcento] = useState('#ea580c');
  const [ghostMode, setGhostMode] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');

  // IA MENTOR
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [temperatura, setTemperatura] = useState(0.7);
  const [brevedad, setBrevedad] = useState(50); // Rango de palabras

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
      
      const meta = user.user_metadata;
      const fecha = meta?.fecha_dejo_fumar || user.created_at;
      setFechaInicio(fecha);
      setNuevaFecha(new Date(fecha).toISOString().split('T')[0]);
      
      setNuevoNombre(meta?.nombre || '');
      setAlias(meta?.alias || 'SOCIO');
      setBio(meta?.mision || 'OPERATIVO ACTIVO');
      setColorAcento(meta?.color_acento || '#ea580c');
      setGhostMode(meta?.ghost_mode || false);

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

  const guardarAjustes = async () => {
    await supabase.auth.updateUser({
      data: { 
        nombre: nuevoNombre,
        alias: alias,
        mision: bio,
        color_acento: colorAcento,
        ghost_mode: ghostMode,
        fecha_dejo_fumar: new Date(nuevaFecha).toISOString() 
      }
    });
    setEditandoPerfil(false);
    window.location.reload();
  };

  const enviarTareaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarea || !socioId) return;
    const { error } = await supabase.from('tareas').insert([{ titulo: tituloTarea, duracion_minutos: minutosTarea, user_id: socioId }]);
    if (!error) { setStatusMsg('DESPLEGADO'); setTituloTarea(''); setSocioId(''); setTimeout(() => setStatusMsg(''), 3000); }
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
        body: JSON.stringify({ 
          messages: historial, 
          contexto: `Alias: ${alias}. Racha: ${tiempo.dias} días. Máximo palabras: ${brevedad}.`,
          temperature: temperatura
        }),
      });
      const data = await res.json();
      setChat([...historial, { role: 'assistant', content: data.content }]);
    } catch (e) { console.error(e); } finally { setCargandoIA(false); }
  };

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center font-black animate-pulse uppercase tracking-[1em]">Cargando...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-white selection:text-black" style={{ '--color-acento': colorAcento } as any}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 border-b border-zinc-900 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-between px-8">
        <span className="text-xl font-black italic tracking-tighter cursor-pointer" style={{ color: colorAcento }} onClick={() => window.location.reload()}>+TESTO</span>
        <div className="relative">
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)} 
            className="w-9 h-9 rounded-full bg-zinc-900 border flex items-center justify-center font-black transition-all text-[10px]"
            style={{ borderColor: menuAbierto ? colorAcento : '#27272a' }}
          >
            {alias[0]?.toUpperCase()}
          </button>
          
          {menuAbierto && (
            <div className="absolute top-14 right-0 w-72 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200">
               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Operativo</p>
               <p className="text-[10px] font-bold truncate mb-4" style={{ color: colorAcento }}>{user?.email}</p>
               
               <div className="space-y-1 border-t border-zinc-900 pt-4">
                 {/* REDIRECCION LEADERBOARD */}
                 <button 
                   onClick={() => router.push('/ranking')} 
                   className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all flex justify-between items-center group"
                 >
                   Leaderboard <span style={{ color: colorAcento }} className="opacity-0 group-hover:opacity-100">→</span>
                 </button>

                 <button onClick={() => { setEditandoPerfil(true); setMenuAbierto(false); }} className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Ajustes Tácticos</button>
                 
                 <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full text-left p-3 text-[9px] font-black uppercase text-red-600 mt-2 border-t border-zinc-900 pt-4 italic">Cerrar Sesión</button>
               </div>
            </div>
          )}
        </div>
      </nav>

      <main className="mt-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* BIOMETRÍA */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] sticky top-24">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-4 tracking-widest italic">Estado_Actual</p>
            <p className="text-[14px] font-black mb-1 uppercase italic tracking-tighter" style={{ color: colorAcento }}>{alias}</p>
            <p className="text-[8px] text-zinc-600 font-bold mb-6 uppercase italic">"{bio}"</p>
            <div className="flex justify-between text-[8px] font-black mb-1 uppercase text-zinc-400">
              <span>{obtenerRango()}</span>
              <span>XP: {((tiempo.dias % 10) * 10)}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000" style={{ backgroundColor: colorAcento, width: `${((tiempo.dias % 10) * 10)}%` }} />
            </div>
          </div>
        </div>

        {/* DASHBOARD PRINCIPAL */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${colorAcento}, transparent)` }} />
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500 mb-12 italic">Cronómetro de Disciplina</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.dias}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Días</p></div>
              <div><p className="text-5xl md:text-7xl font-black" style={{ color: colorAcento }}>{tiempo.horas.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Hrs</p></div>
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.min.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Min</p></div>
              <div><p className="text-5xl md:text-7xl font-black" style={{ color: colorAcento }}>{tiempo.seg.toString().padStart(2,'0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Seg</p></div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem]">
               <h4 className="text-[10px] font-black uppercase mb-6 text-center italic tracking-widest" style={{ color: colorAcento }}>Asignación de Misiones</h4>
               <form onSubmit={enviarTareaAdmin} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                   <input value={tituloTarea} onChange={e => setTituloTarea(e.target.value)} placeholder="TÍTULO" className="md:col-span-9 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500" />
                   <input type="number" value={minutosTarea} onChange={e => setMinutosTarea(parseInt(e.target.value))} className="md:col-span-3 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono outline-none" style={{ color: colorAcento }} />
                 </div>
                 <input value={socioId} onChange={e => setSocioId(e.target.value)} placeholder="ID DEL SOCIO" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono outline-none" />
                 <button className="w-full py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all" style={{ backgroundColor: colorAcento, color: 'black' }}>Lanzar Objetivo</button>
                 {statusMsg && <p className="text-center text-[8px] font-black text-green-500 animate-pulse uppercase">{statusMsg}</p>}
               </form>
            </div>
          )}
        </div>

        {/* LISTA DE MISIONES */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2.5rem] min-h-[400px]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-6 tracking-widest text-center italic">Buffer_Misiones</p>
            {tareas.length > 0 ? tareas.map((t: any) => <CardTarea key={t.id} tarea={t} userNick={alias} supabase={supabase} colorAcento={colorAcento} />) : <p className="text-[8px] text-zinc-700 text-center uppercase font-black italic mt-20">Esperando órdenes...</p>}
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIGURACIÓN */}
      {editandoPerfil && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl">
            <h3 className="font-black text-[12px] uppercase tracking-[0.5em] mb-10 italic text-center" style={{ color: colorAcento }}>Centro de Configuración</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Nombre Real</label>
                  <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-white outline-none focus:border-zinc-500 uppercase" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Callsign (Alias)</label>
                  <input value={alias} onChange={(e) => setAlias(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] outline-none uppercase font-black italic" style={{ color: colorAcento }} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Declaración de Misión (Bio)</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-white outline-none h-20 resize-none italic" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Fecha de Inicio</label>
                  <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] outline-none font-mono" style={{ color: colorAcento }} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase mb-4 block italic">Color de Interfaz</label>
                  <div className="flex gap-3">
                    {['#ea580c', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'].map(c => (
                      <button key={c} onClick={() => setColorAcento(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${colorAcento === c ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-zinc-900">
                  <span className="text-[9px] font-black uppercase text-zinc-400">Ghost Mode</span>
                  <button onClick={() => setGhostMode(!ghostMode)} className="w-12 h-6 rounded-full relative transition-all" style={{ backgroundColor: ghostMode ? colorAcento : '#27272a' }}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ghostMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button onClick={guardarAjustes} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all" style={{ backgroundColor: colorAcento, color: 'black' }}>Sincronizar Datos</button>
              <button onClick={() => setEditandoPerfil(false)} className="px-8 bg-zinc-900 text-zinc-500 py-5 rounded-2xl font-black text-[10px] uppercase hover:text-white transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* IA MENTOR MODAL */}
      <div className="fixed bottom-8 left-8 z-[120]">
        <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl" style={{ backgroundColor: isOpen ? colorAcento : 'white', color: 'black' }}>
          <span className="font-black text-xs">{isOpen ? '✕' : 'IA'}</span>
        </button>
        {isOpen && (
          <div className="absolute bottom-20 left-0 w-80 bg-zinc-950 border-2 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4" style={{ borderColor: colorAcento }}>
            <div className="p-4 font-black text-[10px] flex justify-between italic items-center" style={{ backgroundColor: colorAcento, color: 'black' }}>
              <span>EL FORJADOR v1.0</span>
            </div>
            
            {/* AJUSTES IA */}
            <div className="p-5 border-b border-zinc-900 space-y-4">
              <div>
                <div className="flex justify-between text-[7px] font-black text-zinc-500 uppercase mb-2"><span>FUEGO (TEMPERATURA)</span><span>{temperatura}</span></div>
                <input type="range" min="0" max="1" step="0.1" value={temperatura} onChange={(e)=>setTemperatura(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-900 appearance-none accent-white" />
              </div>
              <div>
                <div className="flex justify-between text-[7px] font-black text-zinc-500 uppercase mb-2"><span>RANGO PALABRAS (BREVEDAD)</span><span>{brevedad}</span></div>
                <input type="range" min="10" max="200" step="10" value={brevedad} onChange={(e)=>setBrevedad(parseInt(e.target.value))} className="w-full h-1 bg-zinc-900 appearance-none accent-white" />
              </div>
            </div>

            <div ref={scrollRef} className="h-48 overflow-y-auto p-5 font-mono text-[10px] uppercase space-y-4 bg-black" style={{ color: colorAcento }}>
              {chat.length === 0 ? <p className="opacity-30 italic text-center mt-10">Reporte su estado, operativo.</p> : chat.map((msg, i) => (
                <div key={i} className={msg.role === 'assistant' ? 'border-l-2 pl-3 py-1' : 'text-zinc-600 text-right italic'} style={{ borderLeftColor: msg.role === 'assistant' ? colorAcento : 'transparent' }}>{msg.content}</div>
              ))}
              {cargandoIA && <p className="animate-pulse">Procesando...</p>}
            </div>

            <form onSubmit={consultarMentor} className="p-4 bg-zinc-950 flex gap-2 border-t border-zinc-900">
              <input type="text" value={mensaje} onChange={e => setMensaje(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-3 text-[10px] text-white rounded-xl outline-none" placeholder="Escriba aquí..." />
              <button className="px-4 rounded-xl font-black text-[10px]" style={{ backgroundColor: colorAcento, color: 'black' }}>OK</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
