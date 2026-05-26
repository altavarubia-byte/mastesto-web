import type { ApiCallResult, JsonObject, JsonValue } from "./types";

export const DEFAULT_RF_API =
  process.env.NEXT_PUBLIC_RF_ENGINE_API_URL ||
  "https://vicentealtava-mastesto-sionna-api.hf.space";

function cleanBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function callRfApi(
  baseUrl: string,
  endpoint: string,
  payload?: JsonObject,
  method?: "GET" | "POST"
): Promise<ApiCallResult> {
  const httpMethod = method || (payload ? "POST" : "GET");
  const url = `${cleanBaseUrl(baseUrl)}${endpoint}`;

  try {
    const res = await fetch(url, {
      method: httpMethod,
      headers:
        httpMethod === "POST"
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
      body: httpMethod === "POST" ? JSON.stringify(payload || {}) : undefined,
      cache: "no-store",
    });

    const text = await res.text();
    let data: JsonValue;
    try {
      data = JSON.parse(text) as JsonValue;
    } catch {
      data = { ok: false, rawText: text };
    }

    return {
      ok: res.ok,
      endpoint,
      data,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      endpoint,
      data: { ok: false, error: error instanceof Error ? error.message : String(error) },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function safeJsonParse(text: string): { ok: true; value: JsonObject } | { ok: false; error: string } {
  try {
    const value = JSON.parse(text) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return { ok: true, value: value as JsonObject };
    }
    return { ok: false, error: "El JSON debe ser un objeto." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
