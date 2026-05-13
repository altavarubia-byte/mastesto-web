'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no está logueado, lo mandamos a la principal
        router.push('/');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [supabase, router]);

  if (!user) return <div className="bg-black min-h-screen text-white p-10">Cargando...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-10 shadow-2xl">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
          Panel de Socio
        </h1>
        
        <div className="space-y-6">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Email de la cuenta</p>
            <p className="text-lg font-mono">{user.email}</p>
          </div>
          
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">ID de Usuario</p>
            <p className="text-xs text-zinc-400 font-mono">{user.id}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Última conexión</p>
            <p className="text-sm">{new Date(user.last_sign_in_at).toLocaleString()}</p>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="mt-10 w-full border border-zinc-700 py-3 rounded-lg text-[10px] uppercase font-bold hover:bg-white hover:text-black transition-all"
          >
            Volver a Inicio
          </button>
        </div>
      </div>
    </div>
  );
}