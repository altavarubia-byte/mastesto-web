'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Tarea {
  id: string;
  texto: string;
  completada: boolean;
  created_at: string;
  user_id: string;
}

// 1. Definimos la interfaz para recibir la función del padre
interface ListaTareasProps {
  onTareasChange?: (tareasTexto: string) => void;
}

export default function ListaTareas({ onTareasChange }: ListaTareasProps) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [socioIdDestino, setSocioIdDestino] = useState(''); 
  const [user, setUser] = useState<any>(null);
  const [mensajeExito, setMensajeExito] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const ADMIN_EMAIL = 'altava.rubia@gmail.com'; 
  const esAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      cargarTareas();
    }
  }, [user]);

  // --- 2. EFECTO PARA ENVIAR TAREAS AL PERFIL (CONTEXTO IA) ---
  useEffect(() => {
    if (onTareasChange) {
      // Filtramos solo las misiones que NO están completadas
      const pendientes = tareas
        .filter(t => !t.completada)
        .map(t => t.texto)
        .join(", ");
      
      onTareasChange(pendientes || "No tiene misiones pendientes.");
    }
  }, [tareas, onTareasChange]);

  async function cargarTareas() {
    let query = supabase.from('tareas').select('*').order('created_at', { ascending: true });
    
    if (esAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data } = await query;
    if (data) setTareas(data as Tarea[]);
  }

  async function agregarTarea(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    const asignadoA = esAdmin && socioIdDestino.trim() !== '' 
      ? socioIdDestino.trim() 
      : user.id;
    
    const { error } = await supabase
      .from('tareas')
      .insert([{ texto: nuevaTarea, user_id: asignadoA }]);

    if (!error) {
      setNuevaTarea('');
      setSocioIdDestino('');
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
      
      if (asignadoA === user.id) {
        cargarTareas();
      }
    }
  }

  async function eliminarTarea(id: string) {
    const { error } = await supabase.from('tareas').delete().eq('id', id);
    if (!error) cargarTareas();
  }

  async function toggleTarea(id: string, estado: boolean) {
    const { error } = await supabase
      .from('tareas')
      .update({ completada: !estado })
      .eq('id', id);
    
    if (!error) cargarTareas();
  }

  return (
    <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm shadow-2xl relative">
      
      {mensajeExito && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-black text-[9px] font-black px-4 py-2 rounded-full shadow-xl z-50 animate-bounce uppercase">
          Misión enviada con éxito ⚔️
        </div>
      )}

      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-orange-600 italic">
        ⚔️ Objetivos de Batalla {esAdmin && <span className="text-white ml-2">[MODO FORJADOR]</span>}
      </h3>
      
      {esAdmin && (
        <form onSubmit={agregarTarea} className="flex flex-col gap-2 mb-6 p-4 bg-orange-600/5 rounded-2xl border border-orange-600/20">
          <p className="text-[7px] font-black text-orange-500 uppercase ml-1">Destinatario (UUID):</p>
          <input
            type="text"
            value={socioIdDestino}
            onChange={(e) => setSocioIdDestino(e.target.value)}
            placeholder="ID DEL SOCIO..."
            className="bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[9px] uppercase focus:border-orange-600 outline-none text-orange-400 font-mono"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              placeholder="NUEVA MISIÓN..."
              className="flex-grow bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[10px] uppercase focus:outline-none focus:border-orange-600 transition-all"
            />
            <button type="submit" className="bg-orange-600 text-black px-4 py-2 rounded-xl font-black text-[10px] hover:bg-white transition-all uppercase">
              Asignar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-[8px] text-zinc-500 uppercase font-black mb-2 px-1">
          {esAdmin ? "Mis tareas personales" : "Tus misiones asignadas"}
        </p>
        {tareas.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-900 group transition-all hover:border-zinc-800">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={t.completada} 
                onChange={() => toggleTarea(t.id, t.completada)}
                className="w-4 h-4 accent-orange-600 rounded border-zinc-800 bg-black cursor-pointer"
              />
              <span className={`text-[10px] uppercase font-bold tracking-tight ${t.completada ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                {t.texto}
              </span>
            </div>
            <button 
              onClick={() => eliminarTarea(t.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 text-[8px] font-black transition-all"
            >
              BORRAR
            </button>
          </div>
        ))}
        {tareas.length === 0 && (
          <p className="text-[9px] text-zinc-700 text-center uppercase italic py-4 tracking-widest">Sin misiones activas</p>
        )}
      </div>
    </div>
  );
}
