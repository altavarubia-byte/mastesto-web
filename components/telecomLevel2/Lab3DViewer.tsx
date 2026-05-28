"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Grid, Line, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

function safeNumber(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function Box({ pos, scale, color = "#f97316", opacity = 0.75 }: { pos: [number, number, number]; scale: [number, number, number]; color?: string; opacity?: number }) {
  return (
    <mesh position={pos} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.42} metalness={0.12} />
    </mesh>
  );
}

function Sphere({ pos, r = 0.18, color = "#38bdf8", opacity = 1 }: { pos: [number, number, number]; r?: number; color?: string; opacity?: number }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.35} metalness={0.18} />
    </mesh>
  );
}

function Label({ text, pos, size = 0.18, color = "#ffffff" }: { text: string; pos: [number, number, number]; size?: number; color?: string }) {
  return (
    <Text position={pos} fontSize={size} color={color} anchorX="center" anchorY="middle">
      {text}
    </Text>
  );
}

function Ray({ points, color = "#f97316", opacity = 0.75 }: { points: [number, number, number][]; color?: string; opacity?: number }) {
  return <Line points={points} color={color} lineWidth={2} transparent opacity={opacity} />;
}

function Helix({ turns = 12, radius = 0.8, pitch = 0.18, color = "#f97316" }: { turns?: number; radius?: number; pitch?: number; color?: string }) {
  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    const n = Math.max(80, Math.min(900, Math.round(turns * 45)));
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * turns * Math.PI * 2;
      p.push(new THREE.Vector3(Math.cos(t) * radius, (i / n - 0.5) * turns * pitch, Math.sin(t) * radius));
    }
    return p;
  }, [turns, radius, pitch]);
  return <Line points={pts} color={color} lineWidth={4} />;
}

function PatternShell({ gain = 8, color = "#38bdf8" }: { gain?: number; color?: string }) {
  const scale = Math.max(0.8, Math.min(3.8, 0.65 + gain / 8));
  return (
    <mesh scale={[scale * 0.9, scale * 1.15, scale * 0.9]} rotation={[Math.PI / 2, 0, 0]}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial color={color} transparent opacity={0.16} wireframe roughness={0.5} />
    </mesh>
  );
}

function OpticalScene({ payload, result }: any) {
  const km = safeNumber(payload?.lengthKm, 10);
  const channels = safeNumber(payload?.wdmChannels, 1);
  const margin = safeNumber(result?.marginDb, 6);
  const nodes = [
    [-4, 0, 0],
    [-2.2, 0, 0.8],
    [-0.5, 0, -0.6],
    [1.5, 0, 0.7],
    [4, 0, 0],
  ] as [number, number, number][];
  return (
    <group>
      <Label text="OPTICAL LAB" pos={[0, 2.4, 0]} color="#38bdf8" />
      {nodes.map((p, i) => <Sphere key={i} pos={p} r={0.22 + i * 0.015} color={i === 0 ? "#22c55e" : i === nodes.length - 1 ? "#ef4444" : "#38bdf8"} />)}
      {nodes.slice(0, -1).map((p, i) => <Ray key={i} points={[p, nodes[i + 1]]} color={margin > 3 ? "#22c55e" : "#ef4444"} />)}
      {Array.from({ length: Math.min(12, Math.max(1, channels)) }).map((_, i) => (
        <Ray key={`ch-${i}`} points={[[-4, 0.05 + i * 0.025, 0.18], [4, 0.05 + i * 0.025, 0.18]]} color={["#38bdf8", "#f97316", "#a855f7", "#22c55e"][i % 4]} opacity={0.35} />
      ))}
      <Label text={`${km} km · margin ${margin.toFixed(1)} dB`} pos={[0, -0.55, 0]} size={0.16} color="#a1a1aa" />
      <Box pos={[-2.2, -0.35, 0.8]} scale={[0.5, 0.15, 0.5]} color="#a855f7" opacity={0.8} />
      <Label text="EDFA/SPLITTER" pos={[-2.2, -0.75, 0.8]} size={0.12} color="#d8b4fe" />
    </group>
  );
}

