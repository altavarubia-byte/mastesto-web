'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ListaTareas from '@/components/ListaTareas';

// --- COMPONENTE DE TAREA CON TEMPORIZADOR ---
function CardTarea({ tarea, userNick, supabase }: any) {
  const [segundos, setSegundos] = useState(tarea.duracion_minutos * 60);
  const [activo, setActivo] = useState(false);
  const [completada, setCompletada] = useState(tarea.completada_por?.includes(userNick));

  useEffect(() => {
    let timer: any;
    if (activo && segundos > 0) {
      timer = setInterval(() => setSegundos(s => s - 1), 1000);
    } else if (segundos === 0 && activo) {
      finalizarMision();
    }
    return () => clearInterval(timer);
  }, [activo, segundos]);

  const finalizarMision = async () => {
    setActivo(false);
    setCompletada(true);
    await supabase.rpc('array_append_completada', { 
      tarea_id: tarea.id, 
      nuevo_nick: userNick 
    });
  };

  const formatear = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`p-6 rounded-[2rem] border ${completada ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/20'} transition-all mb-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest">{tarea.titulo}</h3>
        <span className={`text-[9px] font-bold px-3 py-1 rounded-full border ${completada ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-zinc-800 text-zinc-500'}`}>
          {completada ? `● ${userNick}` : `○ ${userNick}`}
        </span>
      </div>

      {!completada ? (
        <div className="space-y-4">
          <div className="text-3xl font-black font-mono text-center text-orange-600">
            {formatear(segundos)}
          </div>
          <button
            onClick={() => setActivo(!activo)}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activo ? 'bg-zinc-800 text-white' : 'bg-white text-black'
            }`}
          >
            {activo ? 'DETENER MISION' : 'INICIAR TAREA'}
          </button>
        </div>
      ) : (
        <div className="text-center py-2 text-[10px] font-black text-green-500 uppercase italic tracking-widest animate-pulse">
          OBJETIVO CUMPLIDO
        </div>
      )}
    </div>
  );
}

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [tareas, setTareas] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados Admin
  const [tituloTarea, setTituloTarea] = useState('');
  const [minutosTarea, setMinutosTarea] = useState(30);
  const [socioId, setSocioId] = useState('');

  const [temp, setTemp] = useState(0.7);
  const [words, setWords] = useState(40);
  const [tareasReales, setTareasReales] = useState<string>("");
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const isAdmin = user?.email === 'altava.rubia@gmail.com';

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
      const metaFecha = user.user_metadata?.fecha_dejo_fumar || user.created_at;
      if (metaFecha) setFechaInicio(metaFecha);

      // Cargar tareas de la DB
      const { data: tasks } = await supabase
        .from('tareas')
        .select('*')
        .order('created_at', { ascending: false });
      if (tasks) setTareas(tasks);
    };
    getData();
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

  const enviarTareaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarea || !socioId) return;
    const { error } = await supabase.from('tareas').insert([
      { titulo: tituloTarea, duracion_minutos: minutosTarea, user_id: socioId }
    ]);
    if (!error) {
      alert("MISIÓN DESPLEGADA");
      setTituloTarea('');
      window.location.reload();
    }
  };

  const reiniciarCronometro = async () => {
    const nuevaFecha = new Date().toISOString();
    const { error } = await supabase.auth.updateUser({ data: { fecha_dejo_fumar: nuevaFecha } });
    if (!error) {
      setFechaInicio(nuevaFecha);
      setConfirmarReinicio(false);
      setChat(prev => [...prev, { role: 'assistant', content: 'CONTADOR REINICIADO. LA DISCIPLINA NO ENTIENDE DE EXCUSAS.' }]);
    }
  };

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
          temp, words,
          contexto: `SOCIO: ${user.user_metadata?.nombre || 'Vicente'}. PROGRESO: ${tiempo.dias}d. TAREAS: ${tareasReales}.`
        }),
      });
      const data = await res.json();
      setChat([...historialActualizado, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setChat([...historialActualizado, { role: 'assistant', content: 'SISTEMA: ERROR.' }]);
    } finally {
      setCargandoIA(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans relative overflow-hidden">
      
      {/* EXPEDIENTE SOCIO (IZQUIERDA) */}
      <div className="fixed top-12 left-12 w-64 hidden xl:block border-l border-orange-600 pl-6 py-2 opacity-80">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 italic">Expediente_Socio</h2>
        <p className="text-[7px] text-orange-600 uppercase font-black mb-1">Estatus</p>
        <p className="text-[11px] font-black uppercase text-green-500 mb-4 italic tracking-widest">En Batalla</p>
        {isAdmin && <p className="text-[10px] bg-orange-600 text-black px-2 py-0.5 inline-block font-black">ADMINISTRADOR</p>}
      </div>

      {/* LISTA DE TAREAS (DERECHA) */}
      <div className="fixed top-12 right-12 w-80 hidden xl:block opacity-90 z-20 overflow-y-auto max-h-[80vh]">
        <div className="mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Misiones Activas</h2>
          {tareas.map(t => (
            <CardTarea key={t.id} tarea={t} userNick={user.user_metadata?.nombre || user.email} supabase={supabase} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative z-10">
          
          {/* VISTA ADMIN: FORMULARIO ENVÍO */}
          {isAdmin && (
            <div className="mb-12 p-6 border border-orange-600/20 rounded-2xl bg-black">
              <h3 className="text-[10px] font-black text-orange-600 uppercase mb-4">Desplegar Tarea</h3>
              <form onSubmit={enviarTareaAdmin} className="flex flex-col gap-2">
                <input value={tituloTarea} onChange={e => setTituloTarea(e.target.value)} placeholder="TÍTULO" className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-[10px] uppercase font-bold" />
                <input type="number" value={minutosTarea} onChange={e => setMinutosTarea(Number(e.target.value))} placeholder="MINUTOS" className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-[10px] font-bold" />
                <input value={socioId} onChange={e => setSocioId(e.target.value)} placeholder="ID SOCIO (UUID)" className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-[10px] font-bold" />
                <button type="submit" className="bg-orange-600 text-black font-black text-[9px] py-2 rounded-lg uppercase mt-2">Enviar Misión</button>
              </form>
            </div>
          )}

          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-600 mb-12 opacity-60 italic">Tiempo de Disciplina</p>
          
          <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12">
            <div><p className="text-5xl md:text-7xl font-black tracking-tighter">{tiempo.dias}</p><p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Días</p></div>
            <div><p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.horas.toString().padStart(2, '0')}</p><p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Horas</p></div>
            <div><p className="text-5xl md:text-7xl font-black tracking-tighter">{tiempo.minutos.toString().padStart(2, '0')}</p><p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Minutos</p></div>
            <div><p className="text-5xl md:text-7xl font-black tracking-tighter text-orange-600">{tiempo.segundos.toString().padStart(2, '0')}</p><p className="text-[8px] uppercase font-bold text-zinc-600 mt-2">Segundos</p></div>
          </div>

          <div className="mb-10">
            {!confirmarReinicio ? (
              <button onClick={() => setConfirmarReinicio(true)} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-red-600 italic">[ Declarar Fallo ]</button>
            ) : (
              <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-300">
                <p className="text-red-600 font-black text-[10px] italic uppercase">¿CONFIRMAS EL FRACASO?</p>
                <div className="flex gap-4">
                  <button onClick={reiniciarCronometro} className="bg-red-600 text-black px-4 py-1 rounded-full font-black text-[9px] uppercase">SÍ, HE FALLADO</button>
                  <button onClick={() => setConfirmarReinicio(false)} className="border border-zinc-700 text-zinc-400 px-4 py-1 rounded-full font-black text-[9px] uppercase">NO, RESISTIRÉ</button>
                </div>
              </div>
            )}
          </div>

          {/* Misiones en Móvil */}
          <div className="xl:hidden mb-10 text-left space-y-4">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Misiones Activas</h2>
             {tareas.map(t => (
               <CardTarea key={t.id} tarea={t} userNick={user.user_metadata?.nombre || user.email} supabase={supabase} />
             ))}
          </div>

          <button onClick={handleLogout} className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800 hover:text-orange-600 transition-colors italic">[ Finalizar Sesión ]</button>
        </div>
      </div>

      {/* EL FORJADOR (IA) */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
        {isOpen && (
          <div className="mb-6 w-80 md:w-96 bg-zinc-950 border-2 border-orange-600 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-orange-600 text-black font-black uppercase italic text-[10px] flex justify-between items-center">
              <span>SISTEMA: EL FORJADOR</span>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div ref={scrollRef} className="h-64 overflow-y-auto p-6 font-mono text-[10px] uppercase bg-black text-orange-500 space-y-4 border-b border-zinc-900">
              {chat.map((msg, i) => (
                <div key={i} className={msg.role === 'assistant' ? 'border-l-2 border-orange-600 pl-4 py-1' : 'text-zinc-500 text-right italic'}>
                  {msg.content}
                </div>
              ))}
              {cargandoIA && <div className="animate-pulse">MOLDEANDO...</div>}
            </div>
            <form onSubmit={consultarMentor} className="p-4 bg-zinc-950 flex gap-2">
              <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="INFORME..." className="flex-1 bg-black border border-zinc-800 rounded-xl p-3 text-[10px] text-white outline-none focus:border-orange-600" />
              <button type="submit" className="bg-orange-600 text-black px-5 rounded-xl font-black text-[10px]">OK</button>
            </form>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="w-20 h-20 bg-orange-600 rounded-full border-4 border-black shadow-lg flex items-center justify-center hover:scale-110 transition-all">
          <span className="text-black font-black text-2xl italic">IA</span>
        </button>
      </div>
    </div>
  );
}
