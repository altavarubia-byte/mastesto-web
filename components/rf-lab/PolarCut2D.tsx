"use client";

import React, { useMemo, useState } from "react";
import { Card, SelectField } from "./ui";
import { getGain, getPattern, nearestPhiCut, normalize01, numberOr } from "./rfMath";

export function PolarCut2D({ result }: { result: any }) {
  const [phi, setPhi] = useState("0");

  const data = useMemo(() => {
    const pattern = getPattern(result);
    if (!pattern.length) return null;
    const cut = nearestPhiCut(pattern, Number(phi));
    if (!cut.length) return null;
    const gains = cut.map(getGain);
    const max = Math.max(...gains);
    const min = Math.max(Math.min(...gains), max - 35);
    const pts = cut.map((p) => {
      const theta = (numberOr(p.thetaDeg) * Math.PI) / 180;
      const q = normalize01(getGain(p), min, max);
      const r = 22 + q * 125;
      return { x: 170 + r * Math.sin(theta), y: 170 - r * Math.cos(theta), theta: numberOr(p.thetaDeg), gain: getGain(p) };
    });
    return { pts, max, min };
  }, [result, phi]);

  return (
    <Card title="Corte polar 2D" subtitle="Plano E/H aproximado mediante corte φ constante." right={
      <div className="w-36">
        <SelectField label="φ" value={phi} onChange={setPhi} options={["0", "30", "60", "90", "120", "150", "180", "270"]} />
      </div>
    }>
      {!data ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">Sin patrón para corte polar.</div>
      ) : (
        <div className="rounded-3xl border border-zinc-800 bg-black p-4">
          <svg viewBox="0 0 340 340" className="mx-auto h-[360px] max-w-full">
            <rect width="340" height="340" fill="black" />
            {[40, 80, 120].map((r) => <circle key={r} cx="170" cy="170" r={r} fill="none" stroke="rgba(255,255,255,0.1)" />)}
            {[0, 30, 60, 90, 120, 150, 180].map((a) => {
              const rad = (a * Math.PI) / 180;
              return <line key={a} x1="170" y1="170" x2={170 + 145 * Math.sin(rad)} y2={170 - 145 * Math.cos(rad)} stroke="rgba(255,255,255,0.08)" />;
            })}
            <polyline points={data.pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="rgb(249,115,22)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {data.pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(249,115,22)"><title>{`θ=${p.theta} G=${p.gain.toFixed(2)} dB`}</title></circle>)}
          </svg>
          <div className="text-center text-[10px] uppercase tracking-[0.18em] text-zinc-500">Corte φ={phi}° · max {data.max.toFixed(2)} dB</div>
        </div>
      )}
    </Card>
  );
}