function RFScene({ payload, result }: any) {
  const turns = safeNumber(payload?.geometry?.turns, safeNumber(payload?.rf?.geometry?.turns, 12));
  const gain = safeNumber(result?.antenna?.gainDbi, safeNumber(result?.metrics?.gainDbi, 8));
  const freq = safeNumber(payload?.frequencyGHz, safeNumber(payload?.rf?.frequencyGHz, 2.45));
  return (
    <group>
      <Label text="RF / HELIX LAB" pos={[0, 2.6, 0]} color="#f97316" />
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.06, 72]} />
        <meshStandardMaterial color="#71717a" metalness={0.7} roughness={0.25} />
      </mesh>
      <group rotation={[0, 0, Math.PI / 2]}>
        <Helix turns={Math.max(3, Math.min(30, turns))} radius={0.55} pitch={0.085} />
      </group>
      <PatternShell gain={gain} />
      <Ray points={[[0, 0, 0], [0, 2.0, 0]]} color="#22c55e" />
      <Label text={`${turns} turns · ${freq} GHz · ${gain.toFixed(1)} dBi`} pos={[0, -1.75, 0]} size={0.16} color="#a1a1aa" />
    </group>
  );
}

function AnechoicScene({ payload, result }: any) {
  const farOk = result?.quality?.farFieldConditionOk;
  const dist = safeNumber(payload?.chamber?.measurementDistanceM, 3);
  const gain = safeNumber(result?.metrics?.gainDbi, 8);
  return (
    <group>
      <Label text="ANECHOIC CHAMBER" pos={[0, 2.85, 0]} color="#f97316" />
      <Box pos={[0, 0, 0]} scale={[6, 2.6, 4]} color="#111827" opacity={0.18} />
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`abs-l-${i}`} position={[-3.05, -0.7 + (i % 5) * 0.35, -1.8 + Math.floor(i / 5) * 1.3]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.55, 4]} />
          <meshStandardMaterial color="#27272a" roughness={0.75} />
        </mesh>
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`abs-r-${i}`} position={[3.05, -0.7 + (i % 5) * 0.35, -1.8 + Math.floor(i / 5) * 1.3]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.55, 4]} />
          <meshStandardMaterial color="#27272a" roughness={0.75} />
        </mesh>
      ))}
      <group position={[-1.2, -0.65, 0]}>
        <Helix turns={12} radius={0.35} pitch={0.065} />
        <PatternShell gain={gain} color="#f97316" />
      </group>
      <Sphere pos={[1.8, -0.35, 0]} r={0.22} color="#38bdf8" />
      <Ray points={[[-1.2, -0.35, 0], [1.8, -0.35, 0]]} color={farOk ? "#22c55e" : "#ef4444"} />
      <Label text={`${dist} m · far-field ${farOk ? "OK" : "CHECK"}`} pos={[0.25, -1.55, 0]} size={0.16} color={farOk ? "#86efac" : "#fca5a5"} />
    </group>
  );
}

function SionnaScene({ payload, result }: any) {
  const rooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
  const rx = Array.isArray(payload?.rx) ? payload.rx : [];
  const temp = safeNumber(payload?.thermalTempK, 700);
  const snr = safeNumber(result?.snrDb, 12);
  return (
    <group>
      <Label text="SIONNA / CHANNEL LAB" pos={[0, 3, 0]} color="#38bdf8" />
      {(rooms.length ? rooms : [{ x: 0, z: 0, width: 6, length: 4, height: 2.8 }]).map((r: any, i: number) => (
        <Box key={i} pos={[safeNumber(r.x, 0) / 3, 0, safeNumber(r.z, 0) / 3]} scale={[safeNumber(r.width, 5) / 3, 0.08, safeNumber(r.length, 4) / 3]} color={i % 2 ? "#334155" : "#1f2937"} opacity={0.6} />
      ))}
      <Sphere pos={[-2.2, 0.4, 0]} color="#f97316" r={0.24} />
      <Label text="TX" pos={[-2.2, 0.8, 0]} size={0.16} color="#f97316" />
      {(rx.length ? rx : [{ x: 3, y: 1.2, z: 1 }]).map((r: any, i: number) => {
        const p: [number, number, number] = [safeNumber(r.x, 3) / 3, 0.35, safeNumber(r.z, 1) / 3];
        return (
          <group key={i}>
            <Sphere pos={p} color="#22c55e" r={0.18} />
            <Ray points={[[-2.2, 0.4, 0], [p[0] * 0.3, 1.0, p[2] * 0.4], p]} color={snr > 10 ? "#22c55e" : "#ef4444"} opacity={0.55} />
          </group>
        );
      })}
      <mesh position={[0.2, 0.7, 0.2]}>
        <cylinderGeometry args={[0.42, 0.62, 1.8, 32]} />
        <meshStandardMaterial color={temp > 700 ? "#ef4444" : "#f97316"} transparent opacity={0.22} />
      </mesh>
      <Label text={`${temp} K · SNR ${snr.toFixed(1)} dB`} pos={[0, -1.45, 0]} size={0.16} color="#a1a1aa" />
    </group>
  );
}

