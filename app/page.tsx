'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

function FondoMastesto() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.22),transparent_34%),linear-gradient(to_bottom,#030303,#000000_45%,#050505)]" />
      <div className="absolute left-1/2 top-0 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-[130px]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

function ModulosSistema() {
  const modulos = [
    {
      num: '01',
      titulo: 'Panel de progreso',
      desc: 'Control de disciplina, hábitos y avance personal desde un panel claro.',
    },
    {
      num: '02',
      titulo: 'Control de hábitos',
      desc: 'Seguimiento para reducir distracciones, tabaco, pantallas y pérdida de foco.',
    },
    {
      num: '03',
      titulo: 'Dietas personalizadas',
      desc: 'Planes de alimentación enfocados en rendimiento, constancia y cambio físico.',
    },
    {
      num: '04',
      titulo: 'Rutinas de entrenamiento',
      desc: 'Estructura semanal para entrenar con cabeza y dejar de improvisar.',
    },
    {
      num: '05',
      titulo: 'Ranking de constancia',
      desc: 'Sistema de progreso para convertir la disciplina en algo visible.',
    },
  ];

  return (
    <section id="sistema" className="mx-auto mb-20 w-full max-w-6xl scroll-mt-28 px-4">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="text-left">
          <p className="mb-3 text-[10px] font-black uppercase italic tracking-[0.5em] text-orange-500">
            Sistema +TESTO
          </p>
          <h2 className="text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl">
            No es motivación.
            <br />
            Es estructura.
          </h2>
        </div>

        <p className="max-w-md text-left text-xs font-bold uppercase italic leading-relaxed text-zinc-500 md:text-right md:text-sm">
          Disciplina, hábitos, dieta, entrenamiento, comunidad y seguimiento.
          Todo diseñado para volver cada día con un objetivo claro.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {modulos.map((m) => (
          <div
            key={m.num}
            className="group relative overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950/70 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-600/50"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-600/10 blur-2xl transition-all group-hover:bg-orange-600/20" />

            <div className="mb-7 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-orange-500">
                {m.num}
              </span>
              <span className="text-lg">⚔️</span>
            </div>

            <h4 className="mb-3 text-[12px] font-black uppercase leading-tight tracking-widest text-white">
              {m.titulo}
            </h4>

            <p className="text-[10px] uppercase italic leading-relaxed text-zinc-500">
              {m.desc}
            </p>
          </div>
        ))}
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
      fetch('/api/social')
        .then((res) => res.json())
        .then(setStats)
        .catch(console.error);
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 15000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="mb-8 grid max-w-4xl grid-cols-1 gap-4 lg:mx-0 md:grid-cols-2">
      <a
        href="https://discord.gg/a7a3Skg2"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-[2rem] border border-zinc-900 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-[#5865F2]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5865F2] text-3xl">
            🎮
          </div>

          <div className="text-left">
            <p className="mb-1 text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Discord
            </p>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">
                  {stats.discord.usuarios ?? '--'}
                </p>
                <p className="text-[8px] font-bold uppercase text-zinc-600">
                  Miembros
                </p>
              </div>

              <div className="h-10 w-px bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                  <p className="text-3xl font-black text-green-500">
                    {stats.discord.activos ?? '--'}
                  </p>
                </div>
                <p className="text-[8px] font-bold uppercase text-green-500">
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
        className="block rounded-[2rem] border border-zinc-900 bg-zinc-950/70 p-6 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-pink-500"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-3xl">
            🎵
          </div>

          <div className="text-left">
            <p className="mb-1 text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">
              TikTok
            </p>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">
                  {stats.tiktok.seguidores ?? '--'}
                </p>
                <p className="text-[8px] font-bold uppercase text-zinc-600">
                  Seguidores
                </p>
              </div>

              <div className="h-10 w-px bg-zinc-800" />

              <div>
                <p className="text-3xl font-black text-pink-500">
                  {stats.tiktok.likes ?? '--'}
                </p>
                <p className="text-[8px] font-bold uppercase text-pink-500">
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comentarios' },
        (payload: any) => {
          setReportes((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase]);

  const enviarReporte = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !nuevoReporte.trim() || misReportesCount >= 3 || enviando) return;

    setEnviando(true);

    const meta = user.user_metadata;
    const alias =
      meta?.alias ||
      meta?.given_name ||
      meta?.full_name?.split(' ')[0] ||
      'MIEMBRO';

    const { error } = await supabase.from('comentarios').insert([
      {
        user_id: user.id,
        alias: alias.toUpperCase(),
        contenido: nuevoReporte.trim(),
        color_acento: meta?.color_acento || '#ea580c',
      },
    ]);

    if (!error) setNuevoReporte('');
    setEnviando(false);
  };

  if (loading) {
    return (
      <div className="my-10 text-center text-[10px] font-black uppercase italic text-zinc-700 animate-pulse">
        Cargando muro de progreso...
      </div>
    );
  }

  return (
    <section id="comunidad" className="mx-auto mb-20 w-full max-w-6xl scroll-mt-28 px-4 text-white">
      <div className="grid items-stretch gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-600/25 bg-black/60 p-8 text-left shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(234,88,12,0.20),transparent_28%)]" />
          <div className="relative z-10">
            <p className="mb-4 text-[10px] font-black uppercase italic tracking-[0.5em] text-orange-500">
              Muro de progreso
            </p>

            <h2 className="mb-5 text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl">
              Comparte avances.
              <br />
              Construye constancia.
            </h2>

            <p className="mb-8 text-xs font-bold uppercase italic leading-relaxed text-zinc-400">
              Logros, aprendizajes, caídas y victorias personales. Un espacio
              para hacer visible el progreso.
            </p>

            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <li className="flex gap-3">
                <span className="text-orange-500">🔥</span> Reportes reales
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500">⚔️</span> Comunidad privada
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500">🧱</span> Disciplina visible
              </li>
            </ul>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-900 bg-zinc-950/70 p-6 text-left shadow-2xl backdrop-blur-xl md:p-8">
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-orange-600/60 to-transparent" />

          <div className="relative z-10 mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase italic tracking-[0.5em] text-orange-500">
                Comunidad
              </p>
              <p className="text-[10px] font-bold uppercase italic tracking-widest text-zinc-500">
                Reportes directos de miembros.
              </p>
            </div>

            {user && (
              <div className="rounded-2xl border border-zinc-900 bg-black/70 px-5 py-3 font-mono text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Tus reportes:{' '}
                <span className={misReportesCount >= 3 ? 'text-red-500' : 'text-orange-500'}>
                  {misReportesCount}/3
                </span>
              </div>
            )}
          </div>

          {user ? (
            misReportesCount < 3 ? (
              <form onSubmit={enviarReporte} className="relative z-10 mb-8 space-y-3">
                <div className="relative">
                  <textarea
                    value={nuevoReporte}
                    onChange={(e) => setNuevoReporte(e.target.value)}
                    maxLength={500}
                    placeholder="COMPARTE TU AVANCE, LOGRO O COMPROMISO DE HOY... "
                    className="h-28 w-full resize-none rounded-2xl border border-zinc-900 bg-black/70 p-5 text-[11px] font-bold uppercase text-white outline-none transition-all placeholder:text-zinc-700 focus:border-orange-600/60"
                  />
                  <span className="absolute bottom-4 right-4 font-mono text-[7px] text-zinc-600">
                    {nuevoReporte.length}/500
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={enviando || !nuevoReporte.trim()}
                  className="w-full rounded-xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-orange-600 hover:text-white disabled:opacity-20"
                >
                  {enviando ? 'Publicando...' : 'Publicar reporte'}
                </button>
              </form>
            ) : (
              <div className="relative z-10 mb-8 rounded-2xl border border-red-950 bg-red-950/10 p-5 text-center">
                <p className="text-[8px] font-black uppercase italic tracking-widest text-red-500">
                  Límite de reportes alcanzado.
                </p>
              </div>
            )
          ) : (
            <div className="relative z-10 mb-8 rounded-2xl border border-zinc-900 bg-black/50 p-5 text-center italic">
              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                Inicia sesión para publicar tu reporte de progreso.
              </p>
            </div>
          )}

          <div className="custom-scrollbar relative z-10 max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {reportes.length > 0 ? (
              reportes.map((reporte) => (
                <div
                  key={reporte.id}
                  className="rounded-2xl border bg-black/40 p-5 transition-all duration-300 hover:translate-x-1 hover:bg-black/70"
                  style={{ borderColor: `${reporte.color_acento}22` }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase italic tracking-wider"
                      style={{ color: reporte.color_acento }}
                    >
                      @{reporte.alias}
                    </span>

                    <span className="font-mono text-[7px] text-zinc-600">
                      {new Date(reporte.created_at).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="break-words text-[11px] font-medium uppercase leading-relaxed text-zinc-300">
                    {reporte.contenido}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-[8px] font-black uppercase italic text-zinc-700">
                Todavía no hay reportes. Sé el primero en publicar tu avance.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GuiaInstalacion() {
  return (
    <section id="faq" className="mx-auto mb-10 mt-8 w-full max-w-6xl scroll-mt-28 px-4">
      <div className="group relative overflow-hidden rounded-[3rem] border border-zinc-900 bg-zinc-950/60 p-8 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-orange-600/30 to-transparent" />

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="text-left">
            <p className="mb-3 text-[9px] font-black uppercase italic tracking-[0.5em] text-orange-500">
              Acceso rápido
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tighter md:text-4xl">
              Instálalo en tu móvil.
            </h2>
          </div>

          <p className="max-w-md text-left text-[10px] font-bold uppercase italic text-zinc-500 md:text-right">
            Acceso directo desde pantalla de inicio para entrar cada día sin excusas.
          </p>
        </div>

        <div className="relative z-10 grid gap-10 text-left md:grid-cols-2">
          <div className="space-y-6 rounded-[2rem] border border-zinc-900 bg-black/35 p-6">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
              <span className="text-3xl">🍎</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">
                iOS / Safari
              </h3>
            </div>

            <ul className="space-y-4 text-[9px] font-bold uppercase italic text-zinc-500">
              <li>01 · Abre mastesto.es</li>
              <li>02 · Pulsa compartir</li>
              <li>03 · Añadir a pantalla de inicio</li>
            </ul>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-zinc-900 bg-black/35 p-6">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
              <span className="text-3xl">🤖</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-200">
                Android / Chrome
              </h3>
            </div>

            <ul className="space-y-4 text-[9px] font-bold uppercase italic text-zinc-500">
              <li>01 · Entra desde Chrome</li>
              <li>02 · Abre el menú de 3 puntos</li>
              <li>03 · Pulsa instalar aplicación</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [cookiesAceptadas, setCookiesAceptadas] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [esLogin, setEsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [edad, setEdad] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [sexo, setSexo] = useState('');
  const [motivoCambio, setMotivoCambio] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const aceptadas = localStorage.getItem('mastesto-cookies');

    if (aceptadas === 'true') {
      setCookiesAceptadas(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = cookiesAceptadas ? '' : 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [cookiesAceptadas]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) setAutorizado(true);
    };

    fetchData();
  }, [supabase]);

  const aceptarCookies = () => {
    localStorage.setItem('mastesto-cookies', 'true');
    setCookiesAceptadas(true);
  };

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

  const handleAuth = async (e: FormEvent) => {
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
      alert('Cuenta creada. Revisa tu email para confirmar el acceso.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    window.location.href = '/perfil';
  };

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center overflow-x-hidden bg-black p-4 font-sans text-white selection:bg-orange-600 selection:text-white md:p-6 ${
        !cookiesAceptadas ? 'h-screen overflow-hidden' : ''
      }`}
    >
      <FondoMastesto />

      <nav className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-zinc-900 bg-black/75 px-4 py-3 shadow-2xl backdrop-blur-2xl md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 font-black text-black shadow-[0_0_25px_rgba(234,88,12,0.35)] transition-all group-hover:scale-105">
            M
          </div>

          <div className="hidden text-left leading-none sm:block">
            <p className="text-sm font-black italic tracking-tighter">MASTESTO</p>
            <p className="text-[7px] font-black uppercase tracking-[0.25em] text-zinc-600">
              Forge Protocol
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 italic md:flex">
          <Link href="/nosotros" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-orange-600">
            Misión
          </Link>
          <a href="#sistema" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-orange-600">
            Sistema
          </a>
          <a href="#comunidad" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-orange-600">
            Comunidad
          </a>
          <a href="#faq" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:text-orange-600">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          {autorizado ? (
            <Link
              href="/perfil"
              className="rounded-full bg-white px-5 py-2.5 text-[9px] font-black uppercase tracking-tighter text-black transition-all hover:scale-105"
            >
              Panel
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  setEsLogin(true);
                  setMostrarLogin(true);
                }}
                className="block text-[9px] font-black uppercase text-zinc-400 transition-all hover:text-white"
              >
                Entrar
              </button>

              <button
                onClick={abrirRegistro}
                className="rounded-full bg-orange-600 px-5 py-2.5 text-[9px] font-black uppercase tracking-tighter text-white shadow-[0_0_25px_rgba(234,88,12,0.25)] transition-all hover:bg-orange-500"
              >
                Empezar
              </button>
            </>
          )}
        </div>
      </nav>

      {!cookiesAceptadas && (
        <div className="fixed inset-0 z-[999999] flex h-screen w-screen touch-none select-none items-center justify-center overflow-hidden bg-black px-5 backdrop-blur-2xl">
          <div className="w-full max-w-md rounded-[2rem] border border-orange-500/20 bg-zinc-950 p-7 text-center shadow-[0_0_80px_rgba(255,120,0,0.25)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-600/15 text-4xl">
              🍪
            </div>

            <h1 className="mb-4 text-3xl font-black text-white">
              Bienvenido a Mastesto
            </h1>

            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              Utilizamos cookies para mejorar la experiencia, analizar el uso,
              mantener la seguridad y hacer funcionar correctamente la comunidad.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="/privacidad"
                target="_blank"
                className="w-full rounded-xl bg-zinc-900 py-3 font-bold text-zinc-300 transition hover:bg-zinc-800"
              >
                Leer política
              </a>

              <button
                onClick={aceptarCookies}
                className="w-full rounded-xl bg-orange-600 py-4 font-black transition-all hover:bg-orange-500"
              >
                ACEPTAR Y ENTRAR
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="z-10 flex w-full max-w-7xl flex-col items-center pt-32 text-center md:pt-36">
        <section className="mb-16 flex min-h-[78vh] w-full flex-col items-center justify-between gap-12 px-4 lg:flex-row">
          <div className="w-full text-center lg:w-[55%] lg:text-left">
            <ContadorSocial />

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-600/20 bg-orange-600/10 px-4 py-2">
              <span className="text-xs text-orange-500">⚔️</span>
              <span className="text-[9px] font-black uppercase italic tracking-[0.35em] text-orange-400">
                Sistema de disciplina personal
              </span>
            </div>

            <h1 className="mb-7 text-5xl font-black uppercase leading-[0.85] tracking-[-0.08em] sm:text-7xl lg:text-8xl">
              No te falta potencial.
              <br />
              <span className="text-orange-500">Te sobran distracciones.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-sm font-bold uppercase italic leading-relaxed text-zinc-400 md:text-base lg:mx-0">
              +TESTO es una plataforma para recuperar disciplina, ordenar tus hábitos
              y construir una versión más fuerte, enfocada y constante de ti mismo.
            </p>

            <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                onClick={abrirRegistro}
                className="rounded-2xl bg-orange-600 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(234,88,12,0.25)] transition-all hover:scale-105 hover:bg-orange-500"
              >
                Empezar ahora
              </button>

              <Link
                href="/nosotros"
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:border-orange-600/60"
              >
                Ver misión
              </Link>
            </div>

            <div className="mx-auto grid max-w-xl grid-cols-3 gap-3 lg:mx-0">
              {[
                ['Hábitos', 'Diarios'],
                ['Rutinas', 'Guiadas'],
                ['Progreso', 'Visible'],
              ].map(([a, b]) => (
                <div key={b} className="rounded-2xl border border-zinc-900 bg-zinc-950/50 p-4">
                  <p className="text-xl font-black italic tracking-tighter md:text-2xl">
                    {a}
                  </p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-600">
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-[45%]">
            <div className="absolute -inset-4 rounded-full bg-orange-600/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[3rem] border border-zinc-900 bg-zinc-950/50 p-3 shadow-2xl">
              <img
                src="/logoweb.jpeg"
                alt="Mastesto"
                className="w-full rounded-[2.5rem] border border-zinc-900 object-cover"
              />

              <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-zinc-800 bg-black/75 p-5 text-left backdrop-blur-xl">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.4em] text-orange-500">
                  Protocolo activo
                </p>

                <p className="text-xl font-black uppercase tracking-tighter">
                  Disciplina, control y progreso.
                </p>

                <p className="mt-2 text-[10px] font-bold uppercase text-zinc-500">
                  Una estructura para dejar de prometer y empezar a ejecutar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ModulosSistema />

        <section className="mx-auto mb-20 w-full max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-[3rem] border border-orange-600/20 bg-zinc-950/70 p-8 shadow-2xl md:p-14">
            <div className="absolute right-[-120px] top-[-180px] h-[450px] w-[450px] rounded-full bg-orange-600/10 blur-[120px]" />

            <p className="mb-4 text-[9px] font-black uppercase italic tracking-[0.5em] text-orange-500">
              Qué recibes al entrar
            </p>

            <h2 className="mb-6 text-4xl font-black leading-none tracking-tighter md:text-6xl">
              Herramientas para
              <br />
              <span className="text-orange-500">crear constancia.</span>
            </h2>

            <div className="grid gap-4 text-left md:grid-cols-3">
              {[
                'Panel operativo',
                'Dietas personalizadas',
                'Rutinas de entrenamiento',
                'Control de hábitos',
                'Blog premium',
                'Comunidad privada',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-900 bg-black/40 p-5 text-[10px] font-black uppercase tracking-widest text-zinc-300"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <SeccionReportes supabase={supabase} />

        <section className="mx-auto mb-20 w-full max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-[3rem] border border-orange-600/20 bg-zinc-950/70 p-8 shadow-2xl md:p-14">
            <p className="mb-4 text-[9px] font-black uppercase italic tracking-[0.5em] text-orange-500">
              Mastesto Research
            </p>

            <h2 className="mb-6 text-4xl font-black leading-none tracking-tighter md:text-6xl">
              Ciencia, hábitos
              <br />
              <span className="text-orange-500">y disciplina.</span>
            </h2>

            <p className="mb-8 max-w-2xl text-sm font-bold uppercase italic leading-relaxed text-zinc-400">
              Artículos sobre duchas frías, dejar vicios, estudio, rendimiento,
              hábitos y transformación personal.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex rounded-2xl bg-orange-600 px-8 py-4 font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:bg-orange-500"
              >
                Entrar al blog
              </Link>

              <Link
                href="/blog/beneficios-ducha-fria"
                className="inline-flex rounded-2xl border border-zinc-800 bg-black px-8 py-4 font-black uppercase tracking-[0.2em] transition-all hover:border-orange-600"
              >
                Leer último artículo
              </Link>
            </div>
          </div>
        </section>

        <GuiaInstalacion />

        <footer className="mt-28 w-full border-t border-zinc-900/50 pb-12 pt-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center">
              <div className="mb-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
                <Link href="/contacto" className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 transition-all hover:text-orange-500">
                  Contacto
                </Link>

                <div className="h-1 w-1 rounded-full bg-zinc-800" />

                <Link href="/privacidad" className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 transition-all hover:text-orange-500">
                  Privacidad
                </Link>

                <div className="h-1 w-1 rounded-full bg-zinc-800" />

                <Link href="/terminos" className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 transition-all hover:text-orange-500">
                  Términos
                </Link>
              </div>

              <div className="mb-10 h-px w-64 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-[7px] font-black uppercase tracking-[0.8em] text-white opacity-70">
                  Mastesto Engineering Protocol
                </p>

                <p className="text-center text-[8px] uppercase italic tracking-[0.3em] text-zinc-700">
                  Disciplina • Control • Progreso
                </p>

                <p className="text-center text-[7px] uppercase tracking-[0.25em] text-zinc-800">
                  © 2026 Mastesto
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {mostrarLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
          <div className="custom-scrollbar relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2.5rem] border border-zinc-800 bg-zinc-950/95 p-8 shadow-2xl">
            <button
              onClick={() => setMostrarLogin(false)}
              className="absolute right-6 top-6 text-[8px] font-black uppercase text-zinc-600 hover:text-white"
            >
              Cerrar
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 font-black text-black">
                M
              </div>

              <h2 className="mb-2 text-xl font-black uppercase tracking-[0.18em]">
                {esLogin ? 'Acceso' : 'Crear cuenta'}
              </h2>

              <p className="text-[9px] uppercase italic tracking-widest text-zinc-500">
                {esLogin ? 'Entra a tu panel' : 'Empieza tu proceso'}
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={cargando}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-[9px] font-black uppercase text-black transition-all hover:bg-orange-600 hover:text-white disabled:opacity-40"
            >
              <img src="https://www.google.com/favicon.ico" alt="G" className="h-3 w-3" />
              Continuar con Google
            </button>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60"
              />

              {!esLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="NOMBRE" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />
                    <input type="text" placeholder="APELLIDOS" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="EDAD" value={edad} onChange={(e) => setEdad(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />

                    <select value={sexo} onChange={(e) => setSexo(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] text-zinc-400 outline-none focus:border-orange-600/60">
                      <option value="">SEXO</option>
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <input type="text" placeholder="NACIONALIDAD" value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />

                  <input type="text" placeholder="PROVINCIA" value={provincia} onChange={(e) => setProvincia(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />
                </>
              )}

              <input
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60"
              />

              {!esLogin && (
                <>
                  <input type="password" placeholder="CONFIRMAR CONTRASEÑA" value={password2} onChange={(e) => setPassword2(e.target.value)} required className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />

                  <textarea placeholder="¿QUÉ QUIERES CAMBIAR?" value={motivoCambio} onChange={(e) => setMotivoCambio(e.target.value)} className="min-h-[80px] w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-[10px] outline-none focus:border-orange-600/60" />
                </>
              )}

              {error && (
                <p className="text-center text-[9px] font-black uppercase text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-xl bg-white py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-orange-600 hover:text-white disabled:opacity-40"
              >
                {cargando ? 'Cargando...' : esLogin ? 'Entrar' : 'Crear cuenta'}
              </button>
            </form>

            <p className="mt-8 text-center text-[9px] font-bold uppercase text-zinc-600">
              {esLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}

              <button
                onClick={() => setEsLogin(!esLogin)}
                className="ml-2 text-white underline hover:text-orange-600"
              >
                {esLogin ? 'Registrarse' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
