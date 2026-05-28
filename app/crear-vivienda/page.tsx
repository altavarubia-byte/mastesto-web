"use client";
import ModelObjeto from "@/components/ModelObjeto";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Line, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// =========================================================
// CONFIGURACIÓN DE APIS
// =========================================================
// Backend Hugging Face activo para crear-vivienda.
// En Vercel puedes sobrescribirlo con:
// NEXT_PUBLIC_API_URL
// NEXT_PUBLIC_SIONNA_API_URL
const DEFAULT_BACKEND_URL = "https://VicenteAltava-mastesto-sionna-api.hf.space";

const normalizarApiUrl = (url?: string) =>
  (url && url.trim().length > 0 ? url : DEFAULT_BACKEND_URL).replace(/\/$/, "");

const API_URL = normalizarApiUrl(process.env.NEXT_PUBLIC_API_URL);

const SIONNA_API_URL = normalizarApiUrl(
  process.env.NEXT_PUBLIC_SIONNA_API_URL || process.env.NEXT_PUBLIC_API_URL,
);

// =========================================================
// TIPOS DE DATOS DEL SIMULADOR
// =========================================================
type Habitacion = {
  id: string;
  nombre: string;
  x: number;
  z: number;
  ancho: number;
  largo: number;
  alto: number;
  materialPared?: string;
  materialSuelo?: string;
  materialTecho?: string;

  // Propiedades físicas RF opcionales
  espesorParedM?: number;
  espesorSueloM?: number;
  espesorTechoM?: number;
  rugosidadParedM?: number;
  rugosidadSueloM?: number;
  rugosidadTechoM?: number;
  capasPared?: MaterialCapaRF[];
  capasSuelo?: MaterialCapaRF[];
  capasTecho?: MaterialCapaRF[];
};

type MaterialCapaRF = {
  material: string;
  espesorM: number;
  rugosidadM?: number;
  epsR?: number;
  sigmaS_m?: number;
  tanDelta?: number;
  nombre?: string;
};

type Objeto3D = {
  id: string;
  tipo: string;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: string;
  material?: string;

  // Movimiento dinámico para personajes/personas
  direccionDeg?: number;
  sentido?: 1 | -1;
  velocidadMps?: number;
  recorridoM?: number;
  origenX?: number;
  origenZ?: number;

  // Columna térmica dinámica
  T_hot_K?: number;
  T_amb_K?: number;
  temperaturaC?: number;
  v_mean_mps?: number;
  sigma_v_mps?: number;
  atenuacion_base_db?: number;
  delay_extra_base_ns?: number;

  // Parámetros físicos avanzados de columna térmica
  pressure_hpa?: number;
  humidity_rel?: number;
  turbulence_strength?: number;
  absorcion_extra_db_m?: number;

  // Propiedades RF opcionales del objeto/obstáculo
  espesorM?: number;
  rugosidadM?: number;
  epsR?: number;
  sigmaS_m?: number;
  tanDelta?: number;
};

type PuntoHeatmap = {
  x: number;
  z: number;
  potenciaDbm: number;
  calidad: "excelente" | "buena" | "media" | "mala";
  delaySpreadRmsNs?: number;
  retardoMedioNs?: number;
  dopplerHz?: number;
  numComponentes?: number;
  modelo?: string;
};

type RayoCobertura = {
  id: string;
  tipo: "directo" | "reflejado" | "debil" | "afectado_persona" | string;
  potenciaDbm: number;
  los?: boolean;
  nlos?: boolean;
  numRebotes?: number;
  afectadoPorPersona?: boolean;
  personasInteractuadas?: string[];
  dopplerPersonaHz?: number;
  perdidaPersonaDb?: number;
  modeloInteraccionPersona?: string;
  esDifractado?: boolean;
  tiposInteraccionSionna?: string[];
  tipoVisual?: string;
  objetosInteractuados?: number[];
  puntos: {
    x: number;
    y: number;
    z: number;
  }[];
};

type MuestraCIR = {
  id?: string;
  tipo?: string;
  delayNs: number;
  potenciaDbm: number;
  magnitud?: number;
  faseRad?: number;
  dopplerHz?: number;
  tap?: number;
};

type CirResumen = {
  delaySpreadRmsNs?: number;
  delaySpreadNs?: number;
  retardoMedioNs?: number;
  potenciaTotalDbm?: number;
  potenciaTotal?: number;
  numComponentes?: number;
  anchoBandaMhz?: number;
};

type MaterialRF = {
  nombre?: string;
  material?: string;
  rol?: string;
  frecuenciaHz?: number;
  frecuenciaGhz?: number;
  epsR?: number;
  eps_r?: number;
  sigmaS_m?: number;
  sigma_s_m?: number;
  tanDelta?: number;
  tan_delta?: number;
  epsComplejaReal?: number;
  eps_compleja_real?: number;
  epsComplejaImag?: number;
  eps_compleja_imag?: number;
  espesorM?: number;
  espesor_m?: number;
  rugosidadM?: number;
  rugosidad_m?: number;
  perdidaSlabDb?: number;
  perdida_slab_db?: number;
  perdidaRugosidadDb?: number;
  perdida_rugosidad_db?: number;
  perdidaTotalDb?: number;
  perdida_total_db?: number;
  coefReflexionAbs?: number;
  coef_reflexion_normal_abs?: number;
  perdidaReflexionDb?: number;
  perdida_reflexion_db?: number;
  lambda_m?: number;
  modelo?: string;
  [key: string]: any;
};


const nrf = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const materialRfValue = (m: any, camel: string, snake: string, fallback = 0): number => {
  return nrf(m?.[camel] ?? m?.[snake], fallback);
};

const fmtFixed = (value: unknown, digits = 3): string => nrf(value).toFixed(digits);

const fmtExp = (value: unknown, digits = 2): string => nrf(value).toExponential(digits);

type ResultadoCobertura = {
  ok: boolean;
  mensaje: string;
  modelo?: {
    frecuenciaMhz: number;
    potenciaTxDbm: number;
    materialPared?: string;
    materialesObjeto?: any[];
    tipo: string;
    materialSuelo?: string;
    materialTecho?: string;
    sionnaDisponible?: boolean;
    sionnaUsado?: boolean;
    sionnaDetalle?: string;
    sionnaXmlCargado?: boolean;
    sionnaXmlError?: string | null;
    receptoresDetectados?: number;
    rayosTotales?: number;
    rayosDirectos?: number;
    rayosReflejados?: number;
    rayosDifractados?: number;
    rayosOrigenSionna?: number;
    diffractionEnabled?: boolean;
    fekoPreparado?: boolean;
    fekoUsado?: boolean;
  };

  heatmapConMesh?: PuntoHeatmap[];

  estadisticasMesh?: {
    potenciaMediaDbm: number;
    puntosAnalizados: number;
    zonasMuertas: number;
    porcentajeZonasMuertas: number;
    mejoraMediaDb: number;
  };

  coberturaConMesh?: {
    heatmap: PuntoHeatmap[];
    score: number;
  };

  resumenHabitacionesConMesh?: {
    habitacion: string;
    potenciaMediaDbm: number | null;
    calidad: string;
  }[];

  repetidoresOptimos?: {
    id: string;
    tipo: string;
    x: number;
    y: number;
    z: number;
  }[];

  receptoresOptimos?: {
    habitacion: string;
    x: number;
    y: number;
    z: number;
    potenciaDbm: number;
  }[];

  optimosPorHabitacion?: {
    habitacion: string;
    habitacionId: string;
    x: number;
    y: number;
    z: number;
    score: number;
    potenciaMediaDbm: number;
    zonasMuertas: number;
    calidad: string;
    recomendacion: string;
  }[];
  routerActual?: {
    x: number;
    y: number;
    z: number;
  };
  routerOptimo: {
    x: number;
    y: number;
    z: number;
  };
  estadisticas: {
    score: number;
    potenciaMediaDbm: number;
    puntosAnalizados: number;
    zonasMuertas: number;
    porcentajeZonasMuertas: number;
  };
  heatmap: PuntoHeatmap[];
  heatmapCanal?: PuntoHeatmap[];
  materialesRF?: MaterialRF[];
  anchoBanda?: {
    anchoBandaMhz?: number;
    anchoBandaHz?: number;
    ruidoTermicoDbm?: number;
    resolucionTemporalNs?: number;
    [key: string]: any;
  };
  mimoArrays?: {
    txRows: number;
    txCols: number;
    rxRows: number;
    rxCols: number;
    txElementos: number;
    rxElementos: number;
    canalesMimoTeoricos: number;
    arraySpacingLambda: number;
    arraysConfiguradosEnSionna: boolean;
    nota?: string;
    catalogoAntenas?: {
      id: string;
      nombre: string;
      sionnaPattern: string;
      fekoFuturo: boolean;
    }[];
    antennaTypeTx?: string;
    antennaTypeRx?: string;
    polarizationTx?: string;
    polarizationRx?: string;
    mimoMode?: string;
  };
  mimoMetricas?: {
    nt: number;
    nr: number;
    streamsMaxTeoricos: number;
    rankMaxTeorico: number;
    rankRealDisponible: boolean;
    potenciaRxDbmUsada: number;
    anchoBandaMhz: number;
    noiseFloorDbm: number;
    noiseFigureDb: number;
    snrDb: number;
    arrayGainTxDbIdeal: number;
    arrayGainRxDbIdeal: number;
    arrayGainBeamformingDbIdeal: number;
    snrBeamformingDbIdeal: number;
    capacidadSisoMbps: number;
    capacidadBeamformingIdealMbps: number;
    capacidadMultiplexingIdealMbps: number;
    capacidadMimoRealGeomMbps?: number;
    rankReal?: number | null;
    matrizHDisponible?: boolean;
    singularValues?: number[];
    mimoMode?: string;
    antenas?: {
      tx?: string;
      rx?: string;
      polarizationTx?: string;
      polarizationRx?: string;
      fekoPatternTx?: string | null;
      fekoPatternRx?: string | null;
    };
    modelo?: {
      nota?: string;
      fisicoFormula?: string[];
      empiricoDeclarado?: string[];
      pendienteParaMimoRealCompleto?: string[];
    };
  };
  rayos: RayoCobertura[];
  resumenHabitaciones: {
    habitacion: string;
    potenciaMediaDbm: number | null;
    calidad: string;
  }[];
  recomendaciones: string[];
  cir?: MuestraCIR[];
  cirResumen?: CirResumen;
  columnaTermica?: {
    columnaActiva?: boolean;
    aplicadaACIR?: boolean;
    aplicada?: boolean;
    pathsAfectados?: number;
    porcentajePathsAfectados?: number;
    deltaT_K?: number;
    T_amb_K?: number;
    T_hot_K?: number;
    fdMeanHz?: number;
    fdSigmaHz?: number;
    atenuacionDb?: number;
    delayExtraNs?: number;
    longitudDentroColumnaM?: number;
    TmediaK?: number;
    nAmb?: number;
    nHotMedio?: number;
    deltaN?: number;
    faseExtraRad?: number;
    gradienteTermicoKPorM?: number;
    perdidaTurbulenciaDb?: number;
    perdidaAbsorcionDb?: number;
    modeloFisico?: string;
    pathsResumen?: any[];
    columna?: any;
    nota?: string;
    motivo?: string;
    [key: string]: any;
  };
  modeloFisico?: {
    principio?: string;
    calculadoPorFormula?: string[];
    calculadoPorSionnaSiDisponible?: string[];
    empiricoDeclarado?: string[];
    sinAleatoriedadArtificial?: boolean;
    sionnaUsado?: boolean;
    advertencia?: string;
  };
  modeloAvanzado?: {
    difraccion?: string;
    rugosidad?: string;
    multicapa?: string;
    feko?: string;
    polarizacion?: string;
    [key: string]: any;
  };
  validacionFekoSionna?: {
    ok?: boolean;
    sionnaUsado?: boolean;
    fekoPreparado?: boolean;
    fekoTxImportado?: boolean;
    fekoRxImportado?: boolean;
    polarizacionTx?: string;
    polarizacionRx?: string;
    acoploPolarizacionDb?: number;
    rayosDifractados?: number;
    nota?: string;
    fekoTxParse?: any;
    fekoRxParse?: any;
    [key: string]: any;
  };
};

