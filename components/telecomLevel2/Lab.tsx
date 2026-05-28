"use client";
import { useState } from "react";
import { Button, Card, Code, MiniBars, Shell, Stat } from "./Shell";
import { downloadJson, endpoints, postApi, writeBus } from "@/lib/telecomLevel2/api";

export function Lab({
  moduleKey, title, subtitle, initialPayload, charts = [], nextLabel, guide,
}: {
  moduleKey: string; title: string; subtitle: string; initialPayload: any;
  charts?: { title: string; path: string; x: string; y: string }[];
  nextLabel?: string; guide?: string[];
}) {
  const [text, setText] = useState(JSON.stringify(initialPayload, null, 2));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  function getPath(obj: any, path: string) { return path.split(".").reduce((a,p)=>a?.[p], obj); }
  async function run() {
    setLoading(true);
    try {
      const payload = JSON.parse(text);
      const data = await postApi(endpoints[moduleKey], payload);
      setResult(data);
      writeBus(moduleKey, payload, data);
    } catch (e: any) { setResult({ ok:false, error:e.message }); }
    finally { setLoading(false); }
  }
  const metrics = result?.metrics || result?.antenna || result?.final || result || {};
  const metricKeys = Object.keys(metrics).filter(k => typeof metrics[k] !== "object").slice(0,4);
  return (
    <Shell title={title} subtitle={subtitle}>
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Módulo" value={moduleKey} />
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} />
        <Stat label="Endpoint" value={endpoints[moduleKey].split("/").slice(-1)[0]} />
        <Stat label="Siguiente" value={nextLabel || "pipeline"} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <Card title="Payload editable" subtitle="Modifica parámetros y ejecuta. El resultado se guarda en el bus global para el pipeline.">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button tone="orange" onClick={run} disabled={loading}>Ejecutar laboratorio</Button>
            <Button onClick={() => downloadJson(`${moduleKey}-payload.json`, JSON.parse(text))}>Descargar payload</Button>
            {result && <Button onClick={() => downloadJson(`${moduleKey}-result.json`, result)}>Descargar resultado</Button>}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={34} className="w-full rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-zinc-300 outline-none focus:border-orange-500" />
        </Card>
        <section className="space-y-5">
          {metricKeys.length > 0 && <div className="grid gap-3 md:grid-cols-2">{metricKeys.map(k => <Stat key={k} label={k} value={typeof metrics[k] === "number" ? Number(metrics[k]).toFixed(3) : String(metrics[k])} />)}</div>}
          {guide && <Card title="Guía técnica">{guide.map((g,i)=><p key={i} className="mb-2 text-sm leading-6 text-zinc-400">{g}</p>)}</Card>}
          <Card title="Resultado"><Code data={result || { info:"Pulsa Ejecutar laboratorio." }} /></Card>
        </section>
      </section>
      {result && charts.length > 0 && <section className="mt-5 grid gap-5 xl:grid-cols-2">{charts.map(c => { const arr = getPath(result, c.path); if (!Array.isArray(arr)) return null; return <MiniBars key={c.title} title={c.title} data={arr} xKey={c.x} yKey={c.y} />; })}</section>}
    </Shell>
  );
}
