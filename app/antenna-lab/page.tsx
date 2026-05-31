"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

const DEFAULT_BACKEND_URL = "https://VicenteAltava-mastesto-sionna-api.hf.space";

const normalizarApiUrl = (url?: string) =>
  (url && url.trim().length > 0 ? url : DEFAULT_BACKEND_URL).replace(/\/$/, "");

const API_URL = normalizarApiUrl(
  process.env.NEXT_PUBLIC_SIONNA_API_URL || process.env.NEXT_PUBLIC_API_URL,
);

type SolverMode = "analytic" | "mom";

type FlexiblePoint = Record<string, any>;

type Pattern2DChartPoint = {
  theta: number;
  gainRelDb: number;
  powerNorm: number;
};

type PolarChartPoint = {
  theta: string;
  value: number;
};

type CurrentChartPoint = {
  zLambda: number;
  currentAbsNorm: number;
  currentAbs: number;
  phaseDeg: number;
};

type Pattern3DVertex = {
  thetaDeg: number;
  phiDeg: number;
  r: number;
  x: number;
  y: number;
  z: number;
  powerNorm: number;
  gainRelDb: number;
};

type DipoleResult = {
  ok: boolean;
  antennaType?: string;
  solver?: string;
  frequencyHz?: number;
  lambdaM?: number;
  geometry?: {
    lengthLambda?: number;
    lengthM?: number;
    radiusLambda?: number;
    radiusM?: number;
    segments?: number;
    dzM?: number;
    feedIndex?: number;
    axis?: string;
    feed?: string;
  };
  impedance?: {
    inputResistanceOhm?: number;
    inputReactanceOhm?: number;
    inputResistanceOhmRaw?: number;
    inputReactanceOhmRaw?: number;
    inputImpedanceOhm?: { real?: number; imag?: number };
    inputImpedanceOhmRaw?: { real?: number; imag?: number };
    radiationResistanceOhm?: number;
    calibrated?: boolean;
  };
  sParameters?: {
    z0Ohm?: number;
    s11Db?: number;
    S11Db?: number;
    s11_db?: number;
    vswr?: number;
    VSWR?: number;
    mismatchLossDb?: number;
    returnLossDb?: number;
    gammaAbs?: number;
    classification?: string;
  };
  performance?: {
    directivityDbi?: number;
    directivityLinear?: number;
    gainMaxDbi?: number;
    realizedGainMaxDbi?: number;
    efficiency?: number;
    polarization?: string;
    polarizationBasis?: string;
  };
  pattern2D?: any;
  radiationPattern2D?: any;
  pattern2d?: any;
  ePlanePattern?: any;
  polarPattern?: any;
  pattern3D?: any;
  radiationPattern3D?: any;
  pattern3d?: any;
  farField3D?: any;
  currents?: any;
  currentDistribution?: any;
  currentProfile?: any;
  currentsData?: any;
  charts?: {
    current?: FlexiblePoint[];
    pattern2D?: FlexiblePoint[];
    pattern3D?: FlexiblePoint[];
  };
  mom?: {
    matrix?: {
      size?: number[];
      rows?: number;
      cols?: number;
      conditionNumber?: number;
      solvedDirectly?: boolean;
      error?: string | null;
    };
    equation?: any;
  };
  exportSionna?: any;
  warnings?: string[];
  summary?: any;
};


type MoMJobStatus = {
  ok: boolean;
  jobId: string;
  status: "queued" | "running" | "done" | "error" | string;
  progress: number;
  stage: string;
  message: string;
  error?: { detail?: string } | string | null;
  result?: DipoleResult;
};

const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const fmt = (n: unknown, d = 3) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(d) : "-";
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const asArray = (x: any): any[] => {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.points)) return x.points;
  if (Array.isArray(x?.vertices)) return x.vertices;
  if (Array.isArray(x?.data)) return x.data;
  return [];
};