// =========================================================
// PÁGINA PRINCIPAL: CREAR VIVIENDA / SIMULADOR RF
// =========================================================
export default function CrearViviendaPage() {
  // ---------------------------------------------------------
  // ESTADO: VIVIENDA, HABITACIONES Y MATERIALES
  // ---------------------------------------------------------
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([
    {
      id: "habitacion-1",
      nombre: "Salón",
      x: 0,
      z: 0,
      ancho: 8,
      largo: 6,
      alto: 2.6,
      materialPared: "ladrillo",
      materialSuelo: "hormigon",
      materialTecho: "pladur",
    },
  ]);

  const [modoCalculo, setModoCalculo] = useState<"rapido" | "sionna">("rapido");
  const [materialPared, setMaterialPared] = useState("ladrillo");
  const [materialSuelo, setMaterialSuelo] = useState("hormigon");
  const [materialTecho, setMaterialTecho] = useState("pladur");
  const [frecuenciaMhz, setFrecuenciaMhz] = useState(5000);
  const [anchoBandaMhz, setAnchoBandaMhz] = useState(80);

  // Propiedades físicas RF globales si una habitación no las sobrescribe
  const [espesorParedM, setEspesorParedM] = useState(0.115);
  const [espesorSueloM, setEspesorSueloM] = useState(0.2);
  const [espesorTechoM, setEspesorTechoM] = useState(0.013);
  const [rugosidadParedM, setRugosidadParedM] = useState(0.0015);
  const [rugosidadSueloM, setRugosidadSueloM] = useState(0.002);
  const [rugosidadTechoM, setRugosidadTechoM] = useState(0.0005);

  // Cerramiento multicapa global. Si está activo, el backend usa estas capas
  // en lugar de una pared equivalente simple.
  const [usarMulticapa, setUsarMulticapa] = useState(false);
  const [presetMulticapa, setPresetMulticapa] = useState<"tabique" | "fachada1975" | "hormigon30" | "personalizado">("fachada1975");

  // Sionna avanzado y FEKO automático.
  const [diffractionEnabled, setDiffractionEnabled] = useState(false);
  const [diffuseReflection, setDiffuseReflection] = useState(false);
  const [maxDepthSionna, setMaxDepthSionna] = useState(5);
  const [numSamplesSionna, setNumSamplesSionna] = useState(150000);
  const [usarPatronFeko, setUsarPatronFeko] = useState(false);
  const [fekoPatternTxContent, setFekoPatternTxContent] = useState("");
  const [fekoPatternRxContent, setFekoPatternRxContent] = useState("");

  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState("habitacion-1");

  // ---------------------------------------------------------
  // ESTADO: OBJETOS 3D, ROUTER, RECEPTORES Y PERSONAS
  // ---------------------------------------------------------
  const [objetos, setObjetos] = useState<Objeto3D[]>([
    {
      id: "router-1",
      tipo: "router",
      x: 0,
      y: 1.2,
      z: 0,
      sx: 0.35,
      sy: 0.35,
      sz: 0.35,
      color: "#f97316",
    },
  ]);

  const [objetoSeleccionado, setObjetoSeleccionado] = useState("router-1");

  const [resultadoCobertura, setResultadoCobertura] =
    useState<ResultadoCobertura | null>(null);

  // ---------------------------------------------------------
  // ESTADO: VISUALIZACIÓN, SIMULACIÓN DINÁMICA Y MIMO
  // ---------------------------------------------------------
  const [maxRayos, setMaxRayos] = useState(15);
  const [simulando, setSimulando] = useState(false);
  const [moverReceptor, setMoverReceptor] = useState(true);
  const [moverPersonas, setMoverPersonas] = useState(true);
  const [velocidadSim, setVelocidadSim] = useState(1);
  const [velocidadRx, setVelocidadRx] = useState(1);
  const [unidadVelocidad, setUnidadVelocidad] = useState<"ms" | "kmh">("ms");
  const [anguloMovimiento, setAnguloMovimiento] = useState(0);
  const [dopplerActual, setDopplerActual] = useState(0);
  const [intervaloSionna, setIntervaloSionna] = useState(3);
  const calculandoDinamicoRef = useRef(false);

  const [cir, setCir] = useState<MuestraCIR[]>([]);
  const [cirResumen, setCirResumen] = useState<CirResumen | null>(null);

  const [calculandoCobertura, setCalculandoCobertura] = useState(false);
  const [generandoRender, setGenerandoRender] = useState(false);
  const [imagenRender, setImagenRender] = useState("");
  const [modeloGlb, setModeloGlb] = useState("");
  const [generandoGlb, setGenerandoGlb] = useState(false);
  const [mostrarMesh, setMostrarMesh] = useState(true);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(true);
  const [mostrarRayos, setMostrarRayos] = useState(true);
  const [mostrarRouterOptimo, setMostrarRouterOptimo] = useState(true);
  const [modoHeatmap, setModoHeatmap] = useState<
    "potencia" | "delay" | "doppler"
  >("potencia");
  const [txRows, setTxRows] = useState(1);
  const [txCols, setTxCols] = useState(1);
  const [rxRows, setRxRows] = useState(1);
  const [rxCols, setRxCols] = useState(1);
  const [arraySpacingLambda, setArraySpacingLambda] = useState(0.5);
  const [mimoMode, setMimoMode] = useState<
    "siso" | "beamforming" | "multiplexing" | "diversity"
  >("siso");
  const [antennaTypeTx, setAntennaTypeTx] = useState("omni");
  const [antennaTypeRx, setAntennaTypeRx] = useState("omni");
  const [polarizationTx, setPolarizationTx] = useState("V");
  const [polarizationRx, setPolarizationRx] = useState("V");
  const [noiseFigureDb, setNoiseFigureDb] = useState(7);
  const [temperaturaColumnaC, setTemperaturaColumnaC] = useState(327);
  const [velocidadColumnaMps, setVelocidadColumnaMps] = useState(2);
  const [turbulenciaColumnaMps, setTurbulenciaColumnaMps] = useState(0.5);
  const [presionColumnaHpa, setPresionColumnaHpa] = useState(1013.25);
  const [humedadColumnaRel, setHumedadColumnaRel] = useState(0.45);
  const [intensidadTurbulencia, setIntensidadTurbulencia] = useState(0.35);
  const [absorcionExtraDbM, setAbsorcionExtraDbM] = useState(0.02);

  const habitacionActual = habitaciones.find(
    (h) => h.id === habitacionSeleccionada,
  );

  const objetoActual = objetos.find((o) => o.id === objetoSeleccionado);

  const velocidadRxMps =
    unidadVelocidad === "kmh" ? velocidadRx / 3.6 : velocidadRx;

  const esReceptor = (tipo: string) =>
    tipo === "receptor" || tipo === "rx" || tipo === "receiver";

  const esMovibleEnPlano = (tipo: string) =>
    tipo === "router" || esReceptor(tipo);

  const aplicarTipoObjeto = (tipo: string) => {
    const configs: Record<string, Partial<Objeto3D>> = {
      router: {
        sx: 0.35,
        sy: 0.35,
        sz: 0.35,
        color: "#f97316",
        material: undefined,
      },
      receptor: {
        sx: 0.25,
        sy: 0.25,
        sz: 0.25,
        color: "#22c55e",
        material: "rx",
        y: 1.2,
      },
      persona: {
        sx: 0.55,
        sy: 1.25,
        sz: 0.55,
        color: "#facc15",
        material: "persona",
        y: 0.9,
        velocidadMps: 0.8,
        recorridoM: 3,
        sentido: 1,
      },
      columna_termica: {
        sx: 1.2,
        sy: 3,
        sz: 1.2,
        color: "#ff6b00",
        material: "aire_caliente",
        y: 1.5,
        temperaturaC: temperaturaColumnaC,
        T_amb_K: 293.15,
        T_hot_K: temperaturaColumnaC + 273.15,
        v_mean_mps: velocidadColumnaMps,
        sigma_v_mps: turbulenciaColumnaMps,
        atenuacion_base_db: 1.5,
        delay_extra_base_ns: 2,
        pressure_hpa: presionColumnaHpa,
        humidity_rel: humedadColumnaRel,
        turbulence_strength: intensidadTurbulencia,
        absorcion_extra_db_m: absorcionExtraDbM,
      },
      sofa: {
        sx: 1.8,
        sy: 0.6,
        sz: 0.8,
        color: "#7c2d12",
        material: "tejido",
        y: 0.4,
      },
      mesa: {
        sx: 1.2,
        sy: 0.25,
        sz: 0.8,
        color: "#92400e",
        material: "madera",
        y: 0.4,
      },
      silla: {
        sx: 0.5,
        sy: 0.8,
        sz: 0.5,
        color: "#57534e",
        material: "madera",
        y: 0.4,
      },
      tv: {
        sx: 1.3,
        sy: 0.08,
        sz: 0.8,
        color: "#020617",
        material: "metal",
        y: 1.4,
      },
      cama: {
        sx: 2,
        sy: 0.45,
        sz: 1.4,
        color: "#1e3a8a",
        material: "tejido",
        y: 0.4,
      },
      armario: {
        sx: 1.2,
        sy: 2,
        sz: 0.5,
        color: "#44403c",
        material: "madera",
        y: 1,
      },
      ventana: {
        sx: 1.8,
        sy: 1.1,
        sz: 0.08,
        color: "#7dd3fc",
        material: "cristal",
        y: 1.5,
      },
    };

    const config = configs[tipo] || {};

    setObjetos((prev) =>
      prev.map((o) =>
        o.id === objetoSeleccionado
          ? {
              ...o,
              tipo,
              sx: config.sx ?? o.sx,
              sy: config.sy ?? o.sy,
              sz: config.sz ?? o.sz,
              y: config.y ?? o.y,
              color: config.color ?? o.color,
              material: config.material,
              temperaturaC: config.temperaturaC ?? o.temperaturaC,
              T_amb_K: config.T_amb_K ?? o.T_amb_K,
              T_hot_K: config.T_hot_K ?? o.T_hot_K,
              v_mean_mps: config.v_mean_mps ?? o.v_mean_mps,
              sigma_v_mps: config.sigma_v_mps ?? o.sigma_v_mps,
              atenuacion_base_db:
                config.atenuacion_base_db ?? o.atenuacion_base_db,
              delay_extra_base_ns:
                config.delay_extra_base_ns ?? o.delay_extra_base_ns,
              pressure_hpa: config.pressure_hpa ?? o.pressure_hpa,
              humidity_rel: config.humidity_rel ?? o.humidity_rel,
              turbulence_strength:
                config.turbulence_strength ?? o.turbulence_strength,
              absorcion_extra_db_m:
                config.absorcion_extra_db_m ?? o.absorcion_extra_db_m,
            }
          : o,
      ),
    );

    setResultadoCobertura(null);
    setCir([]);
    setCirResumen(null);
  };

  // ---------------------------------------------------------
  // ACCIONES: HABITACIONES
  // ---------------------------------------------------------
  const crearHabitacion = () => {
    const nueva: Habitacion = {
      id: `habitacion-${Date.now()}`,
      nombre: `Habitación ${habitaciones.length + 1}`,
      x: habitaciones.length * 3,
      z: habitaciones.length * 2,
      ancho: 4,
      largo: 4,
      alto: 2.6,
      materialPared,
      materialSuelo,
      materialTecho,
      espesorParedM,
      espesorSueloM,
      espesorTechoM,
      rugosidadParedM,
      rugosidadSueloM,
      rugosidadTechoM,
    };

    setHabitaciones((prev) => [...prev, nueva]);
    setHabitacionSeleccionada(nueva.id);
  };

  const actualizarHabitacion = (
    campo: keyof Habitacion,
    valor: number | string,
  ) => {
    setHabitaciones((prev) =>
      prev.map((h) =>
        h.id === habitacionSeleccionada ? { ...h, [campo]: valor } : h,
      ),
    );

    setResultadoCobertura(null);
  };

  const eliminarHabitacion = () => {
    if (habitaciones.length <= 1) {
      alert("Debe quedar al menos una habitación.");
      return;
    }

    const habitacionesRestantes = habitaciones.filter(
      (h) => h.id !== habitacionSeleccionada,
    );

    setHabitaciones(habitacionesRestantes);
    setHabitacionSeleccionada(habitacionesRestantes[0].id);
    setResultadoCobertura(null);
  };

  // ---------------------------------------------------------
  // ACCIONES: OBJETOS 3D
  // ---------------------------------------------------------
  const crearObjeto = (tipo: string) => {
    const base: Record<string, Partial<Objeto3D>> = {
      sofa: { sx: 1.8, sy: 0.6, sz: 0.8, color: "#7c2d12", material: "tejido" },
      mesa: {
        sx: 1.2,
        sy: 0.25,
        sz: 0.8,
        color: "#92400e",
        material: "madera",
      },
      silla: {
        sx: 0.5,
        sy: 0.8,
        sz: 0.5,
        color: "#57534e",
        material: "madera",
      },
      tv: { sx: 1.3, sy: 0.08, sz: 0.8, color: "#020617", material: "metal" },
      cama: { sx: 2, sy: 0.45, sz: 1.4, color: "#1e3a8a", material: "tejido" },
      router: { sx: 0.35, sy: 0.35, sz: 0.35, color: "#f97316" },
      armario: {
        sx: 1.2,
        sy: 2,
        sz: 0.5,
        color: "#44403c",
        material: "madera",
      },
      receptor: {
        sx: 0.25,
        sy: 0.25,
        sz: 0.25,
        color: "#22c55e",
        material: "rx",
      },
      persona: {
        sx: 0.55,
        sy: 1.25,
        sz: 0.55,
        color: "#facc15",
        material: "persona",
        velocidadMps: 0.8,
        recorridoM: 3,
        sentido: 1,
      },
      columna_termica: {
        sx: 1.2,
        sy: 3,
        sz: 1.2,
        color: "#ff6b00",
        material: "aire_caliente",
        temperaturaC: temperaturaColumnaC,
        T_amb_K: 293.15,
        T_hot_K: temperaturaColumnaC + 273.15,
        v_mean_mps: velocidadColumnaMps,
        sigma_v_mps: turbulenciaColumnaMps,
        atenuacion_base_db: 1.5,
        delay_extra_base_ns: 2,
        pressure_hpa: presionColumnaHpa,
        humidity_rel: humedadColumnaRel,
        turbulence_strength: intensidadTurbulencia,
        absorcion_extra_db_m: absorcionExtraDbM,
      },
      ventana: {
        sx: 1.8,
        sy: 1.1,
        sz: 0.08,
        color: "#7dd3fc",
        material: "cristal",
      },
    };

    const h = habitacionActual;
    const config = base[tipo] || {};

    const nuevo: Objeto3D = {
      id: `${tipo}-${Date.now()}`,
      tipo,
      x: h ? h.x : 0,
      y:
        tipo === "tv"
          ? 1.4
          : tipo === "router" || tipo === "receptor"
            ? 1.2
            : tipo === "persona"
              ? 0.9
              : tipo === "columna_termica"
                ? 1.5
                : tipo === "ventana"
                  ? 1.5
                  : 0.4,
      z: h ? h.z : 0,
      sx: config.sx || 1,
      sy: config.sy || 1,
      sz: config.sz || 1,
      color: config.color || "#ffffff",
      material: config.material,
      temperaturaC:
        tipo === "columna_termica" ? temperaturaColumnaC : undefined,
      T_amb_K: tipo === "columna_termica" ? 293.15 : undefined,
      T_hot_K:
        tipo === "columna_termica" ? temperaturaColumnaC + 273.15 : undefined,
      v_mean_mps: tipo === "columna_termica" ? velocidadColumnaMps : undefined,
      sigma_v_mps:
        tipo === "columna_termica" ? turbulenciaColumnaMps : undefined,
      atenuacion_base_db: tipo === "columna_termica" ? 1.5 : undefined,
      delay_extra_base_ns: tipo === "columna_termica" ? 2 : undefined,
      pressure_hpa: tipo === "columna_termica" ? presionColumnaHpa : undefined,
      humidity_rel: tipo === "columna_termica" ? humedadColumnaRel : undefined,
      turbulence_strength:
        tipo === "columna_termica" ? intensidadTurbulencia : undefined,
      absorcion_extra_db_m:
        tipo === "columna_termica" ? absorcionExtraDbM : undefined,
      direccionDeg: tipo === "persona" ? anguloMovimiento : undefined,
      sentido: tipo === "persona" ? 1 : undefined,
      velocidadMps: tipo === "persona" ? 0.8 : undefined,
      recorridoM: tipo === "persona" ? 3 : undefined,
      origenX: tipo === "persona" ? (h ? h.x : 0) : undefined,
      origenZ: tipo === "persona" ? (h ? h.z : 0) : undefined,
    };

    setObjetos((prev) => [...prev, nuevo]);
    setObjetoSeleccionado(nuevo.id);
    setResultadoCobertura(null);
  };

  const actualizarObjeto = (
    campo: keyof Objeto3D,
    valor: number | string | null | undefined,
  ) => {
    setObjetos((prev) =>
      prev.map((o) => {
        if (o.id !== objetoSeleccionado) return o;
        if (valor === null || typeof valor === "undefined" || valor === "") {
          const copia: any = { ...o };
          delete copia[campo];
          return copia;
        }
        return { ...o, [campo]: valor };
      }),
    );

    setResultadoCobertura(null);
  };

  const columnasTermicas = objetos.filter((o) => o.tipo === "columna_termica");
  const hayColumnaTermica = columnasTermicas.length > 0;

  const actualizarColumnasTermicas = (patch: Partial<Objeto3D>) => {
    setObjetos((prev) =>
      prev.map((o) =>
        o.tipo === "columna_termica"
          ? {
              ...o,
              ...patch,
              T_hot_K:
                typeof patch.temperaturaC === "number"
                  ? patch.temperaturaC + 273.15
                  : (patch.T_hot_K ?? o.T_hot_K),
            }
          : o,
      ),
    );

    setResultadoCobertura(null);
    setCir([]);
    setCirResumen(null);
  };

  const eliminarSeleccionado = () => {
    setObjetos((prev) => prev.filter((o) => o.id !== objetoSeleccionado));
    setObjetoSeleccionado("");
    setResultadoCobertura(null);
  };

  const capasParedMulticapa = (): MaterialCapaRF[] | undefined => {
    if (!usarMulticapa) return undefined;

    if (presetMulticapa === "tabique") {
      return [
        { nombre: "yeso interior", material: "pladur", espesorM: 0.015, rugosidadM: 0.0003 },
        { nombre: "ladrillo hueco", material: "ladrillo", espesorM: 0.07, rugosidadM: 0.0015 },
        { nombre: "yeso exterior", material: "pladur", espesorM: 0.015, rugosidadM: 0.0003 },
      ];
    }

    if (presetMulticapa === "fachada1975") {
      return [
        { nombre: "yeso interior", material: "pladur", espesorM: 0.015, rugosidadM: 0.0003 },
        { nombre: "tabique cerámico 7 cm", material: "ladrillo", espesorM: 0.07, rugosidadM: 0.0015 },
        { nombre: "cámara de aire", material: "aire", espesorM: 0.08, rugosidadM: 0 },
        { nombre: "panel hormigón", material: "hormigon", espesorM: 0.30, rugosidadM: 0.002 },
      ];
    }

    if (presetMulticapa === "hormigon30") {
      return [
        { nombre: "hormigón estructural 30 cm", material: "hormigon", espesorM: 0.30, rugosidadM: rugosidadParedM },
      ];
    }

    return [
      { nombre: "capa equivalente", material: materialPared, espesorM: espesorParedM, rugosidadM: rugosidadParedM },
    ];
  };

  const leerArchivoTexto = (file: File | undefined, setter: (txt: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(String(reader.result || ""));
      setResultadoCobertura(null);
      setCir([]);
      setCirResumen(null);
    };
    reader.readAsText(file);
  };

  // ---------------------------------------------------------
  // PAYLOAD PARA BACKEND: SIONNA, CIR, MIMO Y ANTENAS
  // ---------------------------------------------------------
  const crearDatosVivienda = () => {
    return {
      version: "mastesto-vivienda-3d-v3",
      unidades: "metros",
      fecha: new Date().toISOString(),
      materialPared,
      materialSuelo,
      materialTecho,
      frecuenciaMhz,
      espesorParedM,
      espesorSueloM,
      espesorTechoM,
      rugosidadParedM,
      rugosidadSueloM,
      rugosidadTechoM,
      capasPared: capasParedMulticapa(),
      parametrosCIR: {
        anchoBandaMhz,
        numTaps: 128,
        incluirDoppler: true,
        velocidadRxMps,
        direccionRxDeg: anguloMovimiento,
        velocidadAireMps: 0,
        sigmaTurbulenciaMps: 0,
        txRows,
        txCols,
        rxRows,
        rxCols,
        arraySpacingLambda,
        mimoMode,
        antennaTypeTx,
        antennaTypeRx,
        polarizationTx,
        polarizationRx,
        noiseFigureDb,
        diffractionEnabled,
        diffuseReflection,
        maxDepth: maxDepthSionna,
        numSamples: numSamplesSionna,
        usarPatronFeko,
        fekoPatternTxContent,
        fekoPatternRxContent,
        incluirHeatmapCanal: true,
      },
      columnaTermica: objetos
        .filter((o) => o.tipo === "columna_termica")
        .map((o) => ({
          activa: true,
          nombre: o.id,
          x: o.x,
          y: o.y,
          z: o.z,
          sx: o.sx,
          sy: o.sy,
          sz: o.sz,
          T_amb_K: o.T_amb_K ?? 293.15,
          T_hot_K:
            o.T_hot_K ?? (o.temperaturaC ?? temperaturaColumnaC) + 273.15,
          temperaturaC: o.temperaturaC ?? temperaturaColumnaC,
          v_mean_mps: o.v_mean_mps ?? velocidadColumnaMps,
          sigma_v_mps: o.sigma_v_mps ?? turbulenciaColumnaMps,
          atenuacion_base_db: o.atenuacion_base_db ?? 1.5,
          delay_extra_base_ns: o.delay_extra_base_ns ?? 2,
          pressure_hpa: o.pressure_hpa ?? presionColumnaHpa,
          humidity_rel: o.humidity_rel ?? humedadColumnaRel,
          turbulence_strength: o.turbulence_strength ?? intensidadTurbulencia,
          absorcion_extra_db_m: o.absorcion_extra_db_m ?? absorcionExtraDbM,
        })),
      habitaciones: habitaciones.map((h) => ({
        ...h,
        // Usamos los valores globales actuales para que los sliders cambien siempre el cálculo.
        // Si en el futuro quieres rugosidad/espesor por habitación, se puede reactivar como modo avanzado.
        espesorParedM,
        espesorSueloM,
        espesorTechoM,
        rugosidadParedM,
        rugosidadSueloM,
        rugosidadTechoM,
      })),
      objetos,
    };
  };

  const actualizarDopplerDesdeBackend = (taps: MuestraCIR[]) => {
    const dopplers = taps
      .map((tap) => tap.dopplerHz)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

    if (dopplers.length === 0) {
      setDopplerActual(0);
      return taps;
    }

    const dominante = dopplers.reduce(
      (max, v) => (Math.abs(v) > Math.abs(max) ? v : max),
      dopplers[0],
    );

    setDopplerActual(dominante);

    // El frontend NO inventa Doppler ni modifica taps.
    // Cada dopplerHz debe venir calculado por main.py para cada camino.
    return taps;
  };

  const normalizarCIR = (resultado: any): MuestraCIR[] => {
    const bruto = Array.isArray(resultado?.cir)
      ? resultado.cir
      : Array.isArray(resultado?.componentes)
        ? resultado.componentes
        : Array.isArray(resultado?.taps)
          ? resultado.taps
          : Array.isArray(resultado?.cir?.canales)
            ? resultado.cir.canales.flatMap(
                (canal: any) => canal.componentes ?? [],
              )
            : Array.isArray(resultado?.cir?.componentes)
              ? resultado.cir.componentes
              : Array.isArray(resultado?.cir?.taps)
                ? resultado.cir.taps
                : Array.isArray(resultado?.canales)
                  ? resultado.canales.flatMap(
                      (canal: any) => canal.componentes ?? [],
                    )
                  : [];

    return bruto
      .map((c: any, index: number) => {
        const delayNs = Number(
          c.delayNs ??
            c.retardoNs ??
            c.tauNs ??
            c.tau_ns ??
            c.delay_ns ??
            (typeof c.tauS === "number"
              ? c.tauS * 1e9
              : typeof c.tau_s === "number"
                ? c.tau_s * 1e9
                : 0),
        );

        const potenciaDbm = Number(
          c.potenciaDbm ??
            c.powerDbm ??
            c.potencia_dbm ??
            c.power_dbm ??
            c.potencia ??
            c.potenciaDb ??
            -120,
        );

        return {
          id: c.id ?? `cir-${index}`,
          tipo: c.tipo ?? c.type ?? "multipath",
          delayNs,
          potenciaDbm,
          magnitud: c.magnitud ?? c.amplitud ?? c.amplitude,
          faseRad: c.faseRad ?? c.phaseRad ?? c.fase_rad,
          dopplerHz: c.dopplerHz ?? c.doppler_hz,
          tap: c.tap ?? index,
        };
      })
      .filter(
        (c: MuestraCIR) =>
          Number.isFinite(c.delayNs) && Number.isFinite(c.potenciaDbm),
      )
      .sort((a: MuestraCIR, b: MuestraCIR) => a.delayNs - b.delayNs);
  };

  const extraerResumenCIR = (resultado: any): CirResumen | null => {
    return (
      resultado?.cirResumen ??
      resultado?.resumen ??
      resultado?.cir?.resumenGlobal ??
      resultado?.cir?.canales?.[0]?.resumen ??
      resultado?.canales?.[0]?.resumen ??
      null
    );
  };

  const calcularResumenDesdeTaps = (taps: MuestraCIR[]): CirResumen | null => {
    if (!taps.length) return null;

    const potenciasLineales = taps.map((tap) =>
      Math.pow(10, (tap.potenciaDbm ?? -120) / 10),
    );
    const potenciaTotalLineal = potenciasLineales.reduce(
      (acc, p) => acc + p,
      0,
    );

    if (potenciaTotalLineal <= 0) return null;

    const retardoMedioNs =
      taps.reduce(
        (acc, tap, index) => acc + tap.delayNs * potenciasLineales[index],
        0,
      ) / potenciaTotalLineal;

    const delaySpreadRmsNs = Math.sqrt(
      taps.reduce(
        (acc, tap, index) =>
          acc +
          Math.pow(tap.delayNs - retardoMedioNs, 2) * potenciasLineales[index],
        0,
      ) / potenciaTotalLineal,
    );

    const potenciaTotalDbm = 10 * Math.log10(potenciaTotalLineal);

    return {
      delaySpreadRmsNs,
      delaySpreadNs: delaySpreadRmsNs,
      retardoMedioNs,
      potenciaTotalDbm,
      potenciaTotal: potenciaTotalLineal,
      numComponentes: taps.length,
      anchoBandaMhz,
    };
  };

  const crearHeatmapCanalFallback = (
    resultado: ResultadoCobertura,
    taps: MuestraCIR[],
    resumen: CirResumen | null,
  ): PuntoHeatmap[] => {
    if (resultado.heatmapCanal?.length) return resultado.heatmapCanal;
    if (!resultado.heatmap?.length) return [];

    const dopplers = taps
      .map((tap) => tap.dopplerHz)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

    const dopplerDominante =
      dopplers.length > 0
        ? dopplers.reduce(
            (max, v) => (Math.abs(v) > Math.abs(max) ? v : max),
            dopplers[0],
          )
        : dopplerActual;

    const delayBase =
      resumen?.delaySpreadRmsNs ??
      resumen?.delaySpreadNs ??
      resultado.cirResumen?.delaySpreadRmsNs ??
      0;

    const retardoBase =
      resumen?.retardoMedioNs ?? resultado.cirResumen?.retardoMedioNs ?? 0;

    const minPot = Math.min(...resultado.heatmap.map((p) => p.potenciaDbm));
    const maxPot = Math.max(...resultado.heatmap.map((p) => p.potenciaDbm));
    const rango = Math.max(1, maxPot - minPot);

    return resultado.heatmap.map((p) => {
      const degradacion = (maxPot - p.potenciaDbm) / rango;

      return {
        ...p,
        delaySpreadRmsNs:
          typeof p.delaySpreadRmsNs === "number"
            ? p.delaySpreadRmsNs
            : Number((delayBase * (1 + degradacion * 1.5)).toFixed(3)),
        retardoMedioNs:
          typeof p.retardoMedioNs === "number"
            ? p.retardoMedioNs
            : Number((retardoBase * (1 + degradacion)).toFixed(3)),
        dopplerHz:
          typeof p.dopplerHz === "number"
            ? p.dopplerHz
            : Number(
                (dopplerDominante * (0.35 + degradacion * 0.65)).toFixed(3),
              ),
        numComponentes:
          typeof p.numComponentes === "number" ? p.numComponentes : taps.length,
        modelo:
          p.modelo ??
          (resultado.modelo?.sionnaUsado
            ? "Sionna RT + CIR"
            : "Fallback visual derivado del CIR/resumen recibido"),
      };
    });
  };

  const normalizarMimoMetricas = (resultado: any): any => {
    const mm: any = resultado?.mimoMetricas ?? null;
    if (!mm) return undefined;

    const nt = nrf(mm.nt ?? mm.txElementos ?? txRows * txCols, txRows * txCols || 1);
    const nr = nrf(mm.nr ?? mm.rxElementos ?? rxRows * rxCols, rxRows * rxCols || 1);
    const capacidadReal = nrf(
      mm.capacidadMimoRealGeomMbps ??
        mm.capacidadMimoRealMbps ??
        mm.capacidadRealMbps,
      0,
    );
    const snrNormalizado = nrf(mm.snrDb ?? mm.snrDbRel ?? mm.snr_db, 0);

    return {
      ...mm,
      nt,
      nr,
      streamsMaxTeoricos: nrf(
        mm.streamsMaxTeoricos ?? Math.min(nt, nr),
        Math.min(nt, nr),
      ),
      rankMaxTeorico: nrf(mm.rankMaxTeorico ?? Math.min(nt, nr), Math.min(nt, nr)),
      rankRealDisponible: Boolean(
        mm.rankRealDisponible ?? mm.matrizHDisponible ?? mm.rankReal,
      ),
      potenciaRxDbmUsada: nrf(
        mm.potenciaRxDbmUsada ??
          resultado?.estadisticas?.potenciaMediaDbm ??
          resultado?.estadisticas?.potencia_media_dbm,
        0,
      ),
      anchoBandaMhz: nrf(mm.anchoBandaMhz ?? anchoBandaMhz, anchoBandaMhz),
      noiseFloorDbm: nrf(mm.noiseFloorDbm, -100),
      noiseFigureDb: nrf(mm.noiseFigureDb ?? noiseFigureDb, noiseFigureDb),
      snrDb: snrNormalizado,
      arrayGainTxDbIdeal: nrf(
        mm.arrayGainTxDbIdeal,
        10 * Math.log10(Math.max(1, nt)),
      ),
      arrayGainRxDbIdeal: nrf(
        mm.arrayGainRxDbIdeal,
        10 * Math.log10(Math.max(1, nr)),
      ),
      arrayGainBeamformingDbIdeal: nrf(
        mm.arrayGainBeamformingDbIdeal,
        10 * Math.log10(Math.max(1, nt * nr)),
      ),
      snrBeamformingDbIdeal: nrf(
        mm.snrBeamformingDbIdeal,
        snrNormalizado + 10 * Math.log10(Math.max(1, nt * nr)),
      ),
      capacidadSisoMbps: nrf(
        mm.capacidadSisoMbps ?? capacidadReal,
        capacidadReal,
      ),
      capacidadBeamformingIdealMbps: nrf(
        mm.capacidadBeamformingIdealMbps ?? capacidadReal,
        capacidadReal,
      ),
      capacidadMultiplexingIdealMbps: nrf(
        mm.capacidadMultiplexingIdealMbps ?? capacidadReal,
        capacidadReal,
      ),
      capacidadMimoRealGeomMbps: capacidadReal,
      rankReal:
        typeof mm.rankReal === "number"
          ? mm.rankReal
          : typeof mm.rank === "number"
            ? mm.rank
            : null,
      matrizHDisponible: Boolean(mm.matrizHDisponible ?? mm.HShape ?? mm.H_real),
      singularValues: Array.isArray(mm.singularValues) ? mm.singularValues : [],
      mimoMode: mm.mimoMode ?? mimoMode,
      modelo: mm.modelo ?? {
        nota:
          mm.modeloH ??
          "Métricas MIMO normalizadas desde la respuesta del backend para compatibilidad visual.",
      },
    };
  };

  const prepararResultadoVisual = (
    resultado: ResultadoCobertura,
  ): ResultadoCobertura => {
    const taps = actualizarDopplerDesdeBackend(normalizarCIR(resultado));
    const resumenBackend = extraerResumenCIR(resultado);
    const resumen = resumenBackend ?? calcularResumenDesdeTaps(taps);
    const mimoMetricasNormalizadas = normalizarMimoMetricas(resultado);

    const resultadoConResumen: ResultadoCobertura = {
      ...resultado,
      mimoMetricas: mimoMetricasNormalizadas,
      cir: resultado.cir ?? taps,
      cirResumen: resultado.cirResumen ?? resumen ?? undefined,
    };

    return {
      ...resultadoConResumen,
      heatmapCanal: crearHeatmapCanalFallback(
        resultadoConResumen,
        taps,
        resumen,
      ),
    };
  };

  const exportarJSON = () => {
    const datos = crearDatosVivienda();
    const json = JSON.stringify(datos, null, 2);

    const archivo = new Blob([json], {
      type: "application/json",
    });

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "vivienda-mastesto.json";

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(enlace.href);

    console.log(json);
    alert("Vivienda exportada correctamente.");
  };

  // ---------------------------------------------------------
  // LLAMADAS A BACKEND: COBERTURA, SIONNA, CIR Y MIMO
  // ---------------------------------------------------------
  const calcularCobertura = async (silencioso: boolean = false) => {
    const modoSilencioso = silencioso === true;

    try {
      setCalculandoCobertura(true);

      const datos = crearDatosVivienda();

      const BASE_URL =
  SIONNA_API_URL ||
  API_URL ||
  "https://VicenteAltava-mastesto-sionna-api.hf.space";

const url = `${BASE_URL}/raytrace`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await res.json();

      console.log("URL usada:", url);
      console.log("Status HTTP:", res.status);
      console.log("Resultado cobertura:", resultado);

      if (!res.ok || !resultado.ok) {
        if (!modoSilencioso) {
          alert(
            "Error calculando cobertura: " +
              (resultado?.mensaje || resultado?.error || res.status),
          );
        }
        return;
      }
      const resultadoVisual = prepararResultadoVisual(resultado);
      setResultadoCobertura(resultadoVisual);

      const cirNormalizado = normalizarCIR(resultadoVisual);
      setCir(cirNormalizado);
      setCirResumen(
        resultadoVisual.cirResumen ?? extraerResumenCIR(resultadoVisual),
      );

      if (cirNormalizado.length === 0 && modoCalculo === "sionna") {
        try {
          const resCir = await fetch(`${SIONNA_API_URL}/cir`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
          });

          const resultadoCir = await resCir.json();

          console.log("Resultado CIR:", resultadoCir);

          if (resCir.ok && resultadoCir?.ok) {
            const cirEndpoint = actualizarDopplerDesdeBackend(
              normalizarCIR(resultadoCir),
            );
            setCir(cirEndpoint);
            setCirResumen(extraerResumenCIR(resultadoCir));
          }
        } catch (errorCir) {
          console.warn("No se pudo cargar /cir aparte:", errorCir);
        }
      }

      if (!modoSilencioso) {
        console.log("Cobertura calculada correctamente.");
      }
    } catch (error) {
      console.error("Error enviando datos a /api/cobertura:", error);
      if (!modoSilencioso) {
        alert("No se pudo conectar con la API de cobertura.");
      }
    } finally {
      setCalculandoCobertura(false);
    }
  };

  const calcularCoberturaConObjetos = async (
    objetosActualizados: Objeto3D[],
  ) => {
    if (calculandoDinamicoRef.current) return;

    try {
      calculandoDinamicoRef.current = true;

      const datos = {
        ...crearDatosVivienda(),
        objetos: objetosActualizados,
      };

      const res = await fetch(`${SIONNA_API_URL}/raytrace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await res.json();

      if (!res.ok || !resultado.ok) {
        console.warn("Sionna dinámico no devolvió resultado válido", resultado);
        return;
      }

      const resultadoVisual = prepararResultadoVisual(resultado);
      setResultadoCobertura(resultadoVisual);

      const cirNormalizado = normalizarCIR(resultadoVisual);
      setCir(cirNormalizado);
      setCirResumen(
        resultadoVisual.cirResumen ?? extraerResumenCIR(resultadoVisual),
      );
    } catch (e) {
      console.error("Error en Sionna dinámico:", e);
    } finally {
      calculandoDinamicoRef.current = false;
    }
  };

  // ---------------------------------------------------------
  // SIMULACIÓN DINÁMICA: MOVIMIENTO RX/PERSONAS + RECÁLCULO
  // ---------------------------------------------------------
  useEffect(() => {
    if (!simulando) return;

    const intervaloMs = Math.max(3, intervaloSionna) * 1000;

    const intervalo = setInterval(() => {
      const ang = (anguloMovimiento * Math.PI) / 180;
      const dt = Math.max(0.1, intervaloSionna);
      const dirX = Math.cos(ang);
      const dirZ = Math.sin(ang);

      setObjetos((prev) => {
        const nuevosObjetos = prev.map((obj) => {
          const tipo = obj.tipo.toLowerCase();

          if (
            moverReceptor &&
            (tipo === "receptor" || tipo === "rx" || tipo === "receiver")
          ) {
            const dx = dirX * velocidadRxMps * dt;
            const dz = dirZ * velocidadRxMps * dt;

            return {
              ...obj,
              x: Math.max(-10, Math.min(10, Number((obj.x + dx).toFixed(2)))),
              z: Math.max(-10, Math.min(10, Number((obj.z + dz).toFixed(2)))),
            };
          }

          if (moverPersonas && tipo === "persona") {
            const velocidadPersona = obj.velocidadMps ?? 0.8;
            const recorrido = obj.recorridoM ?? 3;
            const origenX = obj.origenX ?? obj.x;
            const origenZ = obj.origenZ ?? obj.z;
            const sentidoActual = obj.sentido ?? 1;

            let nuevoX = obj.x + dirX * velocidadPersona * dt * sentidoActual;
            let nuevoZ = obj.z + dirZ * velocidadPersona * dt * sentidoActual;

            const proyeccion =
              (nuevoX - origenX) * dirX + (nuevoZ - origenZ) * dirZ;

            let nuevoSentido: 1 | -1 = sentidoActual;

            if (proyeccion > recorrido) {
              nuevoSentido = -1;
              nuevoX = origenX + dirX * recorrido;
              nuevoZ = origenZ + dirZ * recorrido;
            }

            if (proyeccion < -recorrido) {
              nuevoSentido = 1;
              nuevoX = origenX - dirX * recorrido;
              nuevoZ = origenZ - dirZ * recorrido;
            }

            return {
              ...obj,
              origenX,
              origenZ,
              direccionDeg: anguloMovimiento,
              sentido: nuevoSentido,
              x: Math.max(-10, Math.min(10, Number(nuevoX.toFixed(2)))),
              z: Math.max(-10, Math.min(10, Number(nuevoZ.toFixed(2)))),
            };
          }

          return obj;
        });

        calcularCoberturaConObjetos(nuevosObjetos);

        return nuevosObjetos;
      });
    }, intervaloMs);

    return () => clearInterval(intervalo);
  }, [
    simulando,
    velocidadRxMps,
    anguloMovimiento,
    intervaloSionna,
    moverReceptor,
    moverPersonas,
  ]);

  // ---------------------------------------------------------
  // EXPORTACIÓN: RENDER, GLB Y PDF
  // ---------------------------------------------------------
  const generarRenderPremium = async () => {
    try {
      setGenerandoRender(true);
      setImagenRender("");

      const datos = crearDatosVivienda();

      const res = await fetch(`${SIONNA_API_URL}/generar-render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(error);
        alert("No se pudo generar el render premium.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setImagenRender(url);
    } catch (error) {
      console.error(error);
      alert("Error conectando con Blender render.");
    } finally {
      setGenerandoRender(false);
    }
  };

  const generarModeloGLB = async () => {
    try {
      setGenerandoGlb(true);
      setModeloGlb("");

      const datos = crearDatosVivienda();

      const res = await fetch(`${SIONNA_API_URL}/generar-glb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(error);
        alert("No se pudo generar el modelo GLB.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setModeloGlb(url);
    } catch (error) {
      console.error(error);
      alert("Error conectando con Blender GLB.");
    } finally {
      setGenerandoGlb(false);
    }
  };

  const generarInformePDF = async () => {
    if (!resultadoCobertura) {
      alert("Calcula cobertura primero.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const fecha = new Date().toLocaleString();
    let y = 18;

    const nuevaPaginaSiHaceFalta = (altoNecesario = 15) => {
      if (y + altoNecesario > 280) {
        pdf.addPage();
        y = 18;
      }
    };

    pdf.setFillColor(5, 5, 5);
    pdf.rect(0, 0, 210, 297, "F");

    pdf.setTextColor(249, 115, 22);
    pdf.setFontSize(24);
    pdf.text("INFORME TÉCNICO RF · SIONNA", 18, y);

    y += 9;
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(10);
    pdf.text(
      "Ray tracing indoor · CIR · MIMO · Doppler · Columna térmica · FEKO-ready",
      18,
      y,
    );

    y += 8;
    pdf.text(`Fecha: ${fecha}`, 18, y);

    y += 14;
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Resumen de simulación", 18, y);

    y += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(220, 220, 220);

    const resumen = [
      `Frecuencia: ${resultadoCobertura.modelo?.frecuenciaMhz ?? frecuenciaMhz} MHz`,
      `Ancho de banda: ${resultadoCobertura.mimoMetricas?.anchoBandaMhz ?? anchoBandaMhz} MHz`,
      `Potencia TX: ${resultadoCobertura.modelo?.potenciaTxDbm ?? 20} dBm`,
      `Material paredes: ${resultadoCobertura.modelo?.materialPared ?? materialPared}`,
      `Sionna usado: ${resultadoCobertura.modelo?.sionnaUsado ? "Sí" : "No"}`,
      `XML Sionna cargado: ${resultadoCobertura.modelo?.sionnaXmlCargado ? "Sí" : "No"}`,
      `Potencia media: ${resultadoCobertura.estadisticas.potenciaMediaDbm} dBm`,
      `Zonas muertas: ${resultadoCobertura.estadisticas.porcentajeZonasMuertas}%`,
      `Puntos analizados: ${resultadoCobertura.estadisticas.puntosAnalizados}`,
      `Rayos totales: ${resultadoCobertura.rayos?.length ?? 0}`,
      `Rayos directos: ${resultadoCobertura.modelo?.rayosDirectos ?? resultadoCobertura.rayos?.filter((r: any) => r.tipo === "directo").length ?? 0}`,
      `Rayos reflejados: ${resultadoCobertura.modelo?.rayosReflejados ?? resultadoCobertura.rayos?.filter((r: any) => r.tipo === "reflejado").length ?? 0}`,
    ];

    resumen.forEach((linea) => {
      nuevaPaginaSiHaceFalta(7);
      pdf.text(linea, 22, y);
      y += 6;
    });

    if (resultadoCobertura.materialesRF?.length) {
      y += 6;
      nuevaPaginaSiHaceFalta(45);
      pdf.setTextColor(125, 211, 252);
      pdf.setFontSize(15);
      pdf.text("Materiales RF físicos", 18, y);
      y += 8;
      pdf.setFontSize(8);
      pdf.setTextColor(220, 220, 220);

      resultadoCobertura.materialesRF.slice(0, 10).forEach((m: any) => {
        nuevaPaginaSiHaceFalta(7);
        pdf.text(
          `${m.rol ?? m.nombre ?? m.material ?? "material"} · epsR=${(m.epsR ?? 0).toFixed(3)} · sigma=${(m.sigmaS_m ?? 0).toExponential(2)} S/m · d=${(m.espesorM ?? 0).toFixed(3)} m · rug=${(m.rugosidadM ?? 0).toFixed(4)} m · loss=${(m.perdidaTotalDb ?? m.perdidaSlabDb ?? 0).toFixed(2)} dB`,
          22,
          y,
        );
        y += 5;
      });
    }

    if (resultadoCobertura.columnaTermica) {
      y += 6;
      nuevaPaginaSiHaceFalta(42);
      pdf.setTextColor(249, 115, 22);
      pdf.setFontSize(15);
      pdf.text("Columna térmica dinámica", 18, y);

      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(220, 220, 220);

      const ct = resultadoCobertura.columnaTermica;
      const lineasColumna = [
        `Estado: ${ct.columnaActiva ? "Activa" : "Inactiva"}`,
        `Temperatura seleccionada: ${temperaturaColumnaC.toFixed(0)} °C`,
        `Delta térmica backend: ${(ct.deltaT_K ?? 0).toFixed(2)} K`,
        `Paths afectados: ${ct.pathsAfectados ?? 0} (${(ct.porcentajePathsAfectados ?? 0).toFixed(2)}%)`,
        `Doppler térmico medio: ${(ct.fdMeanHz ?? 0).toFixed(3)} Hz`,
        `Ensanchamiento Doppler: ${(ct.fdSigmaHz ?? 0).toFixed(3)} Hz`,
        `Atenuación adicional: ${(ct.atenuacionDb ?? 0).toFixed(2)} dB`,
        `Retardo extra: ${(ct.delayExtraNs ?? 0).toFixed(6)} ns`,
        `Presión: ${presionColumnaHpa.toFixed(0)} hPa`,
        `Humedad relativa: ${(humedadColumnaRel * 100).toFixed(0)}%`,
        `Índice n ambiente: ${(ct.nAmb ?? 0).toFixed(9)}`,
        `Índice n caliente medio: ${(ct.nHotMedio ?? 0).toFixed(9)}`,
        `Longitud dentro columna: ${(ct.longitudDentroColumnaM ?? 0).toFixed(4)} m`,
        `Fase extra: ${(ct.faseExtraRad ?? 0).toFixed(6)} rad`,
      ];

      lineasColumna.forEach((linea) => {
        nuevaPaginaSiHaceFalta(7);
        pdf.text(linea, 22, y);
        y += 5;
      });
    }

    y += 6;
    nuevaPaginaSiHaceFalta(25);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Router óptimo", 18, y);

    y += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(220, 220, 220);
    pdf.text(`X: ${resultadoCobertura.routerOptimo.x.toFixed(2)} m`, 22, y);
    y += 6;
    pdf.text(`Y: ${resultadoCobertura.routerOptimo.y.toFixed(2)} m`, 22, y);
    y += 6;
    pdf.text(`Z: ${resultadoCobertura.routerOptimo.z.toFixed(2)} m`, 22, y);

    y += 12;
    nuevaPaginaSiHaceFalta(30);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Recomendaciones", 18, y);

    y += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(220, 220, 220);

    resultadoCobertura.recomendaciones.forEach((rec) => {
      nuevaPaginaSiHaceFalta(12);
      const lineas = pdf.splitTextToSize(`• ${rec}`, 165);
      pdf.text(lineas, 22, y);
      y += lineas.length * 5 + 2;
    });

    y += 8;
    nuevaPaginaSiHaceFalta(65);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Explicación técnica del resultado", 18, y);

    y += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(220, 220, 220);

    const explicacionTecnica = [
      "El heatmap de potencia representa la potencia recibida estimada en cada punto de la vivienda. Verde indica mejor cobertura; rojo indica zonas débiles o muertas.",
      "El heatmap de delay spread RMS muestra la dispersión temporal del canal. Valores altos significan más multitrayecto y mayor riesgo de interferencia entre símbolos.",
      "El heatmap de Doppler muestra la variación de frecuencia causada por movimiento de receptor/personas. Si la simulación dinámica está activa, se actualiza con cada recálculo.",
      "Los rayos verdes son trayectorias directas o fuertes; los naranjas/morados suelen representar caminos reflejados o NLOS; los rojos indican interacción con personas u obstáculos móviles.",
      "El router óptimo se calcula buscando una posición que mejore la potencia media y reduzca el porcentaje de zonas muertas.",
    ];

    explicacionTecnica.forEach((texto) => {
      nuevaPaginaSiHaceFalta(16);
      const lineas = pdf.splitTextToSize(`• ${texto}`, 165);
      pdf.text(lineas, 22, y);
      y += lineas.length * 5 + 2;
    });

    if (cir.length > 0 || cirResumen) {
      y += 6;
      nuevaPaginaSiHaceFalta(55);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.text("Canal CIR y movilidad", 18, y);

      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(220, 220, 220);

      const resumenCirPdf = [
        `Componentes CIR: ${cir.length}`,
        `Delay spread RMS: ${(cirResumen?.delaySpreadRmsNs ?? cirResumen?.delaySpreadNs ?? resultadoCobertura.cirResumen?.delaySpreadRmsNs ?? 0).toFixed(3)} ns`,
        `Retardo medio: ${(cirResumen?.retardoMedioNs ?? resultadoCobertura.cirResumen?.retardoMedioNs ?? 0).toFixed(3)} ns`,
        `Potencia total CIR: ${(cirResumen?.potenciaTotalDbm ?? resultadoCobertura.cirResumen?.potenciaTotalDbm ?? 0).toFixed(2)} dBm`,
        `Doppler dominante actual: ${dopplerActual.toFixed(3)} Hz`,
      ];

      resumenCirPdf.forEach((linea) => {
        nuevaPaginaSiHaceFalta(7);
        pdf.text(linea, 22, y);
        y += 5;
      });

      y += 3;
      const explicacionCir = pdf.splitTextToSize(
        "El CIR es la respuesta impulsional del canal. Cada componente representa un camino de propagación con retardo, potencia, fase y, si procede, Doppler. Esto permite justificar que el simulador no solo pinta cobertura, sino también comportamiento temporal del canal.",
        165,
      );
      nuevaPaginaSiHaceFalta(explicacionCir.length * 5 + 8);
      pdf.text(explicacionCir, 22, y);
      y += explicacionCir.length * 5 + 2;
    }

    if (resultadoCobertura.mimoMetricas) {
      y += 6;
      nuevaPaginaSiHaceFalta(60);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.text("MIMO y capacidad estimada", 18, y);

      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(220, 220, 220);

      const m = resultadoCobertura.mimoMetricas;
      const lineasMimo = [
        `Configuración: TX ${m.nt} elementos · RX ${m.nr} elementos`,
        `SNR usada: ${m.snrDb.toFixed(2)} dB`,
        `Capacidad SISO: ${m.capacidadSisoMbps.toFixed(2)} Mbps`,
        `Capacidad beamforming ideal: ${m.capacidadBeamformingIdealMbps.toFixed(2)} Mbps`,
        `Capacidad multiplexing ideal: ${m.capacidadMultiplexingIdealMbps.toFixed(2)} Mbps`,
        `Rank real: ${m.rankReal ?? "N/D"}`,
      ];

      lineasMimo.forEach((linea) => {
        nuevaPaginaSiHaceFalta(7);
        pdf.text(linea, 22, y);
        y += 5;
      });
    }

    const heatmapParaPdf =
      modoHeatmap === "potencia"
        ? resultadoCobertura.heatmap
        : (resultadoCobertura.heatmapCanal ?? resultadoCobertura.heatmap);

    if (heatmapParaPdf?.length) {
      y += 6;
      nuevaPaginaSiHaceFalta(50);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.text("Muestras principales del heatmap dinámico", 18, y);

      y += 8;
      pdf.setFontSize(8);
      pdf.setTextColor(220, 220, 220);

      heatmapParaPdf
        .slice()
        .sort((a, b) => a.potenciaDbm - b.potenciaDbm)
        .slice(0, 10)
        .forEach((p, index) => {
          nuevaPaginaSiHaceFalta(7);
          pdf.text(
            `P${index + 1} · x=${p.x.toFixed(2)} z=${p.z.toFixed(2)} · ${p.potenciaDbm.toFixed(2)} dBm · DS=${(p.delaySpreadRmsNs ?? 0).toFixed(2)} ns · fd=${(p.dopplerHz ?? 0).toFixed(2)} Hz`,
            22,
            y,
          );
          y += 5;
        });
    }

    y += 6;
    nuevaPaginaSiHaceFalta(40);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Top rayos Sionna", 18, y);

    y += 8;
    pdf.setFontSize(8);
    pdf.setTextColor(220, 220, 220);

    resultadoCobertura.rayos
      .slice()
      .sort((a: any, b: any) => b.potenciaDbm - a.potenciaDbm)
      .slice(0, 12)
      .forEach((rayo: any, index: number) => {
        nuevaPaginaSiHaceFalta(7);
        pdf.text(
          `R${index + 1} · ${rayo.tipo} · ${rayo.potenciaDbm} dBm · rebotes: ${rayo.numRebotes ?? Math.max(0, (rayo.puntos?.length ?? 2) - 2)}`,
          22,
          y,
        );
        y += 5;
      });

    if (imagenRender && typeof imagenRender === "string") {
      pdf.addPage();
      pdf.setFillColor(5, 5, 5);
      pdf.rect(0, 0, 210, 297, "F");
      pdf.setTextColor(249, 115, 22);
      pdf.setFontSize(20);
      pdf.text("Render premium Blender", 18, 22);

      try {
        pdf.addImage(imagenRender, "PNG", 15, 38, 180, 105);
      } catch (error) {
        pdf.setTextColor(255, 80, 80);
        pdf.setFontSize(10);
        pdf.text("No se pudo insertar el render en el PDF.", 18, 42);
      }
    }

    pdf.save("informe-mastesto-rf.pdf");
  };

  const aplicarRouterOptimo = () => {
    if (!resultadoCobertura) return;

    setObjetos((prev) =>
      prev.map((obj) =>
        obj.tipo === "router"
          ? {
              ...obj,
              x: resultadoCobertura.routerOptimo.x,
              y: resultadoCobertura.routerOptimo.y,
              z: resultadoCobertura.routerOptimo.z,
            }
          : obj,
      ),
    );

    setResultadoCobertura(null);
  };

  const primerRayoConH = resultadoCobertura?.rayos?.find(
    (r: any) =>
      r?.mimoRealSionna || r?.mimoTermicoSionna || r?.mimoRealTermicoSionna,
  ) as any;

  const hContainer = primerRayoConH?.mimoRealSionna ?? primerRayoConH?.mimoTermicoSionna ?? primerRayoConH?.mimoRealTermicoSionna;
  const hSionnaBase =
    hContainer?.HBaseSionna ??
    hContainer?.H_base ??
    hContainer?.base ??
    (hContainer?.H_real ? hContainer : null);
  const hSionnaTermica =
    hContainer?.HTermicaSionna ??
    hContainer?.H_termica ??
    hContainer?.termica ??
    primerRayoConH?.mimoTermicoSionna ??
    primerRayoConH?.mimoRealTermicoSionna ??
    primerRayoConH?.mimoRealSionnaTermica;

  const columnaBackend = resultadoCobertura?.columnaTermica as any;
  const primerPathTermico = Array.isArray(columnaBackend?.pathsResumen)
    ? columnaBackend.pathsResumen[0]
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0f172a_0,#020617_36%,#000_100%)] text-slate-100 p-3 md:p-5 font-mono">
      <section className="max-w-[1800px] mx-auto">
        <header className="mb-4 border border-cyan-900/60 bg-slate-950/90 rounded-2xl p-5 shadow-[0_0_45px_rgba(8,145,178,0.12)]">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-300 font-black mb-3">
                RF DIGITAL TWIN · SIONNA RT · CIR · MIMO · FEKO-READY
              </p>

              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[-0.08em] text-white">
                Simulador técnico de propagación indoor
              </h1>

              <p className="text-slate-400 mt-3 max-w-4xl text-xs md:text-sm leading-relaxed">
                Consola de ingeniería para modelar viviendas 3D, ejecutar ray
                tracing con Sionna, visualizar cobertura, rayos, CIR, Doppler,
                delay spread, MIMO y exportar informes RF.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[360px]">
              <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                <p className="text-[8px] uppercase text-slate-500 font-black">
                  Motor
                </p>
                <p className="text-xs font-black text-cyan-300">
                  {modoCalculo === "sionna" ||
                  resultadoCobertura?.modelo?.sionnaUsado
                    ? "Sionna RT"
                    : "Rápido"}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                <p className="text-[8px] uppercase text-slate-500 font-black">
                  Frecuencia
                </p>
                <p className="text-xs font-black text-white">
                  {(frecuenciaMhz / 1000).toFixed(1)} GHz
                </p>
              </div>
              <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                <p className="text-[8px] uppercase text-slate-500 font-black">
                  Escena
                </p>
                <p className="text-xs font-black text-white">
                  {habitaciones.length} salas · {objetos.length} obj.
                </p>
              </div>
              <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                <p className="text-[8px] uppercase text-slate-500 font-black">
                  Estado
                </p>
                <p
                  className={`text-xs font-black ${simulando ? "text-emerald-300" : "text-slate-300"}`}
                >
                  {simulando ? "Live" : "Standby"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-3 bg-slate-950/95 border border-cyan-900/50 rounded-2xl p-4 h-fit shadow-[0_0_35px_rgba(8,145,178,0.08)]">
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-5">
              Habitaciones
            </h2>

            <button
              onClick={crearHabitacion}
              className="w-full py-4 rounded-xl bg-cyan-400 text-slate-950 text-[10px] font-black uppercase hover:bg-white transition-all mb-4"
            >
              Añadir habitación
            </button>

            <select
              value={habitacionSeleccionada}
              onChange={(e) => setHabitacionSeleccionada(e.target.value)}
              className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none mb-5"
            >
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre}
                </option>
              ))}
            </select>

            {habitacionActual ? (
              <div className="space-y-4 mb-6">
                <input
                  value={habitacionActual.nombre}
                  onChange={(e) =>
                    actualizarHabitacion("nombre", e.target.value)
                  }
                  className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                />

                <Control
                  label="X habitación"
                  value={habitacionActual.x}
                  min={-20}
                  max={20}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("x", v)}
                />

                <Control
                  label="Z habitación"
                  value={habitacionActual.z}
                  min={-20}
                  max={20}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("z", v)}
                />

                <Control
                  label="Ancho"
                  value={habitacionActual.ancho}
                  min={2}
                  max={15}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("ancho", v)}
                />

                <Control
                  label="Largo"
                  value={habitacionActual.largo}
                  min={2}
                  max={15}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("largo", v)}
                />

                <Control
                  label="Alto"
                  value={habitacionActual.alto}
                  min={2.2}
                  max={4}
                  step={0.1}
                  onChange={(v) => actualizarHabitacion("alto", v)}
                />

                <MaterialSelect
                  label="Paredes de esta habitación"
                  value={habitacionActual.materialPared || materialPared}
                  onChange={(v) => actualizarHabitacion("materialPared", v)}
                />

                <MaterialSelect
                  label="Suelo de esta habitación"
                  value={habitacionActual.materialSuelo || materialSuelo}
                  onChange={(v) => actualizarHabitacion("materialSuelo", v)}
                />

                <MaterialSelect
                  label="Techo de esta habitación"
                  value={habitacionActual.materialTecho || materialTecho}
                  onChange={(v) => actualizarHabitacion("materialTecho", v)}
                />

                <div className="border-t border-slate-800 pt-4">
                  <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                    Las propiedades RF físicas se editan una sola vez en el panel “Ancho de banda y materiales RF” para evitar duplicidades. Esos valores se aplican a todas las habitaciones en el payload.
                  </p>
                </div>

                <button
                  onClick={eliminarHabitacion}
                  className="w-full py-3 rounded-xl bg-red-700 text-white text-[10px] font-black uppercase hover:bg-red-600 transition-all"
                >
                  Eliminar habitación
                </button>
              </div>
            ) : null}

            <div className="mb-6 border-t border-slate-800 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-4">
                Material de paredes
              </h2>

              <select
                value={materialPared}
                onChange={(e) => {
                  setMaterialPared(e.target.value);
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value="pladur">Pladur / yeso</option>
                <option value="madera">Madera</option>
                <option value="ladrillo">Ladrillo</option>
                <option value="hormigon">Hormigón</option>
                <option value="cristal">Cristal</option>
                <option value="metal">Metal</option>
              </select>

              <p className="mt-3 text-[9px] text-slate-500 uppercase leading-relaxed">
                Este material afecta a la atenuación, permitividad y reflexión
                de los rayos.
              </p>
            </div>

            <div className="mb-6 border-t border-slate-800 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-4">
                Material de suelo
              </h2>

              <select
                value={materialSuelo}
                onChange={(e) => {
                  setMaterialSuelo(e.target.value);
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value="hormigon">Hormigón</option>
                <option value="madera">Madera / parquet</option>
                <option value="ladrillo">Ladrillo / cerámico</option>
                <option value="pladur">Pladur / yeso</option>
                <option value="cristal">Cristal</option>
              </select>
            </div>

            <div className="mb-6 border-t border-slate-800 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-4">
                Material de techo
              </h2>

              <select
                value={materialTecho}
                onChange={(e) => {
                  setMaterialTecho(e.target.value);
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value="pladur">Pladur / falso techo</option>
                <option value="yeso">Yeso</option>
                <option value="hormigon">Hormigón</option>
                <option value="madera">Madera</option>
                <option value="cristal">Cristal</option>
              </select>
            </div>
            <div className="mb-6 border-t border-slate-800 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-4">
                Frecuencia WiFi
              </h2>

              <select
                value={frecuenciaMhz}
                onChange={(e) => {
                  setFrecuenciaMhz(Number(e.target.value));
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value={2400}>2.4 GHz</option>
                <option value={5000}>5 GHz</option>
                <option value={6000}>6 GHz WiFi 6E / WiFi 7</option>
              </select>

              <p className="mt-3 text-[9px] text-slate-500 uppercase leading-relaxed">
                2.4 GHz mayor cobertura · 5 GHz equilibrio · 6 GHz más velocidad
                y menor alcance.
              </p>
            </div>

            <div className="mb-6 border-t border-slate-800 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-4">
                Ancho de banda y materiales RF
              </h2>

              <select
                value={anchoBandaMhz}
                onChange={(e) => {
                  setAnchoBandaMhz(Number(e.target.value));
                  setResultadoCobertura(null);
                  setCir([]);
                  setCirResumen(null);
                }}
                className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none mb-4"
              >
                <option value={20}>20 MHz</option>
                <option value={40}>40 MHz</option>
                <option value={80}>80 MHz</option>
                <option value={160}>160 MHz</option>
                <option value={320}>320 MHz WiFi 7</option>
              </select>

              <Control label="Espesor pared m" value={espesorParedM} min={0.005} max={0.6} step={0.005} onChange={(v) => { setEspesorParedM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />
              <Control label="Rugosidad pared m" value={rugosidadParedM} min={0} max={0.02} step={0.0005} onChange={(v) => { setRugosidadParedM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />
              <Control label="Espesor suelo m" value={espesorSueloM} min={0.005} max={0.6} step={0.005} onChange={(v) => { setEspesorSueloM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />
              <Control label="Rugosidad suelo m" value={rugosidadSueloM} min={0} max={0.02} step={0.0005} onChange={(v) => { setRugosidadSueloM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />
              <Control label="Espesor techo m" value={espesorTechoM} min={0.005} max={0.6} step={0.005} onChange={(v) => { setEspesorTechoM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />
              <Control label="Rugosidad techo m" value={rugosidadTechoM} min={0} max={0.02} step={0.0005} onChange={(v) => { setRugosidadTechoM(v); setResultadoCobertura(null); setCir([]); setCirResumen(null); }} />

              <p className="mt-3 text-[9px] text-slate-500 uppercase leading-relaxed">
                Backend: εr(f), σ(f), tanδ, permitividad compleja, slab loss,
                permitividad compleja εc=ε′−jε″, rugosidad/lambda, ruido kTB y resolución temporal 1/B.
                La rugosidad editable es la de cerramientos; la de objetos se asigna automáticamente en backend.
              </p>
            </div>

            <div className="mb-6 border-t border-cyan-900/50 pt-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300">
                Cerramiento multicapa
              </h2>
              <button
                onClick={() => { setUsarMulticapa(!usarMulticapa); setResultadoCobertura(null); }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${usarMulticapa ? "bg-cyan-400 text-black" : "bg-slate-800 text-slate-300"}`}
              >
                {usarMulticapa ? "Multicapa activado" : "Usar pared equivalente simple"}
              </button>
              {usarMulticapa && (
                <>
                  <select
                    value={presetMulticapa}
                    onChange={(e) => { setPresetMulticapa(e.target.value as any); setResultadoCobertura(null); }}
                    className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                  >
                    <option value="fachada1975">Fachada 1975: yeso + tabique + cámara + hormigón 30cm</option>
                    <option value="tabique">Tabique interior: yeso + ladrillo 7cm + yeso</option>
                    <option value="hormigon30">Hormigón macizo 30cm</option>
                    <option value="personalizado">Personalizado equivalente</option>
                  </select>
                  <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                    El backend calcula cada capa con εr(f), σ(f), permitividad compleja, espesor, interfaces Fresnel y rugosidad. La habitación puede sobrescribirlo si más adelante añades capas por sala.
                  </p>
                </>
              )}
            </div>

            <div className="mb-6 border-t border-purple-900/50 pt-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-purple-300">
                Sionna avanzado / FEKO
              </h2>
              <button
                onClick={() => { setDiffractionEnabled(!diffractionEnabled); setResultadoCobertura(null); }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${diffractionEnabled ? "bg-purple-400 text-black" : "bg-slate-800 text-slate-300"}`}
              >
                Difracción Sionna: {diffractionEnabled ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => { setDiffuseReflection(!diffuseReflection); setResultadoCobertura(null); }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${diffuseReflection ? "bg-purple-400 text-black" : "bg-slate-800 text-slate-300"}`}
              >
                Reflexión difusa: {diffuseReflection ? "ON" : "OFF"}
              </button>
              <Control label="Profundidad Sionna" value={maxDepthSionna} min={1} max={12} step={1} onChange={(v) => { setMaxDepthSionna(v); setResultadoCobertura(null); }} />
              <Control label="Samples Sionna" value={numSamplesSionna} min={50000} max={1000000} step={50000} onChange={(v) => { setNumSamplesSionna(v); setResultadoCobertura(null); }} />
              <button
                onClick={() => { setUsarPatronFeko(!usarPatronFeko); setResultadoCobertura(null); }}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${usarPatronFeko ? "bg-fuchsia-400 text-black" : "bg-slate-800 text-slate-300"}`}
              >
                Patrón FEKO automático: {usarPatronFeko ? "ON" : "OFF"}
              </button>
              {usarPatronFeko && (
                <div className="space-y-2">
                  <label className="block text-[9px] text-slate-400 uppercase">Archivo FEKO TX .ffe/.out/.farfield/.csv</label>
                  <input type="file" accept=".ffe,.out,.farfield,.csv,.txt" onChange={(e) => leerArchivoTexto(e.target.files?.[0], setFekoPatternTxContent)} className="w-full text-[10px] text-slate-300" />
                  <label className="block text-[9px] text-slate-400 uppercase">Archivo FEKO RX .ffe/.out/.farfield/.csv</label>
                  <input type="file" accept=".ffe,.out,.farfield,.csv,.txt" onChange={(e) => leerArchivoTexto(e.target.files?.[0], setFekoPatternRxContent)} className="w-full text-[10px] text-slate-300" />
                  <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                    Se envía el contenido al backend. Si el parser reconoce theta/phi/gain o Etheta/Ephi complejos, corrige la H geométrica con ganancia angular, polarización y RHCP/LHCP. Si no subes FEKO, queda preparado sin fingir antena real.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6 border-t border-orange-900/50 pt-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-300">
                  Columna térmica física
                </h2>
                <span
                  className={`text-[8px] uppercase font-black px-2 py-1 rounded-lg border ${
                    hayColumnaTermica
                      ? "text-orange-300 border-orange-700 bg-orange-950/40"
                      : "text-slate-400 border-slate-700 bg-black/40"
                  }`}
                >
                  {hayColumnaTermica
                    ? `${columnasTermicas.length} activa(s)`
                    : "Sin columna"}
                </span>
              </div>

              {!hayColumnaTermica && (
                <button
                  onClick={() => crearObjeto("columna_termica")}
                  className="w-full py-3 mb-4 rounded-xl bg-orange-500 text-black text-[10px] font-black uppercase hover:bg-white transition-all"
                >
                  Crear columna térmica
                </button>
              )}

              <div className="space-y-4">
                <Control
                  label="Temperatura núcleo °C"
                  value={temperaturaColumnaC}
                  min={20}
                  max={900}
                  step={10}
                  onChange={(v) => {
                    setTemperaturaColumnaC(v);
                    actualizarColumnasTermicas({
                      temperaturaC: v,
                      T_hot_K: v + 273.15,
                    });
                  }}
                />

                <Control
                  label="Velocidad aire caliente m/s"
                  value={velocidadColumnaMps}
                  min={0}
                  max={12}
                  step={0.1}
                  onChange={(v) => {
                    setVelocidadColumnaMps(v);
                    actualizarColumnasTermicas({ v_mean_mps: v });
                  }}
                />

                <Control
                  label="Turbulencia σv m/s"
                  value={turbulenciaColumnaMps}
                  min={0}
                  max={5}
                  step={0.1}
                  onChange={(v) => {
                    setTurbulenciaColumnaMps(v);
                    actualizarColumnasTermicas({ sigma_v_mps: v });
                  }}
                />

                <Control
                  label="Presión hPa"
                  value={presionColumnaHpa}
                  min={850}
                  max={1050}
                  step={1}
                  onChange={(v) => {
                    setPresionColumnaHpa(v);
                    actualizarColumnasTermicas({ pressure_hpa: v });
                  }}
                />

                <Control
                  label="Humedad relativa"
                  value={humedadColumnaRel}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => {
                    setHumedadColumnaRel(v);
                    actualizarColumnasTermicas({ humidity_rel: v });
                  }}
                />

                <Control
                  label="Intensidad turbulencia"
                  value={intensidadTurbulencia}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={(v) => {
                    setIntensidadTurbulencia(v);
                    actualizarColumnasTermicas({ turbulence_strength: v });
                  }}
                />

                <Control
                  label="Absorción extra dB/m"
                  value={absorcionExtraDbM}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => {
                    setAbsorcionExtraDbM(v);
                    actualizarColumnasTermicas({ absorcion_extra_db_m: v });
                  }}
                />
              </div>

              <p className="mt-3 text-[9px] text-orange-200/70 uppercase leading-relaxed">
                Dinámico: estos valores se guardan dentro del objeto
                columna_termica y viajan al backend en cada /raytrace.
              </p>
            </div>

            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-5">
              Añadir objetos
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Boton texto="Sofá" onClick={() => crearObjeto("sofa")} />
              <Boton texto="Mesa" onClick={() => crearObjeto("mesa")} />
              <Boton texto="Silla" onClick={() => crearObjeto("silla")} />
              <Boton texto="TV" onClick={() => crearObjeto("tv")} />
              <Boton texto="Cama" onClick={() => crearObjeto("cama")} />
              <Boton texto="Router" onClick={() => crearObjeto("router")} />
              <Boton texto="Receptor" onClick={() => crearObjeto("receptor")} />
              <Boton texto="Persona" onClick={() => crearObjeto("persona")} />
              <Boton
                texto="Columna térmica"
                onClick={() => crearObjeto("columna_termica")}
              />
              <Boton texto="Armario" onClick={() => crearObjeto("armario")} />
              <Boton texto="Ventana" onClick={() => crearObjeto("ventana")} />
            </div>

            <button
              onClick={exportarJSON}
              className="mt-5 w-full py-4 rounded-xl bg-cyan-400 text-slate-950 text-[10px] font-black uppercase hover:bg-white transition-all"
            >
              Exportar JSON
            </button>
            <select
              value={modoCalculo}
              onChange={(e) =>
                setModoCalculo(e.target.value as "rapido" | "sionna")
              }
              className="mt-5 w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
            >
              <option value="rapido">Modelo rápido actual</option>

              <option value="sionna">Verificar con Sionna</option>
            </select>
            <button
              onClick={() => calcularCobertura(false)}
              disabled={calculandoCobertura}
              className="mt-3 w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase hover:opacity-80 transition-all disabled:opacity-40"
            >
              {calculandoCobertura ? "Calculando..." : "Calcular cobertura"}
            </button>

            <button
              onClick={generarRenderPremium}
              disabled={generandoRender}
              className="mt-3 w-full py-4 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase hover:bg-purple-500 transition-all disabled:opacity-40"
            >
              {generandoRender
                ? "Generando render..."
                : "✨ Generar vivienda premium"}
            </button>

            <button
              onClick={generarModeloGLB}
              disabled={generandoGlb}
              className="mt-3 w-full py-4 rounded-xl bg-cyan-500 text-black text-[10px] font-black uppercase hover:bg-white transition-all disabled:opacity-40"
            >
              {generandoGlb ? "Generando 3D..." : "🧊 Generar modelo 3D"}
            </button>

            <button
              onClick={generarInformePDF}
              disabled={!resultadoCobertura}
              className="mt-3 w-full py-4 rounded-xl bg-sky-500 text-black text-[10px] font-black uppercase hover:bg-white transition-all disabled:opacity-40"
            >
              📄 Descargar informe RF
            </button>

            {resultadoCobertura && (
              <button
                onClick={aplicarRouterOptimo}
                className="mt-3 w-full py-4 rounded-xl bg-green-500 text-black text-[10px] font-black uppercase hover:bg-white transition-all"
              >
                Mover router al punto óptimo
              </button>
            )}

            {resultadoCobertura ? (
              <div className="mt-5 bg-black/70 border border-slate-800 rounded-xl p-4">
                <p className="text-[9px] uppercase text-slate-500 font-black mb-2">
                  Modelo
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {resultadoCobertura.modelo?.tipo ??
                    "Modelo de cobertura aproximado"}
                </p>
                <p className="text-[9px] text-slate-500 uppercase leading-relaxed mt-2">
                  Sionna usado:{" "}
                  {resultadoCobertura.modelo?.sionnaUsado ? "Sí" : "No"} · XML:{" "}
                  {resultadoCobertura.modelo?.sionnaXmlCargado
                    ? "Cargado"
                    : "No cargado"}
                </p>
                <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                  Rayos:{" "}
                  {resultadoCobertura.modelo?.rayosTotales ??
                    resultadoCobertura.rayos?.length ??
                    0}{" "}
                  · Directos: {resultadoCobertura.modelo?.rayosDirectos ?? 0} ·
                  Reflejados: {resultadoCobertura.modelo?.rayosReflejados ?? 0} · Difractados: {resultadoCobertura.modelo?.rayosDifractados ?? resultadoCobertura.validacionFekoSionna?.rayosDifractados ?? 0}{" "}
                  · RX: {resultadoCobertura.modelo?.receptoresDetectados ?? 0}
                </p>
              </div>
            ) : null}

            {resultadoCobertura?.modeloFisico ? (
              <div className="mt-5 bg-black/70 border border-emerald-900 rounded-xl p-4">
                <p className="text-[9px] uppercase text-emerald-400 font-black mb-2">
                  Modelo físico
                </p>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  {resultadoCobertura.modeloFisico.principio}
                </p>
                <p className="text-[9px] text-slate-500 uppercase leading-relaxed mt-2">
                  Fórmulas:{" "}
                  {resultadoCobertura.modeloFisico.calculadoPorFormula
                    ?.length ?? 0}{" "}
                  · Empírico declarado:{" "}
                  {resultadoCobertura.modeloFisico.empiricoDeclarado?.length ??
                    0}
                </p>
              </div>
            ) : null}
          </aside>

          <section className="relative lg:col-span-6 bg-slate-950 border border-cyan-900/60 rounded-2xl overflow-hidden min-h-[720px] shadow-[0_0_60px_rgba(8,145,178,0.12)]">
            <div className="absolute top-3 left-3 z-40 flex gap-2 text-[9px] uppercase font-black tracking-widest">
              <span className="px-3 py-2 rounded-lg bg-black/75 border border-cyan-900/60 text-cyan-300">
                3D Scene
              </span>
              <span className="px-3 py-2 rounded-lg bg-black/75 border border-emerald-900/60 text-emerald-300">
                {resultadoCobertura?.modelo?.sionnaUsado
                  ? "Sionna ON"
                  : "Sionna OFF"}
              </span>
              <span className="px-3 py-2 rounded-lg bg-black/75 border border-slate-800 text-slate-300">
                Heatmap: {modoHeatmap}
              </span>
            </div>
            <Canvas
              shadows
              camera={{ position: [10, 8, 10], fov: 48 }}
              style={{ background: "#06111f" }}
            >
              <ambientLight intensity={0.45} />

              <directionalLight
                position={[10, 15, 8]}
                intensity={2}
                castShadow
              />

              <directionalLight position={[-8, 8, -6]} intensity={1} />

              <pointLight position={[0, 3, 0]} intensity={0.8} />

              <Grid
                args={[60, 60]}
                cellColor="#123247"
                sectionColor="#0891b2"
                cellSize={1}
                cellThickness={1}
                sectionSize={5}
                sectionThickness={2}
                infiniteGrid={false}
              />

              {habitaciones.map((h) => (
                <GrupoHabitacion
                  key={h.id}
                  habitacion={h}
                  seleccionada={h.id === habitacionSeleccionada}
                  onClick={() => setHabitacionSeleccionada(h.id)}
                />
              ))}

              {objetos.map((obj) => (
                <ObjetoMovible
                  key={obj.id}
                  obj={obj}
                  seleccionado={obj.id === objetoSeleccionado}
                  onSeleccionar={() => setObjetoSeleccionado(obj.id)}
                  onMover={(x, z) => {
                    setObjetos((prev) =>
                      prev.map((o) =>
                        o.id === obj.id
                          ? {
                              ...o,
                              x,
                              z,
                            }
                          : o,
                      ),
                    );

                    setResultadoCobertura(null);
                  }}
                />
              ))}

              <CapaArraysMIMO
                objetos={objetos}
                txRows={txRows}
                txCols={txCols}
                rxRows={rxRows}
                rxCols={rxCols}
                spacingLambda={arraySpacingLambda}
                frecuenciaMhz={frecuenciaMhz}
                antennaTypeTx={antennaTypeTx}
                antennaTypeRx={antennaTypeRx}
              />

              <SimulacionDinamica
                activa={simulando}
                velocidad={velocidadSim}
                habitaciones={habitaciones}
              />

              {resultadoCobertura && (
                <CapaCobertura
                  resultado={resultadoCobertura}
                  objetos={objetos}
                  mostrarHeatmap={mostrarHeatmap}
                  mostrarRayos={mostrarRayos}
                  mostrarRouterOptimo={mostrarRouterOptimo}
                  maxRayos={maxRayos}
                  modoHeatmap={modoHeatmap}
                  mostrarMesh={mostrarMesh}
                />
              )}

              <axesHelper args={[4]} />

              <OrbitControls
                makeDefault
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.8}
                panSpeed={1}
                zoomSpeed={1}
                target={[0, 1, 0]}
                maxPolarAngle={Math.PI / 2}
                minDistance={2}
                maxDistance={40}
              />
            </Canvas>
            {imagenRender && (
              <div className="absolute top-4 right-4 w-[420px] bg-slate-950/95 border border-purple-900 rounded-2xl p-3 z-50">
                <p className="text-[10px] uppercase text-purple-400 font-black mb-3">
                  ✨ Render premium Blender
                </p>

                <img
                  src={imagenRender}
                  alt="Render premium"
                  className="w-full rounded-xl border border-slate-700"
                />
              </div>
            )}

            {modeloGlb && (
              <div className="absolute bottom-4 right-4 w-[520px] h-[360px] bg-slate-950/95 border border-cyan-900 rounded-2xl p-3 z-50">
                <p className="text-[10px] uppercase text-cyan-400 font-black mb-3">
                  🧊 Modelo 3D Blender
                </p>

                <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 8, 5]} intensity={2} />

                  <Suspense fallback={null}>
                    <ModeloGLB url={modeloGlb} />
                  </Suspense>

                  <OrbitControls enablePan enableZoom enableRotate />
                </Canvas>
              </div>
            )}
          </section>

          <aside className="lg:col-span-3 bg-slate-950/95 border border-cyan-900/50 rounded-2xl p-4 h-fit shadow-[0_0_35px_rgba(8,145,178,0.08)]">
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-5">
              Editor de objeto
            </h2>

            {!objetoActual ? (
              <p className="text-slate-500 text-xs uppercase">
                Selecciona un objeto del plano.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] uppercase text-slate-500 font-black mb-2">
                    Tipo de objeto
                  </p>
                  <select
                    value={objetoActual.tipo}
                    onChange={(e) => aplicarTipoObjeto(e.target.value)}
                    className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                  >
                    <option value="router">Router / TX</option>
                    <option value="receptor">Receptor / RX</option>
                    <option value="persona">Personaje móvil</option>
                    <option value="columna_termica">Columna térmica</option>
                    <option value="sofa">Sofá</option>
                    <option value="mesa">Mesa</option>
                    <option value="silla">Silla</option>
                    <option value="tv">TV / metal</option>
                    <option value="cama">Cama</option>
                    <option value="armario">Armario</option>
                    <option value="ventana">Ventana / cristal</option>
                  </select>
                </div>

                <p className="text-sm font-black uppercase">
                  {objetoActual.tipo}
                </p>

                <Control
                  label="X"
                  value={objetoActual.x}
                  min={-20}
                  max={20}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("x", v)}
                />

                <Control
                  label="Z"
                  value={objetoActual.z}
                  min={-20}
                  max={20}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("z", v)}
                />

                <Control
                  label="Altura"
                  value={objetoActual.y}
                  min={0}
                  max={4}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("y", v)}
                />

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <Control
                    label="Escala X"
                    value={objetoActual.sx}
                    min={0.1}
                    max={8}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sx", v)}
                  />

                  <Control
                    label="Escala Y"
                    value={objetoActual.sy}
                    min={0.1}
                    max={4}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sy", v)}
                  />

                  <Control
                    label="Escala Z"
                    value={objetoActual.sz}
                    min={0.1}
                    max={8}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sz", v)}
                  />
                </div>

                <MaterialSelect
                  label="Material del objeto"
                  value={objetoActual.material || objetoActual.tipo}
                  onChange={(v) => actualizarObjeto("material", v)}
                />

                {objetoActual.tipo !== "router" &&
                  !esReceptor(objetoActual.tipo) &&
                  objetoActual.tipo !== "columna_termica" && (
                    <div className="border border-cyan-900/40 bg-cyan-950/10 rounded-xl p-4 space-y-2">
                      <p className="text-[9px] uppercase text-cyan-300 font-black">
                        RF del objeto automático
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                        La rugosidad, εr y σ del objeto se calculan en main.py según su material y la frecuencia.
                        Así evitas duplicar controles y cada mueble/obstáculo usa valores físicos por defecto.
                      </p>
                    </div>
                  )}

                {objetoActual.tipo === "columna_termica" && (
                  <div className="border border-orange-900/70 bg-orange-950/20 rounded-xl p-4 space-y-4">
                    <p className="text-[9px] uppercase text-orange-300 font-black">
                      Parámetros térmicos dinámicos
                    </p>

                    <Control
                      label="Temperatura columna °C"
                      value={objetoActual.temperaturaC ?? temperaturaColumnaC}
                      min={20}
                      max={900}
                      step={10}
                      onChange={(v) => {
                        setTemperaturaColumnaC(v);
                        actualizarObjeto("temperaturaC", v);
                        actualizarObjeto("T_hot_K", v + 273.15);
                      }}
                    />

                    <Control
                      label="Velocidad aire caliente m/s"
                      value={objetoActual.v_mean_mps ?? velocidadColumnaMps}
                      min={0}
                      max={12}
                      step={0.1}
                      onChange={(v) => {
                        setVelocidadColumnaMps(v);
                        actualizarObjeto("v_mean_mps", v);
                      }}
                    />

                    <Control
                      label="Turbulencia σv m/s"
                      value={objetoActual.sigma_v_mps ?? turbulenciaColumnaMps}
                      min={0}
                      max={5}
                      step={0.1}
                      onChange={(v) => {
                        setTurbulenciaColumnaMps(v);
                        actualizarObjeto("sigma_v_mps", v);
                      }}
                    />

                    <Control
                      label="Presión hPa"
                      value={objetoActual.pressure_hpa ?? presionColumnaHpa}
                      min={850}
                      max={1050}
                      step={1}
                      onChange={(v) => {
                        setPresionColumnaHpa(v);
                        actualizarObjeto("pressure_hpa", v);
                      }}
                    />

                    <Control
                      label="Humedad relativa"
                      value={objetoActual.humidity_rel ?? humedadColumnaRel}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(v) => {
                        setHumedadColumnaRel(v);
                        actualizarObjeto("humidity_rel", v);
                      }}
                    />

                    <Control
                      label="Intensidad turbulencia"
                      value={
                        objetoActual.turbulence_strength ??
                        intensidadTurbulencia
                      }
                      min={0}
                      max={2}
                      step={0.05}
                      onChange={(v) => {
                        setIntensidadTurbulencia(v);
                        actualizarObjeto("turbulence_strength", v);
                      }}
                    />

                    <Control
                      label="Absorción extra dB/m"
                      value={
                        objetoActual.absorcion_extra_db_m ?? absorcionExtraDbM
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(v) => {
                        setAbsorcionExtraDbM(v);
                        actualizarObjeto("absorcion_extra_db_m", v);
                      }}
                    />

                    <p className="text-[9px] text-orange-200/80 uppercase leading-relaxed">
                      Modelo físico dinámico: n(T), longitud atravesada, fase,
                      retardo, Doppler y turbulencia se recalculan en backend.
                    </p>
                  </div>
                )}

                <button
                  onClick={eliminarSeleccionado}
                  className="w-full py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-500 transition-all"
                >
                  Eliminar objeto
                </button>
              </div>
            )}

            {resultadoCobertura && (
              <div className="mt-6 border-t border-slate-800 pt-5 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  Resultado WiFi
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMostrarHeatmap((v) => !v)}
                    className="py-3 rounded-xl bg-black/70 border border-slate-700 text-[9px] font-black uppercase text-slate-300 hover:border-cyan-400"
                  >
                    Heatmap {mostrarHeatmap ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={() => setMostrarRayos((v) => !v)}
                    className="py-3 rounded-xl bg-black/70 border border-slate-700 text-[9px] font-black uppercase text-slate-300 hover:border-cyan-400"
                  >
                    Rayos {mostrarRayos ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={() => setMostrarRouterOptimo((v) => !v)}
                    className="col-span-2 py-3 rounded-xl bg-black/70 border border-slate-700 text-[9px] font-black uppercase text-slate-300 hover:border-cyan-400"
                  >
                    Router óptimo {mostrarRouterOptimo ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={() => setMostrarMesh((v) => !v)}
                    className="col-span-2 py-3 rounded-xl bg-black/70 border border-slate-700 text-[9px] font-black uppercase text-slate-300 hover:border-sky-500"
                  >
                    Heatmap mesh {mostrarMesh ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="bg-black/70 border border-slate-800 rounded-xl p-4 mt-4 space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Modo heatmap dinámico
                  </p>
                  <select
                    value={modoHeatmap}
                    onChange={(e) =>
                      setModoHeatmap(
                        e.target.value as "potencia" | "delay" | "doppler",
                      )
                    }
                    className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                  >
                    <option value="potencia">Potencia recibida dBm</option>
                    <option value="delay">Delay spread RMS ns</option>
                    <option value="doppler">Doppler dominante Hz</option>
                  </select>
                  <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                    Potencia usa malla base. Delay/Doppler usan heatmapCanal
                    calculado en main.py desde rayos/CIR.
                  </p>
                </div>

                {resultadoCobertura.materialesRF?.length ? (
                  <div className="bg-black/70 border border-sky-900 rounded-xl p-4 mt-4 space-y-3">
                    <p className="text-[9px] uppercase text-sky-300 font-black">
                      Materiales RF físicos
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {resultadoCobertura.materialesRF.slice(0, 6).map((m: any, idx: number) => (
                        <div key={`${m.nombre ?? m.material ?? "mat"}-${idx}`} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                          <p className="text-[8px] uppercase text-slate-500 font-black">
                            {m.rol ?? m.nombre ?? m.material ?? `Material ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-white uppercase">
                            ε′={fmtFixed(materialRfValue(m, "epsR", "eps_r"), 3)} · ε″={fmtFixed(materialRfValue(m, "epsComplejaImag", "eps_compleja_imag"), 3)}
                          </p>
                          <p className="text-[9px] text-sky-300 uppercase">
                            εc = ε′ − jε″ · σ={fmtExp(materialRfValue(m, "sigmaS_m", "sigma_s_m"), 2)} S/m · tanδ={fmtFixed(materialRfValue(m, "tanDelta", "tan_delta"), 4)}
                          </p>
                          <p className="text-[9px] text-cyan-300 uppercase">
                            d={fmtFixed(materialRfValue(m, "espesorM", "espesor_m"), 3)} m · rug={fmtFixed(materialRfValue(m, "rugosidadM", "rugosidad_m"), 4)} m
                          </p>
                          <p className="text-[9px] text-orange-300 uppercase">
                            loss={fmtFixed(materialRfValue(m, "perdidaTotalDb", "perdida_total_db", materialRfValue(m, "perdidaSlabDb", "perdida_slab_db")), 2)} dB · |Γ|={fmtFixed(materialRfValue(m, "coefReflexionAbs", "coef_reflexion_normal_abs"), 3)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      Ancho banda: {anchoBandaMhz} MHz · resolución temporal ≈ {(1000 / Math.max(anchoBandaMhz, 1)).toFixed(3)} ns · modelo con εr(f), σ(f), espesor y rugosidad.
                    </p>
                  </div>
                ) : null}

                {resultadoCobertura.modeloAvanzado && (
                  <div className="bg-black/70 border border-indigo-900 rounded-xl p-4 mt-4 space-y-3">
                    <p className="text-[9px] uppercase text-indigo-300 font-black">
                      Modelo avanzado Sionna / RF
                    </p>
                    <div className="space-y-2 text-[9px] text-slate-400 uppercase leading-relaxed">
                      <p>Difracción: {resultadoCobertura.modeloAvanzado.difraccion ?? "activable"}</p>
                      <p>Rugosidad: {resultadoCobertura.modeloAvanzado.rugosidad ?? "Rayleigh / Beckmann / Kirchhoff"}</p>
                      <p>Multicapa: {resultadoCobertura.modeloAvanzado.multicapa ?? "slab + Fresnel + rugosidad por capa"}</p>
                      <p>FEKO: {resultadoCobertura.modeloAvanzado.feko ?? "preparado"}</p>
                      <p>Polarización: {resultadoCobertura.modeloAvanzado.polarizacion ?? "V/H/RHCP/LHCP"}</p>
                    </div>
                  </div>
                )}

                {resultadoCobertura.validacionFekoSionna && (
                  <div className="bg-black/70 border border-fuchsia-900 rounded-xl p-4 mt-4 space-y-3">
                    <p className="text-[9px] uppercase text-fuchsia-300 font-black">
                      Estado FEKO ↔ Sionna
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] text-slate-500 uppercase font-black">FEKO TX</p>
                        <p className={`text-[10px] font-black uppercase ${resultadoCobertura.validacionFekoSionna.fekoTxImportado ? "text-emerald-300" : "text-slate-400"}`}>
                          {resultadoCobertura.validacionFekoSionna.fekoTxImportado ? "Importado" : "Preparado"}
                        </p>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] text-slate-500 uppercase font-black">FEKO RX</p>
                        <p className={`text-[10px] font-black uppercase ${resultadoCobertura.validacionFekoSionna.fekoRxImportado ? "text-emerald-300" : "text-slate-400"}`}>
                          {resultadoCobertura.validacionFekoSionna.fekoRxImportado ? "Importado" : "Preparado"}
                        </p>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] text-slate-500 uppercase font-black">Polarización</p>
                        <p className="text-[10px] text-white font-black uppercase">
                          {resultadoCobertura.validacionFekoSionna.polarizacionTx ?? polarizationTx} → {resultadoCobertura.validacionFekoSionna.polarizacionRx ?? polarizationRx}
                        </p>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] text-slate-500 uppercase font-black">Difracción</p>
                        <p className="text-[10px] text-cyan-300 font-black uppercase">
                          {resultadoCobertura.validacionFekoSionna.rayosDifractados ?? resultadoCobertura.modelo?.rayosDifractados ?? 0} rayos
                        </p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      {resultadoCobertura.validacionFekoSionna.nota ?? "FEKO queda preparado: al subir .ffe/.out/.farfield se aplican ganancia angular y polarización. Sin archivo, no se finge patrón real."}
                    </p>
                  </div>
                )}

                {resultadoCobertura.columnaTermica && (
                  <div className="bg-black border border-orange-900 rounded-xl p-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] uppercase text-orange-400 font-black">
                        Columna térmica dinámica
                      </p>
                      <span
                        className={`text-[8px] uppercase font-black px-2 py-1 rounded-lg border ${
                          resultadoCobertura.columnaTermica.columnaActiva
                            ? "text-orange-300 border-orange-700 bg-orange-950/40"
                            : "text-slate-400 border-slate-700 bg-slate-950"
                        }`}
                      >
                        {resultadoCobertura.columnaTermica.columnaActiva
                          ? "Activa"
                          : "Inactiva"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Paths afectados
                        </p>
                        <p className="text-sm font-black text-orange-300">
                          {resultadoCobertura.columnaTermica.pathsAfectados ??
                            0}
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Afección
                        </p>
                        <p className="text-sm font-black text-orange-300">
                          {(
                            resultadoCobertura.columnaTermica
                              .porcentajePathsAfectados ?? 0
                          ).toFixed(2)}
                          %
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Doppler térmico
                        </p>
                        <p className="text-sm font-black text-cyan-300">
                          {(
                            resultadoCobertura.columnaTermica.fdMeanHz ?? 0
                          ).toFixed(2)}{" "}
                          Hz
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Delay extra
                        </p>
                        <p className="text-sm font-black text-cyan-300">
                          {(
                            resultadoCobertura.columnaTermica.delayExtraNs ??
                            primerPathTermico?.delayExtraNs ??
                            0
                          ).toFixed(4)}{" "}
                          ns
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Longitud dentro
                        </p>
                        <p className="text-sm font-black text-orange-300">
                          {(
                            resultadoCobertura.columnaTermica
                              .longitudDentroColumnaM ??
                            primerPathTermico?.longitudDentroColumnaM ??
                            0
                          ).toFixed(3)}{" "}
                          m
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Fase extra
                        </p>
                        <p className="text-sm font-black text-purple-300">
                          {(
                            resultadoCobertura.columnaTermica.faseExtraRad ??
                            primerPathTermico?.faseExtraRad ??
                            0
                          ).toFixed(3)}{" "}
                          rad
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-orange-950 rounded-xl p-3 space-y-1">
                      <p className="text-[8px] uppercase text-orange-300 font-black">
                        Modelo físico backend
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                        nAmb=
                        {(resultadoCobertura.columnaTermica.nAmb ?? 0).toFixed(
                          8,
                        )}{" "}
                        · nHot=
                        {(
                          resultadoCobertura.columnaTermica.nHotMedio ?? 0
                        ).toFixed(8)}{" "}
                        · Δn=
                        {(
                          resultadoCobertura.columnaTermica.deltaN ?? 0
                        ).toExponential(3)}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                        Gradiente=
                        {(
                          resultadoCobertura.columnaTermica
                            .gradienteTermicoKPorM ?? 0
                        ).toFixed(1)}{" "}
                        K/m · Pérdida turb=
                        {(
                          resultadoCobertura.columnaTermica
                            .perdidaTurbulenciaDb ??
                          primerPathTermico?.atenuacionDb ??
                          0
                        ).toFixed(4)}{" "}
                        dB
                      </p>
                    </div>

                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      Temperatura enviada: {temperaturaColumnaC.toFixed(0)} °C ·
                      Presión: {presionColumnaHpa.toFixed(0)} hPa · Humedad:{" "}
                      {(humedadColumnaRel * 100).toFixed(0)}% · ΔT backend:
                      {(
                        resultadoCobertura.columnaTermica.deltaT_K ?? 0
                      ).toFixed(1)}{" "}
                      K.
                    </p>
                  </div>
                )}

                {resultadoCobertura.mimoArrays && (
                  <div className="bg-black/70 border border-cyan-900 rounded-xl p-4 mt-4 space-y-2">
                    <p className="text-[9px] uppercase text-cyan-400 font-black">
                      MIMO / Arrays Sionna
                    </p>
                    <p className="text-[10px] text-slate-300 uppercase leading-relaxed">
                      TX: {resultadoCobertura.mimoArrays.txRows}x
                      {resultadoCobertura.mimoArrays.txCols} · RX:{" "}
                      {resultadoCobertura.mimoArrays.rxRows}x
                      {resultadoCobertura.mimoArrays.rxCols}
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      Canales teóricos:{" "}
                      {resultadoCobertura.mimoArrays.canalesMimoTeoricos} ·
                      Spacing:{" "}
                      {resultadoCobertura.mimoArrays.arraySpacingLambda}λ
                    </p>
                  </div>
                )}

                {resultadoCobertura.mimoMetricas && (
                  <div className="bg-black/70 border border-emerald-900 rounded-xl p-4 mt-4 space-y-3">
                    <p className="text-[9px] uppercase text-emerald-400 font-black">
                      Parámetros MIMO calculados
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          SNR
                        </p>
                        <p className="text-sm font-black text-white">
                          {nrf(
  resultadoCobertura.mimoMetricas?.snrDb ??
    (resultadoCobertura.mimoMetricas as any)?.snrDbRel,
).toFixed(2)} dB
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Ganancia array ideal
                        </p>
                        <p className="text-sm font-black text-emerald-400">
                          +
                          {resultadoCobertura.mimoMetricas.arrayGainBeamformingDbIdeal.toFixed(
                            2,
                          )}{" "}
                          dB
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Rank máximo teórico
                        </p>
                        <p className="text-sm font-black text-cyan-400">
                          {resultadoCobertura.mimoMetricas.rankMaxTeorico}
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          Streams máximos
                        </p>
                        <p className="text-sm font-black text-cyan-400">
                          {resultadoCobertura.mimoMetricas.streamsMaxTeoricos}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                      <p className="text-[8px] uppercase text-slate-500 font-black">
                        Capacidad Shannon
                      </p>
                      <p className="text-[10px] text-slate-300 uppercase leading-relaxed">
                        SISO:{" "}
                        {resultadoCobertura.mimoMetricas.capacidadSisoMbps.toFixed(
                          2,
                        )}{" "}
                        Mbps
                      </p>
                      <p className="text-[10px] text-slate-300 uppercase leading-relaxed">
                        Beamforming ideal:{" "}
                        {resultadoCobertura.mimoMetricas.capacidadBeamformingIdealMbps.toFixed(
                          2,
                        )}{" "}
                        Mbps
                      </p>
                      <p className="text-[10px] text-slate-300 uppercase leading-relaxed">
                        Multiplexing ideal:{" "}
                        {resultadoCobertura.mimoMetricas.capacidadMultiplexingIdealMbps.toFixed(
                          2,
                        )}{" "}
                        Mbps
                      </p>
                      <p className="text-[9px] text-green-400 uppercase leading-relaxed">
                        MIMO geométrico H:{" "}
                        {(
                          resultadoCobertura.mimoMetricas
                            .capacidadMimoRealGeomMbps ?? 0
                        ).toFixed(2)}{" "}
                        Mbps · Rank real:{" "}
                        {resultadoCobertura.mimoMetricas.rankReal ?? "N/D"}
                      </p>
                    </div>

                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      {resultadoCobertura.mimoMetricas.modelo?.nota ??
                        "La capacidad MIMO real completa requiere matriz H por elemento."}
                    </p>
                  </div>
                )}

                {(hSionnaBase || hSionnaTermica) && (
                  <div className="bg-black/70 border border-purple-900 rounded-xl p-4 mt-4 space-y-3">
                    <p className="text-[9px] uppercase text-purple-300 font-black">
                      Matriz H real Sionna
                    </p>

                    {hSionnaBase && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                        <p className="text-[8px] uppercase text-slate-500 font-black">
                          H base
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase">
                          Shape: {hSionnaBase.HShape?.join("×") ?? "N/D"} ·
                          Rank: {hSionnaBase.rankReal ?? "N/D"} · Paths:{" "}
                          {hSionnaBase.numPaths ?? "N/D"}
                        </p>
                        <p className="text-[10px] text-emerald-300 uppercase">
                          Capacidad:{" "}
                          {(hSionnaBase.capacidadMimoRealMbps ?? 0).toFixed(2)}{" "}
                          Mbps · SNR rel:{" "}
                          {(hSionnaBase.snrDbRel ?? 0).toFixed(2)} dB
                        </p>
                      </div>
                    )}

                    {hSionnaTermica && (
                      <div className="bg-slate-950 border border-orange-900 rounded-xl p-3 space-y-1">
                        <p className="text-[8px] uppercase text-orange-300 font-black">
                          H térmica
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase">
                          Shape: {hSionnaTermica.HShape?.join("×") ?? "N/D"} ·
                          Rank: {hSionnaTermica.rankReal ?? "N/D"} · Paths:{" "}
                          {hSionnaTermica.numPaths ?? "N/D"}
                        </p>
                        <p className="text-[10px] text-orange-300 uppercase">
                          Capacidad:{" "}
                          {(hSionnaTermica.capacidadMimoRealMbps ?? 0).toFixed(
                            2,
                          )}{" "}
                          Mbps · SNR rel:{" "}
                          {(hSionnaTermica.snrDbRel ?? 0).toFixed(2)} dB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-black/70 border border-slate-800 rounded-xl p-4 mt-4">
                  <p className="text-[9px] uppercase text-slate-500 font-black mb-2">
                    Límite rayos Sionna
                  </p>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={maxRayos}
                    onChange={(e) => setMaxRayos(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />

                  <p className="text-cyan-300 text-sm font-black mt-2">
                    {maxRayos} rayos visibles
                  </p>
                </div>

                <div className="bg-black/70 border border-purple-900 rounded-xl p-4 mt-4 space-y-3">
                  <p className="text-[9px] uppercase text-slate-500 font-black mb-2">
                    Simulación dinámica Sionna
                  </p>

                  <button
                    onClick={() => setSimulando((v) => !v)}
                    className="w-full py-3 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase hover:bg-purple-500 transition-all"
                  >
                    {simulando ? "Detener simulación" : "Iniciar simulación"}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMoverReceptor((v) => !v)}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${
                        moverReceptor
                          ? "bg-cyan-500 text-black border-cyan-400"
                          : "bg-black text-slate-400 border-slate-700"
                      }`}
                    >
                      RX {moverReceptor ? "móvil" : "fijo"}
                    </button>

                    <button
                      onClick={() => setMoverPersonas((v) => !v)}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${
                        moverPersonas
                          ? "bg-yellow-400 text-black border-yellow-300"
                          : "bg-black text-slate-400 border-slate-700"
                      }`}
                    >
                      Personas {moverPersonas ? "móviles" : "fijas"}
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <p className="text-[8px] uppercase text-slate-500 font-black">
                      Estado dinámico
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase leading-relaxed mt-1">
                      {moverReceptor ? "RX móvil" : "RX fijo"} ·{" "}
                      {moverPersonas ? "personas móviles" : "personas fijas"}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <p className="text-[10px] text-slate-400">Modo MIMO</p>
                    <select
                      value={mimoMode}
                      onChange={(e) => setMimoMode(e.target.value as any)}
                      className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                    >
                      <option value="siso">SISO / referencia</option>
                      <option value="beamforming">Beamforming</option>
                      <option value="multiplexing">Spatial multiplexing</option>
                      <option value="diversity">Diversity</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">
                        Antena TX
                      </p>
                      <select
                        value={antennaTypeTx}
                        onChange={(e) => setAntennaTypeTx(e.target.value)}
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      >
                        <option value="omni">Omni / isotrópica</option>
                        <option value="dipolo">Dipolo λ/2</option>
                        <option value="monopolo">Monopolo λ/4</option>
                        <option value="patch">Patch microstrip</option>
                        <option value="panel">Panel directiva</option>
                        <option value="yagi">Yagi-Uda</option>
                        <option value="helicoidal_axial">
                          Helicoidal axial
                        </option>
                        <option value="array_dipolos">Array dipolos</option>
                        <option value="array_patch">Array patch</option>
                        <option value="feko_import">Importar FEKO</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">
                        Antena RX
                      </p>
                      <select
                        value={antennaTypeRx}
                        onChange={(e) => setAntennaTypeRx(e.target.value)}
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      >
                        <option value="omni">Omni / isotrópica</option>
                        <option value="dipolo">Dipolo λ/2</option>
                        <option value="monopolo">Monopolo λ/4</option>
                        <option value="patch">Patch microstrip</option>
                        <option value="panel">Panel directiva</option>
                        <option value="yagi">Yagi-Uda</option>
                        <option value="helicoidal_axial">
                          Helicoidal axial
                        </option>
                        <option value="array_dipolos">Array dipolos</option>
                        <option value="array_patch">Array patch</option>
                        <option value="feko_import">Importar FEKO</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">Pol. TX</p>
                      <select
                        value={polarizationTx}
                        onChange={(e) => setPolarizationTx(e.target.value)}
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      >
                        <option value="V">Vertical</option>
                        <option value="H">Horizontal</option>
                        <option value="RHCP">RHCP FEKO</option>
                        <option value="LHCP">LHCP FEKO</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">Pol. RX</p>
                      <select
                        value={polarizationRx}
                        onChange={(e) => setPolarizationRx(e.target.value)}
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      >
                        <option value="V">Vertical</option>
                        <option value="H">Horizontal</option>
                        <option value="RHCP">RHCP FEKO</option>
                        <option value="LHCP">LHCP FEKO</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 mb-1">
                        Figura ruido RX (dB)
                      </p>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={noiseFigureDb}
                        onChange={(e) =>
                          setNoiseFigureDb(Math.max(0, Number(e.target.value)))
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">TX filas</p>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={txRows}
                        onChange={(e) =>
                          setTxRows(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">
                        TX columnas
                      </p>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={txCols}
                        onChange={(e) =>
                          setTxCols(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">RX filas</p>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={rxRows}
                        onChange={(e) =>
                          setRxRows(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 mb-1">
                        RX columnas
                      </p>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={rxCols}
                        onChange={(e) =>
                          setRxCols(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 mb-1">
                        Separación array (λ)
                      </p>
                      <input
                        type="number"
                        min={0.05}
                        step={0.05}
                        value={arraySpacingLambda}
                        onChange={(e) =>
                          setArraySpacingLambda(
                            Math.max(0.05, Number(e.target.value)),
                          )
                        }
                        className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Velocidad receptor
                    </p>

                    <input
                      type="number"
                      value={velocidadRx}
                      step={0.1}
                      onChange={(e) => setVelocidadRx(Number(e.target.value))}
                      className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                    />

                    <select
                      value={unidadVelocidad}
                      onChange={(e) =>
                        setUnidadVelocidad(e.target.value as "ms" | "kmh")
                      }
                      className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                    >
                      <option value="ms">m/s</option>
                      <option value="kmh">km/h</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Recalcular Sionna cada:
                    </p>

                    <input
                      type="number"
                      value={intervaloSionna}
                      step={0.1}
                      min={0.1}
                      onChange={(e) =>
                        setIntervaloSionna(
                          Math.max(0.1, Number(e.target.value)),
                        )
                      }
                      className="w-full bg-black/70 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none"
                    />

                    <p className="text-[9px] text-slate-500 uppercase">
                      {Math.max(0.1, intervaloSionna).toFixed(1)} s entre
                      cálculos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Dirección movimiento: {anguloMovimiento}°
                    </p>

                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={anguloMovimiento}
                      onChange={(e) =>
                        setAnguloMovimiento(Number(e.target.value))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <p className="text-[8px] uppercase text-slate-500 font-black">
                        Velocidad usada
                      </p>
                      <p className="text-xs font-black text-purple-400">
                        {velocidadRxMps.toFixed(2)} m/s
                      </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <p className="text-[8px] uppercase text-slate-500 font-black">
                        Doppler backend
                      </p>
                      <p className="text-xs font-black text-cyan-400">
                        {dopplerActual.toFixed(2)} Hz
                      </p>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 uppercase leading-relaxed mt-2">
                    Al iniciar, puedes elegir si se mueve el receptor, las
                    personas o ambos. El frontend solo mueve geometría y
                    visualiza; el Doppler viene calculado desde main.py por
                    camino.
                  </p>
                </div>

                <div className="bg-black/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Potencia media
                  </p>
                  <p className="text-2xl font-black text-cyan-300">
                    {resultadoCobertura.estadisticas.potenciaMediaDbm} dBm
                  </p>
                </div>

                <div className="bg-black/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Zonas muertas
                  </p>
                  <p className="text-xl font-black text-white">
                    {resultadoCobertura.estadisticas.porcentajeZonasMuertas}%
                  </p>
                </div>

                {resultadoCobertura.estadisticasMesh && (
                  <div className="bg-black/70 border border-sky-900 rounded-xl p-4 space-y-2">
                    <p className="text-[9px] uppercase text-slate-500 font-black">
                      Cobertura con Mesh
                    </p>

                    <p className="text-xl font-black text-sky-400">
                      {resultadoCobertura.estadisticasMesh.potenciaMediaDbm} dBm
                    </p>

                    <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                      Mejora media:{" "}
                      {resultadoCobertura.estadisticasMesh.mejoraMediaDb} dB ·
                      Zonas muertas:{" "}
                      {
                        resultadoCobertura.estadisticasMesh
                          .porcentajeZonasMuertas
                      }
                      %
                    </p>
                  </div>
                )}

                <div className="bg-black/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Router recomendado
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    X: {resultadoCobertura.routerOptimo.x.toFixed(2)} · Z:{" "}
                    {resultadoCobertura.routerOptimo.z.toFixed(2)} · Altura:{" "}
                    {resultadoCobertura.routerOptimo.y.toFixed(2)} m
                  </p>
                </div>

                {resultadoCobertura.optimosPorHabitacion && (
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase text-slate-500 font-black">
                      Mejor posición por habitación
                    </p>

                    {resultadoCobertura.optimosPorHabitacion.map((o) => (
                      <div
                        key={o.habitacionId}
                        className="bg-black/70 border border-slate-800 rounded-xl p-3"
                      >
                        <p className="text-[10px] font-black uppercase text-white">
                          {o.habitacion}
                        </p>

                        <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                          X: {o.x.toFixed(2)} · Z: {o.z.toFixed(2)} · Media:{" "}
                          {o.potenciaMediaDbm} dBm · Zonas muertas:{" "}
                          {o.zonasMuertas}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Habitaciones
                  </p>

                  {resultadoCobertura.resumenHabitaciones.map((h) => (
                    <div
                      key={h.habitacion}
                      className="bg-black/70 border border-slate-800 rounded-xl p-3"
                    >
                      <p className="text-[10px] font-black uppercase text-white">
                        {h.habitacion}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase">
                        {h.potenciaMediaDbm ?? "Sin datos"} dBm · {h.calidad}
                      </p>
                    </div>
                  ))}
                </div>

                {resultadoCobertura.repetidoresOptimos &&
                  resultadoCobertura.repetidoresOptimos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase text-slate-500 font-black">
                        Repetidores / Mesh recomendados
                      </p>

                      {resultadoCobertura.repetidoresOptimos.map((rep) => (
                        <div
                          key={rep.id}
                          className="bg-black/70 border border-sky-900 rounded-xl p-3"
                        >
                          <p className="text-[10px] font-black uppercase text-sky-400">
                            {rep.tipo}
                          </p>

                          <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                            X: {rep.x.toFixed(2)} · Z: {rep.z.toFixed(2)} ·
                            Altura: {rep.y.toFixed(2)} m
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                {resultadoCobertura.receptoresOptimos &&
                  resultadoCobertura.receptoresOptimos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase text-slate-500 font-black">
                        Receptor óptimo por habitación
                      </p>

                      {resultadoCobertura.receptoresOptimos.map((rx) => (
                        <div
                          key={rx.habitacion}
                          className="bg-black/70 border border-green-900 rounded-xl p-3"
                        >
                          <p className="text-[10px] font-black uppercase text-green-400">
                            {rx.habitacion}
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                            X: {rx.x.toFixed(2)} · Z: {rx.z.toFixed(2)} ·
                            Potencia: {rx.potenciaDbm} dBm
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                {cir.length > 0 && (
                  <div className="bg-black/70 border border-orange-900 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase text-cyan-300 font-black">
                          CIR / Power Delay Profile
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase leading-relaxed mt-1">
                          Potencia recibida por cada retardo multipath.
                        </p>
                      </div>

                      <p className="text-[10px] text-white font-black">
                        {cir.length} taps
                      </p>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cir}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="delayNs"
                            tick={{ fontSize: 9 }}
                            label={{
                              value: "Retardo (ns)",
                              position: "insideBottom",
                              offset: -3,
                              fontSize: 9,
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: 9 }}
                            domain={["dataMin - 5", "dataMax + 5"]}
                            label={{
                              value: "dBm",
                              angle: -90,
                              position: "insideLeft",
                              fontSize: 9,
                            }}
                          />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${Number(value).toFixed(2)} dBm`,
                              name === "potenciaDbm" ? "Potencia" : name,
                            ]}
                            labelFormatter={(label: any) =>
                              `Retardo: ${Number(label).toFixed(2)} ns`
                            }
                          />
                          <Bar dataKey="potenciaDbm" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {cirResumen && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                          <p className="text-[8px] uppercase text-slate-500 font-black">
                            Delay spread RMS
                          </p>
                          <p className="text-sm font-black text-orange-400">
                            {Number(
                              cirResumen.delaySpreadRmsNs ??
                                cirResumen.delaySpreadNs ??
                                0,
                            ).toFixed(2)}{" "}
                            ns
                          </p>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                          <p className="text-[8px] uppercase text-slate-500 font-black">
                            Potencia total
                          </p>
                          <p className="text-sm font-black text-white">
                            {Number(
                              cirResumen.potenciaTotalDbm ??
                                cirResumen.potenciaTotal ??
                                cir[0]?.potenciaDbm ??
                                0,
                            ).toFixed(2)}{" "}
                            dBm
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {cir.slice(0, 12).map((tap, index) => (
                        <div
                          key={tap.id ?? index}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                        >
                          <p className="text-[10px] font-black uppercase text-white">
                            Tap {index + 1} · {tap.tipo ?? "multipath"}
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase">
                            {tap.delayNs.toFixed(2)} ns ·{" "}
                            {tap.potenciaDbm.toFixed(2)} dBm
                            {typeof tap.dopplerHz === "number"
                              ? ` · Doppler ${tap.dopplerHz.toFixed(2)} Hz`
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[9px] uppercase text-slate-500 font-black">
                    Recomendaciones
                  </p>
                  {resultadoCobertura.recomendaciones.map((r, i) => (
                    <p
                      key={i}
                      className="text-[10px] text-slate-400 leading-relaxed bg-black/70 border border-slate-800 rounded-xl p-3"
                    >
                      {r}
                    </p>
                  ))}
                </div>

                {/* ANALISIS RAYOS SIONNA */}

                {resultadoCobertura.rayos &&
                  resultadoCobertura.rayos.length > 0 && (
                    <div className="space-y-3 border-t border-slate-800 pt-5">
                      <p className="text-[9px] uppercase text-slate-500 font-black">
                        Análisis rayos Sionna
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/70 border border-slate-800 rounded-xl p-3">
                          <p className="text-[8px] uppercase text-slate-500 font-black">
                            Total rayos
                          </p>

                          <p className="text-xl font-black text-white">
                            {resultadoCobertura.rayos.length}
                          </p>
                        </div>

                        <div className="bg-black/70 border border-slate-800 rounded-xl p-3">
                          <p className="text-[8px] uppercase text-slate-500 font-black">
                            Mejor potencia
                          </p>

                          <p className="text-xl font-black text-green-400">
                            {Math.max(
                              ...resultadoCobertura.rayos.map(
                                (r: any) => r.potenciaDbm,
                              ),
                            )}{" "}
                            dBm
                          </p>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {resultadoCobertura.rayos

                          .slice()

                          .sort(
                            (a: any, b: any) => b.potenciaDbm - a.potenciaDbm,
                          )

                          .slice(0, maxRayos)

                          .map((rayo: any, index: number) => (
                            <div
                              key={rayo.id}
                              className="bg-black/70 border border-slate-800 rounded-xl p-3"
                            >
                              <p className="text-[10px] font-black uppercase text-white">
                                Rayo {index + 1}
                              </p>

                              <p className="text-[9px] text-slate-500 uppercase">
                                {rayo.afectadoPorPersona ||
                                rayo.tipo === "afectado_persona" ||
                                rayo.tipoVisual === "afectado_persona"
                                  ? "AFECTADO POR PERSONA"
                                  : rayo.tipo}
                                ·{rayo.potenciaDbm} dBm · Rebotes:
                                {rayo.numRebotes ?? 0}
                                {typeof rayo.perdidaPersonaDb === "number" &&
                                rayo.perdidaPersonaDb > 0
                                  ? ` · Pérdida persona ${rayo.perdidaPersonaDb.toFixed(2)} dB`
                                  : ""}
                                {typeof rayo.dopplerPersonaHz === "number" &&
                                Math.abs(rayo.dopplerPersonaHz) > 0
                                  ? ` · Doppler persona ${rayo.dopplerPersonaHz.toFixed(2)} Hz`
                                  : ""}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed">
                Controles: rueda para zoom, click derecho o dos dedos para mover
                cámara, click izquierdo para rotar. Selecciona habitaciones u
                objetos y edítalos desde los paneles.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// =========================================================
// COMPONENTES 3D AUXILIARES
// =========================================================
function GrupoHabitacion({
  habitacion,
  seleccionada,
  onClick,
}: {
  habitacion: Habitacion;
  seleccionada: boolean;
  onClick: () => void;
}) {
  const { x, z, ancho, largo, alto } = habitacion;
  const grosor = 0.12;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh position={[x, -0.02, z]} scale={[ancho, 0.04, largo]}>
        <boxGeometry />
        <meshStandardMaterial color={seleccionada ? "#fff7ed" : "#f5f5f5"} />
      </mesh>

      <mesh
        position={[x, alto / 2, z - largo / 2]}
        scale={[ancho, alto, grosor]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x, alto / 2, z + largo / 2]}
        scale={[ancho, alto, grosor]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x - ancho / 2, alto / 2, z]}
        scale={[grosor, alto, largo]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x + ancho / 2, alto / 2, z]}
        scale={[grosor, alto, largo]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh position={[x, alto, z]} scale={[ancho, 0.04, largo]}>
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function ObjetoMovible({
  obj,
  seleccionado,
  onSeleccionar,
  onMover,
}: {
  obj: Objeto3D;
  seleccionado: boolean;
  onSeleccionar: () => void;
  onMover: (x: number, z: number) => void;
}) {
  const { camera, gl } = useThree();

  const planoSuelo = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const puntoInterseccion = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [arrastrando, setArrastrando] = useState(false);

  const tipo = obj.tipo.toLowerCase();
  const movible =
    tipo === "router" ||
    tipo === "receptor" ||
    tipo === "rx" ||
    tipo === "receiver" ||
    tipo === "persona" ||
    tipo === "columna_termica";

  const moverEnSuelo = (event: any) => {
    if (!arrastrando || !movible) return;

    const rect = gl.domElement.getBoundingClientRect();

    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    const hayInterseccion = raycaster.current.ray.intersectPlane(
      planoSuelo.current,
      puntoInterseccion.current,
    );

    if (!hayInterseccion) return;

    onMover(
      Number(puntoInterseccion.current.x.toFixed(2)),
      Number(puntoInterseccion.current.z.toFixed(2)),
    );
  };

  return (
    <group
      position={[obj.x, obj.y, obj.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSeleccionar();
      }}
      onPointerDown={(e: any) => {
        e.stopPropagation();
        onSeleccionar();

        if (movible) {
          setArrastrando(true);
          gl.domElement.style.cursor = "grabbing";

          if (e.target?.setPointerCapture) {
            e.target.setPointerCapture(e.pointerId);
          }
        }
      }}
      onPointerMove={(e: any) => {
        if (arrastrando) {
          e.stopPropagation();
          moverEnSuelo(e);
        }
      }}
      onPointerUp={(e: any) => {
        e.stopPropagation();
        setArrastrando(false);
        gl.domElement.style.cursor = "default";

        if (e.target?.releasePointerCapture) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerLeave={() => {
        if (!arrastrando) {
          gl.domElement.style.cursor = "default";
        }
      }}
      onPointerOver={() => {
        if (movible) {
          gl.domElement.style.cursor = "grab";
        }
      }}
      onPointerOut={() => {
        if (!arrastrando) {
          gl.domElement.style.cursor = "default";
        }
      }}
    >
      {tipo === "router" || tipo === "receptor" ? (
        <mesh castShadow receiveShadow scale={[obj.sx, obj.sy, obj.sz]}>
          <ModelObjeto tipo={obj.tipo} />
        </mesh>
      ) : tipo === "persona" ? (
        <PersonajeMovil color={obj.color} seleccionado={seleccionado} />
      ) : tipo === "columna_termica" ? (
        <ColumnaTermica3D obj={obj} seleccionado={seleccionado} />
      ) : (
        <mesh castShadow receiveShadow scale={[obj.sx, obj.sy, obj.sz]}>
          <boxGeometry />
          <meshStandardMaterial
            color={obj.color}
            emissive="#000000"
            emissiveIntensity={0}
          />
        </mesh>
      )}

      {(tipo === "router" ||
        tipo === "receptor" ||
        tipo === "persona" ||
        tipo === "columna_termica") && (
        <mesh position={[0, -obj.y + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.7, 32]} />
          <meshBasicMaterial
            color={
              tipo === "columna_termica"
                ? seleccionado
                  ? "#ff7a18"
                  : "#fb923c"
                : tipo === "persona"
                  ? seleccionado
                    ? "#facc15"
                    : "#fde68a"
                  : tipo === "receptor"
                    ? seleccionado
                      ? "#22c55e"
                      : "#86efac"
                    : seleccionado
                      ? "#f97316"
                      : "#fb923c"
            }
            transparent
            opacity={seleccionado ? 0.55 : 0.25}
          />
        </mesh>
      )}
    </group>
  );
}

function ColumnaTermica3D({
  obj,
  seleccionado,
}: {
  obj: Objeto3D;
  seleccionado: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const temperaturaC = obj.temperaturaC ?? (obj.T_hot_K ?? 600) - 273.15;
  const intensidad = Math.max(0.15, Math.min(1, temperaturaC / 900));

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (0.8 + intensidad);
  });

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow scale={[obj.sx, obj.sy, obj.sz]}>
        <cylinderGeometry args={[0.38, 0.62, 1, 36, 1, true]} />
        <meshStandardMaterial
          color="#ff6b00"
          emissive="#ff3b00"
          emissiveIntensity={0.25 + intensidad * 0.9}
          transparent
          opacity={0.22 + intensidad * 0.28}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh scale={[obj.sx * 0.8, obj.sy * 0.7, obj.sz * 0.8]}>
        <cylinderGeometry args={[0.28, 0.48, 1, 28, 1, true]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.12 + intensidad * 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[0, obj.sy * 0.55, 0]}
        scale={[obj.sx * 0.45, obj.sx * 0.45, obj.sx * 0.45]}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#fed7aa"
          transparent
          opacity={0.18 + intensidad * 0.25}
        />
      </mesh>

      <Line
        points={[
          [0, -obj.sy / 2, 0],
          [0, obj.sy / 2, 0],
        ]}
        color={seleccionado ? "#fff7ed" : "#fdba74"}
        lineWidth={seleccionado ? 3 : 1.5}
      />
    </group>
  );
}

function PersonajeMovil({
  color,
  seleccionado,
}: {
  color: string;
  seleccionado: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 1.8;
  });

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.42, 0]} scale={[0.45, 0.55, 0.45]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={seleccionado ? "#facc15" : "#000000"}
          emissiveIntensity={seleccionado ? 0.25 : 0}
          roughness={0.65}
        />
      </mesh>

      <mesh castShadow position={[0, 1.08, 0]} scale={[0.36, 0.36, 0.36]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#fde68a" roughness={0.7} />
      </mesh>

      <mesh castShadow position={[-0.28, 1.36, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.14, 0.45, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh castShadow position={[0.28, 1.36, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.14, 0.45, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[-0.13, 1.12, 0.32]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      <mesh position={[0.13, 1.12, 0.32]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      <mesh
        castShadow
        position={[-0.18, 0.05, 0.04]}
        scale={[0.16, 0.12, 0.23]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh castShadow position={[0.18, 0.05, 0.04]} scale={[0.16, 0.12, 0.23]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0, 0.25, -0.48]} rotation={[0.75, 0, 0]}>
        <coneGeometry args={[0.12, 0.65, 18]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function SimulacionDinamica({
  activa,
  velocidad,
  habitaciones,
}: {
  activa: boolean;
  velocidad: number;
  habitaciones: Habitacion[];
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);

  const habitacion = habitaciones[0];
  const centroX = habitacion?.x ?? 0;
  const centroZ = habitacion?.z ?? 0;
  const ancho = Math.max(2, habitacion?.ancho ?? 6);
  const largo = Math.max(2, habitacion?.largo ?? 5);

  useFrame((_, delta) => {
    if (!activa || !ref.current) return;

    t.current += delta * velocidad;

    const x = centroX + Math.sin(t.current) * (ancho * 0.35);
    const z = centroZ + Math.cos(t.current * 0.7) * (largo * 0.35);

    ref.current.position.set(x, 0.9, z);
  });

  if (!activa) return null;

  return (
    <group ref={ref} position={[centroX, 0.9, centroZ]}>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#581c87"
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.48, 32]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.45} />
      </mesh>

      <Line
        points={[
          [0, 0, 0],
          [0, 0.6, 0],
        ]}
        color="#a855f7"
        lineWidth={2}
      />
    </group>
  );
}

// ---------------------------------------------------------
// VISUALIZACIÓN DE ARRAYS MIMO / ANTENAS FEKO-READY
// ---------------------------------------------------------
function CapaArraysMIMO({
  objetos,
  txRows,
  txCols,
  rxRows,
  rxCols,
  spacingLambda,
  frecuenciaMhz,
  antennaTypeTx,
  antennaTypeRx,
}: {
  objetos: Objeto3D[];
  txRows: number;
  txCols: number;
  rxRows: number;
  rxCols: number;
  spacingLambda: number;
  frecuenciaMhz: number;
  antennaTypeTx: string;
  antennaTypeRx: string;
}) {
  const c = 299792458;
  const lambda = c / Math.max(1, frecuenciaMhz * 1e6);
  const spacingM = Math.max(0.02, spacingLambda * lambda);

  const pintarArray = (
    obj: Objeto3D,
    rows: number,
    cols: number,
    esTx: boolean,
  ) => {
    const elementos = [];
    const rMax = Math.max(1, Math.min(8, rows));
    const cMax = Math.max(1, Math.min(8, cols));
    const color = esTx ? "#fb923c" : "#22d3ee";
    const antena = esTx ? antennaTypeTx : antennaTypeRx;

    for (let r = 0; r < rMax; r++) {
      for (let cIdx = 0; cIdx < cMax; cIdx++) {
        const ox = (cIdx - (cMax - 1) / 2) * spacingM;
        const oy = (r - (rMax - 1) / 2) * spacingM;
        elementos.push(
          <group
            key={`${obj.id}-${r}-${cIdx}`}
            position={[obj.x + ox, obj.y + oy, obj.z]}
          >
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.35}
              />
            </mesh>
            {antena.includes("dipolo") && (
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.32, 12]} />
                <meshStandardMaterial color={color} />
              </mesh>
            )}
            {antena.includes("patch") && (
              <mesh position={[0, 0, 0.035]}>
                <boxGeometry args={[0.18, 0.12, 0.018]} />
                <meshStandardMaterial color={color} />
              </mesh>
            )}
            {antena.includes("helicoidal") && (
              <mesh>
                <torusGeometry args={[0.08, 0.01, 8, 24]} />
                <meshStandardMaterial color={color} />
              </mesh>
            )}
          </group>,
        );
      }
    }
    return elementos;
  };

  return (
    <>
      {objetos.map((obj) => {
        const tipo = obj.tipo.toLowerCase();
        if (tipo === "router" || tipo === "tx" || tipo === "transmitter") {
          return pintarArray(obj, txRows, txCols, true);
        }
        if (tipo === "receptor" || tipo === "rx" || tipo === "receiver") {
          return pintarArray(obj, rxRows, rxCols, false);
        }
        return null;
      })}
    </>
  );
}

// ---------------------------------------------------------
// VISUALIZACIÓN DE HEATMAP, RAYOS, ROUTER ÓPTIMO Y PERSONAS
// ---------------------------------------------------------
function CapaCobertura({
  resultado,
  objetos,
  mostrarHeatmap,
  mostrarRayos,
  mostrarRouterOptimo,
  maxRayos,
  modoHeatmap,
  mostrarMesh,
}: {
  resultado: ResultadoCobertura;
  objetos: Objeto3D[];
  mostrarHeatmap: boolean;
  mostrarRayos: boolean;
  mostrarRouterOptimo: boolean;
  maxRayos: number;
  modoHeatmap: "potencia" | "delay" | "doppler";
  mostrarMesh: boolean;
}) {
  const heatmapBase = resultado.heatmap ?? [];
  const heatmapCanal = resultado.heatmapCanal ?? [];
  const heatmapActivo =
    modoHeatmap === "potencia"
      ? heatmapBase
      : heatmapCanal.length > 0
        ? heatmapCanal
        : heatmapBase;

  const heatmapMesh =
    resultado.heatmapConMesh ?? resultado.coberturaConMesh?.heatmap ?? [];

  // -------------------------------------------------------
  // Rayos visibles físicamente coherentes TX -> RX
  // -------------------------------------------------------
  // Con Sionna/difracción pueden llegar muchos candidatos geométricos.
  // Para no pintar una "telaraña", el frontend solo dibuja rayos cuyo
  // extremo final cae cerca de un receptor real de la escena. Si hay varios
  // receptores, se permite maxRayos por receptor. Si no hay receptores
  // reales colocados, se usa el comportamiento anterior como fallback.
  const receptoresEscena = (objetos ?? []).filter((obj) => {
    const tipo = (obj.tipo || "").toLowerCase().trim();
    return ["receptor", "rx", "receiver", "cliente", "movil", "móvil", "portatil", "portátil"].includes(tipo);
  });

  const distancia3 = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => {
    const dx = Number(a.x) - Number(b.x);
    const dy = Number(a.y) - Number(b.y);
    const dz = Number(a.z) - Number(b.z);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const puntoFinito = (p: any) =>
    p &&
    Number.isFinite(Number(p.x)) &&
    Number.isFinite(Number(p.y)) &&
    Number.isFinite(Number(p.z));

  const receptorCercano = (p: any) => {
    if (!puntoFinito(p) || receptoresEscena.length === 0) return null;

    let mejor: Objeto3D | null = null;
    let mejorD = Infinity;

    for (const rx of receptoresEscena) {
      const d = distancia3(
        { x: Number(p.x), y: Number(p.y), z: Number(p.z) },
        { x: Number(rx.x), y: Number(rx.y), z: Number(rx.z) },
      );

      if (d < mejorD) {
        mejorD = d;
        mejor = rx;
      }
    }

    // Tolerancia suficiente para redondeos del backend y tamaño del icono RX.
    return mejorD <= 0.85 ? mejor : null;
  };

  const normalizarPuntosRayo = (rayo: RayoCobertura) => {
    const puntos = (rayo.puntos ?? []).filter(puntoFinito).map((p) => ({
      x: Number(p.x),
      y: Number(p.y),
      z: Number(p.z),
    }));

    if (puntos.length < 2) return [];

    if (receptoresEscena.length === 0) return puntos;

    const primeroLlegaRx = receptorCercano(puntos[0]);
    const ultimoLlegaRx = receptorCercano(puntos[puntos.length - 1]);

    if (ultimoLlegaRx) return puntos;
    if (primeroLlegaRx) return [...puntos].reverse();

    return [];
  };

  const rayosVisibles = (resultado.rayos ?? [])
    .map((rayo) => ({
      ...rayo,
      puntos: normalizarPuntosRayo(rayo),
    }))
    .filter((rayo) => {
      if (!rayo.puntos || rayo.puntos.length < 2) return false;
      if (!Number.isFinite(Number(rayo.potenciaDbm))) return false;

      // Evitamos pintar caminos extremadamente débiles si hay muchos candidatos.
      if (Number(rayo.potenciaDbm) < -115) return false;

      // Si hay RX reales, obligatorio que el rayo termine cerca de alguno.
      if (receptoresEscena.length > 0) {
        return Boolean(receptorCercano(rayo.puntos[rayo.puntos.length - 1]));
      }

      return true;
    })
    .sort((a, b) => Number(b.potenciaDbm) - Number(a.potenciaDbm));

  const firmasRayos = new Set<string>();
  const limiteTotalRayos = Math.max(1, maxRayos) * Math.max(1, receptoresEscena.length);
  const rayosVisiblesUnicos = rayosVisibles
    .filter((rayo) => {
      const firma = rayo.puntos
        .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`)
        .join("|");

      if (firmasRayos.has(firma)) return false;
      firmasRayos.add(firma);
      return true;
    })
    .slice(0, limiteTotalRayos);

  return (
    <group>
      {mostrarMesh &&
        heatmapMesh.map((p, index) => (
          <mesh
            key={`heatmap-mesh-denso-${index}`}
            position={[p.x, 0.085, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.32, 32]} />
            <meshBasicMaterial
              color={colorHeatmapMesh(p.potenciaDbm)}
              transparent
              opacity={0.45}
            />
          </mesh>
        ))}

      {mostrarHeatmap &&
        heatmapActivo.map((p, i) => (
          <mesh
            key={`heatmap-${modoHeatmap}-${i}`}
            position={[p.x, 0.05, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry
              args={[modoHeatmap === "potencia" ? 0.22 : 0.3, 24]}
            />
            <meshBasicMaterial
              color={colorHeatmapModo(p, modoHeatmap)}
              transparent
              opacity={modoHeatmap === "potencia" ? 0.55 : 0.75}
            />
          </mesh>
        ))}

      {mostrarMesh &&
        heatmapMesh.map((p, i) => (
          <mesh
            key={`heatmap-mesh-contorno-${i}`}
            position={[p.x, 0.09, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.24, 0.34, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
          </mesh>
        ))}

      {mostrarRayos &&
        rayosVisiblesUnicos.map((rayo) => {
          const puntos = rayo.puntos.map(
            (p) => [p.x, p.y, p.z] as [number, number, number],
          );

          if (puntos.length < 2) return null;

          return (
            <Line
              key={rayo.id}
              points={puntos}
              color={colorRayo(rayo)}
              lineWidth={grosorRayo(rayo)}
              transparent
              opacity={Math.max(0.18, Math.min(1, (Number(rayo.potenciaDbm) + 115) / 55))}
            />
          );
        })}

      {mostrarRouterOptimo && resultado.routerOptimo && (
        <group
          position={[
            resultado.routerOptimo.x,
            resultado.routerOptimo.y,
            resultado.routerOptimo.z,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#14532d"
              emissiveIntensity={0.8}
            />
          </mesh>

          <mesh
            position={[0, -resultado.routerOptimo.y + 0.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.35, 0.55, 32]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {resultado.receptoresOptimos?.map((rx) => (
        <group key={`rx-opt-${rx.habitacion}`} position={[rx.x, rx.y, rx.z]}>
          <mesh>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#14532d"
              emissiveIntensity={0.8}
            />
          </mesh>

          <mesh position={[0, -rx.y + 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.36, 24]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {resultado.repetidoresOptimos?.map((rep) => (
        <group key={rep.id} position={[rep.x, rep.y, rep.z]}>
          <mesh>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#075985"
              emissiveIntensity={0.7}
            />
          </mesh>

          <mesh
            position={[0, -rep.y + 0.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.25, 0.42, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function colorHeatmapModo(
  p: PuntoHeatmap,
  modo: "potencia" | "delay" | "doppler",
) {
  if (modo === "delay") {
    const d = Math.abs(p.delaySpreadRmsNs ?? 0);
    if (d < 5) return "#22c55e";
    if (d < 20) return "#eab308";
    if (d < 50) return "#f97316";
    return "#ef4444";
  }

  if (modo === "doppler") {
    const f = Math.abs(p.dopplerHz ?? 0);
    if (f < 5) return "#94a3b8";
    if (f < 25) return "#38bdf8";
    if (f < 80) return "#a855f7";
    return "#ef4444";
  }

  return colorHeatmap(p.potenciaDbm);
}

function colorHeatmap(potenciaDbm: number) {
  if (potenciaDbm >= -50) return "#22c55e";
  if (potenciaDbm >= -65) return "#a3e635";
  if (potenciaDbm >= -75) return "#f97316";
  return "#ef4444";
}

function colorHeatmapMesh(potenciaDbm: number) {
  if (potenciaDbm >= -50) return "#7dd3fc";
  if (potenciaDbm >= -65) return "#38bdf8";
  if (potenciaDbm >= -75) return "#0284c7";

  return "#0c4a6e";
}

function colorRayo(rayo: any) {
  if (
    rayo.afectadoPorPersona ||
    rayo.tipo === "afectado_persona" ||
    rayo.tipoVisual === "afectado_persona"
  ) {
    return "#ef4444";
  }

  if (rayo.esDifractado || rayo.tipo === "difractado" || rayo.tipoVisual === "difractado") {
    return "#00d4ff";
  }

  if (rayo.tipo === "difuso" || rayo.tipoVisual === "difuso") {
    return "#60a5fa";
  }

  if (rayo.tipo === "refractado" || rayo.tipoVisual === "refractado") {
    return "#14b8a6";
  }

  if (rayo.tipo === "directo") {
    return "#22c55e";
  }

  if (rayo.tipo === "reflejado") {
    return "#f59e0b";
  }

  if (rayo.nlos) {
    return "#a855f7";
  }

  return "#38bdf8";
}

function grosorRayo(rayo: any) {
  if (
    rayo.afectadoPorPersona ||
    rayo.tipo === "afectado_persona" ||
    rayo.tipoVisual === "afectado_persona"
  ) {
    return 5;
  }

  if (rayo.esDifractado || rayo.tipo === "difractado" || rayo.tipoVisual === "difractado") {
    return 4;
  }

  const p = rayo.potenciaDbm ?? -90;

  return Math.max(1, Math.min(8, (p + 100) / 10));
}

function MaterialSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[8px] uppercase text-slate-500 font-black mb-2">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/70 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
      >
        <option value="hormigon">Hormigón</option>
        <option value="ladrillo">Ladrillo</option>
        <option value="pladur">Pladur / yeso</option>
        <option value="yeso">Yeso</option>
        <option value="madera">Madera</option>
        <option value="metal">Metal</option>
        <option value="cristal">Cristal / vidrio</option>
        <option value="tejido">Tejido</option>
        <option value="rx">Receptor RX</option>
      </select>
    </div>
  );
}

function ModeloGLB({ url }: { url: string }) {
  const gltf = useGLTF(url) as any;

  return (
    <group scale={1} position={[0, 0, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// =========================================================
// COMPONENTES UI REUTILIZABLES
// =========================================================
function Boton({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-3 rounded-xl bg-black/70 border border-slate-700 text-[9px] font-black uppercase text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
    >
      {texto}
    </button>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const decimals = step < 0.001 ? 5 : step < 0.01 ? 4 : step < 0.1 ? 3 : 1;
  const safeValue = Number.isFinite(value) ? value : min;

  return (
    <div>
      <div className="flex justify-between mb-1 gap-2">
        <label className="text-[8px] uppercase text-slate-500 font-black">
          {label}
        </label>

        <span className="text-[8px] text-cyan-300 font-mono">
          {safeValue.toFixed(decimals)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_96px] gap-2 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-black/70 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
        />
      </div>
    </div>
  );
}
