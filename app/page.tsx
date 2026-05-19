'use client'; 

import { useState, useEffect, useMemo } from 'react'; 
import Link from 'next/link'; 
import { createBrowserClient } from '@supabase/ssr'; 

// --- CONFIGURACIÓN GLOBAL: FECHA DE FINALIZACIÓN FIJA ---
const FECHA_OBJETIVO = new Date('2026-05-22T23:59:59').getTime();

// --- NUEVO: COMPONENTE DE MÓDULOS (MUESTRA EL PRODUCTO REAL) ---
function ModulosSistema() {
  const modulos = [
    { titulo: 'Tracker de Bio-Rendimiento', desc: 'Control de disciplina y hábitos diarios en tiempo real.' },
    { titulo: 'Protocolo Anti-Tabaco', desc: 'Reloj de desintoxicación y seguimiento de ahorro.' },
    { titulo: 'Leaderboard de Operativos', desc: 'Ranking global basado en puntos de voluntad.' }
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

// --- NUEVO: MURO DE REPORTES (PRUEBA SOCIAL REAL) ---
function MuroComentarios({ autorizado, nombreUsuario, supabase }: { autorizado: boolean, nombreUsuario: string, supabase: any }) {
  const [comentarios, setComentarios] = useState<{nombre: string, mensaje: string}[]>([]);
  const [nuevoMsg, setNuevoMsg] = useState('');

  useEffect(() => {
    const leerComentarios = async () => {
      const { data } = await supabase.from('comentarios').select('*').order('created_at', { ascending: false }).limit(4);
      if (data) setComentarios(data);
    };
    leerComentarios();
  }, [supabase]);

  const enviarComentario = async () => {
    if (!nuevoMsg) return;
    await supabase.from('comentarios').insert([{ nombre: nombreUsuario, mensaje: nuevoMsg }]);
    setComentarios([{ nombre: nombreUsuario, mensaje: nuevoMsg }, ...comentarios]);
    setNuevoMsg('');
  };

  return (
    <div className="w-full max-w-2xl mt-24 pt-12 border-t border-zinc-900 px-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 italic text-center">Registro de Actividad Operativa</h3>
      
      {autorizado ? (
        <div className="flex gap-2 mb-12">
          <input value={nuevoMsg} onChange={(e) => setNuevoMsg(e.target.value)} placeholder="INFORME DE PROGRESO..." className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-[10px] uppercase outline-none focus:border-orange-600" />
          <button onClick={enviarComentario} className="bg-white text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase">Enviar</button>
        </div>
      ) : (
        <p className="text-[8px] text-zinc-700 uppercase mb-12 tracking-[0.2em] italic text-center">Debes estar alistado para emitir reportes.</p>
      )}

      <div className="grid gap-6">
        {comentarios.map((c, i) => (
          <div key={i} className="text-left border-l border-zinc-800 pl-6">
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">@{c.nombre}</span>
            <p className="text-[11px] text-zinc-400 italic uppercase mt-1">"{c.mensaje}"</p>
          </div>
        ))}
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
    <div className="w-full max-w-4xl mx-auto mb-16 p-[1px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-[2.5rem] shadow-[0_0_50px_-10px_rgba(234,88,12,0.2)]">
      <div className="bg-black rounded-[2.45rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-[0.05] font-black text-8xl italic -z-10 text-white tracking-tighter">70% OFF</div>
        
        <div className="text-left space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"></span>
            <h3 className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] italic">Despliegue de Fase Inicial</h3>
          </div>
          <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">Acceso Total al Sistema</p>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex flex-col">
              <span className="text-zinc-600 line-through text-[10px] font-bold">29,99€</span>
              <span className="text-4xl font-black text-white italic tracking-tighter leading-none">8,99€</span>
            </div>
            <div className="h-10 w-[1px] bg-zinc-900 mx-2"></div>
            <button onClick={alistarse} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40">
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
        ⚡ Protocolo de Instalación en Dispositivo Mobile
      </h2> 
      <div className="grid md:grid-cols-2 gap-16 text-left relative z-10"> 
        <div className="space-y-6"> 
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-4"> 
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">🍎</span> 
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">iOS (Safari)</h3> 
          </div> 
          <ul className="space-y-4 text-[9px] text-zinc-500 uppercase font-bold italic"> 
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">01</span><span>Abre <strong className="text-zinc-200 text-[10px]">mastesto.es</strong></span></li> 
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
            <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">01</span><span>Entra desde <strong className="text-zinc-200 text-[10px]">Chrome</strong></span></li> 
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
  const [nombre, setNombre] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(''); 
  const [cargando, setCargando] = useState(false); 

  useEffect(() => { 
    const fetchData = async () => { 
      const { data: { session } } = await supabase.auth.getSession(); 
      if (session) {
        setAutorizado(true);
        setNombre(session.user.user_metadata.nombre || 'Operativo');
      } 
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }); 
      if (count) setTotalSocios(count); 
    }; 
    fetchData(); 
  }, [supabase]); 

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setCargando(true);
    // ... tu lógica de auth existente ...
    // Asegúrate de guardar el 'nombre' en user_metadata para el muro de comentarios
  };

  const manejarAccesoOferta = () => {
    if (autorizado) { window.location.href = '/perfil'; } 
    else { setEsLogin(false); setMostrarLogin(true); }
  };

  return ( 
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 font-sans"> 
      
      <nav className="w-full max-w-7xl flex justify-between items-center py-6 z-50"> 
        <div className="flex gap-6 italic"> 
          <a href="#" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">Discord</a> 
          <a href="#" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">TikTok</a> 
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

        <div className="relative group mb-16 px-4"> 
          <div className="absolute -inset-4 bg-orange-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div> 
          <img src="/logoweb.jpeg" alt="Logo" className="relative w-full max-w-3xl mx-auto rounded-[3rem] border border-zinc-900 shadow-2xl transition-all duration-700 hover:border-zinc-700" /> 
        </div> 

        <OfertaFlash alistarse={manejarAccesoOferta} />

        {/* --- NUEVA SECCIÓN DE MÓDULOS --- */}
        <ModulosSistema />

        <div className="flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity mb-20">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Pagos Cifrados y Seguros vía</span>
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 invert" />
        </div>

        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.4em] max-w-md italic mb-10 leading-loose"> 
          Forjando la <span className="text-white font-black">disciplina absoluta</span>. <br/>Ingeniería de rendimiento humano supervisada. 
        </p> 

        <GuiaInstalacion /> 

        {/* --- NUEVO: MURO DE COMENTARIOS --- */}
        <MuroComentarios autorizado={autorizado} nombreUsuario={nombre} supabase={supabase} />

        <footer className="mt-32 w-full max-w-2xl py-12 border-t border-zinc-950/50 flex flex-col items-center gap-6"> 
          <div className="flex gap-8 text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">
            <Link href="#" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Soporte</Link>
          </div>
          <p className="text-white text-[7px] font-black uppercase tracking-[1em] opacity-20">Mastesto Engineering Protocol • 2026</p> 
        </footer> 
      </main> 

      {/* --- EL MODAL DE LOGIN SE MANTIENE IGUAL QUE EN TU CÓDIGO --- */}
      {mostrarLogin && (
         <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
             {/* Tu código de modal de login actual */}
         </div>
      )}
    </div> 
  ); 
}
