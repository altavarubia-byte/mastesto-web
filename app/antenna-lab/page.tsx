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

type Pattern2DPoint = {
  thetaDeg: number;
  phiDeg: number;
  fieldNorm: number;
  powerNorm: number;
  gainRelDb: number;
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
  antennaType: string;
  solver: string;
  frequencyHz: number;
  lambdaM: number;
  geometry: {
    lengthLambda: number;
    lengthM: number;
    radiusLambda: number;
    radiusM: number;
    axis: string;
    feed: string;
  };
  impedance: {
    inputResistanceOhm: number;
    inputReactanceOhm: number;
    inputImpedanceOhm: { real: number; imag: number };
  };
  sParameters: {
    z0Ohm: number;
    s11Db: number;
    vswr: number;
    mismatchLossDb: number;
  };
  performance: {
    directivityDbi: number;
    gainMaxDbi: number;
    realizedGainMaxDbi: number;
    efficiency: number;
    polarization: string;
  };
  pattern2D: { cut: string; points: Pattern2DPoint[] };
  pattern3D?: {
    type: string;
    vertices: Pattern3DVertex[];
    thetaSamples: number;
    phiSamples: number;
  } | null;
  exportSionna: any;
  warnings?: string[];
};

const fmt = (n: unknown, d = 3) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(d) : "-";
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

    const thetaValues = Array.from(new Set(vertices.map((v) => v.thetaDeg))).sort((a, b) => a - b);
    const phiValues = Array.from(new Set(vertices.map((v) => v.phiDeg))).sort((a, b) => a - b);
    const thetaN = thetaValues.length;
    const phiN = phiValues.length;

    if (thetaN < 2 || phiN < 2) return null;

    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    vertices.forEach((v) => {
      positions.push(v.x * 1.2, v.z * 1.2, v.y * 1.2);
      const t = Math.max(0, Math.min(1, v.powerNorm ?? 0));
      color.setHSL(0.66 - 0.66 * t, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    });

    const indices: number[] = [];
    for (let i = 0; i < thetaN - 1; i++) {
      for (let j = 0; j < phiN - 1; j++) {
        const a = i * phiN + j;
        const b = (i + 1) * phiN + j;
        const c = (i + 1) * phiN + (j + 1);
        const d = i * phiN + (j + 1);
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
      <meshStandardMaterial vertexColors transparent opacity={0.78} side={THREE.DoubleSide} roughness={0.45} metalness={0.05} />
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

export default function AntennaLabPage() {
  const [frequencyGhz, setFrequencyGhz] = useState(2.45);
  const [lengthLambda, setLengthLambda] = useState(0.5);
  const [radiusLambda, setRadiusLambda] = useState(0.001);
  const [feedImpedanceOhm, setFeedImpedanceOhm] = useState(50);
  const [efficiency, setEfficiency] = useState(0.95);
  const [thetaSamples, setThetaSamples] = useState(361);
  const [phiSamples, setPhiSamples] = useState(181);
  const [includePattern3D, setIncludePattern3D] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DipoleResult | null>(null);
  const [error, setError] = useState("");

  const calcularDipolo = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        frequencyHz: frequencyGhz * 1e9,
        lengthLambda,
        radiusLambda,
        feedImpedanceOhm,
        efficiency,
        thetaSamples,
        phiSamples,
        includePattern3D,
      };

      const res = await fetch(`${API_URL}/antenna/dipole/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Antenna Lab result:", data);

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

  const pattern2DData =
    result?.pattern2D?.points?.map((p) => ({
      theta: Number(p.thetaDeg.toFixed(1)),
      gainRelDb: Number(p.gainRelDb.toFixed(2)),
      powerNorm: Number(p.powerNorm.toFixed(4)),
    })) ?? [];

  const polarData =
    result?.pattern2D?.points
      ?.filter((_, i) => i % 6 === 0)
      ?.map((p) => ({
        theta: `${Math.round(p.thetaDeg)}°`,
        value: Math.max(0, p.powerNorm),
      })) ?? [];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-zinc-950 to-black px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-400">Mastesto RF Engine</p>
          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight md:text-6xl">Antenna Lab</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">
            Dipolo parametrizable por xλ, S11, VSWR, ganancia, directividad, diagrama 2D/3D y exportación preparada para Sionna.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
          <h2 className="text-lg font-black uppercase tracking-[0.18em]">Geometría del dipolo</h2>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Frecuencia GHz</span>
              <input type="number" step="0.01" value={frequencyGhz} onChange={(e) => setFrequencyGhz(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Longitud L = xλ</span>
              <input type="number" step="0.01" value={lengthLambda} onChange={(e) => setLengthLambda(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              <input type="range" min="0.05" max="3" step="0.01" value={lengthLambda} onChange={(e) => setLengthLambda(Number(e.target.value))}
                className="mt-3 w-full" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Radio conductor en λ</span>
              <input type="number" step="0.0001" value={radiusLambda} onChange={(e) => setRadiusLambda(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Impedancia referencia Ω</span>
              <input type="number" step="1" value={feedImpedanceOhm} onChange={(e) => setFeedImpedanceOhm(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Eficiencia</span>
              <input type="number" step="0.01" value={efficiency} onChange={(e) => setEfficiency(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">θ samples</span>
                <input type="number" value={thetaSamples} onChange={(e) => setThetaSamples(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">φ samples</span>
                <input type="number" value={phiSamples} onChange={(e) => setPhiSamples(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500" />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
              <input type="checkbox" checked={includePattern3D} onChange={(e) => setIncludePattern3D(e.target.checked)} />
              <span className="text-sm text-zinc-300">Calcular patrón 3D</span>
            </label>

            <button onClick={calcularDipolo} disabled={loading}
              className="w-full rounded-2xl bg-orange-500 px-5 py-4 font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Calculando..." : "Calcular dipolo"}
            </button>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          </div>
        </aside>

        <section className="space-y-6">
          {!result && (
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-8 text-zinc-400">
              Calcula un dipolo para ver resultados, patrón 2D, patrón 3D y exportación preparada para Sionna.
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="λ" value={fmt(result.lambdaM, 4)} unit="m" />
                <StatCard label="Longitud" value={fmt(result.geometry.lengthM, 4)} unit="m" />
                <StatCard label="S11" value={fmt(result.sParameters.s11Db, 2)} unit="dB" />
                <StatCard label="VSWR" value={fmt(result.sParameters.vswr, 2)} />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Zin real" value={fmt(result.impedance.inputResistanceOhm, 2)} unit="Ω" />
                <StatCard label="Zin imag" value={fmt(result.impedance.inputReactanceOhm, 2)} unit="Ω" />
                <StatCard label="Directividad" value={fmt(result.performance.directivityDbi, 2)} unit="dBi" />
                <StatCard label="Ganancia realizada" value={fmt(result.performance.realizedGainMaxDbi, 2)} unit="dBi" />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Diagrama de radiación 3D</h3>
                  <div className="mt-4 h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <Canvas camera={{ position: [2.2, 1.8, 2.2], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[3, 5, 4]} intensity={1.2} />
                      <Grid args={[4, 4]} cellSize={0.25} sectionSize={1} />
                      <Dipole3D lengthM={result.geometry.lengthM} radiusM={result.geometry.radiusM} />
                      {result.pattern3D?.vertices?.length ? <RadiationPattern3D vertices={result.pattern3D.vertices} /> : null}
                      <OrbitControls makeDefault />
                    </Canvas>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Patrón 2D · E-plane</h3>
                  <div className="mt-4 h-[250px] rounded-2xl border border-white/10 bg-black p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pattern2DData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="theta" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" domain={[-60, 0]} />
                        <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "white" }} />
                        <Line type="monotone" dataKey="gainRelDb" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <h3 className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Polar normalizado</h3>
                  <div className="mt-4 h-[250px] rounded-2xl border border-white/10 bg-black p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={polarData}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="theta" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                        <PolarRadiusAxis tick={{ fill: "#71717a", fontSize: 10 }} />
                        <Radar dataKey="value" fillOpacity={0.35} />
                        <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "white" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
