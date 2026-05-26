"use client";

import React from "react";
import { Card, Metric } from "./ui";

function fmt(v: any, digits = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

export function SParameterPanel({ result }: { result: any }) {
  const zin = result?.zinOhm;
  const raw = result?.zinOhmRawMom;
  const correction = result?.physicalCorrection;

  return (
    <Card title="Puerto y adaptación" subtitle="Impedancia de entrada, S11, VSWR y corrección física aplicada.">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Zin" value={zin ? `${fmt(zin.re)} ${Number(zin.im) >= 0 ? "+" : "-"} j${fmt(Math.abs(Number(zin.im)))} Ω` : "—"} tone="info" />
        <Metric label="S11" value={result?.s11Db !== undefined ? `${fmt(result.s11Db)} dB` : "—"} tone={Number(result?.s11Db) < -10 ? "good" : "warn"} />
        <Metric label="VSWR" value={result?.vswr !== undefined ? fmt(result.vswr) : "—"} tone={Number(result?.vswr) < 2 ? "good" : "warn"} />
        <Metric label="Corrección" value={correction?.applied ? "v5 activa" : "sin corrección"} tone={correction?.applied ? "good" : "neutral"} />
      </div>

      {raw && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-4 text-xs leading-5 text-zinc-400">
          <span className="font-black uppercase tracking-[0.18em] text-zinc-500">MoM bruto:</span>{" "}
          {fmt(raw.re)} {Number(raw.im) >= 0 ? "+" : "-"} j{fmt(Math.abs(Number(raw.im)))} Ω.
        </div>
      )}
    </Card>
  );
}