function ElectronicsScene({ payload, result }: any) {
  const blocks = ["ANT", "LNA", "MIX", "IF", "ADC", "FPGA"];
  const adc = safeNumber(payload?.adcBits, safeNumber(result?.adcBits, 12));
  return (
    <group>
      <Label text="ELECTRONICS LAB" pos={[0, 2.35, 0]} color="#a855f7" />
      {blocks.map((b, i) => (
        <group key={b} position={[-3 + i * 1.2, 0, 0]}>
          <Box pos={[0, 0, 0]} scale={[0.78, 0.5, 0.7]} color={i === 1 ? "#22c55e" : i === 4 ? "#38bdf8" : "#a855f7"} opacity={0.8} />
          <Label text={b} pos={[0, 0.55, 0]} size={0.14} />
          {i < blocks.length - 1 && <Ray points={[[0.45, 0, 0], [0.78, 0.18, 0], [1.05, 0, 0]]} color="#f97316" />}
        </group>
      ))}
      <Label text={`ADC ${adc} bit · DR ${safeNumber(result?.adcDynamicRangeDb, 74).toFixed(1)} dB`} pos={[0, -1.1, 0]} size={0.16} color="#a1a1aa" />
    </group>
  );
}

function DSPScene({ payload, result }: any) {
  const blocks = ["IQ", "FFT", "EQ", "DEMOD", "BER"];
  const ber = safeNumber(result?.ber, 1e-5);
  const evm = safeNumber(result?.evmPct, 4);
  return (
    <group>
      <Label text="DSP LAB" pos={[0, 2.4, 0]} color="#22c55e" />
      {blocks.map((b, i) => (
        <group key={b} position={[-2.8 + i * 1.4, 0.35 * Math.sin(i), 0]}>
          <Box pos={[0, 0, 0]} scale={[0.9, 0.45, 0.6]} color="#16a34a" opacity={0.75} />
          <Label text={b} pos={[0, 0.55, 0]} size={0.14} />
          {i < blocks.length - 1 && <Ray points={[[0.5, 0, 0], [0.9, 0.35, 0], [1.25, 0, 0]]} color="#38bdf8" />}
        </group>
      ))}
      <group position={[2.4, -1.1, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const x = (i % 4 - 1.5) * 0.18 + (Math.random() - 0.5) * 0.015;
          const y = (Math.floor(i / 4) - 1.5) * 0.18 + (Math.random() - 0.5) * 0.015;
          return <Sphere key={i} pos={[x, y, 0]} r={0.035} color="#f97316" />;
        })}
      </group>
      <Label text={`BER ${ber.toExponential(2)} · EVM ${evm.toFixed(1)}%`} pos={[0, -1.2, 0]} size={0.16} color="#a1a1aa" />
    </group>
  );
}

