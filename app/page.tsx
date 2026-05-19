'use client'; 

import { useState, useEffect, useMemo } from 'react'; 
import Link from 'next/link'; 
import { createBrowserClient } from '@supabase/ssr'; 

// --- CONFIGURACIÓN GLOBAL: FECHA DE FINALIZACIÓN FIJA ---
const FECHA_OBJETIVO = new Date('2026-05-22T23:59:59').getTime();

// --- COMPONENTE DE MÓDULOS (DA VALOR REAL AL PRODUCTO) ---
function ModulosSistema() {
  const modulos = [
    { titulo: 'Tracker de Bio-Rendimiento', desc: 'Control de disciplina y hábitos diarios en tiempo real.' },
    { titulo: 'Protocolo Anti-Tabaco', desc: 'Reloj de desintoxicación y seguimiento de ahorro.' },
    { titulo: 'Ranking de Operativos', desc: 'Leaderboard global basado en puntos de voluntad.' }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl mb-16 px-4">
      {modulos.map((m, i) => (
        <div key={i} className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-[2rem] text-left hover:border-orange-600/40 transition-all group">
          <div className="h-[2px] w-6 bg-orange-600 mb-4 group-hover:w-full transition-all duration-700"></div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">{m.titulo}</h4>
          <p className="text-[9px] text-zinc-500 uppercase italic leading-relaxed">{m.desc}</p>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENTE: SECCIÓN DE COMENTARIOS (MURO DE FRECUENCIAS) ---
function SeccionComentarios({ supabase }: { supabase: any }) {
  const [user, setUser] = useState<any>(null);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const misComentariosCount = useMemo(() => {
    if (!user) return 0;
    return comentarios.filter(c => c.user_id === user.id).length;
  }, [comentarios, user]);

  useEffect(() => {
    // Corregido el tipado explícito aquí para evitar el error de compilación en el build
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (data?.user) setUser(data.user);
    });

    const fetchComentarios = async () => {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setComentarios(data);
      setLoading(false);
    };

    fetchComentarios();

    const canal = supabase
      .channel('cambios_comentarios')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comentarios' }, (payload: any) => {
        setComentarios((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase]);

  const enviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nuevoComentario.trim() || misComentariosCount >= 3 || enviando) return;

    setEnviando(true);
    const meta = user.user_metadata;

    const { error } = await supabase.from('comentarios').insert([
      {
        user_id: user.id,
        alias: meta?.alias || 'SOCIO ANÓNIMO',
        contenido: nuevoComentario.trim(),
        color_acento: meta?.color_acento || '#ea580c'
      }
    ]);

    if (!error) {
      setNuevoComentario('');
    }
    setEnviando(false);
  };

  if (loading) return <div className="text-[10px] font-black text-center text-zinc-700 uppercase italic animate-pulse my-10">Sincronizando feed de la comunidad...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 px-4 text-white bg-black">
      <div className="border border-zinc-900 bg-zinc-950/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-600/30 to-transparent" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1 italic">Muro de Frecuencias</h2>
            <p className="text-[8px] text-zinc-600 uppercase font-bold italic">Reportes directos de los operativos en la brecha</p>
          </div>
          {user && (
            <div className="bg-black/50 border border-zinc-900 px-4 py-2 rounded-xl text-[8px] font-mono font-black uppercase tracking-widest text-zinc-400">
              Tus transmisiones: <span className={misComentariosCount >= 3 ? "text-red-500" : "text-orange-500"}>{misComentariosCount}/3</span>
            </div>
          )}
        </div>

        {user ? (
          misComentariosCount < 3 ? (
            <form onSubmit={enviarComentario} className="mb-10 space-y-3">
              <div className="relative">
                <textarea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  maxLength={500}
                  placeholder="DEJA TU REPORTE DE DISCIPLINA O LOGRO AQUÍ... (MÁX 500 CARACTERES)"
                  className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-700 h-24 resize-none transition-all placeholder:text-zinc-700"
                />
                <span className="absolute bottom-4 right-4 text-[7px] font-mono text-zinc-600">
                  {nuevoComentario.length}/500
                </span>
              </div>
              <button
                type="submit"
                disabled={enviando || !nuevoComentario.trim()}
                className="w-full py-4 rounded-xl font-black text-[9px] bg-white text-black uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-20"
              >
                {enviando ? 'TRANSMITIENDO...' : 'FIJAR MENSAJE EN EL MURO'}
              </button>
            </form>
          ) : (
            <div className="mb-10 p-5 border border-red-950 bg-red-950/10 rounded-2xl text-center">
              <p className="text-[8px] font-black tracking-widest uppercase text-red-500 italic">
                ⚠️ CUOTA DE TRANSMISIÓN MÁXIMA ALCANZADA (3/3). TUS ENLACES ESTÁN BLINDADOS.
              </p>
            </div>
          )
        ) : (
          <div className="mb-10 p-5 border border-zinc-900 bg-black/40 rounded-2xl text-center italic">
            <p className="text-[8px] font-black tracking-widest uppercase text-zinc-500">
              Inicia sesión o accede al área de socios para transmitir en la frecuencia principal.
            </p>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {comentarios.length > 0 ? (
            comentarios.map((comentario) => (
              <div 
                key={comentario.id}
                className="p-5 rounded-2xl border bg-black/30 transition-all duration-300 group hover:bg-black/60"
                style={{ borderColor: `${comentario.color_acento}15` }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-[9px] font-black uppercase tracking-wider italic"
                    style={{ color: comentario.color_acento }}
                  >
                    @{comentario.alias}
                  </span>
                  <span className="text-[7px] font-mono text-zinc-600">
                    {new Date(comentario.created_at).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 font-medium leading-relaxed uppercase break-words">
                  {comentario.contenido}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[8px] text-zinc-700 text-center uppercase font-black italic py-10">
              Silencio en la frecuencia. Sé el primero en reportar...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: OFERTA FLASH TÁCTICA --- 
function OfertaFlash({ alistarse }: { alistarse: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const distancia = FECHA_OBJETIVO - ahora;
      if (distancia < 0) { setVisible(false); return; }
      setTimeLeft({
        days: Math.floor(distancia / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distancia % (1000 * 60)) / 1000),
      });
    };
    calcularTiempo();
    const timer = setInterval(calcularTiempo, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 p-[1px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-[2.5rem] shadow-[0_0_50px_-10px_rgba(234,88,12,0.3)]">
      <div className="bg-black rounded-[2.45rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-[0.05] font-black text-8xl italic -z-10 text-white tracking-tighter">70% OFF</div>
        <div className="text-left space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></span>
            <h3 className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] italic">Venta de Despliegue Inicial</h3>
          </div>
          <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">Protocolo de Acceso Total</p>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex flex-col">
              <span className="text-zinc-600 line-through text-[10px] font-bold">29,99€</span>
              <span className="text-4xl font-black text-white italic tracking-tighter leading-none">8,99€</span>
            </div>
            <div className="h-10 w-[1px] bg-zinc-900 mx-2"></div>
            <button onClick={alistarse} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
              Obtener Acceso
            </button>
          </div>
        </div>
        <div className="flex gap-2 z-10">
          {[
            { label: 'DÍAS', val: timeLeft.days },
            { label: 'HRS', val: timeLeft.hours },
            { label: 'MIN', val: timeLeft.minutes },
            { label: 'SEG', val: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center bg-zinc-950/80 border border-zinc-900 w-14 py-4 rounded-[1.2rem] backdrop-blur-sm">
              <span className="text-xl font-black italic text-white tracking-tighter">{String(item.val).padStart(2, '0')}</span>
              <span className="text-[6px] font-black text-zinc-600 tracking-[0.2em] mt-1">{item.label}</span>
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
    <div className="flex flex-col items-center space-y-2 mb-10 text-center"> 
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
    </div> 
  ); 
} 

// --- COMPONENTE: GUÍA DE INSTALACIÓN --- 
function GuiaInstalacion() { 
  return ( 
    <div className="w-full max-w-4xl mx-auto mt-20 mb-10 p-10 bg-zinc-950 border border-zinc-900 rounded-[3rem] relative overflow-hidden group shadow-2xl"> 
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" /> 
      <h2 className="text-[9px] font-black uppercase tracking-[0.5em] mb-12 text-orange-600 italic text-center text-zinc-500"> 
        ⚡ Protocolo de Instalación Mobile
      </h2> 
      <div className="grid md:grid-cols-2 gap-16 text-left relative z-10"> 
        <div className="space-y-6"> 
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-4"> 
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">🍎</span> 
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">iOS (Safari)</h3> 
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
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">Android (Chrome)</h3> 
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

  // ESTADO DEL FORMULARIO COMPLETO
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
  }, [supabase]); 

  const handleGoogleLogin = async () => { 
    setError(''); setCargando(true); 
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: `${window.location.origin}/auth/callback` }, 
    }); 
    if (error) { setError(error.message); setCargando(false); } 
  }; 

  const handleAuth = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setError(''); setCargando(true); 

    if (!esLogin) { 
      if (password !== password2) { setError('Las contraseñas no coinciden.'); setCargando(false); return; } 
      const { error } = await supabase.auth.signUp({ 
        email, password, 
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback`, 
          data: { nombre, apellidos, edad: Number(edad), nacionalidad, provincia, sexo, motivo_cambio: motivoCambio || null } 
        }, 
      }); 
      if (error) { setError(error.message); setCargando(false); return; } 
      setEsLogin(true); setCargando(false); 
      alert('¡Forja activada! Revisa tu email.');
    } else { 
      const { error } = await supabase.auth.signInWithPassword({ email, password }); 
      if (error) { setError(error.message); setCargando(false); return; } 
      window.location.href = '/perfil'; 
    } 
  }; 

  return ( 
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 font-sans"> 
      
      <nav className="w-full max-w-7xl flex justify-between items-center py-6 z-50"> 
        <div className="flex gap-6 italic items-center"> 
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
              <button onClick={() => { setEsLogin(false); setMostrarLogin(true); }} className="bg-orange-600 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-orange-500 transition-all">Alistarse</button> 
            </> 
          )} 
        </div> 
      </nav> 

      <main className="max-w-6xl w-full flex flex-col items-center py-12 z-10 text-center"> 
        <ContadorSocios total={totalSocios} /> 

        <div className="relative group mb-16 px-4"> 
          <img src="/logoweb.jpeg" alt="Logo" className="relative w-full max-w-3xl mx-auto rounded-[3rem] border border-zinc-900 shadow-2xl transition-all duration-700" /> 
        </div> 

        <OfertaFlash alistarse={() => { setEsLogin(false); setMostrarLogin(true); }} />

        <ModulosSistema />

        {/* --- SECCIÓN DE COMENTARIOS SIN ALTERAR COMPONENTES PREVIOS --- */}
        <SeccionComentarios supabase={supabase} />

        <div className="flex flex-col items-center gap-4 opacity-40 mb-20">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">Pagos Seguros vía</span>
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 invert" />
        </div>

        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.4em] max-w-md italic mb-10 leading-loose"> 
          Forjando la <span className="text-white">disciplina absoluta</span>. <br/>Ingeniería de rendimiento humano. 
        </p> 

        <GuiaInstalacion /> 

        <footer className="mt-20 py-10 opacity-20"> 
          <p className="text-white text-[7px] font-black uppercase tracking-[1em]">Mastesto Engineering Protocol • 2026</p> 
        </footer> 
      </main> 

      {/* --- MODAL DE LOGIN/REGISTRO COMPLETO --- */}
      {mostrarLogin && ( 
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"> 
          <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-900 w-full max-w-md relative max-h-[90vh] overflow-y-auto custom-scrollbar"> 
            <button onClick={() => setMostrarLogin(false)} className="absolute top-6 right-6 text-[8px] font-black uppercase text-zinc-600">Cerrar</button> 
            
            <div className="text-center mb-8"> 
              <h2 className="text-lg font-black uppercase tracking-[0.2em] mb-2">{esLogin ? 'Identificación' : 'Alistamiento'}</h2> 
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest italic">{esLogin ? 'Acceso al Sistema' : 'Nuevo Operativo'}</p> 
            </div> 

            <button onClick={handleGoogleLogin} disabled={cargando} className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase mb-6"> 
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-3 h-3" /> 
              Google Sync
            </button> 

            <form onSubmit={handleAuth} className="space-y-4"> 
              <input type="email" placeholder="EMAIL" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] outline-none" /> 
               
              {!esLogin && ( 
                <> 
                  <div className="grid grid-cols-2 gap-4"> 
                    <input type="text" placeholder="NOMBRE" value={nombre} onChange={(e)=>setNombre(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                    <input type="text" placeholder="APELLIDOS" value={apellidos} onChange={(e)=>setApellidos(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                  </div> 
                  <div className="grid grid-cols-2 gap-4"> 
                    <input type="number" placeholder="EDAD" value={edad} onChange={(e)=>setEdad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                    <select value={sexo} onChange={(e)=>setSexo(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-400"> 
                      <option value="">SEXO</option><option value="hombre">Hombre</option><option value="mujer">Mujer</option><option value="otro">Otro</option> 
                    </select> 
                  </div> 
                  <input type="text" placeholder="NACIONALIDAD" value={nacionalidad} onChange={(e)=>setNacionalidad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                  <input type="text" placeholder="PROVINCIA" value={provincia} onChange={(e)=>setProvincia(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                </> 
              )} 

              <input type="password" placeholder="CONTRASEÑA" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
               
              {!esLogin && ( 
                <> 
                  <input type="password" placeholder="CONFIRMAR" value={password2} onChange={(e)=>setPassword2(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px]" /> 
                  <textarea placeholder="OBJETIVO" value={motivoCambio} onChange={(e)=>setMotivoCambio(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] min-h-[80px]" /> 
                </> 
              )} 

              {error && <p className="text-[9px] text-red-500 text-center uppercase font-black">{error}</p>} 

              <button type="submit" disabled={cargando} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all"> 
                {cargando ? 'Cargando...' : esLogin ? 'Entrar' : 'Registrar'} 
              </button> 
            </form> 

            <p className="text-center mt-8 text-[9px] text-zinc-600 uppercase font-bold"> 
              {esLogin ? '¿No tienes cuenta?' : '¿Ya eres operativo?'} 
              <button onClick={() => setEsLogin(!esLogin)} className="ml-2 text-white hover:text-orange-600 underline"> 
                {esLogin ? 'Registrarse' : 'Identificarse'} 
              </button> 
            </p> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}
