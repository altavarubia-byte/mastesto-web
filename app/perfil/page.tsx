'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// --- COMPONENTE DE TAREA ---
function CardTarea({ tarea, userNick, supabase, colorAcento }: any) {
  const [segundos, setSegundos] = useState(tarea.duracion_minutos * 60);
  const [activo, setActivo] = useState(false);
  const [completada, setCompletada] = useState(tarea.completada_por?.includes(userNick));

  useEffect(() => {
    let timer: any;
    if (activo && segundos > 0) {
      timer = setInterval(() => setSegundos((s: number) => s - 1), 1000);
    } else if (segundos === 0 && activo) {
      finalizarMision();
    }
    return () => clearInterval(timer);
  }, [activo, segundos]);

  const finalizarMision = async () => {
    setActivo(false);
    setCompletada(true);
    const { error } = await supabase.rpc('array_append_completada', {
      tarea_id: tarea.id,
      nuevo_nick: userNick,
    });
    if (!error) window.location.reload();
  };

  const formatear = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className="p-5 rounded-2xl border transition-all mb-3 group"
      style={{
        borderColor: completada ? `${colorAcento}33` : '#1f1f23',
        backgroundColor: completada ? `${colorAcento}05` : 'transparent',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">
          {tarea.titulo}
        </h3>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: completada ? colorAcento : '#1f1f23' }} />
      </div>
      {!completada ? (
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-black w-16" style={{ color: colorAcento }}>
            {formatear(segundos)}
          </div>
          <button
            onClick={() => setActivo(!activo)}
            className="flex-1 py-2 rounded-lg text-[8px] font-black uppercase bg-white text-black hover:opacity-80 transition-all"
          >
            {activo ? 'OPERANDO...' : 'EJECUTAR'}
          </button>
        </div>
      ) : (
        <div className="text-[8px] font-black uppercase tracking-widest text-right italic" style={{ color: colorAcento }}>
          Misión Cumplida
        </div>
      )}
    </div>
  );
}

