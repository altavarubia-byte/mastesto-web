"use client";

import React from "react";

export function FieldSlicePreview({ matrix }: { matrix: number[][] | undefined }) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
        Ejecuta FDTD para ver un corte de campo.
      </div>
    );
  }

  const flat = matrix.flat().map(Number);
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const span = Math.max(max - min, 1e-12);
  const rows = matrix.length;
  const cols = matrix[0]?.length || 1;

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black p-3">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {matrix.map((row, i) =>
          row.map((v, j) => {
            const q = (Number(v) - min) / span;
            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square rounded-[3px]"
                style={{
                  background: `rgba(249,115,22,${0.08 + q * 0.92})`,
                }}
                title={`${Number(v).toExponential(3)}`}
              />
            );
          })
        )}
      </div>
      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        <span>Ez corte XY</span>
        <span>
          {rows}×{cols}
        </span>
      </div>
    </div>
  );
}
