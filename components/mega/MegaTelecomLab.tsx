"use client";

import { useEffect, useMemo, useState } from "react";
import { megaGet, megaPost } from "@/lib/megaApi";

type Tab =
  | "global"
  | "rf"
  | "sionna"
  | "optical"
  | "dsp"
  | "electronics"
  | "energy"
  | "iot"
  | "report";

export default function MegaTelecomLab() {
  const [tab, setTab] = useState<Tab>("global");
  const [status, setStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    megaGet("/telecom/v100000/status")
      .then(setStatus)
      .catch((e) => setStatus({ ok: false, error: e.message }));
  }, []);

  const scenario = useMemo(
    () => ({
      rf: {
        antennaType: "dipole",
        frecuenciaGHz: 2.45,
        geometry: { lengthLambda: 0.48, radiusLambda: 0.002, nSegments: 61 },
        numRays: 20000,
      },
      sionna: {
        frecuenciaGHz: 2.45,
        forceFallback: true,
        tx: [{ id: "tx1", x: -2, y: 1.2, z: 0, powerDbm: 20 }],
        rx: [{ id: "rx1", x: 3, y: 1.2, z: 0 }],
        objects: [{ id: "wall1", type: "box", x: 1, y: 1.3, z: 0, sx: 0.2, sy: 2.7, sz: 6 }],
      },
      optical: {
        wavelengthNm: 1550,
        lengthKm: 10,
        txPowerDbm: 0,
        rxSensitivityDbm: -20,
        fiberType: "G652D",
        bitrateGbps: 10,
        connectors: 2,
        splices: 4,
        marginDb: 3,
      },
      dsp: { signal: { kind: "sine", frequencyHz: 1000, fs: 16000, durationS: 0.25, noiseStd: 0.01 } },
      electronics: {
        divider: { vinV: 5, r1Ohm: 10000, r2Ohm: 10000 },
        rc: { rOhm: 1000, cF: 1e-6, frequencyHz: 1000 },
        thermal: { powerW: 2, thetaJaCPerW: 45, ambientC: 30 },
      },
      energy: {
        pv: { areaM2: 30, irradianceWm2: 850 },
        battery: { capacityKWh: 12, soc: 0.6, loadKW: 2 },
        hvac: { areaM2: 120, loadWm2: 90, cop: 3.2 },
        grid: { pvKW: 5, loadKW: 4, batteryKW: 1 },
      },
      iot: {
        network: { devices: 30, packets: 1000, lossRate: 0.015, latencyMs: 28 },
        twin: { peopleMovement: { people: 4, steps: 80 } },
      },
    }),
    []
  );

  async function runUltimate() {
    setLoading(true);
    try {
      const data = await megaPost("/telecom/v100000/scenario/ultimate", scenario);
      setResult(data);
      const rep = await megaPost("/telecom/v100000/report/ai", {
        scenario,
        validation: data,
      });
      setReport(rep);
    } finally {
      setLoading(false);
    }
  }

  const tabs: [Tab, string][] = [
    ["global", "Global 3D"],
    ["rf", "RF"],
    ["sionna", "Sionna"],
    ["optical", "Óptica"],
    ["dsp", "DSP"],
    ["electronics", "Electrónica"],
    ["energy", "Energía"],
    ["iot", "IoT"],
    ["report", "Informe IA"],
  ];

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">
            Mastesto Ultimate Engineering Lab
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase italic md:text-6xl">
            Telecom Platform v100000
          </h1>
          <p className="mt-4 max-w-4xl text-zinc-400">
            Simulación integrada 3D de RF, Sionna, óptica, DSP, electrónica,
            energía e IoT con informe técnico generado por IA.
          </p>
          <div className="mt-4 text-xs text-zinc-500">
            Backend: {status?.ok ? "ONLINE" : "REVISAR"}
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest ${
                tab === id ? "border-orange-400 bg-orange-500 text-black" : "border-zinc-800 bg-zinc-950 text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Mega3DScene active={tab} />
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-2xl font-black uppercase italic">Control</h2>
            <button
              onClick={runUltimate}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-orange-500 px-5 py-4 font-black uppercase text-black"
            >
              {loading ? "Simulando..." : "Ejecutar simulación global"}
            </button>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              {["RF", "Sionna", "Óptica", "DSP", "Electrónica", "Energía", "IoT", "IA"].map((x) => (
                <div key={x} className="rounded-xl border border-zinc-800 bg-black p-3">
                  <p className="font-black uppercase text-zinc-500">{x}</p>
                  <p className="mt-1 text-green-400">READY</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-2xl font-black uppercase italic">
            {tab === "report" ? "Informe IA" : "Resultados"}
          </h2>
          {tab === "report" && report?.markdown ? (
            <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
              {report.markdown}
            </pre>
          ) : (
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
              {JSON.stringify(result || status || { info: "Ejecuta la simulación global." }, null, 2)}
            </pre>
          )}
        </section>
      </section>
    </main>
  );
}

function Mega3DScene({ active }: { active: Tab }) {
  const layers = [
    { id: "building", label: "Edificio", className: "left-[18%] top-[45%] h-40 w-72 border-zinc-600" },
    { id: "rf", label: "Patrón RF 3D", className: "left-[25%] top-[30%] h-28 w-28 rounded-full border-orange-400" },
    { id: "sionna", label: "Rayos", className: "left-[38%] top-[42%] h-1 w-64 border-sky-400" },
    { id: "optical", label: "Fibra", className: "left-[10%] top-[78%] h-1 w-[70%] border-emerald-400" },
    { id: "iot", label: "Personas/IoT", className: "left-[55%] top-[48%] h-16 w-32 border-purple-400" },
    { id: "electronics", label: "PCB", className: "left-[68%] top-[25%] h-24 w-36 border-yellow-400" },
    { id: "energy", label: "Solar/Batería", className: "left-[62%] top-[72%] h-24 w-44 border-lime-400" },
    { id: "dsp", label: "Señal DSP", className: "left-[15%] top-[20%] h-16 w-48 border-pink-400" },
  ];

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_center,#18181b,#020202)] p-5">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
          Simulación 3D conceptual
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase italic">
          Gemelo digital conectado
        </h2>
      </div>

      {layers.map((l) => (
        <div
          key={l.id}
          className={`absolute z-20 flex items-center justify-center border-2 bg-black/50 text-[10px] font-black uppercase tracking-widest ${
            active === l.id || active === "global" || (active === "report" && l.id === "building")
              ? "opacity-100 shadow-[0_0_35px_rgba(249,115,22,0.35)]"
              : "opacity-35"
          } ${l.className}`}
        >
          {l.label}
        </div>
      ))}

      <div className="absolute bottom-5 left-5 right-5 z-20 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
        <span>RF ↔ Sionna</span>
        <span>Sionna ↔ IoT</span>
        <span>Óptica ↔ Backhaul</span>
        <span>Energía ↔ Electrónica</span>
      </div>
    </div>
  );
}
