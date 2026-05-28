export const API =
  process.env.NEXT_PUBLIC_TELECOM_API_URL ||
  "https://vicentealtava-mastesto-sionna-api.hf.space";

export async function getApi(path: string) {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  const txt = await res.text();
  let data: unknown;
  try { data = JSON.parse(txt); } catch { data = txt; }
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}: ${txt}`);
  return data;
}

export async function postApi(path: string, payload: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  const txt = await res.text();
  let data: unknown;
  try { data = JSON.parse(txt); } catch { data = txt; }
  if (!res.ok) throw new Error(`POST ${path} failed ${res.status}: ${txt}`);
  return data;
}

export function readBus() {
  try { return JSON.parse(localStorage.getItem("mastesto-level2-bus") || "{}"); }
  catch { return {}; }
}

export function writeBus(key: string, payload: unknown, result: unknown) {
  const bus = readBus();
  bus[key] = { payload, result, updatedAt: new Date().toISOString() };
  bus.meta = { version: "v1300-level2", updatedAt: new Date().toISOString() };
  localStorage.setItem("mastesto-level2-bus", JSON.stringify(bus, null, 2));
  window.dispatchEvent(new CustomEvent("mastesto-level2-bus", { detail: bus }));
  return bus;
}

export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const routes = [
  ["/telecom-level2", "Dashboard"],
  ["/telecom-level2/ai", "IA Pro"],
  ["/telecom-level2/optical", "Óptica"],
  ["/telecom-level2/rf", "RF"],
  ["/telecom-level2/anechoic", "Cámara"],
  ["/telecom-level2/sionna", "Sionna"],
  ["/telecom-level2/electronics", "Electrónica"],
  ["/telecom-level2/dsp", "DSP"],
  ["/telecom-level2/energy", "Energía"],
  ["/telecom-level2/pipeline", "Pipeline"],
  ["/telecom-level2/report", "Informe"],
];

export const endpoints: Record<string, string> = {
  ai: "/telecom/v1300/ai/generate",
  optical: "/telecom/v1300/optical/run",
  rf: "/telecom/v1300/rf/run",
  anechoic: "/telecom/v1300/anechoic/run",
  sionna: "/telecom/v1300/sionna/run",
  electronics: "/telecom/v1300/electronics/run",
  dsp: "/telecom/v1300/dsp/run",
  energy: "/telecom/v1300/energy/run",
  pipeline: "/telecom/v1300/pipeline/run",
};
