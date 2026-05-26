"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiPost, clearScenario, downloadJson, getHistory, getModuleKeys, getScenario, saveProject, saveScenario } from "@/lib/telecomFinal/core";
import { Button, Card, CodeBox, Gauge, ROUTES, Shell, Stat } from "@/components/telecomFinal/ui";

export default function MegaTelecomFinalPage() {
  const [scenario, setScenarioState] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [projectName, setProjectName] = useState("Proyecto Telecom Final");
  const [loading, setLoading] = useState(false);

  function reload() {
    setScenarioState(getScenario());
    setHistory(getHistory());
  }

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener("mastesto-final-scenario", handler);
    window.addEventListener("mastesto-final-history", handler);
    return () => {
      window.removeEventListener("mastesto-final-scenario", handler);
      window.removeEventListener("mastesto-final-history", handler);
    };
  }, []);

  const moduleKeys = getModuleKeys(scenario);
  const score = Math.round((moduleKeys.length / 9) * 100);
  const bars = useMemo(() => {
    const values = moduleKeys.map((k) => JSON.stringify((scenario as any)[k]).length);
    const max = Math.max(1, ...values);
    return moduleKeys.map((k, i) => ({ key: k, h: Math.max(10, Math.round((values[i] / max) * 100)) }));
  }, [scenario, moduleKeys]);

  async function runGlobal() {
    setLoading(true);
    try { setResult(await apiPost("/telecom/v500000000/scenario/ultimate", scenario)); }
    catch (e: any) { setResult({ ok: false, error: e.message }); }
    finally { setLoading(false); }
  }

  async function runIndustrial() {
    setLoading(true);
    try {
      setResult(await apiPost("/telecom/v900000000/scenario/industrial", {
        scenario,
        industrial: (scenario as any).industrial || {},
        live: {
          timeS: Date.now() / 1000,
          rfPowerDbm: ((scenario as any).rf?.txPowerDbm ?? 20),
          people: ((scenario as any).iot?.twin?.peopleMovement?.people ?? 4),
          opticalLengthKm: ((scenario as any).optical?.lengthKm ?? 10),
          solarIrradianceWm2: ((scenario as any).energy?.pv?.irradianceWm2 ?? 850),
          frecuenciaGHz: ((scenario as any).rf?.frecuenciaGHz ?? 2.45),
        },
      }));
    } catch (e: any) { setResult({ ok: false, error: e.message }); }
    finally { setLoading(false); }
  }

  async function makeReport() {
    setLoading(true);
    try { setReport(await apiPost("/telecom/v900000000/report/industrial", (scenario as any).industrial || {})); }
    catch (e: any) { setReport({ ok: false, error: e.message }); }
    finally { setLoading(false); }
  }

  function importScenario(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { saveScenario(JSON.parse(String(reader.result))); reload(); }
      catch (err: any) { setResult({ ok: false, error: err.message }); }
    };
    reader.readAsText(f);
  }

  return (
    <Shell title="MegaProyecto Final Productivo" badge="Mastesto Telecom Platform · v∞" description="Centro global de producto. Integra todos los módulos, ejecuta escenarios, guarda proyectos, importa/exporta y genera informes.">
      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Módulos exportados" value={moduleKeys.length} />
        <Stat label="Historial" value={history.length} />
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} />
        <Stat label="Madurez" value={`${score}%`} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Gemelo digital integrado">
          <div className="relative h-[620px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-[radial-gradient(circle_at_center,#27272a,#020202)]">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:32px_32px]" />
            <Layer label="Sionna / edificio" active={!!(scenario as any).sionna} className="left-[18%] top-[38%] h-40 w-72 border-sky-400" />
            <Layer label="RF patrón" active={!!(scenario as any).rf} className="left-[30%] top-[24%] h-28 w-28 rounded-full border-orange-400" />
            <Layer label="Fibra óptica" active={!!(scenario as any).optical} className="left-[10%] top-[78%] h-1 w-[72%] border-emerald-400" />
            <Layer label="DSP" active={!!(scenario as any).dsp} className="left-[12%] top-[18%] h-12 w-48 border-pink-400" />
            <Layer label="PCB" active={!!(scenario as any).electronics} className="left-[68%] top-[25%] h-24 w-36 border-yellow-400" />
            <Layer label="Energía" active={!!(scenario as any).energy} className="left-[62%] top-[68%] h-24 w-44 border-lime-400" />
            <Layer label="IoT" active={!!(scenario as any).iot} className="left-[54%] top-[45%] h-16 w-36 border-purple-400" />
            <Layer label="Líneas TX" active={!!(scenario as any).transmissionLines} className="left-[71%] top-[53%] h-8 w-32 border-amber-400" />
            <Layer label="Industrial" active={!!(scenario as any).industrial} className="left-[42%] top-[10%] h-10 w-40 border-red-400" />
          </div>
        </Card>

        <Card title="Control global">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {ROUTES.slice(2, 11).map(([href, label]) => (
                <Link key={href} href={href} className="rounded-2xl border border-zinc-800 bg-black p-3 text-xs font-black uppercase text-zinc-300 hover:border-orange-500">{label}</Link>
              ))}
            </div>
            <Button disabled={loading} onClick={runGlobal} variant="orange">Ejecutar escenario global</Button>
            <Button disabled={loading} onClick={runIndustrial} variant="blue">Ejecutar escenario industrial</Button>
            <Button disabled={loading} onClick={makeReport} variant="white">Generar informe IA</Button>
            <Button onClick={() => downloadJson("mastesto-megaproyecto-final.json", scenario)}>Descargar escenario</Button>
            <label className="block w-full cursor-pointer rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-center text-xs font-black uppercase text-zinc-200">
              Importar escenario JSON
              <input type="file" accept="application/json" className="hidden" onChange={importScenario} />
            </label>
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none" />
            <Button onClick={() => saveProject(projectName, "Guardado desde MegaProyecto Final")} variant="green">Guardar proyecto local</Button>
            <Button onClick={() => { clearScenario(); reload(); setResult(null); setReport(null); }} variant="red">Limpiar MegaProyecto</Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Gauge title="Integración" value={score} />
        <Card title="Peso relativo por módulo">
          <div className="flex h-52 items-end gap-3 rounded-2xl border border-zinc-800 bg-black p-4">
            {bars.length === 0 ? <p className="text-sm text-zinc-500">Exporta módulos para ver el análisis.</p> : bars.map((b) => (
              <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-orange-500" style={{ height: `${b.h}%` }} />
                <p className="text-[10px] uppercase text-zinc-500">{b.key}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Módulos integrados">
          <div className="grid gap-2">
            {["rf","sionna","optical","dsp","electronics","energy","iot","transmissionLines","industrial"].map((key) => (
              <div key={key} className={`rounded-2xl border p-3 ${moduleKeys.includes(key) ? "border-emerald-600 bg-emerald-950/40" : "border-zinc-800 bg-black"}`}>
                <p className="text-xs font-black uppercase">{key}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{moduleKeys.includes(key) ? "integrado" : "pendiente"}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card title="Escenario global"><CodeBox data={scenario} /></Card>
        <Card title="Resultado"><CodeBox data={result ?? { info: "Ejecuta una simulación." }} /></Card>
        <Card title="Informe"><CodeBox data={report ?? { info: "Genera informe." }} /></Card>
      </section>

      <Card title="Historial realtime"><CodeBox data={history.slice(0, 12)} /></Card>
    </Shell>
  );
}

function Layer({ label, active, className }: { label: string; active: boolean; className: string }) {
  return <div className={`absolute z-10 flex items-center justify-center border-2 bg-black/60 text-[10px] font-black uppercase tracking-widest transition ${active ? "opacity-100 shadow-[0_0_30px_rgba(249,115,22,0.35)]" : "opacity-25"} ${className}`}>{label}</div>;
}
