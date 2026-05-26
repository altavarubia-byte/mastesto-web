"use client";

import { useMemo, useState } from "react";
import type {
  ActionLogItem,
  ApiCallResult,
  ChartSample,
  ComplexValue,
  ExtractedMetrics,
  FekoTemplateMap,
  JsonObject,
  JsonValue,
  PatternPoint,
} from "@/lib/feko-lab/types";
import { callRfApi, DEFAULT_RF_API, downloadText, prettyJson, safeJsonParse } from "@/lib/feko-lab/api";
import { Concept3DViewer, HeatmapGrid, MiniLineChart, PolarPattern } from "./FekoLabCharts";
import { ActionLog, JsonViewer, MarkdownPanel, MetricsGrid, StatusPill } from "./FekoLabPanels";

const DEFAULT_PAYLOAD: JsonObject = {
  problemType: "antenna",
  antennaType: "dipole",
  geometryClass: "dipole",
  frecuenciaGHz: 2.45,
  geometry: {
    lengthLambda: 0.48,
    radiusLambda: 0.002,
    nSegments: 61,
  },
  port: {
    z0Ohm: 50,
    feedMode: "center_delta_gap",
  },
  requirements: {
    needZin: true,
    needFarfield: true,
    needBandwidth: true,
    accuracy: "high",
  },
  farfield: {
    include: true,
    thetaStepDeg: 10,
    phiStepDeg: 20,
  },
};

const TABS = ["dashboard", "solver", "post", "validation", "exports", "backend", "raw"] as const;
type TabId = (typeof TABS)[number];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asJsonObject(value: unknown): JsonObject {
  return isObject(value) ? (value as JsonObject) : {};
}

function getNestedObject(root: unknown, keys: string[]): Record<string, unknown> | undefined {
  let cur: unknown = root;
  for (const key of keys) {
    if (!isObject(cur)) return undefined;
    cur = cur[key];
  }
  return isObject(cur) ? cur : undefined;
}

