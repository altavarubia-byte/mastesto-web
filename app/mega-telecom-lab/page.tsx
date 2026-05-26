"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiPost, clearScenario, downloadJson, getHistory, getModuleKeys, getScenario, saveScenario } from "@/lib/telecomPremium/core";
import { Button, Card, CodeBox, Shell, Stat } from "@/components/telecomPremium/PremiumShell";
import { BarPro, GaugePro } from "@/components/telecomPremium/PremiumCharts";
import { Mega3DScene } from "@/components/telecomPremium/ThreeScenes";

const modules = [
  ["rf", "RF", "/rf-lab"],
  ["sionna", "Sionna", "/sionna-lab"],
  ["optical", "Óptica", "/optical-lab"],
  ["dsp", "DSP", "/dsp-lab"],
  ["electronics", "Electrónica", "/electronics-lab"],
  ["energy", "Energía", "/energy-lab"],
  ["iot", "IoT", "/iot-lab"],
  ["transmissionLines", "Líneas", "/transmission-lines-lab"],
  ["industrial", "Industrial", "/industrial-lab"],
];

export default function MegaPremiumPage() {
  const [scenario, setScenarioState] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function reload() {
    setScenarioState(getScenario());
    setHistory(getHistory());
  }

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("mastesto-premium-scenario", h);
    window.addEventListener("mastesto-premium-history", h);
    return () => {
      window.removeEventListener("mastesto-premium-scenario", h);
      window.removeEventListener("mastesto-premium-history", h);
    };
  }, []);

  const keys = getModuleKeys(scenario);
  const score = Math.round(keys.length / 9 * 100);
  const barData = useMemo(() => {
    return keys.map((k) => ({ module: k, size: JSON.stringify((scenario as any)[k]).length }));
  }, [keys, scenario]);

  async function runGlobal() {
    setLoading(true);
    try { setResult(await apiPost("/telecom/v500000000/scenario/ultimate", scenario)); }
    catch (e:any) { setResult({ ok:false, error:e.message }); }
    finally { setLoading(false); }
  }

  async function runIndustrial() {
    setLoading(true);
    try {
      setResult(await apiPost("/telecom/v900000000/scenario/industrial", {
        scenario,
        industrial: (scenario as any).industrial || {},
        live: { timeS: Date.now()/1000, rfPowerDbm: 20, people: 4, opticalLengthKm: 10, solarIrradianceWm2: 850 }
      }));
    } catch (e:any) { setResult({ ok:false, error:e.message }); }
    finally { setLoading(false); }
  }

  async function makeReport() {
    setLoading(true);
    try { setReport(await apiPost("/telecom/v900000000/report/industrial", (scenario as any).industrial || {})); }
    catch (e:any) { setReport({ ok:false, error:e.message }); }
    finally { setLoading(false); }
  }

  function importScenario(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { saveScenario(JSON.parse(String(reader.result))); reload(); }
      catch (err:any) { setResult({ ok:false, error:err.message }); }
    };
    reader.readAsText(f);
  }

  return (
    <Shell title="MegaProyecto Premium 3D" badge="Global Digital Twin · Three.js · Recharts" description="Vista global premium con escena 3D integrada, módulos en tiempo real, simulación global, informe IA e import/export.">
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Módulos" value={keys.length} />
        <Stat label="Integración" value={`${score}%`} tone="green" />
        <Stat label="Historial" value={history.length} />
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} tone="blue" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card title="Gemelo digital 3D global" subtitle="Three.js real; los módulos exportados activan capas visuales.">
          <Mega3DScene scenario={scenario} />
        </Card>

        <Card title="Control global">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {modules.map(([key, label, href]) => (
                <Link key={key} href={href} className={`rounded-2xl border p-3 text-xs font-black uppercase ${keys.includes(key) ? "border-emerald-500 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-black/50 text-zinc-300"}`}>
                  {label}
                </Link>
              ))}
            </div>
            <Button onClick={runGlobal} disabled={loading} variant="orange">Ejecutar global</Button>
            <Button onClick={runIndustrial} disabled={loading} variant="blue">Escenario industrial</Button>
            <Button onClick={makeReport} disabled={loading} variant="white">Informe IA</Button>
            <Button onClick={() => downloadJson("mega-premium-scenario.json", scenario)}>Descargar escenario</Button>
            <label className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center text-xs font-black uppercase text-zinc-200">
              Importar JSON
              <input type="file" accept="application/json" className="hidden" onChange={importScenario} />
            </label>
            <Button onClick={() => { clearScenario(); reload(); setResult(null); setReport(null); }} variant="red">Limpiar</Button>
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <GaugePro title="Madurez global" value={score} />
        <div className="lg:col-span-2">
          <BarPro title="Peso de payload por módulo" data={barData.length ? barData : [{module:"none",size:0}]} xKey="module" yKey="size" />
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Escenario"><CodeBox data={scenario} /></Card>
        <Card title="Resultado"><CodeBox data={result ?? { info: "Ejecuta una simulación." }} /></Card>
        <Card title="Informe"><CodeBox data={report ?? { info: "Genera informe." }} /></Card>
      </section>

      <section className="mt-5">
        <Card title="Historial"><CodeBox data={history.slice(0, 12)} /></Card>
      </section>
    </Shell>
  );
}