export default function PerfilPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });
  const [menuAbierto, setMenuAbierto] = useState(false);

  // CONFIGURACIÓN PERFIL
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [colorAcento, setColorAcento] = useState('#ea580c');
  const [ghostMode, setGhostMode] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');

  // IA EL FORJADOR
  const [mentorAbierto, setMentorAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [temperatura, setTemperatura] = useState(0.7);
  const [brevedad, setBrevedad] = useState(50);

  // ADMIN MISIONES
  const [tituloTarea, setTituloTarea] = useState('');
  const [minutosTarea, setMinutosTarea] = useState(30);
  const [socioId, setSocioId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // EMAIL MARKETING
  const [asuntoMarketing, setAsuntoMarketing] = useState('');
  const [mensajeMarketing, setMensajeMarketing] = useState('');
  const [enviandoMarketing, setEnviandoMarketing] = useState(false);
  const [esAdminReal, setEsAdminReal] = useState(false);

  // PROTOCOLO TABACO
  const [showTabacoModal, setShowTabacoModal] = useState(false);
  const [datosTabaco, setDatosTabaco] = useState({ cigarrillosDia: '', precioPaquete: '', unidadesPaquete: '20' });

  // DIETAS PERSONALIZADAS
  const [dietasModal, setDietasModal] = useState(false);
  const [cuestionarioPendiente, setCuestionarioPendiente] = useState(false);
  const [guardandoCuestionario, setGuardandoCuestionario] = useState(false);
  const [dietas, setDietas] = useState<any[]>([]);
  const [cargandoDietas, setCargandoDietas] = useState(false);
  const [sociosCuestionario, setSociosCuestionario] = useState<any[]>([]);
  const [socioDietaSeleccionado, setSocioDietaSeleccionado] = useState('');
  const [pdfDieta, setPdfDieta] = useState<File | null>(null);
  const [tituloPdfDieta, setTituloPdfDieta] = useState('');
  const [descripcionPdfDieta, setDescripcionPdfDieta] = useState('');
  const [subiendoPdfDieta, setSubiendoPdfDieta] = useState(false);

  const [formDieta, setFormDieta] = useState({
    sexo: '',
    edad: '',
    peso_kg: '',
    altura_cm: '',
    objetivo: '',
    nivel_actividad: '',
    trabajo_movimiento: '',
    deporte: '',
    deporte_detalle: '',
    dias_entreno_semana: '',
    duracion_entreno: '',
    comidas_dia: '',
    horario_comidas: '',
    intolerancias: '',
    alergias: '',
    alimentos_no_gustan: '',
    alimentos_preferidos: '',
    restricciones: '',
    patologias: '',
    medicacion: '',
    suplementos: '',
    presupuesto: '',
    cocina: '',
    notas: '',
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const ADMIN_EMAIL = 'altava.rubia@gmail.com';

  const isAdmin =
  user?.email?.toLowerCase()?.trim() ===
  ADMIN_EMAIL.toLowerCase();

  const obtenerRango = () => {
    const d = tiempo.dias || 0;
    if (d < 3) return 'RECLUTA';
    if (d < 10) return 'SOLDADO DE ÉLITE';
    if (d < 30) return 'SARGENTO DE HIERRO';
    return 'COMANDANTE +TESTO';
  };

  const hitosSaludYLogros = useMemo(
    () => [
      { id: 1, tiempoHoras: 0.3, titulo: 'Células Limpias', desc: 'La presión arterial y el pulso bajan a la normalidad.', icono: '🫀' },
      { id: 2, tiempoHoras: 2, titulo: 'Filtro de Nicotina', desc: 'La nicotina en sangre disminuye un 50%.', icono: '🩸' },
      { id: 3, tiempoHoras: 8, titulo: 'Oxigenación Alfa', desc: 'El monóxido de carbono en sangre se reduce a la mitad. Oxígeno normalizado.', icono: '🌬️' },
      { id: 4, tiempoHoras: 12, titulo: 'Purificación de Gas', desc: 'Los niveles de monóxido de carbono caen a rangos completamente normales.', icono: '🧪' },
      { id: 5, tiempoHoras: 24, titulo: 'Escudo Cardíaco V1', desc: 'Ansiedad máxima superada. Las probabilidades de ataque cardíaco empiezan a disminuir.', icono: '🛡️' },
      { id: 6, tiempoHoras: 48, titulo: 'Sabor de Acero', desc: 'Las terminaciones nerviosas se regeneran. El olfato y el gusto se agudizan notablemente.', icono: '👅' },
      { id: 7, tiempoHoras: 72, titulo: 'Bronquios Libres', desc: 'Los tubos bronquiales se relajan. La capacidad pulmonar aumenta y respirar es más fácil.', icono: '🫁' },
      { id: 8, tiempoHoras: 96, titulo: 'Victoria de Voluntad', desc: 'Superada la barrera crítica del síndrome de abstinencia físico.', icono: '🧠' },
      { id: 9, tiempoHoras: 120, titulo: 'Energía Dinámica', desc: 'La circulación sanguínea general mejora drásticamente. Menos fatiga al despertar.', icono: '⚡' },
      { id: 10, tiempoHoras: 168, titulo: 'Aliento de Hierro', desc: 'Se elimina por completo el olor a alquitrán impregnado en el sistema respiratorio.', icono: '💬' },
      { id: 11, tiempoHoras: 240, titulo: 'Estabilidad Mental', desc: 'La dependencia psicológica severa empieza a perder fuerza de control.', icono: '🧩' },
      { id: 12, tiempoHoras: 336, titulo: 'Resistencia Base', desc: 'Las encías y los dientes recuperan el riego sanguíneo saludable perdido.', icono: '🦷' },
      { id: 13, tiempoHoras: 504, titulo: 'Mente Inquebrantable', desc: 'Tres semanas completas. Los receptores de nicotina cerebrales empiezan a desactivarse.', icono: '👁️' },
      { id: 14, tiempoHoras: 720, titulo: 'Renacimiento Pulmonar', desc: '1 mes. La tos y la dificultad para respirar disminuyen de manera evidente.', icono: '🌀' },
      { id: 15, tiempoHoras: 1080, titulo: 'Flujo Limpio', desc: 'La función pulmonar general ha mejorado ya hasta un 10%.', icono: '🌊' },
      { id: 16, tiempoHoras: 1440, titulo: 'Piel Operativa', desc: '2 meses. La piel recupera elasticidad, brillo natural y oxigenación celular.', icono: '✨' },
      { id: 17, tiempoHoras: 2160, titulo: 'Resistencia Élite', desc: '3 meses. Los cilios pulmonares se han regenerado y barre activamente la mucosidad.', icono: '🧹' },
      { id: 18, tiempoHoras: 2880, titulo: 'Inmunidad Reforzada', desc: '4 meses. El sistema inmunológico se estabiliza. Menos resfriados y bajas metabólicas.', icono: '🔰' },
      { id: 19, tiempoHoras: 3600, titulo: 'Fuerza Cardiovascular', desc: '5 meses. El ventrículo izquierdo trabaja con un esfuerzo significativamente menor.', icono: '❤️' },
      { id: 20, tiempoHoras: 4320, titulo: 'Medio Año de Acero', desc: '6 meses. Has evitado miles de toxinas mutagénicas en tus vías respiratorias.', icono: '🎖️' },
      { id: 21, tiempoHoras: 5040, titulo: 'Barrera Química', desc: '7 meses. La inflamación celular crónica sistémica se reduce a la mitad.', icono: '🚫' },
      { id: 22, tiempoHoras: 5760, titulo: 'Voz de Comando', desc: '8 meses. Las cuerdas vocales sanan por completo de la agresión térmica diaria.', icono: '🗣️' },
      { id: 23, tiempoHoras: 6480, titulo: 'Capilaridad Óptima', desc: '9 meses. El cabello y las uñas crecen más fuertes debido a la microcirculación limpia.', icono: '🧬' },
      { id: 24, tiempoHoras: 7200, titulo: 'Oxígeno Infinito', desc: '10 meses. Capacidad aeróbica incrementada al nivel más alto desde que iniciaste.', icono: '🚀' },
      { id: 25, tiempoHoras: 7920, titulo: 'Sistema Autolimpiante', desc: '11 meses. Los macrófagos alveolares limpian los últimos depósitos densos de alquitrán.', icono: '🧼' },
      { id: 26, tiempoHoras: 8760, titulo: 'UN AÑO EN LA BRECHA', desc: 'El riesgo de enfermedad coronaria se reduce a la mitad en comparación con un fumador.', icono: '👑' },
      { id: 27, tiempoHoras: 10220, titulo: 'Veterano Anti-Humo', desc: '14 meses de total independencia. Tu gasto cardíaco es óptimo.', icono: '🎖️' },
      { id: 28, tiempoHoras: 11680, titulo: 'Corazón Blindado', desc: '16 meses. Las arterias recuperan flexibilidad y reducen rigidez de placa.', icono: '🌌' },
      { id: 29, tiempoHoras: 13140, titulo: 'Control Absoluto', desc: '18 meses. Los patrones de sueño y niveles de cortisol están 100% regulados.', icono: '☯️' },
      { id: 30, tiempoHoras: 14600, titulo: 'Filtro de Élite', desc: '20 meses. La sangre transporta oxígeno puro sin trazas de metales pesados.', icono: '💎' },
      { id: 31, tiempoHoras: 16060, titulo: 'Genética a Salvo', desc: '22 meses. Los marcadores epigenéticos dañados por el humo comienzan a revertirse.', icono: '🧬' },
      { id: 32, tiempoHoras: 17520, titulo: 'DOS AÑOS DE VICTORIA', desc: 'Los riesgos de cáncer de boca, garganta y esófago se reducen a la mitad.', icono: '⚔️' },
      { id: 33, tiempoHoras: 21900, titulo: 'Comandante Biológico', desc: '2.5 años. Tu capacidad física supera con creces la media de la población.', icono: '☣️' },
      { id: 34, tiempoHoras: 26280, titulo: 'TRES AÑOS INVICTO', desc: 'El riesgo de sufrir un accidente cerebrovascular iguala al de un no fumador.', icono: '💥' },
      { id: 35, tiempoHoras: 30660, titulo: 'Limpieza Arterial Máxima', desc: '3.5 años. Las paredes arteriales internas están limpias de depósitos nicotínicos.', icono: '🛣️' },
      { id: 36, tiempoHoras: 35040, titulo: 'CUATRO AÑOS DE GLORIA', desc: 'Tu tasa de envejecimiento celular celular se ralentiza al ritmo normal óptimo.', icono: '⏳' },
      { id: 37, tiempoHoras: 39420, titulo: 'Células Inmunes Alfa', desc: '4.5 años. Las células asesinas naturales (NK) eliminan con éxito mutaciones base.', icono: '🏹' },
      { id: 38, tiempoHoras: 43800, titulo: 'LUSTRO DE ACERO (5 AÑOS)', desc: 'El riesgo de morir por cáncer de pulmón disminuye a la mitad.', icono: '🏅' },
      { id: 39, tiempoHoras: 52560, titulo: 'Socio de Platino', desc: '6 años. Tu esperanza de vida calculada estadísticamente aumenta notablemente.', icono: '🌌' },
      { id: 40, tiempoHoras: 61320, titulo: 'Soberanía Biológica', desc: '7 años. Los niveles de toxinas acumuladas en la médula ósea desaparecen.', icono: '🔮' },
      { id: 41, tiempoHoras: 70080, titulo: 'OCHO AÑOS LIBRE', desc: 'El riesgo de padecer diabetes tipo 2 disminuye al nivel de un no fumador.', icono: '🩸' },
      { id: 42, tiempoHoras: 78840, titulo: 'Pureza Celular', desc: '9 años. El tejido del páncreas y la vejiga están completamente protegidos.', icono: '🛡️' },
      { id: 43, tiempoHoras: 87600, titulo: 'DÉCADA INQUEBRANTABLE', desc: '10 años. El riesgo de cáncer de pulmón cae al mismo nivel que si nunca hubieras fumado.', icono: '🔱' },
      { id: 44, tiempoHoras: 105120, titulo: 'Leyenda +TESTO', desc: '12 años. Las células precancerosas han sido completamente reemplazadas.', icono: '🌋' },
      { id: 45, tiempoHoras: 122640, titulo: 'Evolución Completa', desc: '14 años. La arquitectura interna de tus pulmones es idéntica a la nativa pura.', icono: '🌳' },
      { id: 46, tiempoHoras: 131400, titulo: '15 AÑOS DE PUREZA MÁXIMA', desc: 'El riesgo de enfermedad coronaria es ahora idéntico al de una persona que jamás fumó.', icono: '🌟' },
      { id: 47, tiempoHoras: 148920, titulo: 'Inmortalidad Estadística', desc: '17 años. Los efectos acumulativos del daño vascular crónico quedan saldados.', icono: '💫' },
      { id: 48, tiempoHoras: 166440, titulo: 'Salud Absoluta', desc: '19 años. Tu perfil de riesgo general es impecable.', icono: '🪐' },
      { id: 49, tiempoHoras: 175200, titulo: '20 AÑOS INTACTO', desc: 'Sistema respiratorio y cardiovascular reseteados al 100% de fábrica.', icono: '🌌' },
      { id: 50, tiempoHoras: 262800, titulo: 'DIOS DE LA DISCIPLINA', desc: 'Dos décadas de autocontrol absoluto. Eres el Forjador de tu propio destiny biológico.', icono: '☀️' },
    ],
    []
  );

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      const meta = user.user_metadata;
      const fecha = meta?.fecha_dejo_fumar || user.created_at;
      setFechaInicio(fecha);
      setNuevaFecha(new Date(fecha).toISOString().split('T')[0]);
      setNuevoNombre(meta?.nombre || '');
      setAlias(meta?.alias || 'SOCIO');
      setBio(meta?.mision || 'OPERATIVO ACTIVO');
      setColorAcento(meta?.color_acento || '#ea580c');
      setGhostMode(meta?.ghost_mode || false);

      if (meta?.es_fumador === undefined || meta?.es_fumador === null) {
        setShowTabacoModal(true);
      } else {
        setShowTabacoModal(false);
        if (meta?.es_fumador === true && meta?.quiere_reloj === true) {
          setDatosTabaco({
            cigarrillosDia: String(meta?.cigarrillos_dia || 0),
            precioPaquete: String(meta?.precio_paquete || 0),
            unidadesPaquete: String(meta?.unidades_paquete || 20),
          });
        }
      }

      const { data: tasks } = await supabase.from('tareas').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (tasks) setTareas(tasks);

      if (user.email === 'altava.rubia@gmail.com') {
        const { data: socios } = await supabase
          .from('dieta_cuestionarios')
          .select('*')
          .order('updated_at', { ascending: false });
        if (socios) setSociosCuestionario(socios);
      }
      const { data: perfilAdmin } = await supabase
.from('profiles')
.select('role')
.eq('email', user.email)
.single();

setEsAdminReal(
perfilAdmin?.role==="admin"
);
      setLoading(false);
    };
    
    getData();
  }, [supabase, router]);

  useEffect(() => {
    if (!fechaInicio) return;
    const intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const inicio = new Date(fechaInicio).getTime();
      const dif = ahora - inicio;
      if (dif > 0) {
        setTiempo({
          dias: Math.floor(dif / (1000 * 60 * 60 * 24)),
          horas: Math.floor((dif / (1000 * 60 * 60)) % 24),
          min: Math.floor((dif / 1000 / 60) % 60),
          seg: Math.floor((dif / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fechaInicio]);

  const analisisProgresoTabaco = useMemo(() => {
    if (!fechaInicio || !user?.user_metadata?.quiere_reloj) return null;
    const totalMs = new Date().getTime() - new Date(fechaInicio).getTime();
    const totalHoras = totalMs / (1000 * 60 * 60);
    const totalDias = totalHoras / 24;
    const cigsDia = Number(datosTabaco.cigarrillosDia) || 0;
    const precioPaq = Number(datosTabaco.precioPaquete) || 0;
    const unidPaq = Number(datosTabaco.unidadesPaquete) || 20;
    const precioPorCigarrillo = precioPaq / unidPaq;
    const dineroAhorrado = totalDias * cigsDia * precioPorCigarrillo;
    const cigarrosEvitados = totalDias * cigsDia;
    const logrados = hitosSaludYLogros.filter((h) => totalHoras >= h.tiempoHoras);
    const proximoHito = hitosSaludYLogros.find((h) => totalHoras < h.tiempoHoras) || hitosSaludYLogros[hitosSaludYLogros.length - 1];
    const beneficioActual = logrados.length > 0 ? logrados[logrados.length - 1].desc : 'Iniciando desintoxicación sistémica...';
    return {
      dinero: dineroAhorrado.toFixed(2),
      cigarros: Math.floor(cigarrosEvitados),
      salud: beneficioActual,
      logros: logrados,
      proximo: proximoHito,
      totalHitosCount: hitosSaludYLogros.length,
    };
  }, [fechaInicio, datosTabaco, user, hitosSaludYLogros]);

  const guardarAjustes = async () => {
    await supabase.auth.updateUser({
      data: {
        nombre: nuevoNombre,
        alias,
        mision: bio,
        color_acento: colorAcento,
        ghost_mode: ghostMode,
        fecha_dejo_fumar: new Date(nuevaFecha).toISOString(),
      },
    });
    setEditandoPerfil(false);
    window.location.reload();
  };

  const enviarTareaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTarea || !socioId) return;
    const { error } = await supabase.from('tareas').insert([{ titulo: tituloTarea, duracion_minutos: minutosTarea, user_id: socioId }]);
    if (!error) {
      setStatusMsg('DESPLEGADO');
      setTituloTarea('');
      setSocioId('');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const cargarDietas = async () => {
    if (!user) return;
    setCargandoDietas(true);
    const { data, error } = await supabase
      .from('dietas_pdf')
      .select('*')
      .eq('destinatario_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setDietas(data);
    setCargandoDietas(false);
  };

  const abrirMisDietas = async () => {
    if (!user) return;
    setMenuAbierto(false);
    setDietasModal(true);
    setCargandoDietas(true);

    const { data: cuestionario } = await supabase
      .from('dieta_cuestionarios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!cuestionario) {
      setCuestionarioPendiente(true);
      setCargandoDietas(false);
      return;
    }

    setCuestionarioPendiente(false);
    await cargarDietas();
  };

  const guardarCuestionarioDieta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGuardandoCuestionario(true);

    const { error } = await supabase.from('dieta_cuestionarios').upsert({
      user_id: user.id,
      email: user.email,
      alias,
      sexo: formDieta.sexo,
      edad: Number(formDieta.edad),
      peso_kg: Number(formDieta.peso_kg),
      altura_cm: Number(formDieta.altura_cm),
      objetivo: formDieta.objetivo,
      nivel_actividad: formDieta.nivel_actividad,
      trabajo_movimiento: formDieta.trabajo_movimiento,
      deporte: formDieta.deporte,
      deporte_detalle: formDieta.deporte_detalle,
      dias_entreno_semana: Number(formDieta.dias_entreno_semana),
      duracion_entreno: formDieta.duracion_entreno,
      comidas_dia: Number(formDieta.comidas_dia),
      horario_comidas: formDieta.horario_comidas,
      intolerancias: formDieta.intolerancias,
      alergias: formDieta.alergias,
      alimentos_no_gustan: formDieta.alimentos_no_gustan,
      alimentos_preferidos: formDieta.alimentos_preferidos,
      restricciones: formDieta.restricciones,
      patologias: formDieta.patologias,
      medicacion: formDieta.medicacion,
      suplementos: formDieta.suplementos,
      presupuesto: formDieta.presupuesto,
      cocina: formDieta.cocina,
      notas: formDieta.notas,
      updated_at: new Date().toISOString(),
    });

    setGuardandoCuestionario(false);
    if (!error) {
      setCuestionarioPendiente(false);
      await cargarDietas();
    } else {
      alert(error.message);
    }
  };

  const subirDietaPdfAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !user || !pdfDieta || !tituloPdfDieta.trim() || !socioDietaSeleccionado) return;

    if (pdfDieta.type !== 'application/pdf') {
      alert('Solo puedes subir archivos PDF.');
      return;
    }

    setSubiendoPdfDieta(true);
    const filePath = `personalizadas/${socioDietaSeleccionado}/${Date.now()}-${pdfDieta.name.replaceAll(' ', '_')}`;

    const { error: uploadError } = await supabase.storage.from('dietas').upload(filePath, pdfDieta, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      alert(uploadError.message);
      setSubiendoPdfDieta(false);
      return;
    }

    const { error: insertError } = await supabase.from('dietas_pdf').insert({
      titulo: tituloPdfDieta.trim(),
      descripcion: descripcionPdfDieta.trim() || null,
      file_path: filePath,
      file_name: pdfDieta.name,
      destinatario_id: socioDietaSeleccionado,
      creado_por: user.id,
    });

    if (insertError) {
      alert(insertError.message);
    } else {
      setTituloPdfDieta('');
      setDescripcionPdfDieta('');
      setPdfDieta(null);
      setSocioDietaSeleccionado('');
      alert('Dieta personalizada enviada al socio seleccionado.');
    }
    setSubiendoPdfDieta(false);
  };
  const enviarMarketing = async () => {
  if (!asuntoMarketing.trim() || !mensajeMarketing.trim()) {
    alert('Falta asunto o mensaje');
    return;
  }

  const confirmar = confirm(
    'Vas a enviar este correo a todos los usuarios que aceptaron comunicaciones comerciales. ¿Continuar?'
  );

  if (!confirmar) return;

  setEnviandoMarketing(true);

  try {
    const res = await fetch('/api/admin/enviar-marketing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asunto: asuntoMarketing,
        mensaje: mensajeMarketing,
        adminEmail: user.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error enviando correos');
      setEnviandoMarketing(false);
      return;
    }

    alert(`Correos enviados: ${data.enviados || 0}`);

    setAsuntoMarketing('');
    setMensajeMarketing('');
  } catch {
    alert('Error enviando correos');
  }

  setEnviandoMarketing(false);
};
  const abrirPdfDieta = async (filePath: string) => {
    const { data, error } = await supabase.storage.from('dietas').createSignedUrl(filePath, 60 * 10);
    if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const consultarMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto || cargandoIA) return;
    const nuevoMensaje: { role: 'user'; content: string } = { role: 'user', content: texto };
    const historialActualizado = [...chat, nuevoMensaje];
    setChat(historialActualizado);
    setMensaje('');
    setCargandoIA(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historialActualizado,
          contexto: `PROGRESO ACTUAL:\nAlias: ${alias}\nRacha exacta: ${tiempo.dias} días, ${tiempo.horas} horas, ${tiempo.min} minutos y ${tiempo.seg} segundos.\nRango actual: ${obtenerRango()}\nMisión personal: ${bio}`,
          temp: temperatura,
          words: brevedad,
        }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: 'assistant', content: data.content || 'SISTEMA: SIN RESPUESTA.' }]);
    } catch (e) {
      console.error(e);
      setChat((prev) => [...prev, { role: 'assistant', content: 'SISTEMA: ERROR DE CONEXIÓN.' }]);
    } finally {
      setCargandoIA(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 80);
    }
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, cargandoIA]);

  if (loading) {
    return <div className="bg-black min-h-screen text-white flex items-center justify-center font-black animate-pulse uppercase tracking-[1em]">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-white selection:text-black" style={{ '--color-acento': colorAcento } as any}>
      <nav className="fixed top-0 left-0 w-full h-16 border-b border-zinc-900 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-between px-8">
        <span className="text-xl font-black italic tracking-tighter cursor-pointer" style={{ color: colorAcento }} onClick={() => window.location.reload()}>
          +TESTO
        </span>
        <div className="relative">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-9 h-9 rounded-full bg-zinc-900 border flex items-center justify-center font-black transition-all text-[10px]"
            style={{ borderColor: menuAbierto ? colorAcento : '#27272a' }}
          >
            {alias[0]?.toUpperCase()}
          </button>

          {menuAbierto && (
            <div className="absolute top-14 right-0 w-80 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Operativo</p>
              <p className="text-[10px] font-bold truncate mb-4" style={{ color: colorAcento }}>{user?.email}</p>

              {analisisProgresoTabaco && (
                <div className="mb-4 border-t border-zinc-900 pt-3">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">
                    Logros de Salud ({analisisProgresoTabaco.logros.length}/{analisisProgresoTabaco.totalHitosCount})
                  </p>
                  {analisisProgresoTabaco.logros.length === 0 ? (
                    <p className="text-[8px] text-zinc-600 italic uppercase">Forjando primer logro...</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {analisisProgresoTabaco.logros.map((logro) => (
                        <div key={logro.id} className="flex items-center gap-2 bg-black/40 border border-zinc-900 p-2 rounded-xl">
                          <span className="text-xs">{logro.icono}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-white uppercase truncate">{logro.titulo}</p>
                            <p className="text-[7px] text-zinc-500 truncate">{logro.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1 border-t border-zinc-900 pt-4">
                <button onClick={() => window.open('https://buy.stripe.com/tu_enlace_aqui', '_blank')} className="w-full mb-2 bg-orange-600 text-white p-3 text-[10px] font-black uppercase rounded-xl transition-all flex justify-between items-center group hover:bg-orange-500 shadow-lg shadow-orange-900/20">
                  Hazte Socio <span className="text-white">⚡</span>
                </button>

                <button onClick={() => router.push('/ranking')} className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all flex justify-between items-center group">
                  Leaderboard <span style={{ color: colorAcento }} className="opacity-0 group-hover:opacity-100">→</span>
                </button>

                <button onClick={abrirMisDietas} className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all flex justify-between items-center group">
                  Mis Dietas <span style={{ color: colorAcento }} className="opacity-0 group-hover:opacity-100">→</span>
                </button>
                {esAdminReal && (
    <button
    onClick={() => router.push('/admin/crear-blog')}
    className="w-full text-left p-3 text-[9px] font-black uppercase text-orange-500 hover:text-white hover:bg-orange-600 rounded-xl transition-all flex justify-between items-center group"
  >
    Crear Blog
    <span className="opacity-70">✍️</span>
  </button>
)}
                {esAdminReal && (
  <a
    href="/api/exportar-bd"
    target="_blank"
    rel="noopener noreferrer"
    className="w-full text-left p-3 text-[9px] font-black uppercase text-orange-500 hover:text-white hover:bg-orange-600 rounded-xl transition-all flex justify-between items-center group"
  >
    Exportar Base Datos
    <span className="opacity-70">📁</span>
  </a>
)}

                <button onClick={() => { setEditandoPerfil(true); setMenuAbierto(false); }} className="w-full text-left p-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">
                  Ajustes Tácticos
                </button>

                <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full text-left p-3 text-[9px] font-black uppercase text-red-600 mt-2 border-t border-zinc-900 pt-4 italic">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="mt-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] sticky top-24">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-4 tracking-widest italic">Estado_Actual</p>
            <p className="text-[14px] font-black mb-1 uppercase italic tracking-tighter" style={{ color: colorAcento }}>{alias}</p>
            <p className="text-[8px] text-zinc-600 font-bold mb-6 uppercase italic">&quot;{bio}&quot;</p>
            <div className="flex justify-between text-[8px] font-black mb-1 uppercase text-zinc-400">
              <span>{obtenerRango()}</span>
              <span>XP: {(tiempo.dias % 10) * 10}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000" style={{ backgroundColor: colorAcento, width: `${(tiempo.dias % 10) * 10}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${colorAcento}, transparent)` }} />
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500 mb-12 italic">Cronómetro de Disciplina</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.dias}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Días</p></div>
              <div><p className="text-5xl md:text-7xl font-black" style={{ color: colorAcento }}>{tiempo.horas.toString().padStart(2, '0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Hrs</p></div>
              <div><p className="text-5xl md:text-7xl font-black">{tiempo.min.toString().padStart(2, '0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Min</p></div>
              <div><p className="text-5xl md:text-7xl font-black" style={{ color: colorAcento }}>{tiempo.seg.toString().padStart(2, '0')}</p><p className="text-[7px] text-zinc-600 font-black uppercase">Seg</p></div>
            </div>
          </div>

          {user?.user_metadata?.quiere_reloj && analisisProgresoTabaco && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">Protocolo Anti-Tabaco Activo</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 border border-zinc-900 p-4 rounded-2xl text-center"><span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Capital Recuperado</span><span className="text-2xl font-mono font-black text-green-500">{analisisProgresoTabaco.dinero}€</span></div>
                <div className="bg-black/50 border border-zinc-900 p-4 rounded-2xl text-center"><span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Cigarros Evitados</span><span className="text-2xl font-mono font-black text-white">{analisisProgresoTabaco.cigarros}</span></div>
              </div>
              <div className="border-t border-zinc-900 pt-4 text-left mb-4">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Último Impacto Biológico Conseguido</span>
                <p className="text-[10px] font-bold uppercase text-green-400 tracking-wide italic">{analisisProgresoTabaco.salud}</p>
              </div>
              {analisisProgresoTabaco.proximo && (
                <div className="border-t border-zinc-900 pt-4 text-left">
                  <div className="flex justify-between items-center mb-1"><span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Siguiente Objetivo Sanitario</span><span className="text-[7px] font-mono text-zinc-500">HITO #{analisisProgresoTabaco.proximo.id}</span></div>
                  <p className="text-[9px] font-black uppercase text-zinc-300 tracking-wide">{analisisProgresoTabaco.proximo.icono} {analisisProgresoTabaco.proximo.titulo}</p>
                  <p className="text-[8px] text-zinc-500 italic mt-0.5">{analisisProgresoTabaco.proximo.desc}</p>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black uppercase mb-6 text-center italic tracking-widest" style={{ color: colorAcento }}>Asignación de Misiones</h4>
              <form onSubmit={enviarTareaAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input value={tituloTarea} onChange={(e) => setTituloTarea(e.target.value)} placeholder="TÍTULO" className="md:col-span-9 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500" />
                  <input type="number" value={minutosTarea} onChange={(e) => setMinutosTarea(parseInt(e.target.value))} className="md:col-span-3 bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono outline-none" style={{ color: colorAcento }} />
                </div>
                <input value={socioId} onChange={(e) => setSocioId(e.target.value)} placeholder="ID DEL SOCIO" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono outline-none" />
                <button className="w-full py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all" style={{ backgroundColor: colorAcento, color: 'black' }}>Lanzar Objetivo</button>
                {statusMsg && <p className="text-center text-[8px] font-black text-green-500 animate-pulse uppercase">{statusMsg}</p>}
              </form>
            </div>
          )}
          {esAdminReal && (
  <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem]">
    <h4
      className="text-[10px] font-black uppercase mb-6 text-center italic tracking-widest"
      style={{ color: colorAcento }}
    >
      Campaña Email Mastesto
    </h4>

    <input
      value={asuntoMarketing}
      onChange={(e) => setAsuntoMarketing(e.target.value)}
      placeholder="ASUNTO DEL CORREO"
      className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500 mb-4"
    />

    <textarea
      value={mensajeMarketing}
      onChange={(e) => setMensajeMarketing(e.target.value)}
      placeholder="MENSAJE DEL CORREO"
      className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500 h-40 resize-none mb-4"
    />

    <button
      onClick={enviarMarketing}
      disabled={enviandoMarketing}
      className="w-full py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30"
      style={{
        backgroundColor: colorAcento,
        color: 'black',
      }}
    >
      {enviandoMarketing ? 'ENVIANDO CORREOS...' : 'ENVIAR A USUARIOS SUSCRITOS'}
    </button>

    <p className="text-[8px] text-zinc-600 uppercase font-bold italic text-center mt-4 leading-relaxed">
      Solo se enviará a usuarios con acepta_marketing = true.
    </p>
  </div>
)}

          {isAdmin && (
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black uppercase mb-6 text-center italic tracking-widest" style={{ color: colorAcento }}>Enviar Dieta Personalizada</h4>
              <form onSubmit={subirDietaPdfAdmin} className="space-y-4">
                <select value={socioDietaSeleccionado} onChange={(e) => setSocioDietaSeleccionado(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 outline-none" required>
                  <option value="">SELECCIONA SOCIO CON CUESTIONARIO</option>
                  {sociosCuestionario.map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.alias || 'SOCIO'} · {s.email} · {s.objetivo}</option>
                  ))}
                </select>
                <input value={tituloPdfDieta} onChange={(e) => setTituloPdfDieta(e.target.value)} placeholder="TÍTULO DE LA DIETA" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500" />
                <textarea value={descripcionPdfDieta} onChange={(e) => setDescripcionPdfDieta(e.target.value)} placeholder="DESCRIPCIÓN BREVE" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] uppercase font-bold text-white outline-none focus:border-zinc-500 h-20 resize-none" />
                <input type="file" accept="application/pdf" onChange={(e) => setPdfDieta(e.target.files?.[0] || null)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 file:bg-white file:text-black file:border-0 file:rounded-lg file:px-3 file:py-2 file:text-[9px] file:font-black file:uppercase" />
                <button type="submit" disabled={subiendoPdfDieta || !pdfDieta || !tituloPdfDieta.trim() || !socioDietaSeleccionado} className="w-full py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30" style={{ backgroundColor: colorAcento, color: 'black' }}>
                  {subiendoPdfDieta ? 'SUBIENDO PDF...' : 'ENVIAR PDF AL SOCIO'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2.5rem] min-h-[250px]">
            <p className="text-[8px] text-zinc-500 uppercase font-black mb-6 tracking-widest text-center italic">Buffer_Misiones</p>
            
            {tareas.length > 0 ? tareas.map((t: any) => <CardTarea key={t.id} tarea={t} userNick={alias} supabase={supabase} colorAcento={colorAcento} />) : <p className="text-[8px] text-zinc-700 text-center uppercase font-black italic mt-20">Esperando órdenes...</p>}
          </div>
        </div>
      </main>

      {dietasModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[145] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-[3rem] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-8">
              <div>
                <h3 className="font-black text-[12px] uppercase tracking-[0.5em] mb-2 italic" style={{ color: colorAcento }}>Mis Dietas</h3>
                <p className="text-[9px] text-zinc-500 uppercase font-bold italic tracking-widest">Nutrición táctica personalizada.</p>
              </div>
              <button onClick={() => setDietasModal(false)} className="w-9 h-9 rounded-full bg-zinc-900 text-zinc-400 hover:text-white text-xs font-black">✕</button>
            </div>

            {cuestionarioPendiente ? (
              <form onSubmit={guardarCuestionarioDieta} className="space-y-6">
                <div className="p-5 rounded-2xl bg-black/50 border border-orange-600/20">
                  <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest mb-2">Primer acceso detectado</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold leading-relaxed">Completa este cuestionario para que podamos crear tu dieta personalizada.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required type="number" placeholder="EDAD" value={formDieta.edad} onChange={(e) => setFormDieta({ ...formDieta, edad: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input required type="number" step="0.1" placeholder="PESO KG" value={formDieta.peso_kg} onChange={(e) => setFormDieta({ ...formDieta, peso_kg: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input required type="number" step="0.1" placeholder="ALTURA CM" value={formDieta.altura_cm} onChange={(e) => setFormDieta({ ...formDieta, altura_cm: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select required value={formDieta.sexo} onChange={(e) => setFormDieta({ ...formDieta, sexo: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 outline-none"><option value="">SEXO</option><option value="hombre">Hombre</option><option value="mujer">Mujer</option><option value="otro">Otro</option></select>
                  <select required value={formDieta.objetivo} onChange={(e) => setFormDieta({ ...formDieta, objetivo: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 outline-none"><option value="">OBJETIVO</option><option value="perder_grasa">Perder grasa</option><option value="ganar_musculo">Ganar músculo</option><option value="recomposicion">Recomposición corporal</option><option value="rendimiento">Rendimiento</option><option value="salud">Salud y hábitos</option></select>
                  <select required value={formDieta.nivel_actividad} onChange={(e) => setFormDieta({ ...formDieta, nivel_actividad: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 outline-none"><option value="">¿CUÁNTO TE MUEVES?</option><option value="sedentario">Sedentario</option><option value="ligero">Ligero</option><option value="moderado">Moderado</option><option value="alto">Alto</option><option value="muy_alto">Muy alto</option></select>
                  <input required placeholder="TRABAJO / MOVIMIENTO DIARIO" value={formDieta.trabajo_movimiento} onChange={(e) => setFormDieta({ ...formDieta, trabajo_movimiento: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <select required value={formDieta.deporte} onChange={(e) => setFormDieta({ ...formDieta, deporte: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-zinc-400 outline-none"><option value="">¿PRACTICAS DEPORTE?</option><option value="si">Sí</option><option value="no">No</option></select>
                  <input placeholder="DEPORTE Y DETALLE" value={formDieta.deporte_detalle} onChange={(e) => setFormDieta({ ...formDieta, deporte_detalle: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input required type="number" placeholder="DÍAS ENTRENO / SEMANA" value={formDieta.dias_entreno_semana} onChange={(e) => setFormDieta({ ...formDieta, dias_entreno_semana: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input placeholder="DURACIÓN ENTRENO" value={formDieta.duracion_entreno} onChange={(e) => setFormDieta({ ...formDieta, duracion_entreno: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input required type="number" placeholder="COMIDAS AL DÍA" value={formDieta.comidas_dia} onChange={(e) => setFormDieta({ ...formDieta, comidas_dia: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                  <input placeholder="HORARIO COMIDAS" value={formDieta.horario_comidas} onChange={(e) => setFormDieta({ ...formDieta, horario_comidas: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['intolerancias', 'INTOLERANCIAS'],
                    ['alergias', 'ALERGIAS'],
                    ['alimentos_no_gustan', 'ALIMENTOS QUE NO TE GUSTAN'],
                    ['alimentos_preferidos', 'ALIMENTOS PREFERIDOS'],
                    ['restricciones', 'RESTRICCIONES / RELIGIÓN / VEGANO'],
                    ['patologias', 'PATOLOGÍAS'],
                    ['medicacion', 'MEDICACIÓN'],
                    ['suplementos', 'SUPLEMENTOS'],
                    ['presupuesto', 'PRESUPUESTO'],
                    ['cocina', 'TIEMPO / NIVEL DE COCINA'],
                    ['notas', 'NOTAS EXTRA'],
                  ].map(([key, label]) => (
                    <textarea key={key} placeholder={label} value={(formDieta as any)[key]} onChange={(e) => setFormDieta({ ...formDieta, [key]: e.target.value })} className="bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none h-20 resize-none" />
                  ))}
                </div>
                <button type="submit" disabled={guardandoCuestionario} className="w-full py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30" style={{ backgroundColor: colorAcento, color: 'black' }}>{guardandoCuestionario ? 'GUARDANDO...' : 'GUARDAR CUESTIONARIO'}</button>
              </form>
            ) : (
              <div>
                {cargandoDietas ? (
                  <p className="text-[9px] text-zinc-500 uppercase font-black animate-pulse">Cargando dietas...</p>
                ) : dietas.length > 0 ? (
                  <div className="space-y-3">
                    {dietas.map((d) => (
                      <div key={d.id} className="p-5 rounded-2xl border border-zinc-900 bg-black/40 flex justify-between gap-4 items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase text-white">{d.titulo}</p>
                          <p className="text-[8px] text-zinc-500 uppercase mt-1">{d.descripcion || d.file_name}</p>
                        </div>
                        <button onClick={() => abrirPdfDieta(d.file_path)} className="px-4 py-3 rounded-xl bg-white text-black text-[8px] font-black uppercase">Abrir PDF</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-zinc-600 uppercase font-black text-center py-12">Aún no tienes una dieta personalizada asignada.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[140]">
        {!mentorAbierto ? (
          <button type="button" onClick={() => setMentorAbierto(true)} className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-950 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-all" style={{ boxShadow: `0 0 35px ${colorAcento}35`, borderColor: `${colorAcento}55` }}><span className="text-2xl">⚔️</span></button>
        ) : (
          <div className="w-[92vw] max-w-[380px] h-[560px] bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-black/40"><div><p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest italic">El Forjador</p><p className="text-[8px] text-zinc-600 uppercase font-bold">Sistema táctico desplegado</p></div><button type="button" onClick={() => setMentorAbierto(false)} className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white text-xs font-black">✕</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin" ref={scrollRef}>{chat.length === 0 ? <div className="h-full flex items-center justify-center text-center px-8"><p className="text-[9px] text-zinc-600 uppercase italic leading-relaxed">Sistemas listos. Pregunta al mentor y seguirá la conversación mensaje tras mensaje.</p></div> : chat.map((msg, idx) => <div key={idx} className={`p-3 rounded-2xl border text-[10px] leading-relaxed ${msg.role === 'user' ? 'bg-zinc-900/70 border-zinc-800 ml-8 text-right' : 'bg-black border-zinc-900 mr-8 text-left'}`}><p className="text-[7px] font-black tracking-wider text-zinc-500 uppercase mb-1">{msg.role === 'user' ? alias : 'El Forjador'}</p><p className={msg.role === 'user' ? 'text-zinc-300' : 'text-zinc-100 font-medium'}>{msg.content}</p></div>)}{cargandoIA && <div className="text-[8px] text-zinc-500 font-black animate-pulse uppercase tracking-wider">Procesando respuesta...</div>}</div>
            <div className="p-4 border-t border-zinc-900 bg-black/30"><div className="mb-4 space-y-3"><div><div className="flex justify-between mb-1"><span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Temperatura IA</span><span className="text-[7px] font-mono" style={{ color: colorAcento }}>{temperatura.toFixed(1)}</span></div><input type="range" min="0" max="1" step="0.1" value={temperatura} onChange={(e) => setTemperatura(Number(e.target.value))} className="w-full accent-orange-600" /></div><div><div className="flex justify-between mb-1"><span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Máximo palabras</span><span className="text-[7px] font-mono" style={{ color: colorAcento }}>{brevedad}</span></div><input type="range" min="20" max="200" step="10" value={brevedad} onChange={(e) => setBrevedad(Number(e.target.value))} className="w-full accent-orange-600" /></div></div><form onSubmit={consultarMentor} className="flex gap-2"><input value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="ESCRIBE AL FORJADOR..." className="flex-1 bg-black border border-zinc-900 p-3 rounded-xl text-[10px] font-bold text-white outline-none focus:border-zinc-700" disabled={cargandoIA} /><button type="submit" disabled={cargandoIA || !mensaje.trim()} className="px-4 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:opacity-80 transition-all disabled:opacity-30">ENVIAR</button></form></div>
          </div>
        )}
      </div>

      {editandoPerfil && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl">
            <h3 className="font-black text-[12px] uppercase tracking-[0.5em] mb-10 italic text-center" style={{ color: colorAcento }}>Centro de Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-6"><div><label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Nombre Real</label><input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="w-full bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-white outline-none focus:border-zinc-500 uppercase" /></div><div><label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Callsign (Alias)</label><input value={alias} onChange={(e) => setAlias(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] outline-none uppercase font-black italic" style={{ color: colorAcento }} /></div><div><label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Declaración de Misión (Bio)</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none h-20 resize-none italic" /></div></div><div className="space-y-6"><div><label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Color de Acento Hex</label><input value={colorAcento} onChange={(e) => setColorAcento(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] font-mono outline-none" style={{ color: colorAcento }} /></div><div><label className="text-[8px] font-black text-zinc-500 uppercase mb-2 block italic">Fecha del Cambio (Desintoxicación)</label><input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[10px] text-white outline-none font-mono" /></div><div className="flex items-center justify-between p-4 bg-black/40 border border-zinc-900 rounded-xl"><span className="text-[8px] font-black text-zinc-500 uppercase italic">Modo Fantasma</span><input type="checkbox" checked={ghostMode} onChange={(e) => setGhostMode(e.target.checked)} className="w-4 h-4 accent-zinc-500" /></div></div></div>
            <div className="flex gap-4 mt-10"><button onClick={() => setEditandoPerfil(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Cancelar</button><button onClick={guardarAjustes} className="flex-1 py-4 bg-white text-black hover:opacity-80 rounded-xl text-[10px] font-black uppercase transition-all">Guardar Protocolo</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