function findFirstObjectWithKey(root: unknown, key: string, maxDepth = 8): Record<string, unknown> | undefined {
  if (maxDepth < 0) return undefined;
  if (isObject(root) && key in root) return root;
  if (isObject(root)) {
    for (const value of Object.values(root)) {
      const found = findFirstObjectWithKey(value, key, maxDepth - 1);
      if (found) return found;
    }
  }
  if (Array.isArray(root)) {
    for (const value of root) {
      const found = findFirstObjectWithKey(value, key, maxDepth - 1);
      if (found) return found;
    }
  }
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractResultRoot(data: unknown): Record<string, unknown> {
  const direct = findFirstObjectWithKey(data, "s11Db") || findFirstObjectWithKey(data, "farfield") || findFirstObjectWithKey(data, "model");
  return direct || asJsonObject(data);
}

function extractPattern(data: unknown): PatternPoint[] {
  const ff = findFirstObjectWithKey(data, "pattern");
  const pattern = ff?.pattern;
  if (!Array.isArray(pattern)) return [];
  return pattern.filter(isObject).map((p) => ({
    thetaDeg: numberValue(p.thetaDeg),
    phiDeg: numberValue(p.phiDeg),
    directivityDb: numberValue(p.directivityDb),
    gainDb: numberValue(p.gainDb),
    rhcpDb: numberValue(p.rhcpDb),
    lhcpDb: numberValue(p.lhcpDb),
    uRel: numberValue(p.uRel),
    EthetaRe: numberValue(p.EthetaRe),
    EthetaIm: numberValue(p.EthetaIm),
    EphiRe: numberValue(p.EphiRe),
    EphiIm: numberValue(p.EphiIm),
  }));
}

function extractMetrics(data: unknown): ExtractedMetrics {
  const root = extractResultRoot(data);
  const farfield = findFirstObjectWithKey(data, "directivityMaxDb");
  const zinObj = root.zinOhm;
  const zin = isObject(zinObj)
    ? ({
        re: numberValue(zinObj.re),
        im: numberValue(zinObj.im),
        abs: numberValue(zinObj.abs),
      } satisfies ComplexValue)
    : undefined;
  const quality = findFirstObjectWithKey(data, "qualityScore");

  return {
    ok: typeof root.ok === "boolean" ? root.ok : undefined,
    model: stringValue(root.model),
    solverClass: stringValue(root.solverClass),
    s11Db: numberValue(root.s11Db),
    vswr: numberValue(root.vswr),
    zin,
    directivityMaxDb: numberValue(farfield?.directivityMaxDb),
    thetaMaxDeg: numberValue(farfield?.thetaMaxDeg),
    phiMaxDeg: numberValue(farfield?.phiMaxDeg),
    numPatternPoints: extractPattern(data).length,
    qualityScore: numberValue(quality?.qualityScore),
    confidence: stringValue(quality?.confidence),
  };
}

function extractSamples(data: unknown): ChartSample[] {
  const samplesObj = findFirstObjectWithKey(data, "samples");
  const samples = samplesObj?.samples;
  if (Array.isArray(samples)) {
    return samples.filter(isObject).map((s, index) => ({
      label: String(s.frecuenciaGHz ?? s.frequencyHz ?? index),
      x: numberValue(s.frecuenciaGHz) ?? numberValue(s.frequencyHz) ?? index,
      s11Db: numberValue(s.s11Db),
      vswr: numberValue(s.vswr),
      value: numberValue(s.transferAbs) ?? numberValue(s.value),
    }));
  }

  const metrics = extractMetrics(data);
  return [
    {
      label: "actual",
      x: 0,
      s11Db: metrics.s11Db,
      vswr: metrics.vswr,
      value: metrics.directivityMaxDb,
    },
  ];
}

function extractMarkdown(data: unknown): string | undefined {
  const obj = findFirstObjectWithKey(data, "markdown");
  return stringValue(obj?.markdown);
}

function extractHeatmap(data: unknown): number[][] | undefined {
  const slices = findFirstObjectWithKey(data, "EabsCenterXY");
  const matrix = slices?.EabsCenterXY;
  if (!Array.isArray(matrix)) return undefined;
  const rows: number[][] = [];
  for (const row of matrix) {
    if (Array.isArray(row)) {
      rows.push(row.map((v) => (typeof v === "number" ? v : 0)));
    }
  }
  return rows;
}

function getAntennaType(payload: JsonObject): string {
  const a = payload.antennaType;
  const s = payload.surfaceType;
  if (typeof a === "string") return a;
  if (typeof s === "string") return s;
  return "dipole";
}

function buttonClass(kind: "primary" | "secondary" | "danger" = "secondary") {
  if (kind === "primary") {
    return "rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-orange-300 disabled:opacity-40";
  }
  if (kind === "danger") {
    return "rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/20 disabled:opacity-40";
  }
  return "rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-orange-500/60 hover:text-orange-200 disabled:opacity-40";
}

export default function FekoLabClient() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_RF_API);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [payloadText, setPayloadText] = useState(prettyJson(DEFAULT_PAYLOAD));
  const [lastResult, setLastResult] = useState<JsonValue>({ ok: true, message: "FEKO Lab listo." });
  const [health, setHealth] = useState<JsonValue | null>(null);
  const [templates, setTemplates] = useState<FekoTemplateMap>({});
  const [selectedTemplate, setSelectedTemplate] = useState("wifi_dipole_245");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ActionLogItem[]>([]);

  const parsedPayload = useMemo(() => safeJsonParse(payloadText), [payloadText]);
  const currentPayload = parsedPayload.ok ? parsedPayload.value : DEFAULT_PAYLOAD;
  const metrics = useMemo(() => extractMetrics(lastResult), [lastResult]);
  const pattern = useMemo(() => extractPattern(lastResult), [lastResult]);
  const samples = useMemo(() => extractSamples(lastResult), [lastResult]);
  const markdown = useMemo(() => extractMarkdown(lastResult), [lastResult]);
  const heatmap = useMemo(() => extractHeatmap(lastResult), [lastResult]);

  async function runAction(label: string, endpoint: string, payload?: JsonObject, method?: "GET" | "POST") {
    setLoading(true);
    const res: ApiCallResult = await callRfApi(baseUrl, endpoint, payload, method);
    setLastResult(res.data);
    setLogs((prev) => [
      {
        id: `${Date.now()}-${label}`,
        label,
        endpoint,
        ok: res.ok,
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setLoading(false);
    return res;
  }

  async function loadHealth() {
    const res = await runAction("Health", "/rf/health", undefined, "GET");
    setHealth(res.data);
  }

  async function loadTemplates() {
    const res = await runAction("Templates", "/rf/v500/templates/list", undefined, "GET");
    const obj = asJsonObject(res.data);
    const t = obj.templates;
    if (isObject(t)) {
      setTemplates(t as FekoTemplateMap);
      const first = Object.keys(t)[0];
      if (first) setSelectedTemplate(first);
    }
  }

  function applySelectedTemplate() {
    const selected = templates[selectedTemplate];
    if (selected) {
      setPayloadText(prettyJson(selected));
      setActiveTab("solver");
    }
  }

  function setQuickTemplate(kind: string) {
    const payload: JsonObject =
      kind === "helix"
        ? {
            antennaType: "helix",
            geometryClass: "helix",
            frecuenciaGHz: 2.45,
            geometry: {
              turns: 7,
              radiusLambda: 0.159154943,
              pitchLambda: 0.25,
              wireRadiusLambda: 0.0075,
              polarization: "RHCP",
            },
            requirements: { needZin: true, needFarfield: true, accuracy: "high" },
            farfield: { include: true, thetaStepDeg: 10, phiStepDeg: 20 },
          }
        : kind === "plate"
          ? {
              surfaceType: "rectangular_plate",
              geometryClass: "rectangular_plate",
              frecuenciaGHz: 2.45,
              mesh: { widthLambda: 1.0, heightLambda: 0.6, nx: 10, ny: 8 },
              excitation: { type: "plane_wave", direction: [0, 0, -1], polarization: [1, 0, 0], amplitude: 1 },
              farfield: { include: true, thetaStepDeg: 10, phiStepDeg: 20 },
            }
          : kind === "fdtd"
            ? {
                frecuenciaGHz: 2.45,
                geometryClass: "dielectric",
                hasDielectric: true,
                needNearfield: true,
                needBroadband: true,
                grid: { nx: 42, ny: 42, nz: 42, cellsPerWavelength: 14 },
                time: { nSteps: 220 },
                source: { type: "sine_gaussian", component: "Ez", position: [21, 21, 21] },
                probe: { position: [28, 21, 21], component: "Ez" },
                boundaries: { type: "pml", thickness: 8 },
                outputs: { fieldSlices: true, energyTrace: true, nf2ff: true, signals: true },
              }
            : DEFAULT_PAYLOAD;
    setPayloadText(prettyJson(payload));
  }

  async function reportDownload() {
    const payload: JsonObject = {
      title: "FEKO Lab Technical Report",
      strategy: asJsonObject(lastResult),
      result: extractResultRoot(lastResult) as JsonObject,
      validation: {},
    };
    const res = await runAction("Informe v300", "/rf/v300/report/final", payload);
    const md = extractMarkdown(res.data);
    if (md) downloadText("feko_lab_report.md", md, "text/markdown;charset=utf-8");
  }

  async function exportSionna() {
    const payload: JsonObject = {
      result: asJsonObject(lastResult),
      antennaName: "mastesto_feko_lab",
      polarization: "V",
    };
    await runAction("Sionna export", "/rf/v500/sionna/export", payload);
  }

  async function exportJson() {
    downloadText("feko_lab_result.json", prettyJson(lastResult), "application/json;charset=utf-8");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[radial-gradient(circle_at_top,#431407_0,#09090b_42%,#000_100%)]">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">+TESTO RF Engine v500</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase italic tracking-tight text-white sm:text-6xl">
                FEKO Lab
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
                Frontend profesional para controlar tu backend FEKO-like: solver, estrategia, validación,
                postproceso, exportación, Sionna, informes y diagnóstico.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/50 p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">API URL</p>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full min-w-[320px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <button disabled={loading} onClick={loadHealth} className={buttonClass("secondary")}>Health</button>
            <button disabled={loading} onClick={loadTemplates} className={buttonClass("secondary")}>Cargar templates</button>
            <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("Estrategia v300", "/rf/v300/strategy/recommend", currentPayload)} className={buttonClass("primary")}>Estrategia</button>
            <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("Resolver v500", "/rf/v500/solve", currentPayload)} className={buttonClass("primary")}>Resolver v500</button>
            <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("FEKO-like project", "/rf/v200/feko-like/solve-project", currentPayload)} className={buttonClass("secondary")}>Solve Project</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em]",
                activeTab === tab
                  ? "border-orange-400 bg-orange-500 text-black"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {!parsedPayload.ok && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            JSON inválido: {parsedPayload.error}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Concept3DViewer antennaType={getAntennaType(currentPayload)} pattern={pattern} />
              <MetricsGrid metrics={metrics} />
              <div className="grid gap-6 lg:grid-cols-2">
                <MiniLineChart title="S11" samples={samples} yKey="s11Db" unit="dB" />
                <MiniLineChart title="VSWR" samples={samples} yKey="vswr" />
              </div>
            </div>
            <div className="space-y-6">
              <PolarPattern pattern={pattern} />
              <ActionLog logs={logs} />
              <JsonViewer title="Backend health" value={health || { message: "Pulsa Health." }} />
            </div>
          </div>
        )}

        {activeTab === "solver" && (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Templates rápidos</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  <button onClick={() => setQuickTemplate("dipole")} className={buttonClass("secondary")}>Dipolo</button>
                  <button onClick={() => setQuickTemplate("helix")} className={buttonClass("secondary")}>Hélice</button>
                  <button onClick={() => setQuickTemplate("plate")} className={buttonClass("secondary")}>Placa</button>
                  <button onClick={() => setQuickTemplate("fdtd")} className={buttonClass("secondary")}>FDTD</button>
                </div>
                <div className="mt-4 flex gap-2">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-3 py-3 text-xs text-zinc-200 outline-none"
                  >
                    {Object.keys(templates).length === 0 ? (
                      <option>Sin templates cargados</option>
                    ) : (
                      Object.keys(templates).map((key) => <option key={key}>{key}</option>)
                    )}
                  </select>
                  <button onClick={applySelectedTemplate} className={buttonClass("primary")}>Aplicar</button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Payload JSON</p>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  spellCheck={false}
                  className="h-[560px] w-full resize-none rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v20 NEC solve", "/rf/v20/solve", currentPayload)} className={buttonClass("secondary")}>v20 Wire</button>
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v30 RWG solve", "/rf/v30/surface/solve", currentPayload)} className={buttonClass("secondary")}>v30 Surface</button>
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v40 FDTD solve", "/rf/v40/fdtd/solve", currentPayload)} className={buttonClass("secondary")}>v40 FDTD</button>
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v60 EM solve", "/rf/v60/em/solve", currentPayload)} className={buttonClass("secondary")}>v60 EM</button>
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v100 Wire Pro", "/rf/v100/solve/wire-pro", currentPayload)} className={buttonClass("secondary")}>Wire Pro</button>
                <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v100 Surface Pro", "/rf/v100/solve/surface-pro", currentPayload)} className={buttonClass("secondary")}>Surface Pro</button>
              </div>
              <MetricsGrid metrics={metrics} />
              <JsonViewer title="Último resultado" value={lastResult} />
            </div>
          </div>
        )}

        {activeTab === "post" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <PolarPattern pattern={pattern} title="Radiación / Directividad" />
              <HeatmapGrid matrix={heatmap} title="Near-field / FDTD" />
            </div>
            <div className="space-y-6">
              <button onClick={() => runAction("PostFEKO summary", "/rf/v200/post/summary", { result: asJsonObject(lastResult) })} className={buttonClass("primary")}>PostFEKO Summary</button>
              <MarkdownPanel markdown={markdown} />
              <JsonViewer title="Post JSON" value={lastResult} />
            </div>
          </div>
        )}

        {activeTab === "validation" && (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v20 validate", "/rf/v20/validate", currentPayload)} className={buttonClass("secondary")}>Validar v20</button>
              <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v30 validate", "/rf/v30/surface/validate", currentPayload)} className={buttonClass("secondary")}>Validar v30</button>
              <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("v40 validate", "/rf/v40/fdtd/validate", currentPayload)} className={buttonClass("secondary")}>Validar v40</button>
              <button disabled={loading || !parsedPayload.ok} onClick={() => runAction("Quality gates", "/rf/v300/quality/gates", { result: asJsonObject(lastResult) })} className={buttonClass("primary")}>Quality Gates</button>
              <button disabled={loading} onClick={() => runAction("Regression", "/rf/v500/regression/run", { runSolvers: false })} className={buttonClass("primary")}>Regression</button>
              <button disabled={loading} onClick={() => runAction("Acceptance", "/rf/v500/acceptance/final", { backend_deploys: true, health_ok: true, routes_visible: true, limitations_documented: true })} className={buttonClass("secondary")}>Acceptance</button>
            </div>
            <JsonViewer title="Validación" value={lastResult} />
          </div>
        )}

        {activeTab === "exports" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <button onClick={reportDownload} className={buttonClass("primary")}>Generar/descargar informe MD</button>
              <button onClick={exportJson} className={buttonClass("secondary")}>Descargar JSON resultado</button>
              <button onClick={exportSionna} className={buttonClass("secondary")}>Exportar a Sionna</button>
              <button
                onClick={() =>
                  runAction("Touchstone S1P", "/rf/v100/export/s1p", {
                    samples: samples.map((s) => ({
                      label: s.label,
                      x: s.x,
                      s11Db: s.s11Db ?? null,
                      vswr: s.vswr ?? null,
                      value: s.value ?? null,
                      frequencyHz: s.x > 1e6 ? s.x : null,
                      frecuenciaGHz: s.x <= 1000 ? s.x : null,
                    })),
                    z0Ohm: 50,
                  })
                }
                className={buttonClass("secondary")}
              >
                Generar S1P
              </button>
              <button
                onClick={() =>
                  runAction("CSV", "/rf/v100/export/csv", {
                    rows: samples.map((s) => ({
                      label: s.label,
                      x: s.x,
                      s11Db: s.s11Db ?? null,
                      vswr: s.vswr ?? null,
                      value: s.value ?? null,
                    })),
                  })
                }
                className={buttonClass("secondary")}
              >
                Generar CSV
              </button>
              <button onClick={() => runAction("Pattern JSON", "/rf/v100/export/pattern", { result: asJsonObject(lastResult) })} className={buttonClass("secondary")}>Pattern JSON</button>
            </div>
            <JsonViewer title="Export result" value={lastResult} />
          </div>
        )}

        {activeTab === "backend" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <button onClick={() => runAction("v500 status", "/rf/v500/status", undefined, "GET")} className={buttonClass("secondary")}>v500 Status</button>
              <button onClick={() => runAction("v300 status", "/rf/v300/status", undefined, "GET")} className={buttonClass("secondary")}>v300 Status</button>
              <button onClick={() => runAction("v200 status", "/rf/v200/feko-like/status", undefined, "GET")} className={buttonClass("secondary")}>v200 Status</button>
              <button onClick={() => runAction("Routes", "/rf/debug/routes", undefined, "GET")} className={buttonClass("secondary")}>Routes</button>
              <button onClick={() => runAction("Import errors", "/rf/debug/import-errors", undefined, "GET")} className={buttonClass("danger")}>Import Errors</button>
              <button onClick={() => runAction("Frontend schema", "/rf/v500/frontend/schema", undefined, "GET")} className={buttonClass("secondary")}>Frontend Schema</button>
            </div>
            <JsonViewer title="Backend data" value={lastResult} />
          </div>
        )}

        {activeTab === "raw" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <JsonViewer title="Payload actual" value={currentPayload} />
            <JsonViewer title="Último resultado raw" value={lastResult} />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <StatusPill ok={Boolean(health)} label={health ? "backend conectado" : "backend pendiente"} />
          <StatusPill ok={parsedPayload.ok} label={parsedPayload.ok ? "payload válido" : "payload inválido"} />
          <span>{loading ? "Ejecutando..." : "Listo"}</span>
        </div>
      </section>
    </main>
  );
}