function EnergyScene({ payload, result }: any) {
  const battery = safeNumber(payload?.batteryCapacityWh, 200);
  const hours = safeNumber(result?.batteryHours, 12);
  return (
    <group>
      <Label text="ENERGY LAB" pos={[0, 2.35, 0]} color="#facc15" />
      <group position={[-2.3, 0.25, 0]} rotation={[0, 0, -0.35]}>
        {Array.from({ length: 6 }).map((_, i) => <Box key={i} pos={[(i % 3) * 0.45, Math.floor(i / 3) * 0.35, 0]} scale={[0.38, 0.26, 0.04]} color="#38bdf8" opacity={0.85} />)}
        <Label text="PV" pos={[0.45, -0.45, 0]} size={0.16} />
      </group>
      <Box pos={[0.4, 0, 0]} scale={[0.85, 1.15, 0.65]} color={hours > 8 ? "#22c55e" : "#ef4444"} opacity={0.8} />
      <Label text="BAT" pos={[0.4, 0.85, 0]} size={0.16} />
      <Box pos={[2.2, 0, 0]} scale={[0.75, 0.55, 0.75]} color="#f97316" opacity={0.75} />
      <Label text="LOAD" pos={[2.2, 0.62, 0]} size={0.16} />
      <Ray points={[[-1.25, 0.1, 0], [-0.1, 0.35, 0], [0.35, 0.15, 0]]} color="#facc15" />
      <Ray points={[[0.9, 0, 0], [1.5, 0.25, 0], [2.0, 0, 0]]} color="#22c55e" />
      <Label text={`${battery} Wh · ${hours.toFixed(1)} h`} pos={[0, -1.2, 0]} size={0.16} color="#a1a1aa" />
    </group>
  );
}

function PipelineScene({ payload, result }: any) {
  const nodes = ["OPT", "RF", "CAM", "SIO", "ELEC", "DSP", "ENE"];
  const ok = result?.final?.systemOk;
  return (
    <group>
      <Label text="GLOBAL PIPELINE" pos={[0, 2.45, 0]} color="#f97316" />
      {nodes.map((n, i) => (
        <group key={n} position={[-4.2 + i * 1.4, Math.sin(i) * 0.25, 0]}>
          <Sphere pos={[0, 0, 0]} r={0.28} color={ok === false ? "#ef4444" : "#22c55e"} opacity={0.95} />
          <Label text={n} pos={[0, 0.55, 0]} size={0.14} />
          {i < nodes.length - 1 && <Ray points={[[0.35, 0, 0], [0.9, 0.35, 0], [1.2, 0, 0]]} color="#f97316" />}
        </group>
      ))}
      <Label text={ok === false ? "RISKS DETECTED" : ok === true ? "LEVEL 2 OK" : "READY"} pos={[0, -1.1, 0]} size={0.18} color={ok === false ? "#fca5a5" : "#86efac"} />
    </group>
  );
}

function SceneContent({ moduleKey, payload, result }: { moduleKey: string; payload: any; result: any }) {
  if (moduleKey === "optical") return <OpticalScene payload={payload} result={result} />;
  if (moduleKey === "rf") return <RFScene payload={payload} result={result} />;
  if (moduleKey === "anechoic") return <AnechoicScene payload={payload} result={result} />;
  if (moduleKey === "sionna") return <SionnaScene payload={payload} result={result} />;
  if (moduleKey === "electronics") return <ElectronicsScene payload={payload} result={result} />;
  if (moduleKey === "dsp") return <DSPScene payload={payload} result={result} />;
  if (moduleKey === "energy") return <EnergyScene payload={payload} result={result} />;
  if (moduleKey === "pipeline" || moduleKey === "ai") return <PipelineScene payload={payload} result={result} />;
  return <RFScene payload={payload} result={result} />;
}

export function Lab3DViewer({ moduleKey, payload, result }: { moduleKey: string; payload: any; result: any }) {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/70 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <h2 className="text-lg font-black uppercase italic">Visor 3D del laboratorio</h2>
          <p className="text-xs text-zinc-500">Interactivo: gira, zoom y panea. Se alimenta del payload y resultados del simulador.</p>
        </div>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-300">3D Live</span>
      </div>
      <div className="h-[430px]">
        <Canvas camera={{ position: [4.5, 3.2, 6.5], fov: 48 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.65} />
            <directionalLight position={[5, 6, 4]} intensity={1.3} />
            <pointLight position={[-4, 3, -2]} intensity={0.65} color="#f97316" />
            <Stars radius={30} depth={8} count={800} factor={2} fade speed={0.4} />
            <Grid args={[12, 12]} cellColor="#27272a" sectionColor="#52525b" position={[0, -1.75, 0]} />
            <SceneContent moduleKey={moduleKey} payload={payload} result={result} />
            <OrbitControls enableDamping makeDefault />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
