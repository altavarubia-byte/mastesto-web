"use client";

import { useMemo, useState } from "react";
import { Button, Card, Code, MiniBars, Shell, Stat } from "./Shell";
import { Lab3DViewer } from "./Lab3DViewer";
import { downloadJson, endpoints, postApi, writeBus } from "@/lib/telecomLevel2/api";

type Field = { path: string; value: any; type: "number" | "string" | "boolean" | "object" };

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
function getAtPath(obj: any, path: string) { if (!path) return obj; return path.split(".").reduce((acc, key) => acc?.[key], obj); }
function setAtPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) { if (cur[keys[i]] === undefined || cur[keys[i]] === null) cur[keys[i]] = {}; cur = cur[keys[i]]; }
  cur[keys[keys.length - 1]] = value;
  return obj;
}
function flatten(obj: any, prefix = ""): Field[] {
  const out: Field[] = [];
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) out.push({ path, value: v, type: "object" });
    else if (v !== null && typeof v === "object") out.push(...flatten(v, path));
    else out.push({ path, value: v, type: typeof v === "number" ? "number" : typeof v === "boolean" ? "boolean" : typeof v === "string" ? "string" : "object" });
  }
  return out;
}
function format(v: any) {
  if (v === undefined || v === null) return "-";
  if (typeof v === "number") { if (Math.abs(v) < 1e-4 && v !== 0) return v.toExponential(2); return Number(v).toFixed(3); }
  if (typeof v === "boolean") return v ? "OK" : "NO";
  return String(v);
}
function metric(result: any, paths: string[]) { for (const p of paths) { const v = getAtPath(result, p); if (v !== undefined && typeof v !== "object") return v; } return undefined; }

const presets: Record<string, { label: string; patch: Record<string, any> }[]> = {
  optical: [{ label: "Enlace corto", patch: { lengthKm: 1, bitrateGbps: 10, edfaGainDb: 0 } }, { label: "WDM 40 km", patch: { lengthKm: 40, bitrateGbps: 25, wdmChannels: 16, edfaGainDb: 12 } }, { label: "PON splitter", patch: { lengthKm: 20, splitterLossDb: 15, bitrateGbps: 10 } }],
  rf: [{ label: "Helix 7 espiras", patch: { "geometry.turns": 7, frequencyGHz: 2.45 } }, { label: "Helix 20 espiras", patch: { "geometry.turns": 20, frequencyGHz: 2.45 } }, { label: "TX alta potencia", patch: { txPowerDbm: 27, bandwidthMHz: 80 } }],
  anechoic: [{ label: "Medida 3 m", patch: { "chamber.measurementDistanceM": 3, "chamber.thetaStepDeg": 2 } }, { label: "Barrido fino", patch: { "chamber.thetaStepDeg": 0.5, "chamber.frequencyPoints": 401 } }, { label: "Cámara grande", patch: { "chamber.lengthM": 12, "chamber.measurementDistanceM": 6 } }],
  sionna: [{ label: "Indoor 10 m", patch: { distanceM: 10, wallLossDb: 12, multipathLossDb: 4 } }, { label: "Indoor severo", patch: { distanceM: 25, wallLossDb: 22, multipathLossDb: 8 } }, { label: "Térmica 900 K", patch: { thermalTempK: 900 } }],
  electronics: [{ label: "ADC 12 bit", patch: { adcBits: 12, adcFsMHz: 40, frontendPowerW: 2.8 } }, { label: "ADC 14 bit", patch: { adcBits: 14, adcFsMHz: 122.88, frontendPowerW: 3.5 } }, { label: "LNA bajo ruido", patch: { lnaNoiseFigureDb: 1.1, ifGainDb: 35 } }],
  dsp: [{ label: "QPSK robusto", patch: { modulation: "QPSK", codingRate: 0.75 } }, { label: "16QAM medio", patch: { modulation: "16QAM", codingRate: 0.75 } }, { label: "64QAM agresivo", patch: { modulation: "64QAM", codingRate: 0.83 } }],
  energy: [{ label: "Batería 200 Wh", patch: { batteryCapacityWh: 200, solarAreaM2: 1.2 } }, { label: "Batería grande", patch: { batteryCapacityWh: 800, solarAreaM2: 2.5 } }, { label: "Poca radiación", patch: { irradianceWm2: 250, solarEfficiencyPct: 15 } }],
};
const defaultSweep: Record<string, string> = { optical: "lengthKm", rf: "geometry.turns", anechoic: "chamber.measurementDistanceM", sionna: "distanceM", electronics: "adcBits", dsp: "codingRate", energy: "batteryCapacityWh" };
const defaultAiPrompt: Record<string, string> = {
  optical: "Diseña un enlace óptico WDM de 40 km con margen mínimo de 6 dB.",
  rf: "Diseña una antena helicoidal a 2.45 GHz con buen compromiso entre ganancia y axial ratio.",
  anechoic: "Prepara una medida de cámara anecoica para una antena helicoidal a 2.45 GHz.",
  sionna: "Crea un escenario indoor con 3 salas, 4 receptores y columna térmica a 800 K.",
  electronics: "Diseña la cadena electrónica LNA, mezclador y ADC para una señal débil indoor.",
  dsp: "Diseña el procesado DSP para QPSK/OFDM con BER bajo y buen throughput.",
  energy: "Diseña alimentación con batería y solar para sostener el sistema 8 horas.",
  ai: "Diseña un sistema completo de telecomunicaciones de nivel 2 con óptica, RF, canal, electrónica, DSP y energía.",
};
function extractUsefulPayload(moduleKey: string, aiData: any, oldPayload: any) {
  const payload = aiData?.payload;
  if (!payload) return oldPayload;
  if (moduleKey === "ai") return payload;
  if (payload[moduleKey]) return payload[moduleKey];
  if (moduleKey === "anechoic") return { rf: payload.rf || oldPayload.rf || oldPayload, chamber: payload.chamber || oldPayload.chamber || {} };
  return payload[moduleKey] || oldPayload;
}
function scoreFor(moduleKey: string, result: any) {
  if (!result) return "-";
  if (moduleKey === "optical") return metric(result, ["marginDb"]);
  if (moduleKey === "rf") return metric(result, ["antenna.gainDbi", "gainDbi"]);
  if (moduleKey === "anechoic") return metric(result, ["metrics.gainDbi"]);
  if (moduleKey === "sionna") return metric(result, ["snrDb"]);
  if (moduleKey === "electronics") return metric(result, ["adcDynamicRangeDb"]);
  if (moduleKey === "dsp") return metric(result, ["ber"]);
  if (moduleKey === "energy") return metric(result, ["batteryHours"]);
  return metric(result, ["ok"]);
}

