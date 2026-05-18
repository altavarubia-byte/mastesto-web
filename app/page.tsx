'use client'; 

import { useState, useEffect, useMemo } from 'react'; 
import Link from 'next/link'; 
import { createBrowserClient } from '@supabase/ssr'; 

// --- CONFIGURACIÓN GLOBAL: FECHA DE FINALIZACIÓN FIJA ---
// Al poner una fecha fija, el contador es igual para todo el mundo y nunca retrocede.
const FECHA_OBJETIVO = new Date('2026-05-22T23:59:59').getTime();

// --- COMPONENTE: OFERTA FLASH TÁCTICA --- 
function OfertaFlash({ alistarse }: { alistarse: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const distancia = FECHA_OBJETIVO - ahora;

      if (distancia < 0) {
        setVisible(false);
        return null;
      }

      setTimeLeft({
        days: Math.floor(distancia / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distancia % (1000 * 60)) / 1000),
      });
    };

    // Ejecutar inmediatamente y luego cada segundo
    calcularTiempo();
    const timer = setInterval(calcularTiempo, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 p-[1px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-[2.5rem] shadow-[0_0_40px_-10px_rgba(234,88,12,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="bg-black rounded-[2.45rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-[0.03] font-black text-8xl italic -z-10 tracking-tighter text-white">70% OFF</div>
        
        <div className="text-left space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></span>
            <h3 className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] italic">Venta de Despliegue Inicial</h3>
          </div>
          <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">Protocolo de Acceso Total</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-zinc-600 line-through text-[10px] font-bold decoration-orange-600/40">29,99€</span>
              <span className="text-4xl font-black text-white italic tracking-tighter leading-none">8,99€</span>
            </div>
            <div className="h-10 w-[1px] bg-zinc-900 mx-2"></div>
            <button 
              onClick={alistarse}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40"
            >
              Obtener Acceso
            </button>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          {[
            { label: 'DÍAS', val: timeLeft.days },
            { label: 'HRS', val: timeLeft.hours },
            { label: 'MIN', val: timeLeft.minutes },
            { label: 'SEG', val: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center bg-zinc-950/50 border border-zinc-900 w-16 py-4 rounded-[1.5rem] backdrop-blur-sm">
              <span className="text-2xl font-black italic text-white tracking-tighter">{String(item.val).padStart(2, '0')}</span>
              <span className="text-[6px] font-black text-zinc-500 tracking-[0.2em] mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: CONTADOR TÁCTICO --- 
function ContadorSocios({ total }: { total: number }) { 
  return ( 
    <div className="flex flex-col items-center space-y-2 mb-10 animate-in fade-in zoom-in duration-1000 text-center"> 
      <div className="flex items-center gap-3"> 
        <span className="relative flex h-2 w-2"> 
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span> 
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span> 
        </span> 
        <span className="text-[8px] font-black tracking-[0.4em] uppercase text-zinc-500 italic"> 
          Sincronización de Red Global 🌐
        </span> 
      </div> 
      <div className="flex items-baseline gap-3"> 
        <span className="text-6xl font-black italic tracking-tighter text-white"> 
          {total > 0 ? total.toLocaleString() : '---'} 
        </span> 
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 italic"> 
          Usuarios Alistados
        </span> 
      </div> 
      <div className="h-[1px] w-12 bg-zinc-800 mt-2"></div>
    </div> 
  ); 
} 

// --- COMPONENTE: GUÍA DE INSTALACIÓN --- 
function GuiaInstalacion() { 
  return ( 
    <div className="w-full max-w-4xl mx-auto mt-20 mb-10 p-10 bg-zinc-950 border border-zinc-900 rounded-[3rem] relative overflow-hidden group shadow-2xl"> 
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" /> 
      <h2 className="text-[9px] font-black uppercase tracking-[0.5em] mb-12 text-orange-600 italic text-center"> 
        ⚡ DESPLIEGUE TÁCTICO: INSTALACIÓN MOBILE 
      </h2> 
      <div className="grid md:grid-cols-2 gap-16 text-left relative z-10"> 
        <div className="space-y-6"> 
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-4"> 
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">🍎</span> 
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">Protocolo iOS (Safari)</h3> 
          </div> 
          <ul className="space-y-4 text-[9px] text-zinc-500 uppercase font-bold italic"> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">01</span><span>Abre <strong className="text-zinc-200">mastesto.es</strong></span></li> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">02</span><span>Botón <strong className="text-zinc-200">COMPARTIR</strong></span></li> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">03</span><span><strong className="text-zinc-200">AÑADIR A PANTALLA DE INICIO</strong></span></li> 
          </ul> 
        </div> 
        <div className="space-y-6"> 
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-4"> 
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">🤖</span> 
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">Protocolo Android (Chrome)</h3> 
          </div> 
          <ul className="space-y-4 text-[9px] text-zinc-500 uppercase font-bold italic"> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">01</span><span>Entra desde <strong className="text-zinc-200">Chrome</strong></span></li> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">02</span><span>Menú de <strong className="text-zinc-200">3 PUNTOS</strong></span></li> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">03</span><span><strong className="text-zinc-200">INSTALAR APLICACIÓN</strong></span></li> 
          </ul> 
        </div> 
      </div> 
    </div> 
  ); 
} 

export default function Page() { 
  const supabase = useMemo(() => createBrowserClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
  ), []); 

  const [mostrarLogin, setMostrarLogin] = useState(false); 
  const [autorizado, setAutorizado] = useState(false); 
  const [esLogin, setEsLogin] = useState(true); 
  const [totalSocios, setTotalSocios] = useState(0); 

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [nombre, setNombre] = useState(''); 
  const [apellidos, setApellidos] = useState(''); 
  const [edad, setEdad] = useState(''); 
  const [nacionalidad, setNacionalidad] = useState(''); 
  const [provincia, setProvincia] = useState(''); 
  const [sexo, setSexo] = useState(''); 
  const [password2, setPassword2] = useState(''); 
  const [motivoCambio, setMotivoCambio] = useState(''); 
  const [error, setError] = useState(''); 
  const [cargando, setCargando] = useState(false); 

  useEffect(() => { 
    const fetchData = async () => { 
      const { data: { session } } = await supabase.auth.getSession(); 
      if (session) setAutorizado(true); 

      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }); 
      if (count) setTotalSocios(count); 
    }; 
    fetchData(); 

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
      setAutorizado(!!session); 
      if (session) setMostrarLogin(false); 
    }); 
    return () => subscription.unsubscribe(); 
  }, [supabase]); 

  const traducirErrorSupabase = (message: string) => { 
    if (message.includes('User already registered')) return 'Este correo ya está registrado.'; 
    if (message.includes('Password should be at least')) return 'Mínimo 6 caracteres.'; 
    if (message.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'; 
    return message; 
  }; 

  const handleGoogleLogin = async () => { 
    setError(''); setCargando(true); 
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: `${window.location.origin}/auth/callback` }, 
    }); 
    if (error) { setError(traducirErrorSupabase(error.message)); setCargando(false); } 
  }; 

  const handleAuth = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setError(''); 
    setCargando(true); 

    if (!email || !password) { setError('Introduce email y contraseña.'); setCargando(false); return; } 

    if (!esLogin) { 
      if (!nombre || !apellidos || !edad || !nacionalidad || !provincia || !sexo) { 
        setError('Rellena todos los campos.'); setCargando(false); return; 
      } 
      if (password !== password2) { setError('Las contraseñas no coinciden.'); setCargando(false); return; } 

      const { data, error } = await supabase.auth.signUp({ 
        email, password, 
        options: {  
          emailRedirectTo: `${window.location.origin}/auth/callback`, 
          data: { nombre, apellidos, edad: Number(edad), nacionalidad, provincia, sexo, motivo_cambio: motivoCambio || null } 
        }, 
      }); 

      if (error) { setError(traducirErrorSupabase(error.message)); setCargando(false); return; } 

      try { 
        await fetch('/api/notify', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ email, nombre }), 
        }); 
      } catch (err) { console.error(err); } 

      if (data.session) { window.location.href = '/perfil'; return; } 
      setError('¡FORJA ACTIVADA! Revisa tu email.'); 
      setEsLogin(true); setCargando(false); return; 
    } 

    const { error } = await supabase.auth.signInWithPassword({ email, password }); 
    if (error) { setError(traducirErrorSupabase(error.message)); setCargando(false); return; } 
    window.location.href = '/perfil'; 
  }; 

  const manejarAccesoOferta = () => {
    if (autorizado) {
      window.location.href = '/perfil';
    } else {
      setEsLogin(false);
      setMostrarLogin(true);
    }
  };

  return ( 
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 font-sans"> 
      
      <nav className="w-full max-w-7xl flex justify-between items-center py-6 z-50"> 
        <div className="flex gap-6 italic"> 
          <a href="https://discord.gg/q2rtc8PX" target="_blank" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">Discord</a> 
          <a href="https://www.tiktok.com/@mastesto" target="_blank" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">TikTok</a> 
          <Link href="/nosotros" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all underline decoration-zinc-800 underline-offset-4">
            Conócenos más
          </Link>
        </div> 
        <div className="flex gap-4"> 
          {autorizado ? ( 
            <Link href="/perfil" className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter hover:scale-105 transition-all">Panel Operativo</Link> 
          ) : ( 
            <> 
              <button onClick={() => { setEsLogin(true); setMostrarLogin(true); }} className="text-[9px] font-black uppercase text-zinc-400 hover:text-white">Sign In</button> 
              <button onClick={() => { setEsLogin(false); setMostrarLogin(true); }} className="bg-orange-600 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20">Alistarse</button> 
            </> 
          )} 
        </div> 
      </nav> 

      <main className="max-w-6xl w-full flex flex-col items-center py-12 z-10 text-center"> 
        <ContadorSocios total={totalSocios} /> 

        <div className="relative group mb-12"> 
          <div className="absolute -inset-4 bg-orange-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div> 
          <img src="/logoweb.jpeg" alt="Logo" className="relative w-[500px] md:w-[700px] mx-auto rounded-3xl border border-zinc-900 shadow-2xl transition-all duration-700 hover:border-zinc-700" /> 
        </div> 

        <OfertaFlash alistarse={manejarAccesoOferta} />

        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.4em] max-w-md italic mb-10 leading-loose"> 
          Forjando la <span className="text-white">disciplina absoluta</span>. <br/>Ingeniería de rendimiento humano. 
        </p> 

        <GuiaInstalacion /> 

        <footer className="mt-20 opacity-20"> 
          <p className="text-white text-[7px] font-black uppercase tracking-[1em]">Mastesto Engineering Protocol • 2026</p> 
        </footer> 
      </main> 

      {mostrarLogin && ( 
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"> 
          <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-900 w-full max-w-md relative max-h-[90vh] overflow-y-auto custom-scrollbar"> 
            <button onClick={() => setMostrarLogin(false)} className="absolute top-6 right-6 text-[8px] font-black uppercase text-zinc-600 hover:text-white">Cerrar</button> 
            
            <div className="text-center mb-8"> 
              <h2 className="text-lg font-black uppercase tracking-[0.2em] mb-2">{esLogin ? 'Identificación' : 'Alistamiento'}</h2> 
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest italic">{esLogin ? 'Acceso al Sistema' : 'Nuevo Operativo'}</p> 
            </div> 

            <button onClick={handleGoogleLogin} disabled={cargando} className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase hover:bg-zinc-200 transition-all mb-6"> 
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-3 h-3" /> 
              Google Sync
            </button> 

            <form onSubmit={handleAuth} className="space-y-4"> 
              <input type="email" placeholder="EMAIL" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase focus:border-orange-600 outline-none transition-all placeholder:text-zinc-700" /> 
               
              {!esLogin && ( 
                <> 
                  <div className="grid grid-cols-2 gap-4"> 
                    <input type="text" placeholder="NOMBRE" value={nombre} onChange={(e)=>setNombre(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none focus:border-zinc-600 transition-all" /> 
                    <input type="text" placeholder="APELLIDOS" value={apellidos} onChange={(e)=>setApellidos(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none focus:border-zinc-600 transition-all" /> 
                  </div> 
                  <div className="grid grid-cols-2 gap-4"> 
                    <input type="number" placeholder="EDAD" value={edad} onChange={(e)=>setEdad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] outline-none focus:border-zinc-600" /> 
                    <select value={sexo} onChange={(e)=>setSexo(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none focus:border-zinc-600 text-zinc-400"> 
                      <option value="">SEXO</option><option value="hombre">Hombre</option><option value="mujer">Mujer</option><option value="otro">Otro</option> 
                    </select> 
                  </div> 
                  <input type="text" placeholder="NACIONALIDAD" value={nacionalidad} onChange={(e)=>setNacionalidad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none" /> 
                  <input type="text" placeholder="PROVINCIA" value={provincia} onChange={(e)=>setProvincia(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none" /> 
                </> 
              )} 

              <input type="password" placeholder="CONTRASEÑA" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700" /> 
               
              {!esLogin && ( 
                <> 
                  <input type="password" placeholder="CONFIRMAR" value={password2} onChange={(e)=>setPassword2(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] outline-none focus:border-zinc-600" /> 
                  <textarea placeholder="OBJETIVO" value={motivoCambio} onChange={(e)=>setMotivoCambio(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] uppercase outline-none min-h-[80px] resize-none" /> 
                </> 
              )} 

              {error && <p className="text-[9px] text-red-500 text-center font-black uppercase tracking-tighter">{error}</p>} 

              <button type="submit" disabled={cargando} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"> 
                {cargando ? 'Cargando...' : esLogin ? 'Entrar' : 'Registrar'} 
              </button> 
            </form> 

            <p className="text-center mt-8 text-[9px] text-zinc-600 uppercase font-bold"> 
              {esLogin ? '¿No tienes cuenta?' : '¿Ya eres operativo?'} 
              <button onClick={() => { setEsLogin(!esLogin); setError(''); }} className="ml-2 text-white hover:text-orange-600 transition-colors underline underline-offset-4"> 
                {esLogin ? 'Registrarse' : 'Identificarse'} 
              </button> 
            </p> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}
