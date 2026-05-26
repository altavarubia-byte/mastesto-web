"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, loadGlobalScenario, saveModuleScenario, type ModuleKey } from "@/lib/telecomProApi";
import { MODULES } from "./moduleDefaults";

type Props = { moduleKey: ModuleKey };

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function setNested(obj: any, path: string, value: unknown) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] ??= {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export default function ModuleLabPro({ moduleKey }: Props) {
  const config = MODULES[moduleKey];
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [prompt, setPrompt] = useState(`Configura ${config.title} en modo profesional`);
  const [payload, setPayload] = useState<any>(clone(config.defaultPayload));
  const [payloadText, setPayloadText] = useState(JSON.stringify(config.defaultPayload, null, 2));
  const [result, setResult] = useState<any>(null);
  const [globalScenario, setGlobalScenario] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = loadGlobalScenario();
    setGlobalScenario(stored);
    if (stored[moduleKey]) {
      setPayload(stored[moduleKey]);
      setPayloadText(JSON.stringify(stored[moduleKey], null, 2));
    }
  }, [moduleKey]);

  const statusCards = useMemo(() => [
    { label: "Modo", value: mode.toUpperCase() },
    { label: "Módulo", value: config.title },
    { label: "Backend", value: "HF SPACE" },
    { label: "MegaProyecto", value: globalScenario[moduleKey] ? "EXPORTADO" : "PENDIENTE" },
  ], [mode, config.title, globalScenario, moduleKey]);

  function updateField(path: string, raw: string, type: "number" | "text" | "select") {
    const next = clone(payload);
    const value = type === "number" ? Number(raw) : raw;
    setNested(next, path, value);
    setPayload(next);
    setPayloadText(JSON.stringify(next, null, 2));
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(payloadText);
      setPayload(parsed);
      setResult({ ok: true, message: "JSON aplicado correctamente", payload: parsed });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    }
  }

  function exportToMega() {
    saveModuleScenario(moduleKey, payload);
    const updated = loadGlobalScenario();
    setGlobalScenario(updated);
    setResult({ ok: true, message: `${config.title} exportado al MegaProyecto`, globalScenario: updated });
  }

  async function generateWithAI() {
    setLoading(true);
    try {
      const data: any = await apiPost("/telecom/v500000000/manual-ai/generate", {
        module: config.aiModule,
        prompt,
        level: "pro",
      });
      const generated = data?.payload ?? data;
      setPayload(generated);
      setPayloadText(JSON.stringify(generated, null, 2));
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function runEndpoint(method: "GET" | "POST", path: string, endpointPayload?: unknown) {
    setLoading(true);
    try {
      const body = endpointPayload ?? payload;
      const data = method === "GET" ? await apiGet(path) : await apiPost(path, body);
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, endpoint: path, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function runUltimateWithThisModule() {
    setLoading(true);
    try {
      const scenario = { ...loadGlobalScenario(), [moduleKey]: payload };
      const data = await apiPost("/telecom/v500000000/scenario/ultimate", scenario);
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Mastesto Engineering Platform</p>
              <h1 className="mt-3 text-4xl font-black uppercase italic md:text-6xl">{config.title}</h1>
              <p className="mt-4 max-w-4xl text-zinc-400">{config.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/mega-telecom-lab" className="rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-xs font-black uppercase text-black">
                Ver MegaProyecto
              </Link>
              <button onClick={exportToMega} className="rounded-full border border-zinc-700 bg-black px-4 py-2 text-xs font-black uppercase text-white">
                Exportar al MegaProyecto
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {statusCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{card.label}</p>
              <p className="mt-2 text-lg font-black text-white">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode("manual")} className={`rounded-xl px-4 py-3 text-xs font-black uppercase ${mode === "manual" ? "bg-orange-500 text-black" : "bg-black text-zinc-400"}`}>Manual</button>
              <button onClick={() => setMode("ai")} className={`rounded-xl px-4 py-3 text-xs font-black uppercase ${mode === "ai" ? "bg-orange-500 text-black" : "bg-black text-zinc-400"}`}>IA</button>
            </div>

            {mode === "ai" ? (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Prompt IA del módulo</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="h-36 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-zinc-300 outline-none" />
                <button disabled={loading} onClick={generateWithAI} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase text-black">
                  {loading ? "Generando..." : "Generar payload con IA"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Parámetros rápidos</p>
                {config.fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-xs font-bold text-zinc-400">{field.label}</span>
                    {field.type === "select" ? (
                      <select value={String(getNested(payload, field.key) ?? "")} onChange={(e) => updateField(field.key, e.target.value, field.type)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none">
                        {field.options?.map((op) => <option key={op} value={op}>{op}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} value={String(getNested(payload, field.key) ?? "")} onChange={(e) => updateField(field.key, e.target.value, field.type)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white outline-none" />
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <button onClick={exportToMega} className="w-full rounded-xl border border-emerald-700 bg-emerald-950 px-4 py-3 text-xs font-black uppercase text-emerald-200">
                Guardar módulo en escenario global
              </button>
              <button onClick={runUltimateWithThisModule} className="w-full rounded-xl border border-sky-700 bg-sky-950 px-4 py-3 text-xs font-black uppercase text-sky-200">
                Simular escenario global con este módulo
              </button>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-black uppercase italic">Editor JSON avanzado</h2>
                <button onClick={applyJson} className="rounded-xl bg-white px-4 py-2 text-xs font-black uppercase text-black">Aplicar JSON</button>
              </div>
              <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} className="mt-4 h-[360px] w-full rounded-2xl border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300 outline-none" />
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-2xl font-black uppercase italic">Acciones del backend</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {config.endpoints.map((ep) => (
                  <button key={ep.label} disabled={loading} onClick={() => runEndpoint(ep.method, ep.path, ep.defaultPayload)} className="rounded-2xl border border-zinc-800 bg-black p-4 text-left hover:border-orange-500">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-400">{ep.method}</p>
                    <p className="mt-1 font-black text-white">{ep.label}</p>
                    <p className="mt-1 break-all text-xs text-zinc-500">{ep.path}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-2xl font-black uppercase italic">Resultado</h2>
          <pre className="mt-4 max-h-[560px] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
            {JSON.stringify(result ?? { info: "Ejecuta un endpoint o exporta el módulo al MegaProyecto." }, null, 2)}
          </pre>
        </section>
      </section>
    </main>
  );
}
