'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// COMPONENTE DE GUÍA DE INSTALACIÓN (Añadido para PWA)
function GuiaInstalacion() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-20 mb-10 p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl backdrop-blur-sm animate-in fade-in duration-1000">
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-orange-600 italic text-center">
        ⚡ DESPLIEGUE OPERATIVO: INSTALA LA APP EN TU MÓVIL
      </h2>

      <div className="grid md:grid-cols-2 gap-12 text-left">
        {/* GUÍA PARA IPHONE */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <span className="text-xl">🍎</span>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Usuarios iPhone (Safari)</h3>
          </div>
          <ol className="space-y-4 text-[9px] text-zinc-400 uppercase font-medium">
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">01.</span> 
              <span>Abre <strong className="text-zinc-200">mastesto.es</strong> en Safari</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">02.</span> 
              <span>Pulsa el botón <strong className="text-zinc-200">COMPARTIR</strong> (cuadrado con flecha)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">03.</span> 
              <span>Busca <strong className="text-zinc-200">"AÑADIR A PANTALLA DE INICIO"</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">04.</span> 
              <span>Confirma pulsando <strong className="text-zinc-200">"AÑADIR"</strong></span>
            </li>
          </ol>
        </div>

        {/* GUÍA PARA ANDROID */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <span className="text-xl">🤖</span>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Usuarios Android (Chrome)</h3>
          </div>
          <ol className="space-y-4 text-[9px] text-zinc-400 uppercase font-medium">
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">01.</span> 
              <span>Entra en la web desde Google Chrome</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">02.</span> 
              <span>Pulsa los <strong className="text-zinc-200">3 PUNTOS</strong> del navegador</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">03.</span> 
              <span>Selecciona <strong className="text-zinc-200">"INSTALAR APLICACIÓN"</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-black">04.</span> 
              <span>Acepta el despliegue en tu pantalla de inicio</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
        <p className="text-[8px] text-zinc-600 italic uppercase tracking-[0.2em]">
          Experiencia táctica optimizada para pantalla completa sin distracciones.
        </p>
      </div>
    </div>
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

  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [esLogin, setEsLogin] = useState(true);

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
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) setAutorizado(true);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutorizado(!!session);
      if (session) setMostrarLogin(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('login') === 'true') {
      setEsLogin(true);
      setMostrarLogin(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const limpiarFormulario = () => {
    setEmail('');
    setPassword('');
    setPassword2('');
    setNombre('');
    setApellidos('');
    setEdad('');
    setNacionalidad('');
    setProvincia('');
    setSexo('');
    setMotivoCambio('');
    setError('');
  };

  const abrirSignIn = () => {
    limpiarFormulario();
    setEsLogin(true);
    setMostrarLogin(true);
  };

  const abrirRegister = () => {
    limpiarFormulario();
    setEsLogin(false);
    setMostrarLogin(true);
  };

  const traducirErrorSupabase = (message: string) => {
    if (message.includes('User already registered')) {
      return 'Este correo ya está registrado. Inicia sesión.';
    }
    if (message.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (message.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Tienes que confirmar tu correo antes de iniciar sesión.';
    }
    if (message.includes('Database error saving new user')) {
      return 'Error guardando el perfil. Revisa el SQL de la tabla profiles.';
    }
    return message;
  };

  const handleGoogleLogin = async () => {
    setError('');
    setCargando(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(traducirErrorSupabase(error.message));
      setCargando(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    if (!email || !password) {
      setError('Introduce email y contraseña.');
      setCargando(false);
      return;
    }

    if (!esLogin) {
      if (!nombre || !apellidos || !edad || !nacionalidad || !provincia || !sexo) {
        setError('Rellena todos los campos obligatorios.');
        setCargando(false);
        return;
      }

      if (Number(edad) < 14) {
        setError('La edad mínima es 14 años.');
        setCargando(false);
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setCargando(false);
        return;
      }

      if (password !== password2) {
        setError('Las contraseñas no coinciden.');
        setCargando(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
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
        setError(traducirErrorSupabase(error.message));
        setCargando(false);
        return;
      }

      if (data.session) {
        setCargando(false);
        window.location.href = '/perfil';
        return;
      }

      setError('¡FORJA ACTIVADA! Revisa tu email para confirmar tu cuenta antes de entrar.');
      setEsLogin(true);
      setPassword('');
      setPassword2('');
      setCargando(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(traducirErrorSupabase(error.message));
      setCargando(false);
      return;
    }

    setCargando(false);
    window.location.href = '/perfil';
  };

  if (mostrarLogin && !autorizado) {
    return (
      <div className="min-h-screen bg-black/95 text-white flex items-center justify-center p-6 fixed inset-0 z-[100] backdrop-blur-sm font-sans">
        <div className="max-w-md w-full space-y-5 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => setMostrarLogin(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white text-[10px] uppercase"
          >
            Cerrar
          </button>

          <h1 className="text-center text-lg font-black uppercase tracking-[0.3em]">
            {esLogin ? 'Sign In' : 'Register'}
          </h1>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-200 transition-all disabled:opacity-60"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4"
            />
            Continuar con Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="mx-4 text-zinc-600 text-[8px] uppercase tracking-widest">
              o con email
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
            />

            {!esLogin && (
              <>
                <input
                  type="text"
                  placeholder="NOMBRE"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="APELLIDOS"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="EDAD"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  required
                  min={14}
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="NACIONALIDAD"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="PROVINCIA"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                >
                  <option value="">SEXO</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
                </select>
              </>
            )}

            <input
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
            />

            {!esLogin && (
              <>
                <input
                  type="password"
                  placeholder="REPETIR CONTRASEÑA"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none"
                />
                <textarea
                  placeholder="¿POR QUÉ ESTÁS INTERESADO EN CAMBIAR? OPCIONAL"
                  value={motivoCambio}
                  onChange={(e) => setMotivoCambio(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 text-xs focus:outline-none min-h-[90px]"
                />
              </>
            )}

            {error && (
              <p className="text-[10px] text-red-500 uppercase text-center font-bold leading-relaxed">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-zinc-100 text-black font-black text-[10px] py-3.5 rounded-lg uppercase tracking-widest hover:bg-white transition-all disabled:opacity-60"
            >
              {cargando ? 'PROCESANDO...' : esLogin ? 'ENTRAR' : 'REGISTRARME'}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-[9px] uppercase">
            {esLogin ? '¿No tienes cuenta?' : '¿Ya eres socio?'}
            <button
              type="button"
              onClick={() => {
                setEsLogin(!esLogin);
                setError('');
                setPassword('');
                setPassword2('');
              }}
              className="ml-2 text-white underline font-bold italic"
            >
              {esLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-x-hidden font-sans">
      
      <div className="absolute top-6 left-6 z-50">
        <a
          href="https://discord.gg/q2rtc8PX"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] border border-zinc-800 bg-zinc-900/50 px-4 py-2 rounded-full uppercase font-bold text-zinc-400"
        >
          Discord
        </a>
      </div>

      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {autorizado ? (
          <>
            <Link
              href="/perfil"
              className="text-[10px] border border-white bg-white text-black px-5 py-2 rounded-full uppercase font-black tracking-widest"
            >
              Área de socios
            </Link>

            <button
              type="button"
              onClick={() => supabase.auth.signOut().then(() => setAutorizado(false))}
              className="text-[10px] border border-zinc-800 bg-zinc-900/50 px-4 py-2 rounded-full uppercase font-bold text-zinc-400 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={abrirSignIn}
              className="text-[10px] border border-zinc-800 bg-zinc-900/50 px-5 py-2 rounded-full uppercase font-bold text-zinc-400 hover:bg-white hover:text-black transition-all"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={abrirRegister}
              className="text-[10px] border border-white bg-white text-black px-5 py-2 rounded-full uppercase font-black tracking-widest hover:bg-zinc-200 transition-all"
            >
              Register
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-10 right-10 z-50">
        <Link
          href="/nosotros"
          className="text-[9px] text-zinc-500 hover:text-white uppercase underline underline-offset-8 decoration-zinc-800"
        >
          Conoce más
        </Link>
      </div>

      <div className="max-w-5xl w-full flex flex-col items-center space-y-12 z-10 text-center py-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-white/5 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <img
            src="/logoweb.jpeg"
            alt="Logo"
            className="relative w-[600px] md:w-[800px] mx-auto rounded-lg shadow-2xl border border-zinc-900"
          />
        </div>

        {autorizado && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-4">
            <div className="border-t border-zinc-900 pt-4 px-10">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">
                Socio Verificado
              </span>
            </div>

            <Link
              href="/perfil"
              className="inline-block bg-white text-black text-[10px] px-8 py-3 rounded-full uppercase font-black hover:bg-zinc-200 transition-all tracking-widest shadow-xl"
            >
              Ir a mi panel personal
            </Link>
          </div>
        )}

        {/* COMPONENTE DE INSTALACIÓN AÑADIDO AQUÍ */}
        <GuiaInstalacion />

        <p className="text-zinc-900 text-[8px] uppercase tracking-[0.8em] pt-10">
          Mastesto Engineering • 2026
        </p>
      </div>
    </div>
  );
}
