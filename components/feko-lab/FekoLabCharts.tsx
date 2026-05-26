"use client";

import type { ChartSample, PatternPoint } from "@/lib/feko-lab/types";

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function MiniLineChart({
  title,
  samples,
  yKey,
  unit,
}: {
  title: string;
  samples: ChartSample[];
  yKey: "s11Db" | "vswr" | "value";
  unit?: string;
}) {
  const width = 520;
  const height = 180;
  const pad = 28;
  const values = samples.map((s) => finiteNumber(s[yKey], 0));
  const xs = samples.map((s) => finiteNumber(s.x, 0));
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...values, 0);
  const maxY = Math.max(...values, 1);
  const spanX = Math.max(maxX - minX, 1e-9);
  const spanY = Math.max(maxY - minY, 1e-9);

  const points = samples
    .map((s) => {
      const x = pad + ((finiteNumber(s.x, 0) - minX) / spanX) * (width - pad * 2);
      const y = height - pad - ((finiteNumber(s[yKey], 0) - minY) / spanY) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{title}</p>
        <p className="text-[10px] uppercase text-zinc-600">
          {samples.length} pts {unit ? `· ${unit}` : ""}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible">
        <rect x="0" y="0" width={width} height={height} rx="14" className="fill-black/40" />
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="stroke-zinc-800" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="stroke-zinc-800" />
        <polyline points={points} fill="none" className="stroke-orange-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {samples.map((s, i) => {
          const x = pad + ((finiteNumber(s.x, 0) - minX) / spanX) * (width - pad * 2);
          const y = height - pad - ((finiteNumber(s[yKey], 0) - minY) / spanY) * (height - pad * 2);
          return <circle key={`${s.label}-${i}`} cx={x} cy={y} r="3" className="fill-orange-300" />;
        })}
        <text x={pad} y={18} className="fill-zinc-500 text-[10px]">
          max {maxY.toFixed(2)}
        </text>
        <text x={pad} y={height - 6} className="fill-zinc-500 text-[10px]">
          min {minY.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}

export function PolarPattern({
  pattern,
  title = "Patrón polar",
}: {
  pattern: PatternPoint[];
  title?: string;
}) {
  const size = 300;
  const center = size / 2;
  const radius = 112;
  const usable = pattern.filter((p) => typeof p.thetaDeg === "number");
  const vals = usable.map((p) => finiteNumber(p.directivityDb ?? p.gainDb ?? p.uRel, -60));
  const min = Math.min(...vals, -40);
  const max = Math.max(...vals, 1);
  const span = Math.max(max - min, 1e-9);

  const pts = usable
    .filter((p) => finiteNumber(p.phiDeg, 0) === 0 || finiteNumber(p.phiDeg, 0) === 180)
    .slice(0, 361)
    .map((p) => {
      const theta = (finiteNumber(p.thetaDeg, 0) * Math.PI) / 180;
      const v = finiteNumber(p.directivityDb ?? p.gainDb ?? p.uRel, min);
      const r = 20 + ((v - min) / span) * radius;
      const x = center + r * Math.sin(theta);
      const y = center - r * Math.cos(theta);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{title}</p>
        <p className="text-[10px] uppercase text-zinc-600">{pattern.length} puntos</p>
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-72 w-72">
        <circle cx={center} cy={center} r={radius} className="fill-black/40 stroke-zinc-800" />
        <circle cx={center} cy={center} r={radius * 0.66} className="fill-none stroke-zinc-900" />
        <circle cx={center} cy={center} r={radius * 0.33} className="fill-none stroke-zinc-900" />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} className="stroke-zinc-900" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} className="stroke-zinc-900" />
        {pts ? (
          <polyline points={pts} fill="none" className="stroke-orange-400" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        ) : (
          <text x={center} y={center} textAnchor="middle" className="fill-zinc-500 text-[12px]">
            Sin patrón
          </text>
        )}
        <text x={center} y={18} textAnchor="middle" className="fill-zinc-500 text-[10px]">
          θ 0º
        </text>
      </svg>
    </div>
  );
}

export function Concept3DViewer({
  antennaType,
  pattern,
}: {
  antennaType: string;
  pattern: PatternPoint[];
}) {
  const directivity = Math.max(
    ...pattern.map((p) => finiteNumber(p.directivityDb ?? p.gainDb, 0)),
    1
  );
  const scale = Math.max(0.65, Math.min(1.5, directivity / 8));

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_center,#27272a_0,#09090b_62%,#000_100%)] p-6">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">FEKO-like 3D</p>
          <h3 className="mt-2 text-2xl font-black uppercase italic text-white">{antennaType || "RF Object"}</h3>
        </div>
        <div className="rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-200">
          D≈{directivity.toFixed(2)} dB
        </div>
      </div>

      <div className="relative z-10 mt-10 flex h-56 items-center justify-center">
        <div
          className="absolute h-44 w-44 rounded-full border border-orange-400/40 bg-orange-500/10 blur-[1px]"
          style={{ transform: `scale(${scale}) rotateX(65deg) rotateZ(20deg)` }}
        />
        <div
          className="absolute h-32 w-64 rounded-full border border-sky-400/30 bg-sky-500/10"
          style={{ transform: "rotateX(70deg) rotateZ(-20deg)" }}
        />
        <div className="relative h-44 w-2 rounded-full bg-zinc-200 shadow-[0_0_28px_rgba(251,146,60,0.65)]" />
        {antennaType.toLowerCase().includes("helix") && (
          <div className="absolute h-44 w-28 rounded-full border-4 border-dashed border-orange-400/80" style={{ transform: "rotateX(64deg)" }} />
        )}
        <div className="absolute bottom-2 h-2 w-56 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}

export function HeatmapGrid({ matrix, title }: { matrix?: number[][]; title: string }) {
  const data = matrix && matrix.length > 0 ? matrix.slice(0, 24).map((r) => r.slice(0, 24)) : [];
  const flat = data.flat();
  const min = Math.min(...flat, 0);
  const max = Math.max(...flat, 1);
  const span = Math.max(max - min, 1e-9);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{title}</p>
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-black/40 text-sm text-zinc-500">Sin campo cercano</div>
      ) : (
        <div className="grid aspect-square w-full gap-[1px] overflow-hidden rounded-xl bg-black/50" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
          {data.flatMap((row, y) =>
            row.map((value, x) => {
              const q = (value - min) / span;
              const opacity = 0.15 + q * 0.85;
              return (
                <div
                  key={`${x}-${y}`}
                  className="aspect-square bg-orange-400"
                  style={{ opacity }}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
