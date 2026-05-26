"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls, Line, Html, Stars, Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function SceneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black">
      <Canvas camera={{ position: [6, 5, 7], fov: 48 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <Stars radius={50} depth={20} count={900} factor={2} fade speed={0.8} />
        <Grid args={[16, 16]} cellColor="#1f2937" sectionColor="#475569" fadeDistance={25} infiniteGrid />
        {children}
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

export function RFAntennaScene({ payload }: { payload: any }) {
  const turns = Number(payload.geometry?.turns ?? 7);
  const radius = Number(payload.geometry?.helixRadiusMm ?? 21.1) / 25;
  const pitch = Number(payload.geometry?.pitchAngleDeg ?? 13) / 20;
  const points = useMemo(() => {
    return Array.from({ length: 500 }, (_, i) => {
      const t = i / 499 * Math.PI * 2 * turns;
      return new THREE.Vector3(Math.cos(t) * radius, i / 499 * pitch * turns, Math.sin(t) * radius);
    });
  }, [turns, radius, pitch]);
  return (
    <SceneFrame>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[5, 0.08, 5]} />
        <meshStandardMaterial color="#1f4f2e" transparent opacity={0.55} />
      </mesh>
      <Line points={points} color="#f97316" lineWidth={5} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
      </mesh>
      <FieldLobes />
      <AxisLabels />
      <Html position={[0, 3.2, 0]} center>
        <div className="rounded-xl border border-orange-500/40 bg-black/80 px-3 py-2 text-xs font-black text-orange-200">
          {payload.antennaType} · {payload.frecuenciaGHz} GHz
        </div>
      </Html>
    </SceneFrame>
  );
}

function FieldLobes() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <mesh ref={ref} position={[0, 1.1, 0]} scale={[1.4, 0.8, 1.4]}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.22} />
    </mesh>
  );
}

export function Sionna3DScene({ payload }: { payload: any }) {
  const tx = payload.tx?.[0] ?? { x: -2, y: 1.2, z: 0 };
  const rx = payload.rx ?? [];
  return (
    <SceneFrame>
      {(payload.rooms ?? []).map((r:any, i:number) => (
        <Room key={r.id || i} x={Number(r.x ?? i*3)} z={Number(r.z ?? 0)} w={Number(r.width ?? 5)} l={Number(r.length ?? 5)} h={Number(r.height ?? 2.8)} label={r.name ?? `Room ${i+1}`} />
      ))}
      {(payload.objects ?? []).map((o:any, i:number) => o.type === "thermal_column" ? <ThermalColumn key={o.id || i} o={o} temp={payload.thermalTempK} /> : <Obstacle key={o.id || i} o={o} />)}
      <Node label="TX" color="#f97316" p={[Number(tx.x), Number(tx.y), Number(tx.z)]} />
      {rx.map((r:any, i:number) => <Node key={r.id || i} label={`RX${i+1}`} color="#22c55e" p={[Number(r.x), Number(r.y ?? 1.2), Number(r.z)]} />)}
      {rx.map((r:any, i:number) => <AnimatedRay key={i} from={[Number(tx.x), Number(tx.y), Number(tx.z)]} to={[Number(r.x), Number(r.y ?? 1.2), Number(r.z)]} delay={i*0.7} />)}
      <AxisLabels />
    </SceneFrame>
  );
}

function Room({ x, z, w, l, h, label }: { x:number; z:number; w:number; l:number; h:number; label:string }) {
  return (
    <group position={[x, h/2, z]}>
      <mesh>
        <boxGeometry args={[w, h, l]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.08} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, l)]} />
        <lineBasicMaterial color="#38bdf8" />
      </lineSegments>
      <Html position={[0, h/2 + .2, 0]} center>
        <div className="rounded-lg border border-sky-500/30 bg-black/80 px-2 py-1 text-[10px] font-black text-sky-200">{label}</div>
      </Html>
    </group>
  );
}

