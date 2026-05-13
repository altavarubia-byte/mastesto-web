'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function Page() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [esLogin, setEsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setAutorizado(true);
    };
    checkUser();
  }, [supabase]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/perfil` },
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setCargando(true);
    
    const { error, data } = esLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(true);
    } else {
      setAutorizado(true);
      setMostrarLogin(false);
    }
    setCargando(false);
  };

  if (mostrarLogin && !autorizado) {
    return (
      <div className="min-h-screen bg-black/95 text-white flex items-center justify-center p-6 fixed inset-0 z-[100] backdrop-blur-sm font-sans">
        <div className="max-w-sm w-full space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl relative">
          <button onClick={() => setMostrarLogin(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-[10px] uppercase">Cerrar</button>
          
          <h1 className="text-center text-lg font-black uppercase tracking-[0.3em]">{esLogin ? 'Acceso Cliente' : 'Registro'}</h1>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-lg text-[9px] font-bold uppercase hover:bg-zinc-200 transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="G" /> Google
            </button>
            <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded-lg text-[9px] font-bold uppercase hover:opacity-90 transition-all">
              <img src="https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico" className="w-3 h-3 invert" alt="F" /> Facebook
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-[8px] uppercase tracking-widest">o con email</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none" />
            <input type="password" placeholder="CONTRASEÑA" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none" />
            {error && <p className="text-[8px] text-red-500 uppercase text-center font-bold">Error de autenticación</p>}
            <button type="submit" disabled={cargando} className="w-full bg-zinc-100 text-black font-black text-[10px] py-3.5 rounded-lg uppercase tracking-widest hover:bg-white transition-all">
              {cargando ? 'PROCESANDO...' : (esLogin ? 'ENTRAR' : 'REGISTRARME')}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-[9px] uppercase">
            {esLogin ? '¿No tienes cuenta?' : '¿Ya eres socio?'} 
            <button onClick={() => setEsLogin(!esLogin)} className="ml-2 text-white underline font-bold italic">{esLogin ? 'Crea una aquí' : 'Inicia sesión'}</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-6 left-6 z-50">
        <a href="https://discord.gg/KwznUHYp7" target="_blank" rel="noopener noreferrer" className="text-[10px] border border-zinc-800 bg-zinc-900/50 px-4 py-2 rounded-full uppercase font-bold text-zinc-400">Discord</a>
      </div>
      <div className="absolute bottom-10 right-10 z-50">
        <Link href="/nosotros" className="text-[9px] text-zinc-500 hover:text-white uppercase underline underline-offset-8 decoration-zinc-800">Conoce más</Link>
      </div>

      <div className="max-w-5xl w-full flex flex-col items-center space-y-12 z-10 text-center">
        <button onClick={() => autorizado ? supabase.auth.signOut().then(() => setAutorizado(false)) : setMostrarLogin(true)} className="text-[10px] border border-zinc-800 px-8 py-2.5 rounded-full hover:bg-white hover:text-black uppercase font-bold text-zinc-500 tracking-widest transition-all">
          {autorizado ? 'Cerrar Sesión' : 'Acceso al Cliente'}
        </button>

        <div className="relative group">
          <div className="absolute -inset-1 bg-white/5 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <img src="/logoweb.jpeg" alt="Logo" className="relative w-[600px] md:w-[800px] mx-auto rounded-lg shadow-2xl border border-zinc-900" />
        </div>

        {autorizado && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-4">
            <div className="border-t border-zinc-900 pt-4 px-10">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Socio Verificado</span>
            </div>
            <Link href="/perfil" className="inline-block bg-white text-black text-[10px] px-8 py-3 rounded-full uppercase font-black hover:bg-zinc-200 transition-all tracking-widest shadow-xl">
              Ir a mi panel personal
            </Link>
          </div>
        )}
        <p className="text-zinc-900 text-[8px] uppercase tracking-[0.8em] pt-20">Mastesto Engineering • 2026</p>
      </div>
    </div>
  );
}
