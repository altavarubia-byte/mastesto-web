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

export type TelecomProject = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  scenario: Record<string, unknown>;
  tags?: string[];
};

const SCENARIO_KEY = "mastesto_final_vinf_global_scenario";
const HISTORY_KEY = "mastesto_final_vinf_history";
const PROJECTS_KEY = "mastesto_final_vinf_projects";

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
      version: "final-productivo-vinf",
      updatedAt: new Date().toISOString(),
    },
  };
  localStorage.setItem(SCENARIO_KEY, JSON.stringify(next, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-final-scenario", { detail: next }));
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
  window.dispatchEvent(new CustomEvent("mastesto-final-history", { detail: next }));
}

export function getHistory(): Array<{ at: string; entry: unknown }> {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

export function getProjects(): TelecomProject[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); }
  catch { return []; }
}

export function saveProject(name: string, description = "") {
  const now = new Date().toISOString();
  const project: TelecomProject = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    scenario: getScenario(),
    tags: ["local", "telecom", "vinf"],
  };
  const next = [project, ...getProjects()].slice(0, 60);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next, null, 2));
  pushHistory({ type: "save-project", project });
  window.dispatchEvent(new CustomEvent("mastesto-final-projects", { detail: next }));
  return project;
}

export function loadProject(id: string) {
  const p = getProjects().find((x) => x.id === id);
  if (!p) return null;
  saveScenario(p.scenario);
  pushHistory({ type: "load-project", id });
  return p;
}

export function deleteProject(id: string) {
  const next = getProjects().filter((x) => x.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next, null, 2));
  pushHistory({ type: "delete-project", id });
  window.dispatchEvent(new CustomEvent("mastesto-final-projects", { detail: next }));
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

export function getModuleKeys(scenario: Record<string, unknown>) {
  return Object.keys(scenario).filter((k) => k !== "meta");
}
