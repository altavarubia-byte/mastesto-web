"use client";

import React, { useMemo } from "react";

export function PatternPreview({ pattern }: { pattern: any[] }) {
  const points = useMemo(() => {
    if (!Array.isArray(pattern)) return [];
    return pattern.slice(0, 320).map((p) => ({
      theta: Number(p.thetaDeg ?? 0),
      phi: Number(p.phiDeg ?? 0),
      gain: Number(p.gainDb ?? p.directivityDb ?? 0),
    }));
  }, [pattern]);

  if (!points.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
        Sin patrón todavía.
      </div>
    );
  }

  const minG = Math.min(...points.map((p) => p.gain));
  const maxG = Math.max(...points.map((p) => p.gain));
  const span = Math.max(maxG - minG, 1e-9);

  return (
    <div className="relative h-80 overflow-hidden rounded-3xl border border-zinc-800 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_55%)]" />
      <div className="absolute left-4 top-4 rounded-xl border border-zinc-800 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        θ vertical · φ horizontal
      </div>
      {points.map((p, i) => {
        const x = ((p.phi % 360) + 360) % 360 / 360;
        const y = p.theta / 180;
        const q = (p.gain - minG) / span;
        const size = 4 + q * 14;
        return (
          <div
            key={i}
            className="absolute rounded-full bg-orange-400 shadow-lg shadow-orange-500/30"
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: size,
              height: size,
              opacity: 0.2 + q * 0.8,
              transform: "translate(-50%, -50%)",
            }}
            title={`θ=${p.theta} φ=${p.phi} gain=${p.gain.toFixed(2)} dB`}
          />
        );
      })}
      <div className="absolute bottom-3 left-3 rounded-xl bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        {points.length} puntos · gain [{minG.toFixed(1)}, {maxG.toFixed(1)}] dB
      </div>
    </div>
  );
}
