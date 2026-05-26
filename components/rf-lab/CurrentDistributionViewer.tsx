"use client";

import React from "react";
import { Card, Metric } from "./ui";
import { getCurrentMetrics, normalize01, numberOr } from "./rfMath";

export function CurrentDistributionViewer({ result }: { result: any }) {
  const currents = Array.isArray(result?.currents) ? result.currents : [];
  const m = getCurrentMetrics(result);

  if (!currents.length) {
    return (
      <Card title="Corriente sobre la antena">
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">Sin corrientes calculadas.</div>
      </Card>
    );
  }

  const mags = currents.map((c: any) => numberOr(c.abs, 0));
  const phases = currents.map((c: any) => numberOr(c.phaseRad, 0));
  const min = Math.min(...mags);
  const max = Math.max(...mags);
  const pmin = Math.min(...phases);
  const pmax = Math.max(...phases);

  return (
    <Card title="Corriente sobre la antena" subtitle="Distribución |I| y fase por segmento.">
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Metric label="Segmentos" value={m.numSegments} />
        <Metric label="|I| máx" value={m.maxCurrent?.toExponential(3)} tone="info" />
        <Metric label="Segmento máx" value={m.maxSegment} />
      </div>
      <div className="rounded-3xl border border-zinc-800 bg-black p-4">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Magnitud |I|</div>
        <div className="flex h-40 items-end gap-[2px]">
          {mags.map((v: number, i: number) => {
  const q = normalize01(v, min, max);
  return (
    <div
      key={i}
      className="flex-1 rounded-t bg-orange-500"
      style={{
        height: `${8 + q * 92}%`,
        opacity: 0.25 + q * 0.75,
      }}
      title={`seg ${i}: ${v}`}
    />
  );
})}
        </div>
        <div className="mt-6 mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Fase</div>
        <div className="flex h-28 items-end gap-[2px]">
          {phases.map((v: number, i: number) => {
  const q = normalize01(v, pmin, pmax);
  return (
    <div
      key={i}
      className="flex-1 rounded-t bg-sky-400"
      style={{
        height: `${8 + q * 92}%`,
        opacity: 0.25 + q * 0.75,
      }}
      title={`seg ${i}: ${v.toFixed(3)} rad`}
    />
  );
})}
        </div>
      </div>
    </Card>
  );
}
