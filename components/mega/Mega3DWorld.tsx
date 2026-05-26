"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Grid } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Mega3DWorld({ active, live, running }: { active: string; live: any; running: boolean }) {
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl bg-black">
      <Canvas camera={{ position: [8, 7, 9], fov: 48 }}>
        <color attach="background" args={["#020202"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1} />
        <Building active={active} />
        <RFPattern active={active} live={live} running={running} />
        <SionnaRays active={active} live={live} running={running} />
        <Fiber active={active} live={live} running={running} />
        <People active={active} live={live} running={running} />
        <IoTDevices active={active} />
        <Electronics active={active} live={live} />
        <Energy active={active} live={live} />
        <DSPWave active={active} live={live} running={running} />
        <TransmissionLines active={active} live={live} />
        <Text position={[0, 4.2, -4]} fontSize={0.35} color="#f97316" anchorX="center">
          Telecom Platform v500000000
        </Text>
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

function show(active: string, id: string) {
  return active === "global" || active === id || active === "report";
}

function Building({ active }: { active: string }) {
  const opacity = show(active, "sionna") ? 0.45 : 0.18;
  return (
    <group>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[7, 2.8, 5]} />
        <meshStandardMaterial color="#3f3f46" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[1.2, 1.4, 0]}>
        <boxGeometry args={[0.12, 2.8, 5]} />
        <meshStandardMaterial color="#71717a" transparent opacity={0.45} />
      </mesh>
      <Text position={[0, 3.1, 2.7]} fontSize={0.22} color="#a1a1aa">Edificio / escena Sionna</Text>
    </group>
  );
}

function RFPattern({ active, live, running }: any) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (running && ref.current) ref.current.rotation.y += delta * 0.25;
  });
  const r = live?.scene?.rfPattern?.radius || 2.4;
  return (
    <mesh ref={ref} position={[-2, 1.4, 0]} visible={show(active, "rf")}>
      <sphereGeometry args={[r, 48, 24]} />
      <meshStandardMaterial color="#f97316" transparent opacity={0.22} wireframe />
    </mesh>
  );
}

function SionnaRays({ active, live, running }: any) {
  const rays = live?.scene?.rays || [];
  const time = live?.timeS || 0;
  return (
    <group visible={show(active, "sionna")}>
      {rays.slice(0, 20).map((r: any, i: number) => {
        const end = r.to || [0, 1, 0];
        const mid: [number, number, number] = [end[0] * (0.6 + 0.4 * Math.sin(time + i)), end[1], end[2] * (0.6 + 0.4 * Math.sin(time + i))];
        return <Line key={r.id || i} points={[[0, 1.2, 0], mid, end]} color="#38bdf8" lineWidth={1.2} transparent opacity={0.75} />;
      })}
    </group>
  );
}

function Fiber({ active, live, running }: any) {
  const points = live?.scene?.fiber?.points || [[-5, 0.1, -3], [-2, 0.1, -3], [1, 0.1, -2], [5, 0.1, -3]];
  return (
    <group visible={show(active, "optical")}>
      <Line points={points} color="#10b981" lineWidth={4} />
      <Text position={[0, 0.35, -3.4]} fontSize={0.18} color="#10b981">Fibra óptica / backhaul</Text>
    </group>
  );
}

function People({ active, live, running }: any) {
  const people = live?.scene?.people || [];
  return (
    <group visible={show(active, "iot") || show(active, "sionna")}>
      {people.map((p: any, i: number) => {
        const pos = p.pos || [i, 0, 0];
        return (
          <group key={p.id || i} position={pos}>
            <mesh position={[0, 0.85, 0]}>
              <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
              <meshStandardMaterial color="#a855f7" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function IoTDevices({ active }: { active: string }) {
  const pts = [[-2, 1.4, 2], [2, 1.4, 2], [3, 1.4, -1], [-3, 1.4, -1]];
  return (
    <group visible={show(active, "iot")}>
      {pts.map((p, i) => (
        <mesh key={i} position={p as any}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color="#c084fc" emissive="#581c87" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Electronics({ active, live }: any) {
  return (
    <group visible={show(active, "electronics")} position={[4.4, 0.15, 1.8]}>
      <mesh>
        <boxGeometry args={[1.6, 0.08, 1.0]} />
        <meshStandardMaterial color="#14532d" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.55 + i * 0.35, 0.12, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      ))}
      <Text position={[0, 0.45, 0]} fontSize={0.16} color="#eab308">PCB {Math.round(live?.scene?.electronics?.pcbTempC || 42)}°C</Text>
    </group>
  );
}

function Energy({ active, live }: any) {
  return (
    <group visible={show(active, "energy")} position={[3.4, 0.05, -2.2]}>
      <mesh rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[2.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#84cc16" emissive="#365314" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.6, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.5]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Text position={[0, 0.7, 0]} fontSize={0.16} color="#bef264">PV/Batería</Text>
    </group>
  );
}

function DSPWave({ active, live, running }: any) {
  const wave = live?.scene?.dsp?.wave || [];
  const points = wave.map((p: any) => [p.x * 2 - 2, 3.4 + p.y * 0.25, -2.8]);
  return (
    <group visible={show(active, "dsp")}>
      <Line points={points.length ? points : [[-2, 3.4, -2.8], [2, 3.4, -2.8]]} color="#ec4899" lineWidth={2} />
      <Text position={[0, 3.8, -2.8]} fontSize={0.18} color="#f9a8d4">DSP waveform</Text>
    </group>
  );
}

function TransmissionLines({ active, live }: any) {
  return (
    <group visible={show(active, "transmissionLines")} position={[4.4, 0.32, 1.8]}>
      <Line points={[[-0.7, 0, -0.35], [-0.2, 0, 0.2], [0.4, 0, -0.1], [0.7, 0, 0.35]]} color="#facc15" lineWidth={3} />
      <Text position={[0, 0.35, 0.65]} fontSize={0.14} color="#fde047">Microstrip / TL</Text>
    </group>
  );
}
