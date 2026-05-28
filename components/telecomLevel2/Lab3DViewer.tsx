"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Grid, Line, Stars } from "@react-three/drei";
import { Suspense } from "react";

function n(v: any, d = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
}

function colorMaterial(material: string) {
  const m = String(material || "").toLowerCase();
  if (m.includes("metal")) return "#94a3b8";
  if (m.includes("glass")) return "#38bdf8";
  if (m.includes("brick")) return "#b45309";
  if (m.includes("concrete")) return "#71717a";
  if (m.includes("wood")) return "#92400e";
  if (m.includes("drywall")) return "#d6d3d1";
  if (m.includes("human")) return "#22c55e";
  if (m.includes("thermal")) return "#ef4444";
  return "#64748b";
}

function rayColor(type: string) {
  if (type === "los") return "#22c55e";
  if (type === "obstructed_los") return "#f59e0b";
  if (type === "thermal_los" || type === "thermal") return "#ef4444";
  if (type === "reflection") return "#38bdf8";
  return "#f97316";
}

function BoxMesh({ x, y, z, w, h, d, material, opacity = 0.55 }: any) {
  return (
    <mesh position={[n(x), n(y), n(z)]} scale={[n(w,1), n(h,1), n(d,1)]}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color={colorMaterial(material)} transparent opacity={opacity} roughness={0.65} metalness={String(material).includes("metal") ? 0.65 : 0.08} />
    </mesh>
  );
}

function Sphere({ pos, r = 0.18, color = "#38bdf8" }: { pos: [number,number,number]; r?: number; color?: string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r,32,32]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.12} />
    </mesh>
  );
}

function Label({ text, pos, size = 0.18, color = "#ffffff" }: { text: string; pos: [number,number,number]; size?: number; color?: string }) {
  return <Text position={pos} fontSize={size} color={color} anchorX="center" anchorY="middle">{text}</Text>;
}

function Ray({ points, color, opacity = 0.8 }: { points: any[]; color: string; opacity?: number }) {
  return <Line points={points.map((p: any) => [n(p[0]), n(p[1]), n(p[2])])} color={color} lineWidth={2} transparent opacity={opacity} />;
}

function ThermalColumn({ o }: any) {
  return (
    <group>
      <mesh position={[n(o.x), n(o.y), n(o.z)]}>
        <cylinderGeometry args={[n(o.r,0.5), n(o.r,0.7), n(o.h,2.5), 48]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[n(o.x), n(o.y)+0.15, n(o.z)]}>
        <sphereGeometry args={[n(o.r,0.5)*1.05, 32, 32]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.12} wireframe />
      </mesh>
      <Label text={`${Math.round(n(o.temperatureK,850))} K`} pos={[n(o.x), n(o.y)+n(o.h,2.5)/2+0.35, n(o.z)]} size={0.13} color="#fca5a5" />
    </group>
  );
}


function wallsFromRooms(payload: any) {
  const rooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
  const out: any[] = [];

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    const x = n(r.x, 0);
    const z = n(r.z, 0);
    const w = n(r.width ?? r.ancho, 6);
    const d = n(r.length ?? r.largo, 5);
    const h = n(r.height ?? r.alto, 2.8);
    const t = n(r.wallThicknessM ?? payload?.wallThicknessM, 0.2);
    const material = r.material || payload?.defaultWallMaterial || "concrete";
    const roughness = n(r.roughness ?? payload?.roughness, 0.35);

    out.push(
      { id: `room${i+1}_north_payload`, x, y: h/2, z: z-d/2, w, h, d: t, material, thicknessM: t, roughness },
      { id: `room${i+1}_south_payload`, x, y: h/2, z: z+d/2, w, h, d: t, material, thicknessM: t, roughness },
      { id: `room${i+1}_west_payload`, x: x-w/2, y: h/2, z, w: t, h, d, material, thicknessM: t, roughness },
      { id: `room${i+1}_east_payload`, x: x+w/2, y: h/2, z, w: t, h, d, material, thicknessM: t, roughness }
    );
  }

  if (Array.isArray(payload?.walls)) {
    for (const w of payload.walls) {
      out.push({
        id: w.id || `custom_wall_${out.length+1}`,
        x: n(w.x, 0),
        y: n(w.y, 1.4),
        z: n(w.z, 0),
        w: n(w.w ?? w.width, 2),
        h: n(w.h ?? w.height, 2.8),
        d: n(w.d ?? w.depth, 0.2),
        material: w.material || "concrete",
        thicknessM: n(w.thicknessM ?? w.d, 0.2),
        roughness: n(w.roughness, 0.35)
      });
    }
  }

  return out;
}

