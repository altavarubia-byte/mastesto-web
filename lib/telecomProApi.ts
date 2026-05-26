export const TELECOM_API =
  process.env.NEXT_PUBLIC_TELECOM_API_URL ||
  "https://vicentealtava-mastesto-sionna-api.hf.space";

export async function apiGet(path: string) {
  const res = await fetch(`${TELECOM_API}${path}`, { cache: "no-store" });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}: ${text}`);
  return data;
}

export async function apiPost(path: string, payload: unknown) {
  const res = await fetch(`${TELECOM_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`POST ${path} failed ${res.status}: ${text}`);
  return data;
}

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

export function loadGlobalScenario(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("mastesto_telecom_global_scenario") || "{}");
  } catch {
    return {};
  }
}

export function saveModuleScenario(module: ModuleKey, payload: unknown) {
  if (typeof window === "undefined") return;
  const current = loadGlobalScenario();
  const next = { ...current, [module]: payload };
  localStorage.setItem("mastesto_telecom_global_scenario", JSON.stringify(next, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-telecom-scenario-updated", { detail: next }));
}

export function saveGlobalScenario(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mastesto_telecom_global_scenario", JSON.stringify(payload, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-telecom-scenario-updated", { detail: payload }));
}
