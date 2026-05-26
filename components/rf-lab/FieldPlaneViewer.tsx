"use client";

import React, { useMemo, useState } from "react";
import { Card, SelectField } from "./ui";

function getMatrix(fdtdResult: any, key: string): number[][] | undefined {
  return fdtdResult?.fieldSlices?.[key];
}

export function FieldPlaneViewer({ fdtdResult }: { fdtdResult: any }) {
  const [field, setField] = useState("EzCenterXY");

  const matrix = getMatrix(fdtdResult, field);

  const data = useMemo(() => {
    if (!matrix || !Array.isArray(matrix) || !matrix.length) return null;
    const flat = matrix.flat().map(Number).filter(Number.isFinite);
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const span = Math.max(max - min, 1e-12);
    return { min, max, span, rows: matrix.length, cols: matrix[0]?.length || 1 };
  }, [matrix]);

  return (
    <Card title="Planos de campo FDTD" subtitle="Cortes de campo electromagnético calculados por el solver full-wave." right={
      <div className="w-44">
        <SelectField label="Campo" value={field} onChange={setField} options={["EzCenterXY", "ExCenterXY", "EyCenterXY"]} />
      </div>
    }>
      {!data || !matrix ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">Ejecuta FDTD para ver planos de campo.</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black p-3">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${data.cols}, minmax(0, 1fr))` }}>
            {matrix.map((row, i) =>
              row.map((v, j) => {
                const q = Math.max(0, Math.min(1, (Number(v) - data.min) / data.span));
                return <div key={`${i}-${j}`} className="aspect-square rounded-[3px]" style={{ background: `rgba(249,115,22,${0.08 + q * 0.92})` }} title={`${Number(v).toExponential(3)}`} />;
              })
            )}
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span>{field}</span>
            <span>{data.rows}×{data.cols}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