function txFromPayload(payload: any) {
  const tx = Array.isArray(payload?.tx) ? payload.tx[0] : payload?.tx;
  if (!tx) return { x: -3, y: 1.2, z: 0, id: "tx1" };
  if (Array.isArray(tx.position)) {
    return { x: tx.position[0], y: tx.position[1], z: tx.position[2], id: tx.id || tx.name || "tx1" };
  }
  return tx;
}

function rxFromPayload(payload: any) {
  const rx = payload?.rx || payload?.receivers || [];
  if (!Array.isArray(rx)) return [];
  return rx.map((r: any, i: number) => {
    if (Array.isArray(r.position)) {
      return { x: r.position[0], y: r.position[1], z: r.position[2], id: r.id || r.name || `rx${i+1}` };
    }
    return { ...r, id: r.id || r.name || `rx${i+1}` };
  });
}

function previewRaysFromPayload(payload: any) {
  const tx = txFromPayload(payload);
  const rx = rxFromPayload(payload);

  const rays: any[] = [];

  for (let i = 0; i < rx.length; i++) {
    const r = rx[i];

    rays.push({
      id: `preview_los_${r.id || i}`,
      type: "los",
      points: [
        [n(tx.x), n(tx.y), n(tx.z)],
        [n(r.x), n(r.y), n(r.z)]
      ]
    });

    const bounceZ = i % 2 === 0 ? -n(payload?.floor?.depth, 12)/2 + 0.5 : n(payload?.floor?.depth, 12)/2 - 0.5;
    const midX = (n(tx.x) + n(r.x)) / 2;

    rays.push({
      id: `preview_ref_${r.id || i}`,
      type: "reflection",
      points: [
        [n(tx.x), n(tx.y), n(tx.z)],
        [midX, n(tx.y), bounceZ],
        [n(r.x), n(r.y), n(r.z)]
      ]
    });

    const thermal = (payload?.obstacles || []).find((o: any) => o.type === "thermal_column" || o.kind === "thermal_column");
    if (thermal) {
      rays.push({
        id: `preview_thermal_${r.id || i}`,
        type: "thermal",
        points: [
          [n(tx.x), n(tx.y), n(tx.z)],
          [n(thermal.x), n(tx.y), n(thermal.z)],
          [n(r.x), n(r.y), n(r.z)]
        ]
      });
    }
  }

  return rays;
}