function Obstacle({ o }: { o:any }) {
  return (
    <mesh position={[Number(o.x), Number(o.y), Number(o.z)]}>
      <boxGeometry args={[Number(o.sx ?? 1), Number(o.sy ?? 1), Number(o.sz ?? 1)]} />
      <meshStandardMaterial color="#94a3b8" transparent opacity={0.45} />
    </mesh>
  );
}

function ThermalColumn({ o, temp }: { o:any; temp:number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.scale.x = 1 + 0.08*Math.sin(Date.now()/350);
      ref.current.scale.z = 1 + 0.08*Math.cos(Date.now()/350);
    }
  });
  return (
    <mesh ref={ref} position={[Number(o.x), Number(o.y), Number(o.z)]}>
      <cylinderGeometry args={[Number(o.sx ?? .7), Number(o.sx ?? .7)*0.7, Number(o.sy ?? 3), 48, 1, true]} />
      <meshStandardMaterial color={Number(temp) > 600 ? "#ef4444" : "#f97316"} transparent opacity={0.25} emissive="#ef4444" emissiveIntensity={0.5} />
    </mesh>
  );
}

function Node({ label, color, p }: { label:string; color:string; p:[number,number,number] }) {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh position={p}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
      </mesh>
      <Html position={[p[0], p[1]+0.35, p[2]]} center>
        <div className="rounded-lg border border-white/20 bg-black/80 px-2 py-1 text-[10px] font-black text-white">{label}</div>
      </Html>
    </Float>
  );
}

function AnimatedRay({ from, to, delay }: { from:[number,number,number]; to:[number,number,number]; delay:number }) {
  const dot = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = (Math.sin(clock.elapsedTime * 1.5 + delay) + 1) / 2;
    if (dot.current) {
      dot.current.position.set(
        from[0] + (to[0]-from[0])*t,
        from[1] + (to[1]-from[1])*t,
        from[2] + (to[2]-from[2])*t
      );
    }
  });
  return (
    <>
      <Line points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]} color="#f97316" lineWidth={2} transparent opacity={0.55} />
      <mesh ref={dot}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.5} />
      </mesh>
    </>
  );
}

export function Mega3DScene({ scenario }: { scenario: any }) {
  return (
    <SceneFrame>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[10, 0.08, 8]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {scenario.sionna && <group position={[-2, 0, 0]}><Room x={0} z={0} w={4} l={3} h={2.2} label="Sionna" /></group>}
      {scenario.rf && <group position={[2.8, 0, -2]}><RFMini /></group>}
      {scenario.optical && <OpticalFiber />}
      {scenario.energy && <mesh position={[2, 0.05, 2.6]}><boxGeometry args={[1.6,.08,1]} /><meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.4}/></mesh>}
      {scenario.iot && Array.from({length: 12}).map((_, i) => <Node key={i} label="" color="#a855f7" p={[-4 + (i%4)*.8, .3, 2 - Math.floor(i/4)*.8]} />)}
      <AxisLabels />
    </SceneFrame>
  );
}

function RFMini() {
  const pts = Array.from({ length: 180 }, (_, i) => {
    const t = i / 179 * Math.PI * 6;
    return new THREE.Vector3(Math.cos(t)*0.7, i/179*1.2, Math.sin(t)*0.7);
  });
  return <Line points={pts} color="#f97316" lineWidth={4} />;
}

function OpticalFiber() {
  const pts = Array.from({length: 100}, (_, i) => {
    const x = -4 + i/99*8;
    return new THREE.Vector3(x, .25, 3 + .2*Math.sin(i/8));
  });
  return <Line points={pts} color="#22c55e" lineWidth={5} />;
}

function AxisLabels() {
  return (
    <>
      <Line points={[new THREE.Vector3(0,0,0), new THREE.Vector3(1.2,0,0)]} color="#ef4444" lineWidth={2} />
      <Line points={[new THREE.Vector3(0,0,0), new THREE.Vector3(0,1.2,0)]} color="#22c55e" lineWidth={2} />
      <Line points={[new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,1.2)]} color="#38bdf8" lineWidth={2} />
    </>
  );
}
