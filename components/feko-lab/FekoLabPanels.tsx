"use client";

import type { ActionLogItem, ExtractedMetrics, JsonValue } from "@/lib/feko-lab/types";
import { prettyJson } from "@/lib/feko-lab/api";

export function StatusPill({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-900 text-zinc-400",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  suffix,
  tone = "normal",
}: {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  tone?: "normal" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-orange-300"
        : "text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>
        {value === null || value === undefined || value === "" ? "—" : value}
        {value !== null && value !== undefined && suffix ? <span className="ml-1 text-sm text-zinc-500">{suffix}</span> : null}
      </p>
    </div>
  );
}

export function MetricsGrid({ metrics }: { metrics: ExtractedMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="S11" value={metrics.s11Db?.toFixed(2)} suffix="dB" tone={metrics.s11Db !== undefined && metrics.s11Db <= -10 ? "good" : "warn"} />
      <MetricCard label="VSWR" value={metrics.vswr?.toFixed(2)} tone={metrics.vswr !== undefined && metrics.vswr <= 2 ? "good" : "warn"} />
      <MetricCard label="Zin Re" value={metrics.zin?.re?.toFixed(2)} suffix="Ω" />
      <MetricCard label="Zin Im" value={metrics.zin?.im?.toFixed(2)} suffix="Ω" />
      <MetricCard label="Directividad" value={metrics.directivityMaxDb?.toFixed(2)} suffix="dB" />
      <MetricCard label="θ max" value={metrics.thetaMaxDeg?.toFixed(0)} suffix="º" />
      <MetricCard label="Puntos patrón" value={metrics.numPatternPoints} />
      <MetricCard label="Confianza" value={metrics.confidence || metrics.qualityScore?.toFixed(2)} />
    </div>
  );
}

export function JsonViewer({ title, value }: { title: string; value: JsonValue | unknown }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black">
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{title}</p>
      </div>
      <pre className="max-h-[560px] overflow-auto p-4 text-xs leading-relaxed text-zinc-300">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

export function ActionLog({ logs }: { logs: ActionLogItem[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Historial</p>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no has lanzado acciones.</p>
        ) : (
          logs.slice(0, 10).map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-xl border border-zinc-900 bg-black/50 px-3 py-2">
              <div>
                <p className="text-xs font-bold text-zinc-200">{log.label}</p>
                <p className="text-[10px] text-zinc-600">{log.endpoint}</p>
              </div>
              <StatusPill ok={log.ok} label={log.ok ? "ok" : "error"} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function MarkdownPanel({ markdown }: { markdown?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Informe Markdown</p>
      <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap rounded-xl bg-black p-4 text-xs leading-relaxed text-zinc-300">
        {markdown || "Genera un informe para verlo aquí."}
      </pre>
    </div>
  );
}
