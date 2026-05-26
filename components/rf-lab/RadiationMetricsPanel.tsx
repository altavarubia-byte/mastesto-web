"use client";

import React from "react";
import { Card, Metric } from "./ui";
import { computeRadiationMetrics } from "./rfMath";

function fmt(v: any, digits = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

export function RadiationMetricsPanel({ result }: { result: any }) {
  const m = computeRadiationMetrics(result);

  if (!m.ok) {
    return (
      <Card title="Métricas de radiación">
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          No hay patrón calculado todavía.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Métricas de radiación" subtitle="Cálculo automático industrial a partir del patrón angular θ/φ.">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="D/G máximo" value={`${fmt(m.maxGainDb)} dB`} tone="info" />
        <Metric label="Dirección máxima" value={`θ ${fmt(m.thetaMaxDeg, 0)}° · φ ${fmt(m.phiMaxDeg, 0)}°`} />
        <Metric label="HPBW aprox." value={m.hpbwDeg === null ? "—" : `${fmt(m.hpbwDeg, 1)}°`} tone="good" />
        <Metric label="Front/Back" value={`${fmt(m.frontBackDb)} dB`} tone="info" />
        <Metric label="Lóbulo secundario" value={m.sideLobeLevelDb === null ? "—" : `${fmt(m.sideLobeLevelDb)} dB`} />
        <Metric label="Puntos" value={m.numPoints} />
        <Metric label="RHCP máx." value={m.rhcpMaxDb === null ? "—" : `${fmt(m.rhcpMaxDb)} dB`} />
        <Metric label="Polarización" value={m.polarization} tone="warn" />
      </div>
    </Card>
  );
}
