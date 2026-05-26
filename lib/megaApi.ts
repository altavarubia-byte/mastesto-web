const API_URL = process.env.NEXT_PUBLIC_TELECOM_API_URL || "http://localhost:7860";

export async function megaGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}`);
  return res.json();
}

export async function megaPost(path: string, payload: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST ${path} failed ${res.status}`);
  return res.json();
}
