"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiPost, loadGlobalScenario, saveGlobalScenario } from "@/lib/telecomProApi";

const ROUTES = [
  ["/rf-lab", "RF"],
  ["/sionna-lab", "Sionna"],
  ["/optical-lab", "Óptica"],
  ["/dsp-lab", "DSP"],
  ["/electronics-lab", "Electrónica"],
  ["/energy-lab", "Energía"],
  ["/iot-lab", "IoT"],
  ["/transmission-lines-lab", "Líneas"],
  ["/industrial-lab", "Industrial"],
];

export default function MegaProjectPro() {
  const [scenario, setScenario] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScenario(loadGlobalScenario());
    const handler = () => setScenario(loadGlobalScenario());
    window.addEventListener("mastesto-telecom-scenario-updated", handler);
    return () => window.removeEventListener("mastesto-telecom-scenario-updated", handler);
  }, []);

  async function runUltimate() {
    setLoading(true);
    try {
      const data = await apiPost("/telecom/v500000000/scenario/ultimate", scenario);
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function runLive() {
    setLoading(true);
    try {
      const data = await apiPost("/telecom/v500000000/simulation/live", {
        timeS: Date.now() / 1000,
        rfPowerDbm: 20,
        people: 4,
        opticalLengthKm: 10,
        solarIrradianceWm2: 850,
        frecuenciaGHz: 2.45,
      });
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    setLoading(true);
    try {
      const data = await apiPost("/telecom/v900000000/report/industrial", {
        scenario,
        validation: result,
        quality: { backendStarts: true, frontendBuilds: true, apiHealthOk: true, examplesRun: true },
        commercial: { workingBackend: true, workingFrontend: true, clearUseCase: true, demoScenario: true, reportGeneration: true },
      });
      setReport(data);
    } catch (e: any) {
      setReport({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  function clearScenario() {
    saveGlobalScenario({});
    setScenario({});
    setResult(null);
    setReport(null);
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Mastesto MegaProyecto</p>
          <h1 className="mt-3 text-4xl font-black uppercase italic md:text-6xl">Escenario global editable</h1>
          <p className="mt-4 max-w-4xl text-zinc-400">
            Aquí se reúne lo que exportas desde RF, Sionna, Óptica, DSP, Electrónica, Energía, IoT, Líneas de transmisión e Industrial.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {ROUTES.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 hover:border-orange-500">
              {label}
            </Link>
          ))}
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-2xl font-black uppercase italic">Vista conceptual del MegaProyecto</h2>
            <div className="relative mt-4 h-[460px] overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_center,#27272a,#020202)]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:32px_32px]" />
              <Layer label="Edificio / Sionna" className="left-[18%] top-[38%] h-40 w-72 border-sky-400" active={!!scenario.sionna} />
              <Layer label="Patrón RF" className="left-[30%] top-[25%] h-28 w-28 rounded-full border-orange-400" active={!!scenario.rf} />
              <Layer label="Fibra óptica" className="left-[10%] top-[78%] h-1 w-[70%] border-emerald-400" active={!!scenario.optical} />
              <Layer label="DSP" className="left-[12%] top-[18%] h-12 w-48 border-pink-400" active={!!scenario.dsp} />
              <Layer label="PCB" className="left-[68%] top-[25%] h-24 w-36 border-yellow-400" active={!!scenario.electronics} />
              <Layer label="Energía" className="left-[62%] top-[68%] h-24 w-44 border-lime-400" active={!!scenario.energy} />
              <Layer label="IoT / Personas" className="left-[54%] top-[45%] h-16 w-36 border-purple-400" active={!!scenario.iot} />
              <Layer label="Líneas TX" className="left-[71%] top-[53%] h-8 w-32 border-amber-400" active={!!scenario.transmissionLines} />
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-2xl font-black uppercase italic">Control global</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(scenario).length === 0 ? (
                <p className="col-span-2 text-sm text-zinc-500">Todavía no has exportado módulos.</p>
              ) : (
                Object.keys(scenario).map((k) => (
                  <div key={k} className="rounded-xl border border-zinc-800 bg-black p-3">
                    <p className="text-xs font-black uppercase text-green-400">{k}</p>
                    <p className="text-[10px] text-zinc-500">exportado</p>
                  </div>
                ))
              )}
            </div>
            <button disabled={loading} onClick={runLive} className="w-full rounded-xl border border-sky-700 bg-sky-950 px-4 py-3 text-xs font-black uppercase text-sky-200">Simulación live</button>
            <button disabled={loading} onClick={runUltimate} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase text-black">Ejecutar escenario global</button>
            <button disabled={loading} onClick={generateReport} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-black uppercase text-black">Generar informe industrial IA</button>
            <button onClick={clearScenario} className="w-full rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-xs font-black uppercase text-red-200">Limpiar escenario</button>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <JsonBox title="Escenario global" data={scenario} />
          <JsonBox title="Resultado" data={result ?? { info: "Ejecuta una simulación." }} />
          <JsonBox title="Informe" data={report ?? { info: "Genera el informe IA." }} />
        </section>
      </section>
    </main>
  );
}

function Layer({ label, className, active }: { label: string; className: string; active: boolean }) {
  return (
    <div className={`absolute z-10 flex items-center justify-center border-2 bg-black/50 text-[10px] font-black uppercase tracking-widest ${active ? "opacity-100 shadow-[0_0_30px_rgba(249,115,22,0.35)]" : "opacity-25"} ${className}`}>
      {label}
    </div>
  );
}

function JsonBox({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-xl font-black uppercase italic">{title}</h2>
      <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
