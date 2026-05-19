'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// --- CONFIGURACIÓN GLOBAL: FECHA DE FINALIZACIÓN FIJA ---
const FECHA_OBJETIVO = new Date('2026-05-22T23:59:59').getTime();
const CODIGO_PROMOCIONAL = 'FORJA70';

// --- COMPONENTE: FONDO PROFESIONAL ---
function FondoMastesto() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(to_bottom,#030303,#000000_42%,#050505)]" />
      <div className="absolute left-1/2 top-0 h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-[130px]" />
      <div className="absolute right-[-10%] top-[25%] h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[110px]" />
      <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

// --- COMPONENTE: MÚLTIPLES FRENTES ---
function ModulosSistema() {
  const modulos = [
    {
      num: '01',
      icono: '📈',
      titulo: 'Tracker de Bio-Rendimiento',
      desc: 'Control de disciplina, hábitos y avance personal desde un panel limpio y directo.',
    },
    {
      num: '02',
      icono: '🚭',
      titulo: 'Protocolo Anti-Tabaco',
      desc: 'Reloj de desintoxicación, ahorro estimado e hitos de recuperación para no abandonar.',
    },
    {
      num: '03',
      icono: '🥩',
      titulo: 'Dietas Personalizadas',
      desc: 'Planes de alimentación enfocados en rendimiento, constancia y transformación real.',
    },
    {
      num: '04',
      icono: '🏋️',
      titulo: 'Rutinas de Entrenamiento',
      desc: 'Estructura semanal para entrenar con cabeza, progresar y dejar de improvisar.',
    },
    {
      num: '05',
      icono: '🏆',
      titulo: 'Ranking de Operativos',
      desc: 'Leaderboard global para convertir la constancia en competición sana y visible.',
    },
  ];

  return (
    <section id="sistema" className="w-full max-w-6xl mx-auto px-4 mb-20 scroll-mt-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic mb-3">
            Múltiples frentes
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            No es motivación.<br />Es estructura.
          </h2>
        </div>
        <p className="max-w-md text-left md:text-right text-xs md:text-sm text-zinc-500 uppercase font-bold leading-relaxed italic">
          Disciplina, hábitos, dieta, entrenamiento, comunidad y seguimiento. Todo diseñado para que vuelvas y te foguees cada día.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {modulos.map((m) => (
          <div
            key={m.num}
            className="relative overflow-hidden bg-zinc-950/70 border border-zinc-900 p-6 rounded-[2rem] text-left hover:border-orange-600/50 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-600/10 blur-2xl group-hover:bg-orange-600/20 transition-all" />
            <div className="flex items-center justify-between mb-7">
              <span className="text-[10px] font-black text-orange-500 tracking-widest">{m.num}</span>
              <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{m.icono}</span>
            </div>
            <h4 className="text-[12px] font-black uppercase tracking-widest text-white mb-3 leading-tight">
              {m.titulo}
            </h4>
            <p className="text-[10px] text-zinc-500 uppercase italic leading-relaxed">
              {m.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- COMPONENTE: MURO DE FRECUENCIAS ---
function SeccionReportes({ supabase }: { supabase: any }) {
  const [user, setUser] = useState<any>(null);
  const [reportes, setReportes] = useState<any[]>([]);
  const [nuevoReporte, setNuevoReporte] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const misReportesCount = useMemo(() => {
    if (!user) return 0;
    return reportes.filter((r) => r.user_id === user.id).length;
  }, [reportes, user]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (data?.user) setUser(data.user);
    });

    const fetchReportes = async () => {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setReportes(data);
      setLoading(false);
    };

    fetchReportes();

    const canal = supabase
      .channel('cambios_reportes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comentarios' }, (payload: any) => {
        setReportes((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase]);

  const enviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nuevoReporte.trim() || misReportesCount >= 3 || enviando) return;

    setEnviando(true);
    const meta = user.user_metadata;
    const aliasOperativo = meta?.alias || meta?.given_name || meta?.full_name?.split(' ')[0] || 'OPERATIVO';

    const { error } = await supabase.from('comentarios').insert([
      {
        user_id: user.id,
        alias: aliasOperativo.toUpperCase(),
        contenido: nuevoReporte.trim(),
        color_acento: meta?.color_acento || '#ea580c',
      },
    ]);

    if (!error) setNuevoReporte('');
    setEnviando(false);
  };

  if (loading) {
    return (
      <div className="text-[10px] font-black text-center text-zinc-700 uppercase italic animate-pulse my-10">
        Sincronizando feed de la comunidad...
      </div>
    );
  }

  return (
    <section id="comunidad" className="w-full max-w-6xl mx-auto mb-20 px-4 text-white scroll-mt-28">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-4 items-stretch">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-600/25 bg-black/60 p-8 text-left shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(234,88,12,0.22),transparent_28%),radial-gradient(circle_at_80%_85%,rgba(234,88,12,0.12),transparent_30%)]" />
          <div className="absolute bottom-[-70px] left-[-50px] h-44 w-44 rounded-full bg-orange-600/20 blur-[60px]" />
          <div className="absolute right-6 top-6 text-5xl opacity-20">🔥</div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-4 italic">
              Muro de Frecuencias
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-5">
              Aquí se viene<br />a reportar.
            </h2>
            <p className="text-xs text-zinc-400 uppercase font-bold leading-relaxed italic mb-8">
              Logros, caídas, victorias y fuego real de la comunidad. Nada de postureo. Máximo 3 reportes por operativo.
            </p>
            <ul className="space-y-4 text-[10px] uppercase font-black tracking-widest text-zinc-400">
              <li className="flex gap-3"><span className="text-orange-500">🔥</span> Reportes reales</li>
              <li className="flex gap-3"><span className="text-orange-500">⚔️</span> Comunidad en la brecha</li>
              <li className="flex gap-3"><span className="text-orange-500">🧱</span> Disciplina visible</li>
            </ul>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-950/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-600/60 to-transparent" />
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-orange-600/8 blur-3xl" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-2 italic">
                Frecuencia Principal
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold italic tracking-widest">
                Reportes directos de los operativos.
              </p>
            </div>
            {user && (
              <div className="bg-black/70 border border-zinc-900 px-5 py-3 rounded-2xl text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
                Tus reportes: <span className={misReportesCount >= 3 ? 'text-red-500' : 'text-orange-500'}>{misReportesCount}/3</span>
              </div>
            )}
          </div>

          {user ? (
            misReportesCount < 3 ? (
              <form onSubmit={enviarReporte} className="mb-8 space-y-3 relative z-10">
                <div className="relative">
                  <textarea
                    value={nuevoReporte}
                    onChange={(e) => setNuevoReporte(e.target.value)}
                    maxLength={500}
                    placeholder="DEJA TU REPORTE DE DISCIPLINA O LOGRO AQUÍ... (MÁX 500 CARACTERES)"
                    className="w-full bg-black/70 border border-zinc-900 p-5 rounded-2xl text-[11px] uppercase font-bold text-white outline-none focus:border-orange-600/60 h-28 resize-none transition-all placeholder:text-zinc-700"
                  />
                  <span className="absolute bottom-4 right-4 text-[7px] font-mono text-zinc-600">
                    {nuevoReporte.length}/500
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={enviando || !nuevoReporte.trim()}
                  className="w-full py-4 rounded-xl font-black text-[10px] bg-white text-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-20"
                >
                  {enviando ? 'TRANSMITIENDO REPORTE...' : 'FIJAR REPORTE EN EL MURO'}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-5 border border-red-950 bg-red-950/10 rounded-2xl text-center relative z-10">
                <p className="text-[8px] font-black tracking-widest uppercase text-red-500 italic">
                  ⚠️ LÍMITE DE REPORTES ALCANZADO (3/3). TUS TRANSMISIONES ESTÁN BLINDADAS.
                </p>
              </div>
            )
          ) : (
            <div className="mb-8 p-5 border border-zinc-900 bg-black/50 rounded-2xl text-center italic relative z-10">
              <p className="text-[8px] font-black tracking-widest uppercase text-zinc-500">
                Inicia sesión o accede al área de socios para transmitir tu reporte en la frecuencia principal.
              </p>
            </div>
          )}

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {reportes.length > 0 ? (
              reportes.map((reporte) => (
                <div
                  key={reporte.id}
                  className="p-5 rounded-2xl border bg-black/40 transition-all duration-300 group hover:bg-black/70 hover:translate-x-1"
                  style={{ borderColor: `${reporte.color_acento}22` }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider italic"
                      style={{ color: reporte.color_acento }}
                    >
                      @{reporte.alias}
                    </span>
                    <span className="text-[7px] font-mono text-zinc-600">
                      {new Date(reporte.created_at).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-medium leading-relaxed uppercase break-words">
                    {reporte.contenido}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[8px] text-zinc-700 text-center uppercase font-black italic py-10">
                Silencio en la frecuencia. Sé el primer operativo en reportar...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
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
      if (distancia < 0) {
        setVisible(false);
        return;
      }
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
    <section id="precios" className="w-full max-w-6xl mx-auto mb-20 px-4 scroll-mt-28">
      <div className="p-[1px] bg-gradient-to-r from-orange-700 via-orange-400 to-orange-700 rounded-[2.5rem] shadow-[0_0_70px_-20px_rgba(234,88,12,0.55)]">
        <div className="bg-black rounded-[2.45rem] p-7 md:p-9 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden border border-orange-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-black text-8xl md:text-9xl italic text-white tracking-tighter">
            70% OFF
          </div>
          <div className="absolute bottom-[-90px] right-[10%] h-56 w-56 rounded-full bg-orange-600/15 blur-[70px]" />

          <div className="text-left space-y-4 z-10 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
              <h3 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
                Código promocional activo
              </h3>
            </div>
            <p className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Acceso total.<br />Precio de fundador.
            </p>
            <p className="text-xs text-zinc-500 uppercase font-bold max-w-lg leading-relaxed">
              Usa el código <span className="text-white">{CODIGO_PROMOCIONAL}</span>. Termina el 22 de mayo de 2026, el mismo día que cierra el despliegue inicial.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <div className="flex flex-col">
                <span className="text-zinc-600 line-through text-[11px] font-bold">29,99€</span>
                <span className="text-5xl font-black text-white italic tracking-tighter leading-none">8,99€</span>
              </div>
              <div className="rounded-2xl border border-orange-600/40 bg-orange-600/10 px-5 py-3">
                <p className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-1">Código</p>
                <p className="text-lg font-black text-orange-500 tracking-widest">{CODIGO_PROMOCIONAL}</p>
              </div>
              <button
                onClick={alistarse}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(234,88,12,0.25)]"
              >
                Obtener Acceso
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 z-10 w-full lg:w-auto">
            {[
              { label: 'DÍAS', val: timeLeft.days },
              { label: 'HRS', val: timeLeft.hours },
              { label: 'MIN', val: timeLeft.minutes },
              { label: 'SEG', val: timeLeft.seconds },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-zinc-950/90 border border-zinc-900 min-w-[64px] py-4 rounded-[1.3rem] backdrop-blur-sm"
              >
                <span className="text-2xl font-black italic text-white tracking-tighter">
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[6px] font-black text-zinc-600 tracking-[0.2em] mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- COMPONENTE: CONTADOR TÁCTICO ---
function ContadorSocios({ total }: { total: number }) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-zinc-900 bg-zinc-950/70 px-5 py-3 mb-8 shadow-2xl backdrop-blur-xl">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
      </span>
      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500 italic">
        Red Global
      </span>
      <span className="text-xl font-black italic tracking-tighter text-white">
        {total > 0 ? total.toLocaleString() : '---'}
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.25em] text-orange-600 italic">
        Alistados
      </span>
    </div>
  );
}

// --- COMPONENTE: GUÍA DE INSTALACIÓN ---
function GuiaInstalacion() {
  return (
    <section id="faq" className="w-full max-w-6xl mx-auto px-4 mt-8 mb-10 scroll-mt-28">
      <div className="p-8 md:p-10 bg-zinc-950/60 border border-zinc-900 rounded-[3rem] relative overflow-hidden group shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/30 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-3 text-orange-500 italic">
              App rápida
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
              Instálalo en tu móvil.
            </h2>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-bold italic max-w-md text-left md:text-right">
            Acceso directo desde pantalla de inicio para entrar cada día sin excusas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 text-left relative z-10">
          <div className="space-y-6 bg-black/35 border border-zinc-900 rounded-[2rem] p-6">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
              <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🍎</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">iOS (Safari)</h3>
            </div>
            <ul className="space-y-4 text-[9px] text-zinc-500 uppercase font-bold italic">
              <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">01</span><span>Abre <strong className="text-zinc-200">mastesto.es</strong></span></li>
              <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">02</span><span>Botón <strong className="text-zinc-200">COMPARTIR</strong></span></li>
              <li className="flex items-start gap-4"><span className="text-orange-600 font-black text-xs">03</span><span><strong className="text-zinc-200">AÑADIR A PANTALLA DE INICIO</strong></span></li>
            </ul>
          </div>

          <div className="space-y-6 bg-black/35 border border-zinc-900 rounded-[2rem] p-6">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
              <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🤖</span>
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
    </section>
  );
}
function ContadorSocial() {
  const [stats, setStats] = useState<any>({
    discord: { usuarios: null, activos: null },
    tiktok: { seguidores: null, likes: null },
  });

  useEffect(() => {

  const cargarDatos = () => {

    fetch("/api/social")
      .then((res)=>res.json())
      .then(setStats)
      .catch(console.error);

  };

  cargarDatos();

  const intervalo = setInterval(
    cargarDatos,
    15000
  );

  return () => clearInterval(intervalo);

}, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto lg:mx-0 mb-8">
      <a
        href="https://discord.gg/a7a3Skg2"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-zinc-950/70 border border-zinc-900 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl hover:border-[#5865F2] hover:scale-[1.02] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#5865F2] flex items-center justify-center text-3xl">
            🎮
          </div>

          <div className="text-left">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black text-zinc-500 mb-1">
              Discord
            </p>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">
                  {stats.discord.usuarios ?? '--'}
                </p>
                <p className="text-[8px] uppercase text-zinc-600 font-bold">
                  Total
                </p>
              </div>

              <div className="h-10 w-px bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-3xl font-black text-green-500">
                    {stats.discord.activos ?? '--'}
                  </p>
                </div>
                <p className="text-[8px] uppercase font-bold text-green-500">
                  Activos
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>

      <a
        href="https://www.tiktok.com/@mastesto"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-zinc-950/70 border border-zinc-900 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl hover:border-pink-500 hover:scale-[1.02] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 flex items-center justify-center text-3xl">
            🎵
          </div>

          <div className="text-left">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black text-zinc-500 mb-1">
              TikTok
            </p>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">
                  {stats.tiktok.seguidores ?? '--'}
                </p>
                <p className="text-[8px] uppercase text-zinc-600 font-bold">
                  Seguidores
                </p>
              </div>

              <div className="h-10 w-px bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
                  <p className="text-3xl font-black text-pink-500">
                    {stats.tiktok.likes ?? '--'}
                  </p>
                </div>
                <p className="text-[8px] uppercase font-bold text-pink-500">
                  Likes
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
export default function Page() {
  const [cookiesAceptadas, setCookiesAceptadas] = useState(false);

useEffect(() => {

  const aceptadas =
  localStorage.getItem(
    "mastesto-cookies"
  );

  if(aceptadas==="true"){
    setCookiesAceptadas(true);
  }

},[]);


const aceptarCookies=()=>{

  localStorage.setItem(
    "mastesto-cookies",
    "true"
  );

  setCookiesAceptadas(true);

};
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
  }, [supabase]);

  const abrirRegistro = () => {
    setEsLogin(false);
    setMostrarLogin(true);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setCargando(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setCargando(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!esLogin) {
      if (password !== password2) {
        setError('Las contraseñas no coinciden.');
        setCargando(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nombre,
            apellidos,
            edad: Number(edad),
            nacionalidad,
            provincia,
            sexo,
            motivo_cambio: motivoCambio || null,
          },
        },
      });

      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }

      setEsLogin(true);
      setCargando(false);
      alert('¡Forja activada! Revisa tu email.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }

      window.location.href = '/perfil';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 md:p-6 font-sans relative overflow-x-hidden selection:bg-orange-600 selection:text-white">
      <FondoMastesto />

      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-full border border-zinc-900 bg-black/75 backdrop-blur-2xl px-4 md:px-6 py-3 flex justify-between items-center shadow-2xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center text-black font-black shadow-[0_0_25px_rgba(234,88,12,0.35)] group-hover:scale-105 transition-all">
            M
          </div>
          <div className="hidden sm:block text-left leading-none">
            <p className="text-sm font-black tracking-tighter italic">MASTESTO</p>
            <p className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.25em]">Forge Protocol</p>
          </div>
        </Link>

        <div className="hidden md:flex gap-6 italic items-center">
          <Link href="/nosotros" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">
            Misión
          </Link>
          <a href="#sistema" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">
            Sistema
          </a>
          <a href="#comunidad" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">
            Comunidad
          </a>
          <a href="#precios" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">
            Precios
          </a>
          <a href="#faq" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 transition-all">
            FAQ
          </a>
        </div>

        <div className="flex gap-3 items-center">
          {autorizado ? (
            <Link
              href="/perfil"
              className="bg-white text-black px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-tighter hover:scale-105 transition-all"
            >
              Panel Operativo
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  setEsLogin(true);
                  setMostrarLogin(true);
                }}
                className="block text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all"
              >
                Entrar
              </button>
              <button
                onClick={abrirRegistro}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-orange-500 transition-all shadow-[0_0_25px_rgba(234,88,12,0.25)]"
              >
                Alistarse
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl w-full flex flex-col items-center pt-32 md:pt-36 z-10 text-center">
        <section className="w-full min-h-[78vh] flex flex-col lg:flex-row items-center justify-between gap-12 px-4 mb-16">
          <div className="w-full lg:w-[55%] text-center lg:text-left">
            <ContadorSocios total={totalSocios} />
            <ContadorSocial />

            <div className="inline-flex items-center gap-2 rounded-full border border-orange-600/20 bg-orange-600/10 px-4 py-2 mb-6">
              <span className="text-orange-500 text-xs">⚔️</span>
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-orange-400 italic">
                Fogueo digital de disciplina
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-[-0.08em] leading-[0.82] mb-7">
              Disciplina.<br />Enfoque.<br />Dominio.
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-sm md:text-base text-zinc-400 uppercase font-bold leading-relaxed italic mb-8">
              Mastesto es una plataforma para construir disciplina real: hábitos, rutinas, dietas, reportes, ranking, protocolo anti-tabaco y comunidad. No vienes a mirar. Vienes a foguearte.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={abrirRegistro}
                className="bg-orange-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all hover:scale-105 shadow-[0_0_30px_rgba(234,88,12,0.25)]"
              >
                Alistarme ahora
              </button>
              <Link
                href="/nosotros"
                className="border border-zinc-800 bg-zinc-950/70 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-orange-600/60 transition-all"
              >
                Ver misión
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0">
              {[
                ['24/7', 'Acceso'],
                ['3', 'Reportes'],
                ['100%', 'Fogueo'],
              ].map(([a, b]) => (
                <div key={b} className="rounded-2xl border border-zinc-900 bg-zinc-950/50 p-4">
                  <p className="text-2xl font-black italic tracking-tighter">{a}</p>
                  <p className="text-[7px] text-zinc-600 uppercase tracking-widest font-black">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[45%] relative">
            <div className="absolute -inset-4 bg-orange-600/10 blur-3xl rounded-full" />
            <div className="relative rounded-[3rem] border border-zinc-900 bg-zinc-950/50 p-3 shadow-2xl overflow-hidden">
              <img
                src="/logoweb.jpeg"
                alt="Mastesto"
                className="w-full rounded-[2.5rem] border border-zinc-900 object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-zinc-800 bg-black/75 backdrop-blur-xl p-5 text-left">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-orange-500 mb-2">
                  Protocolo activo
                </p>
                <p className="text-xl font-black uppercase tracking-tighter">
                  Disciplina, voluntad y honor.
                </p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-2">
                  La comunidad no te motiva. Te exige.
                </p>
              </div>
            </div>
          </div>
        </section>

        <OfertaFlash alistarse={abrirRegistro} />
        <ModulosSistema />
        <SeccionReportes supabase={supabase} />

        <section className="w-full max-w-6xl mx-auto px-4 mb-16">
          <div className="rounded-[3rem] border border-zinc-900 bg-zinc-950/50 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-4">
              Pagos seguros vía
            </p>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
              alt="Stripe"
              className="h-6 invert mx-auto opacity-80 mb-8"
            />
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.35em] max-w-xl mx-auto italic leading-loose">
              Forjando la <span className="text-white">disciplina absoluta</span>. Ingeniería de rendimiento humano. Una red para quien quiere dejar de prometer y empezar a ejecutar.
            </p>
          </div>
        </section>

        <GuiaInstalacion />

       <footer className="w-full mt-28 pt-16 pb-12 border-t border-zinc-900/50">

  <div className="max-w-6xl mx-auto px-4">

    <div className="flex flex-col items-center">

      {/* ENLACES */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10">

        <Link
          href="/contacto"
          className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.35em]
          text-zinc-600
          hover:text-orange-500
          transition-all
          "
        >
          Contacto
        </Link>

        <div className="w-1 h-1 rounded-full bg-zinc-800" />

        <Link
          href="/privacidad"
          className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.35em]
          text-zinc-600
          hover:text-orange-500
          transition-all
          "
        >
          Privacidad
        </Link>

        <div className="w-1 h-1 rounded-full bg-zinc-800" />

        <Link
          href="/terminos"
          className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.35em]
          text-zinc-600
          hover:text-orange-500
          transition-all
          "
        >
          Términos
        </Link>

      </div>

      {/* SEPARADOR */}
      <div className="w-64 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-10" />

      {/* FIRMA */}
      <div className="flex flex-col items-center gap-3">

        <p
          className="
          text-white
          text-[7px]
          font-black
          uppercase
          tracking-[0.8em]
          opacity-70
          text-center
          "
        >
          Mastesto Engineering Protocol
        </p>

        <p
          className="
          text-[8px]
          text-zinc-700
          italic
          tracking-[0.3em]
          uppercase
          text-center
          "
        >
          Disciplina • Voluntad • Honor
        </p>

        <p
          className="
          text-[7px]
          text-zinc-800
          uppercase
          tracking-[0.25em]
          text-center
          "
        >
          © 2026 Mastesto
        </p>

      </div>

    </div>

  </div>

</footer>
      </main>

      {/* --- MODAL DE LOGIN/REGISTRO COMPLETO --- */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-950/95 p-8 rounded-[2.5rem] border border-zinc-800 w-full max-w-md relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <button
              onClick={() => setMostrarLogin(false)}
              className="absolute top-6 right-6 text-[8px] font-black uppercase text-zinc-600 hover:text-white"
            >
              Cerrar
            </button>

            <div className="text-center mb-8">
              <div className="h-12 w-12 rounded-full bg-orange-600 mx-auto mb-5 flex items-center justify-center text-black font-black">
                M
              </div>
              <h2 className="text-xl font-black uppercase tracking-[0.18em] mb-2">
                {esLogin ? 'Identificación' : 'Alistamiento'}
              </h2>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest italic">
                {esLogin ? 'Acceso al sistema' : 'Nuevo operativo'}
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-xl text-[9px] font-black uppercase mb-6 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-40"
            >
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-3 h-3" />
              Google Sync
            </button>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] outline-none focus:border-orange-600/60"
              />

              {!esLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="NOMBRE" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                    <input type="text" placeholder="APELLIDOS" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="EDAD" value={edad} onChange={(e) => setEdad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                    <select value={sexo} onChange={(e) => setSexo(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-400 focus:border-orange-600/60 outline-none">
                      <option value="">SEXO</option>
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <input type="text" placeholder="NACIONALIDAD" value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                  <input type="text" placeholder="PROVINCIA" value={provincia} onChange={(e) => setProvincia(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                </>
              )}

              <input
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none"
              />

              {!esLogin && (
                <>
                  <input type="password" placeholder="CONFIRMAR" value={password2} onChange={(e) => setPassword2(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] focus:border-orange-600/60 outline-none" />
                  <textarea placeholder="OBJETIVO" value={motivoCambio} onChange={(e) => setMotivoCambio(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] min-h-[80px] focus:border-orange-600/60 outline-none" />
                </>
              )}

              {error && <p className="text-[9px] text-red-500 text-center uppercase font-black">{error}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all disabled:opacity-40"
              >
                {cargando ? 'Cargando...' : esLogin ? 'Entrar' : 'Registrar'}
              </button>
            </form>

            <p className="text-center mt-8 text-[9px] text-zinc-600 uppercase font-bold">
              {esLogin ? '¿No tienes cuenta?' : '¿Ya eres operativo?'}
              <button
                onClick={() => setEsLogin(!esLogin)}
                className="ml-2 text-white hover:text-orange-600 underline"
              >
                {esLogin ? 'Registrarse' : 'Identificarse'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
