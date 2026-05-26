"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TELECOM_API,
  apiPost,
  clone,
  downloadJson,
  exportModule,
  getHistory,
  getPath,
  getScenario,
  runEndpoint,
  setPath,
  type EndpointDef,
  type FieldDef,
  type ModuleKey,
} from "@/lib/telecomFinal/core";
import { Button, Card, CodeBox, ROUTES, Shell, Stat } from "./ui";
import {
  RFVisual, SionnaVisual, OpticalVisual, DSPVisual, ElectronicsVisual,
  EnergyVisual, IoTVisual, TransmissionVisual, IndustrialVisual
} from "./visuals";

export type ProductModuleConfig = {
  key: ModuleKey;
  title: string;
  badge: string;
  description: string;
  initialPayload: any;
  sections: Array<{ title: string; description: string; fields: FieldDef[] }>;
  endpoints: EndpointDef[];
  capabilities: string[];
};

export default function ModuleProductPage({ config }: { config: ProductModuleConfig }) {
  const [payload, setPayload] = useState<any>(config.initialPayload);
  const [jsonText, setJsonText] = useState(JSON.stringify(config.initialPayload, null, 2));
  const [prompt, setPrompt] = useState(`Configura ${config.title} como producto profesional, con validación, visualización y exportación.`);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [autoExport, setAutoExport] = useState(true);
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
    window.addEventListener("mastesto-final-history", handler);
    return () => window.removeEventListener("mastesto-final-history", handler);
  }, [config.key]);

  useEffect(() => {
    if (autoExport) exportModule(config.key, payload);
  }, [payload, autoExport, config.key]);

  const currentSection = useMemo(() => config.sections.find((s) => s.title === activeSection) || config.sections[0], [activeSection, config.sections]);
  const payloadSize = JSON.stringify(payload).length;
  const exported = Boolean(getScenario()[config.key]);

  function updateField(field: FieldDef, value: string) {
    const next = setPath(payload, field.path, value, field.type);
    setPayload(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonText);
      setPayload(parsed);
      setResult({ ok: true, message: "JSON aplicado correctamente", payload: parsed });
      if (autoExport) exportModule(config.key, parsed);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    }
  }

  function exportNow() {
    const scenario = exportModule(config.key, payload);
    setResult({ ok: true, message: `${config.title} exportado al MegaProyecto`, scenario });
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
      const data = await runEndpoint(endpoint, payload);
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, endpoint: endpoint.path, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function simulateGlobal() {
    setLoading(true);
    try {
      const scenario = { ...getScenario(), [config.key]: payload };
      setResult(await apiPost("/telecom/v500000000/scenario/ultimate", scenario));
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title={config.title} badge={config.badge} description={`${config.description} Backend: ${TELECOM_API}`}>
      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Payload" value={`${payloadSize} chars`} />
        <Stat label="Auto export" value={autoExport ? "ON" : "OFF"} />
        <Stat label="Exportado" value={exported ? "Sí" : "No"} />
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} />
      </section>

      <Card title="Visualización técnica">
        <VisualPanel moduleKey={config.key} payload={payload} />
      </Card>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-5">
          <Card title="Secciones del módulo">
            <div className="grid gap-2">
              {config.sections.map((section) => (
                <button key={section.title} onClick={() => setActiveSection(section.title)} className={`rounded-2xl border p-4 text-left transition ${activeSection === section.title ? "border-orange-500 bg-orange-500/10" : "border-zinc-800 bg-black hover:border-zinc-600"}`}>
                  <p className="text-sm font-black uppercase text-white">{section.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{section.description}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Capacidades">
            <div className="flex flex-wrap gap-2">
              {config.capabilities.map((c) => <span key={c} className="rounded-full border border-zinc-800 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">{c}</span>)}
            </div>
          </Card>

          <Card title="Modo IA">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={7} className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300 outline-none focus:border-orange-500" />
            <div className="mt-3 grid gap-2">
              <Button onClick={generateAI} disabled={loading} variant="white">{loading ? "Generando..." : "Generar configuración con IA"}</Button>
            </div>
          </Card>

          <Card title="Exportación y archivos">
            <div className="space-y-2">
              <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-3">
                <span className="text-xs font-black uppercase text-zinc-300">Exportación realtime</span>
                <select value={String(autoExport)} onChange={(e) => setAutoExport(e.target.value === "true")} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-xs text-white">
                  <option value="true">ON</option><option value="false">OFF</option>
                </select>
              </label>
              <Button onClick={exportNow} variant="green">Exportar al MegaProyecto</Button>
              <Button onClick={() => downloadJson(`${config.key}-payload.json`, payload)}>Descargar payload</Button>
              <Button onClick={() => downloadJson(`${config.key}-resultado.json`, result)}>Descargar resultado</Button>
              <Link href="/mega-telecom-lab" className="block rounded-2xl border border-orange-700 bg-orange-950 px-4 py-3 text-center text-xs font-black uppercase text-orange-200">Abrir MegaProyecto</Link>
            </div>
          </Card>
        </aside>

        <section className="space-y-5">
          <Card title={currentSection.title} subtitle={currentSection.description}>
            <div className="grid gap-4 md:grid-cols-2">
              {currentSection.fields.map((field) => (
                <label key={field.path} className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{field.label} {field.unit ? `(${field.unit})` : ""}</span>
                  {field.type === "select" || field.type === "boolean" ? (
                    <select value={String(getPath(payload, field.path) ?? "")} onChange={(e) => updateField(field, e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-orange-500">
                      {field.options?.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea value={String(getPath(payload, field.path) ?? "")} onChange={(e) => updateField(field, e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-orange-500" />
                  ) : (
                    <input type={field.type} value={String(getPath(payload, field.path) ?? "")} onChange={(e) => updateField(field, e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-orange-500" />
                  )}
                </label>
              ))}
            </div>
          </Card>

          <Card title="Acciones del backend">
            <div className="grid gap-3 md:grid-cols-2">
              {config.endpoints.map((endpoint) => (
                <button key={endpoint.label} disabled={loading} onClick={() => executeEndpoint(endpoint)} className="rounded-2xl border border-zinc-800 bg-black p-4 text-left transition hover:border-orange-500">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">{endpoint.method}</p>
                  <p className="mt-1 font-black text-white">{endpoint.label}</p>
                  <p className="mt-1 break-all text-xs text-zinc-500">{endpoint.path}</p>
                </button>
              ))}
              <button disabled={loading} onClick={simulateGlobal} className="rounded-2xl border border-sky-700 bg-sky-950 p-4 text-left transition hover:bg-sky-900">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">POST</p>
                <p className="mt-1 font-black text-white">Simular global con este módulo</p>
                <p className="mt-1 text-xs text-sky-400">/telecom/v500000000/scenario/ultimate</p>
              </button>
            </div>
          </Card>

          <Card title="Editor JSON avanzado">
            <div className="mb-3 flex flex-wrap gap-2">
              <Button onClick={applyJson} variant="white">Aplicar JSON</Button>
              <Button onClick={() => { const reset = clone(config.initialPayload); setPayload(reset); setJsonText(JSON.stringify(reset, null, 2)); }}>Reset módulo</Button>
            </div>
            <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={20} className="w-full rounded-2xl border border-zinc-800 bg-black p-4 font-mono text-xs leading-5 text-zinc-300 outline-none focus:border-orange-500" />
          </Card>
        </section>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card title="Resultado"><CodeBox data={result ?? { info: "Ejecuta un endpoint, genera con IA o exporta al MegaProyecto." }} /></Card>
        <Card title="Historial local"><CodeBox data={history.slice(0, 8)} /></Card>
      </section>
    </Shell>
  );
}

function VisualPanel({ moduleKey, payload }: { moduleKey: ModuleKey; payload: any }) {
  if (moduleKey === "rf") return <RFVisual payload={payload} />;
  if (moduleKey === "sionna") return <SionnaVisual payload={payload} />;
  if (moduleKey === "optical") return <OpticalVisual payload={payload} />;
  if (moduleKey === "dsp") return <DSPVisual payload={payload} />;
  if (moduleKey === "electronics") return <ElectronicsVisual payload={payload} />;
  if (moduleKey === "energy") return <EnergyVisual payload={payload} />;
  if (moduleKey === "iot") return <IoTVisual payload={payload} />;
  if (moduleKey === "transmissionLines") return <TransmissionVisual payload={payload} />;
  if (moduleKey === "industrial") return <IndustrialVisual payload={payload} />;
  return <div />;
}
