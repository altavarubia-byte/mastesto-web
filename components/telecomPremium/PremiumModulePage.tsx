"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TELECOM_API, apiPost, clone, downloadJson, dspSignal, energyProfile, exportModule,
  getHistory, getPath, getScenario, rfSweep, runEndpoint, setPath,
  type EndpointDef, type FieldDef, type ModuleKey
} from "@/lib/telecomPremium/core";
import { Button, Card, CodeBox, Shell, Stat } from "./PremiumShell";
import { AreaPro, BarPro, GaugePro, LinePro, PolarPro } from "./PremiumCharts";
import { Mega3DScene, RFAntennaScene, Sionna3DScene } from "./ThreeScenes";
import type { PremiumConfig } from "./configs";

export default function PremiumModulePage({ config }: { config: PremiumConfig }) {
  const [payload, setPayload] = useState<any>(config.initialPayload);
  const [jsonText, setJsonText] = useState(JSON.stringify(config.initialPayload, null, 2));
  const [prompt, setPrompt] = useState(`Optimiza ${config.title} con criterios profesionales, visuales e industriales.`);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [autoExport, setAutoExport] = useState(true);
  const [activeTab, setActiveTab] = useState<"design" | "simulation" | "charts" | "json" | "results">("design");
  const [activeSection, setActiveSection] = useState(config.sections[0]?.title || "General");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getScenario()[config.key];
    if (existing) {
      setPayload(existing);
      setJsonText(JSON.stringify(existing, null, 2));
    }
    setHistory(getHistory());
    const handler = () => setHistory(getHistory());
    window.addEventListener("mastesto-premium-history", handler);
    return () => window.removeEventListener("mastesto-premium-history", handler);
  }, [config.key]);

  useEffect(() => {
    if (autoExport) exportModule(config.key, payload);
  }, [payload, autoExport, config.key]);

  const currentSection = useMemo(() => config.sections.find((s) => s.title === activeSection) || config.sections[0], [activeSection, config.sections]);
  const payloadSize = JSON.stringify(payload).length;

  function updateField(field: FieldDef, value: string) {
    const next = setPath(payload, field.path, value, field.type);
    setPayload(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonText);
      setPayload(parsed);
      setResult({ ok: true, message: "JSON aplicado", payload: parsed });
      if (autoExport) exportModule(config.key, parsed);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    }
  }

  async function generateAI() {
    setLoading(true);
    try {
      const data: any = await apiPost("/telecom/v500000000/manual-ai/generate", {
        module: config.key === "transmissionLines" ? "transmission_lines" : config.key,
        prompt,
        level: "pro",
      });
      const generated = data?.payload ?? data;
      setPayload(generated);
      setJsonText(JSON.stringify(generated, null, 2));
      setResult(data);
      if (autoExport) exportModule(config.key, generated);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function executeEndpoint(endpoint: EndpointDef) {
    setLoading(true);
    try {
      setResult(await runEndpoint(endpoint, payload));
    } catch (e: any) {
      setResult({ ok: false, endpoint: endpoint.path, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function simulateGlobal() {
    setLoading(true);
    try {
      setResult(await apiPost("/telecom/v500000000/scenario/ultimate", { ...getScenario(), [config.key]: payload }));
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  function exportNow() {
    setResult({ ok: true, message: "Exportado al MegaProyecto", scenario: exportModule(config.key, payload) });
  }

  return (
    <Shell title={config.title} badge={config.badge} description={`${config.description} Backend: ${TELECOM_API}`}>
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Payload" value={`${payloadSize} chars`} />
        <Stat label="Auto export" value={autoExport ? "ON" : "OFF"} tone="green" />
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} tone="blue" />
        <Stat label="Módulo" value={config.key} tone="orange" />
      </section>

      <div className="mb-5 flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-2">
        {(["design","simulation","charts","json","results"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition ${activeTab === t ? "bg-orange-500 text-black" : "bg-black/40 text-zinc-300 hover:bg-white/10"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "design" && (
        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5">
            <Card title="Secciones">
              <div className="grid gap-2">
                {config.sections.map((section) => (
                  <button key={section.title} onClick={() => setActiveSection(section.title)} className={`rounded-2xl border p-4 text-left transition ${activeSection === section.title ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-black/40 hover:border-orange-500/40"}`}>
                    <p className="text-sm font-black uppercase text-white">{section.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{section.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="IA Assistant">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-zinc-300 outline-none focus:border-orange-500" />
              <div className="mt-3 grid gap-2">
                <Button onClick={generateAI} disabled={loading} variant="purple">Generar con IA</Button>
                <Button onClick={exportNow} variant="green">Exportar al MegaProyecto</Button>
                <Button onClick={() => setAutoExport(!autoExport)}>{autoExport ? "Desactivar realtime" : "Activar realtime"}</Button>
              </div>
            </Card>
          </aside>

          <Card title={currentSection.title} subtitle={currentSection.description}>
            <div className="grid gap-4 md:grid-cols-2">
              {currentSection.fields.map((field) => (
                <label key={field.path} className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{field.label} {field.unit ? `(${field.unit})` : ""}</span>
                  {field.type === "select" || field.type === "boolean" ? (
                    <select value={String(getPath(payload, field.path) ?? "")} onChange={(e) => updateField(field, e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 p-3 text-sm text-white outline-none focus:border-orange-500">
                      {field.options?.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={String(getPath(payload, field.path) ?? "")} onChange={(e) => updateField(field, e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 p-3 text-sm text-white outline-none focus:border-orange-500" />
                  )}
                </label>
              ))}
            </div>
          </Card>
        </section>
      )}

      {activeTab === "simulation" && (
        <section className="space-y-5">
          <Card title="Simulación 3D Premium" subtitle="Three.js real en cliente. Rayos y objetos actualizan con el payload.">
            <PremiumVisual moduleKey={config.key} payload={payload} />
          </Card>
          <Card title="Acciones backend">
            <div className="grid gap-3 md:grid-cols-3">
              {config.endpoints.map((endpoint) => (
                <button key={endpoint.label} disabled={loading} onClick={() => executeEndpoint(endpoint)} className="rounded-2xl border border-white/10 bg-black/50 p-4 text-left transition hover:border-orange-500">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">{endpoint.method}</p>
                  <p className="mt-1 font-black text-white">{endpoint.label}</p>
                  <p className="mt-1 break-all text-xs text-zinc-500">{endpoint.path}</p>
                </button>
              ))}
              <button disabled={loading} onClick={simulateGlobal} className="rounded-2xl border border-sky-700 bg-sky-950 p-4 text-left transition hover:bg-sky-900">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">POST</p>
                <p className="mt-1 font-black text-white">Simulación global</p>
                <p className="mt-1 text-xs text-sky-400">/telecom/v500000000/scenario/ultimate</p>
              </button>
            </div>
          </Card>
        </section>
      )}

      {activeTab === "charts" && <ChartsPanel moduleKey={config.key} payload={payload} />}

      {activeTab === "json" && (
        <Card title="Editor JSON avanzado">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button onClick={applyJson} variant="white">Aplicar JSON</Button>
            <Button onClick={() => { const reset = clone(config.initialPayload); setPayload(reset); setJsonText(JSON.stringify(reset, null, 2)); }}>Reset módulo</Button>
            <Button onClick={() => downloadJson(`${config.key}-payload.json`, payload)}>Descargar payload</Button>
          </div>
          <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={24} className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-5 text-zinc-300 outline-none focus:border-orange-500" />
        </Card>
      )}

      {activeTab === "results" && (
        <section className="grid gap-5 lg:grid-cols-2">
          <Card title="Resultado"><CodeBox data={result ?? { info: "Ejecuta backend, IA o simulación." }} /></Card>
          <Card title="Historial"><CodeBox data={history.slice(0, 12)} /></Card>
        </section>
      )}
    </Shell>
  );
}

function PremiumVisual({ moduleKey, payload }: { moduleKey: ModuleKey; payload: any }) {
  if (moduleKey === "rf") return <RFAntennaScene payload={payload} />;
  if (moduleKey === "sionna") return <Sionna3DScene payload={payload} />;
  return <Generic3D moduleKey={moduleKey} payload={payload} />;
}

function Generic3D({ moduleKey, payload }: { moduleKey: ModuleKey; payload: any }) {
  return <Mega3DScene scenario={{ [moduleKey]: payload }} />;
}

function ChartsPanel({ moduleKey, payload }: { moduleKey: ModuleKey; payload: any }) {
  if (moduleKey === "rf") {
    const data = rfSweep(payload);
    return (
      <section className="grid gap-5 lg:grid-cols-2">
        <LinePro title="S11 vs Frecuencia" data={data} xKey="f" yKey="s11" suffix="dB" />
        <LinePro title="VSWR vs Frecuencia" data={data} xKey="f" yKey="vswr" />
        <LinePro title="Ganancia vs Frecuencia" data={data} xKey="f" yKey="gain" suffix="dBi" />
        <PolarPro title="Patrón polar 2D" />
      </section>
    );
  }

  if (moduleKey === "dsp") {
    const data = dspSignal(payload);
    return (
      <section className="grid gap-5 lg:grid-cols-2">
        <LinePro title="Waveform" data={data} xKey="n" yKey="wave" />
        <AreaPro title="FFT conceptual" data={data} xKey="n" yKey="fft" />
        <Spectrogram />
      </section>
    );
  }

  if (moduleKey === "energy") {
    const data = energyProfile(payload);
    return (
      <section className="grid gap-5 lg:grid-cols-2">
        <AreaPro title="PV horario" data={data} xKey="h" yKey="pv" />
        <LinePro title="Carga horaria" data={data} xKey="h" yKey="load" suffix="kW" />
        <LinePro title="SOC batería" data={data} xKey="h" yKey="battery" suffix="%" />
      </section>
    );
  }

  if (moduleKey === "industrial") {
    const q = payload.quality ?? {};
    const v = payload.validation ?? {};
    const c = payload.commercial ?? {};
    const qualityScore = Object.values(q).filter(Boolean).length / Math.max(1,Object.values(q).length) * 100;
    const validationScore = Math.min(100, (Number(v.syntheticTests ?? 0)*1.5 + Number(v.realMeasurements ?? 0)*12 + Number(v.referenceSolverComparisons ?? 0)*8));
    const commercialScore = Object.values(c).filter(Boolean).length / Math.max(1,Object.values(c).length) * 100;
    return (
      <section className="grid gap-5 lg:grid-cols-3">
        <GaugePro title="Quality" value={qualityScore} />
        <GaugePro title="Validation" value={validationScore} />
        <GaugePro title="Commercial" value={commercialScore} />
      </section>
    );
  }

  const base = Array.from({length: 24}, (_, i) => ({ x: i, y: 30 + 20*Math.sin(i/3) }));
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <AreaPro title="Métrica visual" data={base} xKey="x" yKey="y" />
      <BarPro title="Distribución" data={base.slice(0, 12)} xKey="x" yKey="y" />
    </section>
  );
}

function Spectrogram() {
  return (
    <Card title="Espectrograma canvas-like">
      <div className="grid h-72 grid-cols-40 gap-[2px] overflow-hidden rounded-2xl border border-white/10 bg-black p-2">
        {Array.from({length: 40*18}).map((_,i)=> <div key={i} className="rounded-sm" style={{background:`rgba(236,72,153,${0.06 + 0.8*Math.abs(Math.sin(i/19))})`}} />)}
      </div>
    </Card>
  );
}
