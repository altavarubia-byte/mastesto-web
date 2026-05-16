'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Definimos la estructura de la tarea para que TypeScript no falle
interface Tarea {
  id: string;
  texto: string;
  completada: boolean;
  created_at: string;
}

export default function ListaTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error cargando tareas:', error.message);
      return;
    }
    if (data) setTareas(data as Tarea[]);
  }

  async function agregarTarea(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('tareas')
      .insert([{ texto: nuevaTarea, user_id: user.id }]);

    if (!error) {
      setNuevaTarea('');
      cargarTareas();
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
    <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-orange-600 italic">
        ⚔️ Objetivos de Batalla
      </h3>
      
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="NUEVA TAREA..."
          className="flex-grow bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[10px] uppercase focus:outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700"
        />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] hover:bg-orange-600 hover:text-white transition-all">
          +
        </button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {tareas.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-900 group transition-all hover:border-zinc-700">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={t.completada} 
                onChange={() => toggleTarea(t.id, t.completada)}
                className="w-4 h-4 accent-orange-600 rounded border-zinc-800 bg-black"
              />
              <span className={`text-[10px] uppercase font-bold tracking-tight ${t.completada ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                {t.texto}
              </span>
            </div>
            <button 
              onClick={() => eliminarTarea(t.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 text-[8px] font-black transition-all"
            >
              ELIMINAR
            </button>
          </div>
        ))}
        {tareas.length === 0 && (
          <p className="text-[9px] text-zinc-700 text-center uppercase italic py-4">Sin objetivos marcados</p>
        )}
      </div>
    </div>
  );
}