export function Lab({ moduleKey, title, subtitle, initialPayload, charts = [], nextLabel, guide }: { moduleKey: string; title: string; subtitle: string; initialPayload: any; charts?: { title: string; path: string; x: string; y: string }[]; nextLabel?: string; guide?: string[]; }) {
  const [payload, setPayload] = useState<any>(clone(initialPayload));
  const [text, setText] = useState(JSON.stringify(initialPayload, null, 2));
  const [result, setResult] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState(defaultAiPrompt[moduleKey] || defaultAiPrompt.ai);
  const [history, setHistory] = useState<any[]>([]);
  const [sweepRows, setSweepRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fields = useMemo(() => flatten(payload), [payload]);
  const numericFields = fields.filter(f => f.type === "number");
  const [sweepPath, setSweepPath] = useState(defaultSweep[moduleKey] || numericFields[0]?.path || "");
  const [sweepStart, setSweepStart] = useState(1);
  const [sweepStop, setSweepStop] = useState(20);
  const [sweepSteps, setSweepSteps] = useState(10);
  const endpoint = endpoints[moduleKey] || endpoints.pipeline;

  function sync(next: any) { setPayload(next); setText(JSON.stringify(next, null, 2)); }
  function parseJson() { try { const p = JSON.parse(text); setPayload(p); return p; } catch (e: any) { setResult({ ok: false, error: "JSON inválido: " + e.message }); return null; } }
  function updateField(path: string, raw: string, type: Field["type"]) { const next = clone(payload); let value: any = raw; if (type === "number") value = Number(raw); if (type === "boolean") value = raw === "true"; setAtPath(next, path, value); sync(next); }
  function applyPatch(patch: Record<string, any>) { const next = clone(payload); for (const [p, v] of Object.entries(patch)) setAtPath(next, p, v); sync(next); }

  async function simulate() { setLoading(true); try { const p = parseJson(); if (!p) return; const data: any = await postApi(endpoint, p); setResult(data); setHistory(h => [{ type: "sim", at: new Date().toISOString(), payload: p, result: data, score: scoreFor(moduleKey, data) }, ...h].slice(0, 20)); writeBus(moduleKey, p, data); } catch (e: any) { setResult({ ok: false, error: e.message }); } finally { setLoading(false); } }
  async function designWithAI() { setLoading(true); try { const data: any = await postApi("/telecom/v1300/ai/generate", { module: moduleKey, prompt: aiPrompt, level: "pro", current_payload: payload }); const newPayload = extractUsefulPayload(moduleKey, data, payload); sync(newPayload); setResult(data?.pipelinePreview || data); setHistory(h => [{ type: "ai", at: new Date().toISOString(), prompt: aiPrompt, result: data }, ...h].slice(0, 20)); writeBus(`${moduleKey}_ai`, { prompt: aiPrompt }, data); } catch (e: any) { setResult({ ok: false, error: e.message }); } finally { setLoading(false); } }
  async function sweep() { setLoading(true); try { const base = parseJson(); if (!base) return; const steps = Math.max(2, Math.min(Number(sweepSteps || 2), 80)); const rows: any[] = []; for (let i = 0; i < steps; i++) { const value = Number(sweepStart) + (Number(sweepStop) - Number(sweepStart)) * i / (steps - 1); const p = clone(base); setAtPath(p, sweepPath, value); const data: any = await postApi(endpoint, p); rows.push({ index: i, parameter: sweepPath, value, ok: data?.ok, mode: data?.mode, score: scoreFor(moduleKey, data), result: data }); } setSweepRows(rows); writeBus(`${moduleKey}_sweep`, { base, sweepPath, sweepStart, sweepStop, sweepSteps }, rows); } catch (e: any) { setSweepRows([{ ok: false, error: e.message }]); } finally { setLoading(false); } }
  async function optimizeQuick() { const path = defaultSweep[moduleKey] || numericFields[0]?.path; if (!path) return; setSweepPath(path); if (moduleKey === "optical") { setSweepStart(1); setSweepStop(80); setSweepSteps(25); } if (moduleKey === "rf") { setSweepStart(3); setSweepStop(30); setSweepSteps(28); } if (moduleKey === "anechoic") { setSweepStart(1); setSweepStop(10); setSweepSteps(20); } if (moduleKey === "sionna") { setSweepStart(1); setSweepStop(50); setSweepSteps(25); } if (moduleKey === "electronics") { setSweepStart(8); setSweepStop(16); setSweepSteps(9); } if (moduleKey === "dsp") { setSweepStart(0.4); setSweepStop(0.95); setSweepSteps(12); } if (moduleKey === "energy") { setSweepStart(50); setSweepStop(1000); setSweepSteps(20); } setTimeout(() => sweep(), 50); }
  function clearLab() { setResult(null); setHistory([]); setSweepRows([]); }
  function chartPath(obj: any, path: string) { return path.split(".").reduce((a, p) => a?.[p], obj); }

  const keyMetrics = [["OK", result?.ok], ["Score", scoreFor(moduleKey, result)], ["Historial", history.length], ["Sweep", sweepRows.length]];

  return (
    <Shell title={title} subtitle={subtitle}>
      <section className="mb-5 grid gap-3 md:grid-cols-4">{keyMetrics.map(([k, v]) => <Stat key={String(k)} label={String(k)} value={format(v)} />)}</section>
      <section className="mb-5"><Lab3DViewer moduleKey={moduleKey} payload={payload} result={result} /></section>
      <Card title="Simulador del laboratorio" subtitle="Diseña con IA, simula, barre variables, optimiza rápido y guarda al pipeline.">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
          <label className="block rounded-2xl border border-white/10 bg-black/50 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prompt IA del laboratorio</span><textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4} className="mt-3 w-full bg-transparent text-sm leading-6 text-white outline-none" /></label>
          <div className="grid gap-3 md:grid-cols-3"><Button tone="orange" disabled={loading} onClick={designWithAI}>Diseñar con IA</Button><Button tone="green" disabled={loading} onClick={simulate}>Simular</Button><Button tone="blue" disabled={loading} onClick={sweep}>Sweep</Button><Button tone="white" disabled={loading} onClick={optimizeQuick}>Optimizar rápido</Button><Button disabled={loading} onClick={() => downloadJson(`${moduleKey}-investigacion.json`, { payload, result, sweepRows, history })}>Exportar</Button><Button tone="red" disabled={loading} onClick={clearLab}>Limpiar</Button></div>
        </div>
      </Card>
      <section className="mt-5 grid gap-5 2xl:grid-cols-[.72fr_1.28fr]">
        <section className="space-y-5">
          <Card title="Presets y controles">
            {presets[moduleKey]?.length > 0 && <div className="mb-5"><p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Presets</p><div className="flex flex-wrap gap-2">{presets[moduleKey].map(p => <Button key={p.label} onClick={() => applyPatch(p.patch)}>{p.label}</Button>)}</div></div>}
            <div className="grid gap-3 md:grid-cols-2">{fields.filter(f => f.type !== "object").map(f => <label key={f.path} className="rounded-2xl border border-white/10 bg-black/40 p-3"><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">{f.path}</span>{f.type === "boolean" ? <select value={String(getAtPath(payload, f.path))} onChange={e => updateField(f.path, e.target.value, f.type)} className="mt-2 w-full bg-black text-sm text-white outline-none"><option value="true">true</option><option value="false">false</option></select> : <input value={String(getAtPath(payload, f.path))} type={f.type === "number" ? "number" : "text"} step="any" onChange={e => updateField(f.path, e.target.value, f.type)} className="mt-2 w-full bg-transparent text-sm text-white outline-none" />}</label>)}</div>
          </Card>
          <Card title="Sweep / barrido paramétrico">
            <div className="grid gap-3 md:grid-cols-4">
              <label className="md:col-span-4 rounded-2xl border border-white/10 bg-black/40 p-3"><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Variable a investigar</span><select value={sweepPath} onChange={e => setSweepPath(e.target.value)} className="mt-2 w-full bg-black text-sm text-white outline-none">{numericFields.map(f => <option key={f.path} value={f.path}>{f.path}</option>)}</select></label>
              <label className="rounded-2xl border border-white/10 bg-black/40 p-3"><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Start</span><input type="number" step="any" value={sweepStart} onChange={e => setSweepStart(Number(e.target.value))} className="mt-2 w-full bg-transparent text-sm text-white outline-none" /></label>
              <label className="rounded-2xl border border-white/10 bg-black/40 p-3"><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Stop</span><input type="number" step="any" value={sweepStop} onChange={e => setSweepStop(Number(e.target.value))} className="mt-2 w-full bg-transparent text-sm text-white outline-none" /></label>
              <label className="rounded-2xl border border-white/10 bg-black/40 p-3"><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Steps</span><input type="number" value={sweepSteps} onChange={e => setSweepSteps(Number(e.target.value))} className="mt-2 w-full bg-transparent text-sm text-white outline-none" /></label>
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200">Activo:<br />{sweepPath || "-"}</div>
            </div>
          </Card>
          <Card title="JSON avanzado"><textarea value={text} onChange={e => setText(e.target.value)} rows={18} className="w-full rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-zinc-300 outline-none focus:border-orange-500" /></Card>
        </section>
        <section className="space-y-5">
          {guide && <Card title="Guía técnica">{guide.map((g, i) => <p key={i} className="mb-2 text-sm leading-6 text-zinc-400">{g}</p>)}</Card>}
          <Card title="Resultado de simulación"><Code data={result || { info: "Usa Diseñar con IA, Simular, Sweep u Optimizar rápido." }} /></Card>
          {sweepRows.length > 0 && <Card title="Comparador de sweep"><div className="mb-4 space-y-2">{sweepRows.slice(0, 30).map((r, i) => <div key={i} className="grid grid-cols-[60px_1fr_120px] items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs"><span className="text-zinc-500">#{i}</span><span className="text-zinc-300">{r.parameter} = {Number(r.value).toFixed(4)}</span><span className="text-right text-orange-300">{format(r.score)}</span></div>)}</div><Code data={sweepRows} /></Card>}
          {history.length > 0 && <Card title="Historial del laboratorio"><div className="space-y-2">{history.map((h, i) => <button key={i} onClick={() => { if (h.payload) sync(h.payload); if (h.result) setResult(h.result); }} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-left text-xs hover:border-orange-500"><span className="text-orange-300">{h.type}</span><span className="ml-3 text-zinc-500">{h.at}</span><span className="float-right text-zinc-300">{format(h.score)}</span></button>)}</div></Card>}
        </section>
      </section>
      {result && charts.length > 0 && <section className="mt-5 grid gap-5 xl:grid-cols-2">{charts.map(c => { const arr = chartPath(result, c.path); if (!Array.isArray(arr)) return null; return <MiniBars key={c.title} title={c.title} data={arr} xKey={c.x} yKey={c.y} />; })}</section>}
    </Shell>
  );
}
