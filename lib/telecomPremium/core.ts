export const TELECOM_API =
  process.env.NEXT_PUBLIC_TELECOM_API_URL ||
  "https://vicentealtava-mastesto-sionna-api.hf.space";

export type ModuleKey =
  | "rf"
  | "sionna"
  | "optical"
  | "dsp"
  | "electronics"
  | "energy"
  | "iot"
  | "transmissionLines"
  | "industrial";

export type EndpointDef = {
  label: string;
  method: "GET" | "POST";
  path: string;
  payloadMode?: "current" | "global" | "custom";
  payload?: unknown;
};

export type FieldDef = {
  path: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "textarea";
  options?: string[];
  unit?: string;
};

const SCENARIO_KEY = "mastesto_premium_3d_global_scenario";
const HISTORY_KEY = "mastesto_premium_3d_history";

export async function apiGet(path: string) {
  const res = await fetch(`${TELECOM_API}${path}`, { cache: "no-store" });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}: ${text}`);
  return data;
}

export async function apiPost(path: string, payload: unknown) {
  const res = await fetch(`${TELECOM_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`POST ${path} failed ${res.status}: ${text}`);
  return data;
}

export async function runEndpoint(endpoint: EndpointDef, currentPayload: unknown) {
  let payload = currentPayload;
  if (endpoint.payloadMode === "custom") payload = endpoint.payload;
  if (endpoint.payloadMode === "global") payload = getScenario();
  if (endpoint.method === "GET") return apiGet(endpoint.path);
  return apiPost(endpoint.path, payload);
}

function keyOf(part: string): string | number {
  const numeric = Number(part);
  return Number.isInteger(numeric) && String(numeric) === part ? numeric : part;
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function getPath(obj: any, path: string) {
  return path.split(".").reduce((acc, p) => acc?.[keyOf(p)], obj);
}

export function setPath(obj: any, path: string, raw: string, type: string) {
  const next = clone(obj);
  let value: unknown = raw;
  if (type === "number") value = Number(raw);
  if (type === "boolean") value = raw === "true";
  const parts = path.split(".");
  let cur = next as any;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = keyOf(parts[i]);
    if (cur[key] === undefined || cur[key] === null) {
      cur[key] = Number.isInteger(Number(parts[i + 1])) ? [] : {};
    }
    cur = cur[key];
  }
  cur[keyOf(parts[parts.length - 1])] = value;
  return next;
}

export function getScenario(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SCENARIO_KEY) || "{}"); }
  catch { return {}; }
}

export function saveScenario(scenario: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const next = {
    ...scenario,
    meta: {
      ...(scenario.meta as object || {}),
      version: "premium-3d-recharts",
      updatedAt: new Date().toISOString(),
    },
  };
  localStorage.setItem(SCENARIO_KEY, JSON.stringify(next, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-premium-scenario", { detail: next }));
}

export function exportModule(module: ModuleKey, payload: unknown) {
  const next = { ...getScenario(), [module]: payload };
  saveScenario(next);
  pushHistory({ type: "export-module", module, payload });
  return next;
}

export function clearScenario() {
  saveScenario({});
  pushHistory({ type: "clear-scenario" });
}

export function pushHistory(entry: unknown) {
  if (typeof window === "undefined") return;
  const current = getHistory();
  const next = [{ at: new Date().toISOString(), entry }, ...current].slice(0, 150);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-premium-history", { detail: next }));
}

export function getHistory(): Array<{ at: string; entry: unknown }> {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

export function getModuleKeys(scenario: Record<string, unknown>) {
  return Object.keys(scenario).filter((k) => k !== "meta");
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function rfSweep(payload: any) {
  const f0 = Number(payload.frecuenciaGHz ?? 2.45);
  const start = Number(payload.sweep?.fStartGHz ?? 2.0);
  const stop = Number(payload.sweep?.fStopGHz ?? 3.0);
  const points = 81;
  return Array.from({ length: points }, (_, i) => {
    const f = start + (stop - start) * i / (points - 1);
    const s11 = -4 - 30 * Math.exp(-Math.pow((f - f0) / 0.08, 2));
    const gamma = Math.pow(10, s11 / 20);
    const vswr = (1 + gamma) / Math.max(0.001, 1 - gamma);
    return {
      f: Number(f.toFixed(3)),
      s11: Number(s11.toFixed(2)),
      vswr: Number(vswr.toFixed(2)),
      gain: Number((2.5 + 5 * Math.exp(-Math.pow((f - f0) / 0.35, 2))).toFixed(2)),
    };
  });
}

export function dspSignal(payload: any) {
  const f = Number(payload.signal?.frequencyHz ?? 1000);
  const fs = Number(payload.signal?.fs ?? 16000);
  return Array.from({ length: 128 }, (_, i) => {
    const t = i / fs;
    return {
      n: i,
      wave: Math.sin(2 * Math.PI * f * t * 80),
      fft: 80 * Math.exp(-Math.pow((i - 32) / 10, 2)) + 8 * Math.sin(i / 4),
    };
  });
}

export function energyProfile(payload: any) {
  const pv = Number(payload.pv?.areaM2 ?? 30) * Number(payload.pv?.irradianceWm2 ?? 850) * Number(payload.pv?.efficiency ?? 0.2) / 1000;
  const load = Number(payload.grid?.loadKW ?? 4);
  return Array.from({ length: 24 }, (_, h) => {
    const solar = Math.max(0, Math.sin((h - 6) / 12 * Math.PI)) * pv;
    const demand = load + (h > 8 && h < 20 ? 1 : -0.5);
    return {
      h,
      pv: Number(solar.toFixed(2)),
      load: Number(demand.toFixed(2)),
      battery: Number((50 + 30 * Math.sin((h - 4) / 24 * Math.PI * 2)).toFixed(1)),
    };
  });
}
