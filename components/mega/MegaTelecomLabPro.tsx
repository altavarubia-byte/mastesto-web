"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { megaGet, megaPost } from "@/lib/megaApi";

const Mega3DWorld = dynamic(() => import("./Mega3DWorld"), { ssr: false });

type ModuleKey =
  | "global"
  | "rf"
  | "sionna"
  | "optical"
  | "dsp"
  | "electronics"
  | "energy"
  | "iot"
  | "transmissionLines"
  | "report";

export default function MegaTelecomLabPro() {
  const [active, setActive] = useState<ModuleKey>("global");
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [prompt, setPrompt] = useState("Diseña un escenario telecom completo con Sionna avanzado, RF, fibra, IoT, energía y DSP.");
  const [status, setStatus] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [live, setLive] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [running, setRunning] = useState(true);
  const [rfPowerDbm, setRfPowerDbm] = useState(20);
  const [people, setPeople] = useState(4);
  const [opticalLengthKm, setOpticalLengthKm] = useState(10);
  const [solarIrradianceWm2, setSolarIrradianceWm2] = useState(850);
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    megaGet("/telecom/v500000000/status").then(setStatus).catch((e) => setStatus({ ok: false, error: e.message }));
    megaGet("/telecom/v500000000/examples").then((x) => setScenario(x.scenario || x)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    let alive = true;
    let t = 0;
    async function tick() {
      if (!alive) return;
      try {
        const data = await megaPost("/telecom/v500000000/simulation/live", {
          timeS: t,
          rfPowerDbm,
          people,
          opticalLengthKm,
          solarIrradianceWm2,
          frecuenciaGHz: 2.45,
        });
        setLive(data);
      } catch {}
      t += 0.35;
      setTimeout(tick, 650);
    }
    tick();
    return () => {
      alive = false;
    };
  }, [running, rfPowerDbm, people, opticalLengthKm, solarIrradianceWm2]);

  async function generateWithAI(module?: string) {
    setLoading(true);
    try {
      if (module && module !== "global" && module !== "report") {
        const data = await megaPost("/telecom/v500000000/manual-ai/generate", {
          module,
          prompt,
          level: "pro",
        });
        setScenario((prev: any) => ({
          ...(prev || {}),
          [module]: data.payload,
        }));
      } else {
        const data = await megaPost("/telecom/v500000000/manual-ai/generate-scenario", {
          prompt,
          level: "pro",
        });
        setScenario(data.scenario);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runUltimateScenario() {
    setLoading(true);
    try {
      const data = await megaPost("/telecom/v500000000/scenario/ultimate", scenario || {});
      const rep = await megaPost("/telecom/v500000000/report/ai", {
        scenario,
        validation: data,
        results: data,
      });
      setReport(rep);
    } finally {
      setLoading(false);
    }
  }

  async function recordCanvas() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return alert("No se ha encontrado el canvas 3D.");
    const stream = (canvas as HTMLCanvasElement).captureStream(30);
    const chunks: BlobPart[] = [];
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorderRef.current = rec;
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "telecom-platform-v500000000-demo.webm";
      a.click();
      URL.revokeObjectURL(url);
    };
    rec.start();
    setTimeout(() => rec.stop(), 10000);
  }

  const tabs: [ModuleKey, string][] = [
    ["global", "Global"],
    ["rf", "RF"],
    ["sionna", "Sionna"],
    ["optical", "Óptica"],
    ["dsp", "DSP"],
    ["electronics", "Electrónica"],
    ["energy", "Energía"],
    ["iot", "IoT"],
    ["transmissionLines", "Líneas"],
    ["report", "Informe IA"],
  ];

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">
            Mastesto Ultimate Telecom Lab
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase italic md:text-6xl">
            v500000000 Pro Final
          </h1>
          <p className="mt-4 max-w-4xl text-zinc-400">
            Plataforma all-in-one con modo manual, modo IA y simulación 3D interactiva animada.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Backend: {status?.ok ? "ONLINE" : "REVISAR"}
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.55fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3">
            <Mega3DWorld active={active} live={live} running={running} />
          </div>

          <aside className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex gap-2">
              <button onClick={() => setMode("manual")} className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase ${mode === "manual" ? "bg-orange-500 text-black" : "bg-black text-zinc-400"}`}>
                Manual
              </button>
              <button onClick={() => setMode("ai")} className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase ${mode === "ai" ? "bg-orange-500 text-black" : "bg-black text-zinc-400"}`}>
                IA
              </button>
            </div>

            {mode === "ai" && (
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-28 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-xs text-zinc-300 outline-none"
                />
                <button onClick={() => generateWithAI(active)} disabled={loading} className="mt-2 w-full rounded-xl bg-orange-500 px-3 py-3 text-xs font-black uppercase text-black">
                  Generar {active} con IA
                </button>
              </div>
            )}

            <div className="space-y-3">
              <Slider label="Potencia RF dBm" value={rfPowerDbm} min={0} max={40} onChange={setRfPowerDbm} />
              <Slider label="Personas" value={people} min={0} max={12} onChange={setPeople} />
              <Slider label="Fibra km" value={opticalLengthKm} min={0} max={80} onChange={setOpticalLengthKm} />
              <Slider label="Irradiancia W/m²" value={solarIrradianceWm2} min={100} max={1100} onChange={setSolarIrradianceWm2} />
            </div>

            <button onClick={() => setRunning((x) => !x)} className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-xs font-black uppercase">
              {running ? "Pausar animación" : "Reanudar animación"}
            </button>
            <button onClick={recordCanvas} className="w-full rounded-xl border border-sky-700 bg-sky-950 px-3 py-3 text-xs font-black uppercase text-sky-200">
              Grabar vídeo 10s
            </button>
            <button onClick={runUltimateScenario} disabled={loading} className="w-full rounded-xl bg-white px-3 py-3 text-xs font-black uppercase text-black">
              Simular todo + informe IA
            </button>
          </aside>
        </section>

        <nav className="flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setActive(id)} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest ${
              active === id ? "border-orange-400 bg-orange-500 text-black" : "border-zinc-800 bg-zinc-950 text-zinc-400"
            }`}>
              {label}
            </button>
          ))}
        </nav>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-2xl font-black uppercase italic">
            {active === "report" ? "Informe IA" : "Resultados dinámicos"}
          </h2>
          {active === "report" && report?.markdown ? (
            <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
              {report.markdown}
            </pre>
          ) : (
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
              {JSON.stringify({ active, live, scenario }, null, 2)}
            </pre>
          )}
        </section>
      </section>
    </main>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-orange-400">{value}</span>
      </span>
      <input
        className="mt-2 w-full"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
