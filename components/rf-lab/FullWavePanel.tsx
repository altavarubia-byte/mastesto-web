"use client";

import React from "react";
import { Button, Card, Field, Metric, SelectField } from "./ui";
import { postJson } from "./api";
import { FieldSlicePreview } from "./FieldSlicePreview";

export function FullWavePanel({
  state,
  setState,
  run,
}: {
  state: any;
  setState: (patch: any) => void;
  run: (key: string, fn: () => Promise<void>) => void;
}) {
  const runFdtd = () =>
    run("fdtd", async () => {
      const data = await postJson("/rf/fullwave/fdtd", {
        frecuenciaGHz: state.freqGHz,
        nx: state.fdtdN,
        ny: state.fdtdN,
        nz: state.fdtdN,
        cellsPerWavelength: 10,
        nSteps: state.fdtdSteps,
        sourceType: state.fdtdSource,
        sourceComponent: "Ez",
        addPecBox: state.fdtdPec,
        pecBoxSize: 4,
        materialEpsR: state.epsR,
        materialSigma: state.sigma,
      });
      setState({ fdtdResult: data, activeTab: "fdtd" });
    });

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card
        title="Full-wave FDTD"
        subtitle="Solver 3D Yee: evolución E/H en malla. Sirve para demostrar campo electromagnético propio."
      >
        <div className="grid gap-4">
          <Field
            label="Frecuencia GHz"
            value={state.freqGHz}
            step="0.01"
            onChange={(v) => setState({ freqGHz: v })}
          />
          <Field
            label="Grid N"
            value={state.fdtdN}
            min="8"
            onChange={(v) => setState({ fdtdN: v })}
          />
          <Field
            label="Pasos temporales"
            value={state.fdtdSteps}
            min="10"
            onChange={(v) => setState({ fdtdSteps: v })}
          />
          <SelectField
            label="Fuente"
            value={state.fdtdSource}
            onChange={(v) => setState({ fdtdSource: v })}
            options={["gaussian", "sine_gaussian"]}
          />
          <Field
            label="εr material"
            value={state.epsR}
            step="0.1"
            onChange={(v) => setState({ epsR: v })}
          />
          <Field
            label="σ material"
            value={state.sigma}
            step="0.001"
            onChange={(v) => setState({ sigma: v })}
          />

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={state.fdtdPec}
              onChange={(e) => setState({ fdtdPec: e.target.checked })}
            />
            Añadir caja PEC
          </label>

          <Button loading={state.loading === "fdtd"} onClick={runFdtd}>
            Ejecutar FDTD
          </Button>
        </div>
      </Card>

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            label="Modelo"
            value={state.fdtdResult?.model}
            tone="info"
          />
          <Metric
            label="dx"
            value={
              state.fdtdResult?.grid?.dx
                ? `${Number(state.fdtdResult.grid.dx).toExponential(2)} m`
                : "—"
            }
          />
          <Metric
            label="dt"
            value={
              state.fdtdResult?.grid?.dt
                ? `${Number(state.fdtdResult.grid.dt).toExponential(2)} s`
                : "—"
            }
          />
          <Metric
            label="|H(f0)|"
            value={
              state.fdtdResult?.transferAtF0?.abs
                ? Number(state.fdtdResult.transferAtF0.abs).toExponential(2)
                : "—"
            }
            tone="good"
          />
        </div>
        <Card
          title="Campo electromagnético"
          subtitle="Corte XY del campo Ez. Base para visualización 3D futura."
        >
          <FieldSlicePreview
            matrix={state.fdtdResult?.fieldSlices?.EzCenterXY}
          />
        </Card>
      </div>
    </div>
  );
}
