'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// --- COMPONENTE DE TAREA (MANTENIDO Y PULIDO) ---
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

export default function PerfilPage() {
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // IA
  const [logs, setLogs] = useState<string[]>(["SISTEMA OPERATIVO", "ESPERANDO ÓRDENES..."]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAdmin = user?.email === 'altava.rubia@gmail.com';

  // Lógica de Niveles (Ficticia para profesionalidad visual)
  const nivel = Math.floor(tiempo.dias / 5) + 1;
  const progresoNivel = (tiempo.dias % 5) * 20;

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
      addLog(`USUARIO ${user.user_metadata?.nombre || 'SOCIO'} AUTENTICADO`);
    };
    getData();
  }, [supabase, router]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

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

  if (loading) return <div className="bg-black min-h-screen text-orange-600 flex items-center justify-center font-black animate-pulse uppercase tracking-[1em]">Cargando Núcleo...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-600 selection:text-black">
      
      {/* HEADER SUPERIOR PROFESIONAL */}
      <nav className="fixed top-0 left-0 w-full h-20 border-b border-zinc-900 bg-black/50 backdrop-blur-xl z-[100] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black italic tracking-tighter text-orange-600">+TESTO</span>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest leading-none">Rango</span>
            <span className="text-[10px] font-black uppercase text-white">NIVEL {nivel} — OPERATIVO</span>
          </div>
        </div>

        <div className="flex items-center gap-6" ref={menuRef}>
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[7px] text-zinc-500 uppercase font-black tracking-[0.2em]">Estado del Sistema</span>
              <span className="text-[9px] text-green-500 font-black animate-pulse uppercase">● En Línea</span>
           </div>
           
           <button 
             onClick={() => setMenuAbierto(!menuAbierto)}
             className="relative w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center hover:border-orange-600 transition-all overflow-hidden"
           >
             <span className="text-xs font-black">{(user?.user_metadata?.nombre?.[0] || 'S').toUpperCase()}</span>
             {menuAbierto && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600" />}
           </button>

           {menuAbierto && (
             <div className="absolute top-24 right-8 w-72 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-black font-black">
                    {nivel}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white">{user?.user_metadata?.nombre}</p>
                    <p className="text-[8px] text-zinc-500 font-mono truncate w-40">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[7px] text-zinc-600 uppercase font-black tracking-widest mb-2">Configuración</p>
                  <button className="w-full text-left p-3 hover:bg-zinc-900 rounded-xl flex items-center justify-between transition-colors group">
                    <span className="text-[9px] font-black uppercase text-zinc-400 group-hover:text-white">Perfil Privado</span>
                    <div className="w-6 h-3 bg-zinc-800 rounded-full" />
                  </button>
                  <button className="w-full text-left p-3 hover:bg-zinc-900 rounded-xl flex items-center justify-between transition-colors group">
                    <span className="text-[9px] font-black uppercase text-zinc-400 group-hover:text-white">Notificaciones</span>
                    <div className="w-6 h-3 bg-orange-600 rounded-full" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => router.push('/admin')} className="w-full p-3 bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[9px] font-black uppercase rounded-xl mt-4">
                      Panel de Mando Admin
                    </button>
                  )}
                  <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full text-left p-3 hover:bg-red-950/20 rounded-xl mt-4">
                    <span className="text-[9px] font-black uppercase text-red-600 italic">✕ Finalizar Sesión</span>
                  </button>
                </div>
             </div>
           )}
        </div>
      </nav>

      <main className="mt-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: STATS & LOGS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem]">
            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-4">Progreso de Rango</p>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: `${progresoNivel}%` }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase">
              <span>Nivel {nivel}</span>
              <span>{100 - progresoNivel}% para Nivel {nivel + 1}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] font-mono">
            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-4">System_Logs</p>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <p key={i} className="text-[7px] text-zinc-600 uppercase">
                  <span className="text-orange-900 mr-2">[{new Date().toLocaleTimeString()}]</span> {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: RELOJ DE DISIPLINA */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent opacity-30" />
            
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-12 italic">Tiempo en Alta Intensidad</p>
            
            <div className="grid grid-cols-4 gap-4 mb-12">
              <div className="space-y-1">
                <p className="text-5xl md:text-7xl font-black tracking-tighter text-white">{tiempo.dias}</p>
                <p className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Días</p>
              </div>
              <div className="space-y-1">
                <p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.horas.toString().padStart(2, '0')}</p>
                <p className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Horas</p>
              </div>
              <div className="space-y-1">
                <p className="text-5xl md:text-7xl font-black tracking-tighter text-white">{tiempo.minutos.toString().padStart(2, '0')}</p>
                <p className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Minutos</p>
              </div>
              <div className="space-y-1">
                <p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.segundos.toString().padStart(2, '0')}</p>
                <p className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Segundos</p>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-900/50">
              {!confirmarReinicio ? (
                <button onClick={() => setConfirmarReinicio(true)} className="text-[9px] font-black uppercase text-zinc-700 hover:text-red-600 transition-all tracking-widest group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2">!</span>
                  Reportar Fallo Crítico
                  <span className="opacity-0 group-hover:opacity-100 ml-2">!</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                  <p className="text-red-600 font-black text-[9px] uppercase tracking-[0.3em]">¿Anular progreso acumulado?</p>
                  <div className="flex gap-3">
                    <button onClick={reiniciarCronometro} className="bg-red-600 text-black px-8 py-3 rounded-xl font-black text-[9px] uppercase">CONFIRMO MI DERROTA</button>
                    <button onClick={() => setConfirmarReinicio(false)} className="bg-zinc-800 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase">VOLVER AL FRENTE</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: MISIONES */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Misiones_Asignadas</h2>
              <span className="text-[8px] bg-zinc-900 px-2 py-1 rounded-md text-zinc-600 font-bold">{tareas.length}</span>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {tareas.length > 0 ? (
                tareas.map((t: any) => (
                  <CardTarea key={t.id} tarea={t} userNick={user?.user_metadata?.nombre || 'Socio'} supabase={supabase} />
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                  <p className="text-[8px] text-zinc-800 uppercase font-black">Sin objetivos activos</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* IA (MANTENIDA CON ESTILO BOTÓN MEJORADO) */}
      <div className="fixed bottom-10 left-10 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-all group-hover:rotate-90">
             <span className="text-black font-black text-xl">IA</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Consultar al Forjador</p>
          </div>
        </button>
      </div>

    </div>
  );
}