const normalizePattern2D = (result: DipoleResult | null): Pattern2DChartPoint[] => {
  if (!result) return [];

  const src =
    result.charts?.pattern2D?.length
      ? result.charts.pattern2D
      : asArray(result.pattern2D).length
        ? asArray(result.pattern2D)
        : asArray(result.radiationPattern2D).length
          ? asArray(result.radiationPattern2D)
          : asArray(result.pattern2d).length
            ? asArray(result.pattern2d)
            : asArray(result.ePlanePattern).length
              ? asArray(result.ePlanePattern)
              : asArray(result.polarPattern);

  return src
    .map((p: FlexiblePoint) => {
      const theta = num(p.thetaDeg ?? p.theta_deg ?? p.theta ?? p.angleDeg, NaN);
      const gainRelDb = num(p.gainRelDb ?? p.gainDb ?? p.gainDbi ?? p.db ?? p.valueDb, NaN);
      const powerNorm = clamp(num(p.powerNorm ?? p.norm ?? p.normalized ?? p.r ?? p.value, 0), 0, 1);
      return {
        theta: Number(theta.toFixed(1)),
        gainRelDb: Number(gainRelDb.toFixed(2)),
        powerNorm: Number(powerNorm.toFixed(5)),
      };
    })
    .filter((p) => Number.isFinite(p.theta) && Number.isFinite(p.gainRelDb));
};

const normalizePolarData = (pattern: Pattern2DChartPoint[]): PolarChartPoint[] =>
  pattern
    .filter((_, i) => i % Math.max(1, Math.floor(pattern.length / 36)) === 0)
    .map((p) => ({
      theta: `${Math.round(p.theta)}°`,
      value: clamp(p.powerNorm, 0, 1),
    }));

const normalizeCurrents = (result: DipoleResult | null): CurrentChartPoint[] => {
  if (!result) return [];

  const src =
    result.charts?.current?.length
      ? result.charts.current
      : asArray(result.currents).length
        ? asArray(result.currents)
        : asArray(result.currentDistribution).length
          ? asArray(result.currentDistribution)
          : asArray(result.currentProfile).length
            ? asArray(result.currentProfile)
            : asArray(result.currentsData);

  const raw = src.map((c: FlexiblePoint) => {
    const zLambda =
      typeof c.zLambda === "number"
        ? c.zLambda
        : typeof c.x === "number"
          ? c.x
          : num(c.zM, 0) / Math.max(num(result.lambdaM, 1), 1e-12);

    const currentAbs = num(c.currentAbs ?? c.amplitude ?? c.magnitude ?? c.y, 0);
    const currentAbsNorm = num(
      c.currentAbsNorm ?? c.currentNorm ?? c.norm ?? c.normalized ?? c.value ?? c.y,
      NaN,
    );
    const phaseDeg = num(c.phaseDeg ?? c.currentPhaseDeg ?? (num(c.currentPhaseRad, 0) * 180) / Math.PI, 0);

    return { zLambda, currentAbsNorm, currentAbs, phaseDeg };
  });

  const maxAbs = Math.max(...raw.map((p) => p.currentAbs), 0);

  return raw
    .map((p) => ({
      zLambda: Number(num(p.zLambda).toFixed(5)),
      currentAbsNorm: Number(
        (Number.isFinite(p.currentAbsNorm)
          ? clamp(p.currentAbsNorm, 0, 1)
          : maxAbs > 0
            ? clamp(p.currentAbs / maxAbs, 0, 1)
            : 0
        ).toFixed(5),
      ),
      currentAbs: num(p.currentAbs, 0),
      phaseDeg: Number(p.phaseDeg.toFixed(2)),
    }))
    .filter((p) => Number.isFinite(p.zLambda));
};

