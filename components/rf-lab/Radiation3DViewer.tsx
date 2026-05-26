"use client";

import React, { useMemo } from "react";
import { Card } from "./ui";
import { getGain, getPattern, normalize01, numberOr } from "./rfMath";

export function Radiation3DViewer({ result }: { result: any }) {
  const data = useMemo(() => {
    const pattern = getPattern(result);
    if (!pattern.length) return null;

    const gains = pattern.map(getGain);
    const min = Math.max(Math.min(...gains), -40);
    const max = Math.max(...gains);

    const points = pattern.slice(0, 900).map((p) => {
      const theta = (numberOr(p.thetaDeg) * Math.PI) / 180;
      const phi = (numberOr(p.phiDeg) * Math.PI) / 180;
      const q = normalize01(getGain(p), min, max);
      const r = 38 + q * 118;
      const x3 = r * Math.sin(theta) * Math.cos(phi);
      const y3 = r * Math.sin(theta) * Math.sin(phi);
      const z3 = r * Math.cos(theta);
      const x = 190 + x3 * 0.82 + y3 * 0.36;
      const y = 180 - z3 * 0.82 + y3 * 0.18;
      return { x, y, q, size: 2.5 + q * 6, theta: numberOr(p.thetaDeg), phi: numberOr(p.phiDeg), gain: getGain(p) };
    });

    return { points, min, max };
  }, [result]);

  return (
    <Card title="Diagrama 3D de radiación" subtitle="Superficie 3D aproximada proyectada desde el patrón θ/φ. Estable en Vercel sin dependencias extra.">
      {!data ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          Calcula una antena para ver el diagrama 3D.
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black">
          <svg viewBox="0 0 380 360" className="h-[420px] w-full">
            <defs>
              <radialGradient id="rfGlowIndustrialV6" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(249,115,22,0.35)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect width="380" height="360" fill="black" />
            <circle cx="190" cy="180" r="150" fill="url(#rfGlowIndustrialV6)" />
            <line x1="190" y1="180" x2="330" y2="180" stroke="rgba(255,255,255,0.16)" />
            <line x1="190" y1="180" x2="85" y2="240" stroke="rgba(255,255,255,0.16)" />
            <line x1="190" y1="180" x2="190" y2="35" stroke="rgba(255,255,255,0.16)" />
            <text x="334" y="184" fill="rgba(255,255,255,0.35)" fontSize="10">x</text>
            <text x="75" y="248" fill="rgba(255,255,255,0.35)" fontSize="10">y</text>
            <text x="194" y="35" fill="rgba(255,255,255,0.35)" fontSize="10">z</text>
            {data.points.sort((a, b) => a.q - b.q).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={`rgba(249,115,22,${0.16 + p.q * 0.84})`}>
                <title>{`θ=${p.theta} φ=${p.phi} G=${p.gain.toFixed(2)} dB`}</title>
              </circle>
            ))}
          </svg>
          <div className="absolute bottom-4 left-4 rounded-2xl border border-zinc-800 bg-black/80 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            gain [{data.min.toFixed(1)}, {data.max.toFixed(1)}] dB
          </div>
        </div>
      )}
    </Card>
  );
}