function SionnaScene({ payload, result }: any) {
  const scene = result?.scene;
  const tx = result?.tx || txFromPayload(payload);
  const receivers = result?.receivers || rxFromPayload(payload);
  const rays = Array.isArray(result?.rays) && result.rays.length > 0 ? result.rays : previewRaysFromPayload(payload);
  const floor = scene?.floor || payload?.floor || { width: 16, depth: 12, material: "concrete" };
  const walls = scene?.walls || wallsFromRooms(payload);
  const obstacles = scene?.obstacles || payload?.obstacles || payload?.objects || [];

  const txObj = Array.isArray(tx) ? tx[0] : tx;
  const txPos = Array.isArray(txObj?.position)
    ? { x: txObj.position[0], y: txObj.position[1], z: txObj.position[2] }
    : txObj;

  return (
    <group>
      <Label text="SIONNA GEOMETRIC SCENE" pos={[0, 3.4, 0]} color="#38bdf8" size={0.22} />

      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[n(floor.width,16), n(floor.thicknessM,0.08), n(floor.depth,12)]} />
        <meshStandardMaterial color={colorMaterial(floor.material)} transparent opacity={0.26} roughness={0.8} />
      </mesh>

      {walls.map((w: any) => (
        <group key={w.id}>
          <BoxMesh {...w} opacity={String(w.material).includes("glass") ? 0.25 : 0.42} />
          <Label text={`${w.material} · ${n(w.thicknessM,0.2).toFixed(2)}m`} pos={[n(w.x), n(w.y)+n(w.h,2.8)/2+0.18, n(w.z)]} size={0.09} color="#d4d4d8" />
        </group>
      ))}

      {obstacles.map((o: any) => {
        const kind = o.kind || o.type;
        if (kind === "thermal_column") return <ThermalColumn key={o.id} o={o} />;
        if (kind === "cylinder" || kind === "human") {
          return (
            <mesh key={o.id} position={[n(o.x), n(o.y), n(o.z)]}>
              <cylinderGeometry args={[n(o.r,0.3), n(o.r,0.3), n(o.h,1.6), 32]} />
              <meshStandardMaterial color={colorMaterial(o.material)} transparent opacity={0.75} roughness={0.6} />
            </mesh>
          );
        }
        return (
          <group key={o.id}>
            <BoxMesh x={o.x} y={o.y} z={o.z} w={o.w || o.sx || 1} h={o.h || o.sy || 1} d={o.d || o.sz || 1} material={o.material} opacity={0.62} />
            <Label text={`${o.id}`} pos={[n(o.x), n(o.y)+n(o.h || o.sy || 1)/2+0.18, n(o.z)]} size={0.1} color="#e5e7eb" />
          </group>
        );
      })}

      <Sphere pos={[n(txPos.x), n(txPos.y), n(txPos.z)]} color="#f97316" r={0.25} />
      <Label text="TX" pos={[n(txPos.x), n(txPos.y)+0.45, n(txPos.z)]} color="#fdba74" size={0.16} />

      {receivers.map((r: any, i: number) => {
        const pos = Array.isArray(r.position) ? { x: r.position[0], y: r.position[1], z: r.position[2] } : r;
        return (
          <group key={r.id || r.name || i}>
            <Sphere pos={[n(pos.x), n(pos.y), n(pos.z)]} color="#22c55e" r={0.18} />
            <Label text={r.id || r.name || `rx${i+1}`} pos={[n(pos.x), n(pos.y)+0.38, n(pos.z)]} color="#86efac" size={0.13} />
          </group>
        );
      })}

      {rays.map((r: any) => (
        <group key={r.id}>
          <Ray points={r.points} color={rayColor(r.type)} opacity={r.type === "reflection" ? 0.65 : 0.88} />
          {r.points?.[1] && r.points.length > 2 && <Sphere pos={[n(r.points[1][0]), n(r.points[1][1]), n(r.points[1][2])]} r={0.07} color={rayColor(r.type)} />}
        </group>
      ))}

      <Label text={`walls ${walls.length} · obstacles ${obstacles.length} · rays ${rays.length} · SNR ${n(result?.snrDbAvg,0).toFixed(1)} dB`} pos={[0, -0.55, n(floor.depth,12)/2+0.7]} color="#a1a1aa" size={0.15} />
    </group>
  );
}

function BasicScene({ moduleKey, result }: any) {
  return (
    <group>
      <Label text={`${String(moduleKey).toUpperCase()} LAB`} pos={[0,2.2,0]} color="#f97316" />
      <mesh>
        <sphereGeometry args={[1.0,48,48]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.2} wireframe />
      </mesh>
      <Sphere pos={[-1.2,0,0]} color="#f97316" />
      <Sphere pos={[1.2,0,0]} color="#22c55e" />
      <Ray points={[[-1.2,0,0],[0,0.7,0],[1.2,0,0]]} color="#38bdf8" />
      <Label text={result?.mode || "ready"} pos={[0,-1.2,0]} color="#a1a1aa" size={0.15} />
    </group>
  );
}

export function Lab3DViewer({ moduleKey, payload, result }: { moduleKey: string; payload: any; result: any }) {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/70 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <h2 className="text-lg font-black uppercase italic">Visor 3D del laboratorio</h2>
          <p className="text-xs text-zinc-500">En Sionna muestra piso, paredes, obstáculos y rayos generados por backend.</p>
        </div>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-300">3D Live</span>
      </div>
      <div className="h-[560px]">
        <Canvas camera={{ position: [9, 7, 10], fov: 48 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 4]} intensity={1.35} />
            <pointLight position={[-4, 4, -2]} intensity={0.7} color="#f97316" />
            <Stars radius={40} depth={10} count={700} factor={2} fade speed={0.3} />
            <Grid args={[24,24]} cellColor="#27272a" sectionColor="#52525b" position={[0,-0.12,0]} />
            {moduleKey === "sionna" ? <SionnaScene payload={payload} result={result} /> : <BasicScene moduleKey={moduleKey} result={result} />}
            <OrbitControls enableDamping makeDefault />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