const normalizePattern3D = (result: DipoleResult | null): Pattern3DVertex[] => {
  if (!result) return [];

  const src =
    result.charts?.pattern3D?.length
      ? result.charts.pattern3D
      : asArray(result.pattern3D).length
        ? asArray(result.pattern3D)
        : asArray(result.radiationPattern3D).length
          ? asArray(result.radiationPattern3D)
          : asArray(result.pattern3d).length
            ? asArray(result.pattern3d)
            : asArray(result.farField3D);

  return src
    .map((v: FlexiblePoint) => {
      const r = clamp(num(v.r ?? v.norm ?? v.normalized ?? v.powerNorm, 0), 0, 1);
      const gainRelDb = num(v.gainRelDb ?? v.gainDb ?? v.gainDbi ?? v.db, -60);
      const powerNorm = clamp(num(v.powerNorm ?? v.norm ?? v.normalized ?? r, 0), 0, 1);

      return {
        thetaDeg: num(v.thetaDeg ?? v.theta_deg ?? v.theta, 0),
        phiDeg: num(v.phiDeg ?? v.phi_deg ?? v.phi, 0),
        r,
        x: num(v.x, 0),
        y: num(v.y, 0),
        z: num(v.z, 0),
        powerNorm,
        gainRelDb,
      };
    })
    .filter((v) => Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z));
};

