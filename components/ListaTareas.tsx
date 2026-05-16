'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function ListaTareas() {
  const [tareas, setTareas] = useState<any[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    const { data } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setTareas(data);
  }

  async function agregarTarea(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('tareas')
      .insert([{ texto: nuevaTarea, user_id: user?.id }]);

    if (!error) {
      setNuevaTarea('');
      cargarTareas();
    }
  }

  async function eliminarTarea(id: string) {
    await supabase.from('tareas').delete().eq('id', id);
    cargarTareas();
  }

  async function toggleTarea(id: string, estado: boolean) {
    await supabase.from('tareas').update({ completada: !estado }).eq('id', id);
    cargarTareas();
  }

  return (
    <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-orange-600">
        Objetivos Diarios
      </h3>
      
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="NUEVA TAREA..."
          className="flex-grow bg-black border border-zinc-800 rounded-lg px-4 py-2 text-[10px] uppercase focus:outline-none focus:border-orange-600 transition-colors"
        />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg font-black text-[10px] hover:bg-orange-600 hover:text-white transition-all">
          +
        </button>
      </form>

      <div className="space-y-3">
        {tareas.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-zinc-900 group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={t.completada} 
                onChange={() => toggleTarea(t.id, t.completada)}
                className="w-4 h-4 accent-orange-600 bg-black border-zinc-800"
              />
              <span className={`text-[11px] uppercase font-medium ${t.completada ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                {t.texto}
              </span>
            </div>
            <button 
              onClick={() => eliminarTarea(t.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-[9px] font-bold transition-all"
            >
              BORRAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
