'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [socios, setSocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRanking = async () => {
      // 1. Consultamos los perfiles públicos
      // NOTA: Asegúrate de tener una tabla 'perfiles' o usar la lógica que prefieras
      const { data, error } = await supabase
        .from('perfiles') 
        .select('alias, mision, fecha_inicio, color_acento')
        .eq('ghost_mode', false) // <--- FILTRO CRÍTICO
        .order('fecha_inicio', { ascending: true }); // El que empezó antes, va primero

      if (data) {
        // Calculamos los días de racha para cada uno
        const procesados = data.map(s => {
          const dias = Math.floor((new Date().getTime() - new Date(s.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24));
          return { ...s, dias };
        });
        // Ordenar por días de mayor a menor
        setSocios(procesados.sort((a, b) => b.dias - a.dias));
      }
      setLoading(false);
    };

    fetchRanking();
  }, [supabase]);

  if (loading) return <div className="bg-black min-h-screen text-orange-600 flex items-center justify-center font-black uppercase italic">Escaneando Red de Socios...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
        <span className="text-xl font-black italic text-orange-600 cursor-pointer" onClick={() => router.push('/perfil')}>+TESTO</span>
        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Global_Leaderboard</h1>
      </nav>

      <div className="max-w-4xl mx-auto space-y-4">
        {socios.map((socio, index) => (
          <div 
            key={index}
            className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex items-center justify-between group hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-6">
              {/* POSICIÓN */}
              <div className="text-2xl font-black italic w-12 text-zinc-800 group-hover:text-orange-600 transition-colors">
                #{index + 1}
              </div>
              
              {/* INFO SOCIO */}
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-tighter" style={{ color: socio.color_acento }}>
                  {socio.alias}
                </h3>
                <p className="text-[8px] text-zinc-500 uppercase font-bold italic">"{socio.mision}"</p>
              </div>
            </div>

            {/* RACHA */}
            <div className="text-right">
              <p className="text-3xl font-black tabular-nums">{socio.dias}</p>
              <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Días de Disciplina</p>
            </div>
          </div>
        ))}

        {socios.length === 0 && (
          <p className="text-center text-zinc-500 py-20 italic text-[10px] uppercase">No hay operativos públicos en la red.</p>
        )}
      </div>
    </div>
  );
}