function Dipole3D({ lengthM, radiusM }: { lengthM: number; radiusM: number }) {
  const radius = Math.max(radiusM * 20, 0.015);
  const length = Math.max(lengthM, 0.02);

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, length, 32]} />
        <meshStandardMaterial color="#f97316" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[radius * 1.8, 24, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, length / 2]}>
        <sphereGeometry args={[radius * 1.4, 24, 24]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 0, -length / 2]}>
        <sphereGeometry args={[radius * 1.4, 24, 24]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

function RadiationPattern3D({ vertices }: { vertices: Pattern3DVertex[] }) {
  const geometry = useMemo(() => {
    if (!vertices?.length) return null;

    const thetaValues = Array.from(new Set(vertices.map((v) => Number(v.thetaDeg.toFixed(4))))).sort(
      (a, b) => a - b,
    );
    const phiValues = Array.from(new Set(vertices.map((v) => Number(v.phiDeg.toFixed(4))))).sort(
      (a, b) => a - b,
    );

    const thetaN = thetaValues.length;
    const phiN = phiValues.length;
    if (thetaN < 2 || phiN < 2) return null;

    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    vertices.forEach((v) => {
      const scale = 1.35;
      positions.push(v.x * scale, v.z * scale, v.y * scale);
      const t = clamp(v.powerNorm ?? v.r ?? 0, 0, 1);
      color.setHSL(0.66 - 0.66 * t, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    });

    const indices: number[] = [];
    for (let i = 0; i < thetaN - 1; i++) {
      for (let j = 0; j < phiN; j++) {
        const jp = (j + 1) % phiN;
        const a = i * phiN + j;
        const b = (i + 1) * phiN + j;
        const c = (i + 1) * phiN + jp;
        const d = i * phiN + jp;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.82}
        side={THREE.DoubleSide}
        roughness={0.45}
        metalness={0.05}
      />
    </mesh>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">
        {value}
        {unit && <span className="ml-1 text-sm text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black p-6 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

export default function AntennaLabPage() {
  const [solverMode, setSolverMode] = useState<SolverMode>("analytic");
  const [frequencyGhz, setFrequencyGhz] = useState(2.45);
  const [lengthLambda, setLengthLambda] = useState(0.47);
  const [radiusLambda, setRadiusLambda] = useState(0.001);
  const [feedImpedanceOhm, setFeedImpedanceOhm] = useState(50);
  const [efficiency, setEfficiency] = useState(0.95);
  const [thetaSamples, setThetaSamples] = useState(181);
  const [phiSamples, setPhiSamples] = useState(181);
  const [includePattern3D, setIncludePattern3D] = useState(true);
  const [segments, setSegments] = useState(101);
  const [feedVoltageV, setFeedVoltageV] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DipoleResult | null>(null);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [jobStage, setJobStage] = useState("");
  const [basisType, setBasisType] = useState("piecewise_sinusoidal");

  const esperarResultadoJob = async (newJobId: string): Promise<DipoleResult> => {
    while (true) {
      const statusRes = await fetch(`${API_URL}/antenna/mom/job/status/${newJobId}`, {
        cache: "no-store",
      });
      const statusData: MoMJobStatus = await statusRes.json();

      if (!statusRes.ok || !statusData.ok) {
        throw new Error((statusData as any)?.detail || "Error consultando progreso MoM");
      }

      setProgress(Number(statusData.progress || 0));
      setProgressText(statusData.message || "Calculando...");
      setJobStage(statusData.stage || "");

      if (statusData.status === "error") {
        const detail =
          typeof statusData.error === "string"
            ? statusData.error
            : statusData.error?.detail;
        throw new Error(detail || "Error en cálculo MoM");
      }

      if (statusData.status === "done") {
        const resultRes = await fetch(`${API_URL}/antenna/mom/job/result/${newJobId}`, {
          cache: "no-store",
        });
        const resultData: MoMJobStatus = await resultRes.json();

        if (!resultRes.ok || !resultData.ok) {
          throw new Error((resultData as any)?.detail || "Error obteniendo resultado MoM");
        }

        if (!resultData.result?.ok) {
          throw new Error("El job terminó, pero no devolvió resultado válido");
        }

        return resultData.result;
      }

      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  };

  const calcularDipolo = async () => {
    setLoading(true);
    setError("");
    setProgress(0);
    setProgressText("");
    setJobStage("");
    setJobId(null);

    try {
      const cleanSegments = Math.max(11, Math.min(401, Math.round(segments)));
      const oddSegments = cleanSegments % 2 === 0 ? Math.min(cleanSegments + 1, 401) : cleanSegments;

      const basePayload = {
        frequencyHz: frequencyGhz * 1e9,
        lengthLambda,
        radiusLambda,
        feedImpedanceOhm,
        efficiency,
        thetaSamples,
        phiSamples,
        includePattern3D,
      };

      if (solverMode === "mom") {
        const payload = {
          ...basePayload,
          segments: oddSegments,
          feedVoltageV,
          calibrateImpedance: false,
          basisType,
        };

        const startRes = await fetch(`${API_URL}/antenna/mom/job/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const startData: MoMJobStatus = await startRes.json();

        if (!startRes.ok || !startData.ok) {
          throw new Error((startData as any)?.detail || "Error iniciando job MoM");
        }

        setJobId(startData.jobId);
        setProgress(Number(startData.progress || 0));
        setProgressText(startData.message || "Trabajo MoM iniciado");
        setJobStage(startData.stage || "queued");

        const data = await esperarResultadoJob(startData.jobId);
        console.log("Antenna Lab MoM job result:", data);

        setSegments(oddSegments);
        setProgress(100);
        setProgressText("Cálculo completado");
        setJobStage("done");
        setResult(data);
        return;
      }

      const res = await fetch(`${API_URL}/antenna/dipole/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });

      const data = await res.json();
      console.log("Antenna Lab analytic result:", data);

      if (!res.ok || !data.ok) {
        throw new Error(data?.detail || data?.error || "Error calculando dipolo");
      }

      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const pattern2DData = normalizePattern2D(result);
  const polarData = normalizePolarData(pattern2DData);
  const currentsData = normalizeCurrents(result);
  const pattern3DVertices = normalizePattern3D(result);

  const isMom = result?.solver?.toLowerCase?.().includes("mom") ?? false;

  const zinReal =
    result?.impedance?.inputResistanceOhm ??
    result?.impedance?.inputImpedanceOhm?.real ??
    result?.impedance?.inputResistanceOhmRaw;

  const zinImag =
    result?.impedance?.inputReactanceOhm ??
    result?.impedance?.inputImpedanceOhm?.imag ??
    result?.impedance?.inputReactanceOhmRaw;

  const s11 = result?.sParameters?.s11Db ?? result?.sParameters?.S11Db ?? result?.sParameters?.s11_db;
  const vswr = result?.sParameters?.vswr ?? result?.sParameters?.VSWR;
  const condition = result?.mom?.matrix?.conditionNumber;
  const matrixSize = result?.mom?.matrix?.size;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-zinc-950 to-black px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-400">Mastesto RF Engine</p>
          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight md:text-6xl">Antenna Lab</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">
            Laboratorio RF de antenas: dipolo parametrizable por xλ, solver analítico, solver MoM EFIE/PEEC de hilo fino, S11, VSWR, corrientes, patrón 2D, diagrama 3D y exportación preparada para Sionna.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[400px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
          <h2 className="text-lg font-black uppercase tracking-[0.18em]">Configuración de antena</h2>

          <div className="mt-5 space-y-5">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Solver</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSolverMode("analytic")}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold uppercase ${
                    solverMode === "analytic"
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-white/10 bg-black text-zinc-300"
                  }`}
                >
                  Analítico
                </button>
                <button
                  onClick={() => setSolverMode("mom")}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold uppercase ${
                    solverMode === "mom"
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-white/10 bg-black text-zinc-300"
                  }`}
                >
                  MoM
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Frecuencia GHz</span>
              <input type="number" step="0.01" value={frequencyGhz} onChange={(e) => setFrequencyGhz(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Longitud L = xλ</span>
              <input type="number" step="0.01" value={lengthLambda} onChange={(e) => setLengthLambda(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              <input type="range" min="0.05" max="3" step="0.01" value={lengthLambda} onChange={(e) => setLengthLambda(Number(e.target.value))} className="mt-3 w-full" />
              <p className="mt-2 text-xs text-zinc-500">Para dipolo fino resonante prueba 0.47λ. 0.5λ suele quedar inductivo.</p>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Radio conductor en λ</span>
              <input type="number" step="0.0001" value={radiusLambda} onChange={(e) => setRadiusLambda(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Impedancia referencia Ω</span>
              <input type="number" step="1" value={feedImpedanceOhm} onChange={(e) => setFeedImpedanceOhm(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Eficiencia</span>
              <input type="number" step="0.01" value={efficiency} onChange={(e) => setEfficiency(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            {solverMode === "mom" && (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Parámetros MoM</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Segmentos</span>
                    <input
                      type="number"
                      min={11}
                      max={401}
                      step={2}
                      value={segments}
                      onChange={(e) => setSegments(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">V feed</span>
                    <input type="number" step="0.1" value={feedVoltageV} onChange={(e) => setFeedVoltageV(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Base numérica</span>
                  <select
                    value={basisType}
                    onChange={(e) => setBasisType(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
                  >
                    <option value="piecewise_sinusoidal">Piecewise sinusoidal</option>
                    <option value="default">EFIE/PEEC estable</option>
                  </select>
                </label>

                <p className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-zinc-400">
                  El modo MoM usa jobs backend con progreso real. Para cálculos pesados prueba 101, 201 y 401 segmentos.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">θ samples</span>
                <input type="number" value={thetaSamples} onChange={(e) => setThetaSamples(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">φ samples</span>
                <input type="number" value={phiSamples} onChange={(e) => setPhiSamples(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
              <input type="checkbox" checked={includePattern3D} onChange={(e) => setIncludePattern3D(e.target.checked)} />
              <span className="text-sm text-zinc-300">Calcular patrón 3D</span>
            </label>

            <button onClick={calcularDipolo} disabled={loading} className="w-full rounded-2xl bg-orange-500 px-5 py-4 font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Calculando..." : `Calcular dipolo ${solverMode === "mom" ? "MoM" : "analítico"}`}
            </button>

            {loading && solverMode === "mom" && (
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.2em]">
                  <span className="truncate text-zinc-400">{progressText || "Calculando MoM..."}</span>
                  <span className="font-bold text-orange-400">{Math.round(progress)}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${clamp(progress, 0, 100)}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span>Fase: {jobStage || "-"}</span>
                  {jobId && <span>Job: {jobId.slice(0, 8)}...</span>}
                </div>
              </div>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          </div>
        </aside>

        <section className="space-y-6">
          {!result && (
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-8 text-zinc-400">
              Calcula un dipolo para ver resultados. Usa el modo analítico para respuesta rápida o MoM para resolver corrientes con Z·I=V.
            </div>
          )}

          {result && (
            <>
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Solver activo</p>
                    <h2 className="mt-1 text-2xl font-black uppercase text-white">{result.solver}</h2>
                  </div>
                  {isMom && <div className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">MoM · Z·I=V</div>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="λ" value={fmt(result.lambdaM, 4)} unit="m" />
                <StatCard label="Longitud" value={fmt(result.geometry?.lengthM, 4)} unit="m" />
                <StatCard label="S11" value={fmt(s11, 2)} unit="dB" />
                <StatCard label="VSWR" value={fmt(vswr, 2)} />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Zin real" value={fmt(zinReal, 2)} unit="Ω" />
                <StatCard label="Zin imag" value={fmt(zinImag, 2)} unit="Ω" />
                <StatCard label="Directividad" value={fmt(result.performance?.directivityDbi, 2)} unit="dBi" />
                <StatCard label="Ganancia realizada" value={fmt(result.performance?.realizedGainMaxDbi, 2)} unit="dBi" />
              </div>

              {isMom && result.mom?.matrix && (
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard label="Matriz Z" value={Array.isArray(matrixSize) ? `${matrixSize[0]}×${matrixSize[1]}` : "-"} />
                  <StatCard label="Condición" value={fmt(condition, 2)} />
                  <StatCard label="Segmentos" value={result.geometry?.segments ?? "-"} />
                  <StatCard label="dz" value={fmt(result.geometry?.dzM, 5)} unit="m" />
                </div>
              )}

              {isMom && (
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 text-sm text-zinc-400">
                  <span className="font-bold text-orange-300">Estado EFIE:</span>{" "}
                  Zin y corriente vienen de la matriz Z·I=V. Para diseño final, validar contra FEKO/CST/HFSS.
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Diagrama de radiación 3D</h3>
                  <div className="mt-4 h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <Canvas camera={{ position: [2.5, 2.0, 2.5], fov: 42 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[3, 5, 4]} intensity={1.2} />
                      <Grid args={[4, 4]} cellSize={0.25} sectionSize={1} />
                      <Dipole3D lengthM={num(result.geometry?.lengthM, 0.05)} radiusM={num(result.geometry?.radiusM, 0.0001)} />
                      {pattern3DVertices.length ? <RadiationPattern3D vertices={pattern3DVertices} /> : null}
                      <OrbitControls makeDefault />
                    </Canvas>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    Puntos patrón 3D: {pattern3DVertices.length}. Si no aparece superficie, activa “Calcular patrón 3D”.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Patrón 2D · E-plane</h3>
                  <div className="mt-4 h-[250px] rounded-2xl border border-white/10 bg-black p-3">
                    {pattern2DData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pattern2DData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="theta" stroke="#a1a1aa" />
                          <YAxis stroke="#a1a1aa" domain={[-60, 0]} />
                          <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "white" }} />
                          <Line type="monotone" dataKey="gainRelDb" dot={false} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart text="Sin datos de patrón 2D en la respuesta." />
                    )}
                  </div>

                  <h3 className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Polar normalizado</h3>
                  <div className="mt-4 h-[250px] rounded-2xl border border-white/10 bg-black p-3">
                    {polarData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={polarData}>
                          <PolarGrid stroke="#27272a" />
                          <PolarAngleAxis dataKey="theta" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                          <PolarRadiusAxis tick={{ fill: "#71717a", fontSize: 10 }} domain={[0, 1]} />
                          <Radar dataKey="value" fillOpacity={0.35} />
                          <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "white" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart text="Sin datos polar normalizado." />
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Corriente sobre el hilo · I(z)</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Distribución de corriente calculada por MoM EFIE. En el dipolo resonante debe ser máxima cerca del centro y tender a cero en extremos.
                </p>
                <div className="mt-4 h-[320px] rounded-2xl border border-white/10 bg-black p-3">
                  {currentsData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="zLambda" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" domain={[0, 1]} />
                        <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "white" }} />
                        <Line type="monotone" dataKey="currentAbsNorm" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart text="Sin datos de corriente. Comprueba que el backend devuelve currents o charts.current." />
                  )}
                </div>
                <p className="mt-3 text-xs text-zinc-500">Puntos de corriente: {currentsData.length}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Exportación preparada para Sionna</h3>
                <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black p-4 text-xs text-zinc-300">
                  {JSON.stringify(result.exportSionna, null, 2)}
                </pre>
              </div>

              {result.warnings?.length ? (
                <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 text-sm text-orange-200">
                  <p className="font-bold uppercase tracking-[0.2em]">Avisos</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </section>
      </section>
    </main>
  );
}
