"use client";

import React, { useState } from "react";
import { Button, Card, JsonBox, Metric } from "./ui";
import { postJson } from "./api";

export function ValidationPanel({
  state,
  setState,
  run,
}: {
  state: any;
  setState: (patch: any) => void;
  run: (key: string, fn: () => Promise<void>) => void;
}) {
  const [text, setText] = useState("");

  const parseS1P = () =>
    run("validation-s1p", async () => {
      if (!text.trim()) throw new Error("Pega contenido .s1p primero.");
      const data = await postJson("/enterprise/validation/s1p", {
        content: text,
      });
      setState({ validationResult: data });
    });

  const postProcess = () =>
    run("post-process", async () => {
      const target = state.rfResult || state.enterpriseResult || state.fdtdResult;
      if (!target) throw new Error("No hay resultado para postprocesar.");
      const data = await postJson("/enterprise/post/process", target);
      setState({ validationResult: data });
    });

  const makeReport = () =>
    run("report-md", async () => {
      const target = state.rfResult || state.enterpriseResult || state.fdtdResult;
      if (!target) throw new Error("No hay resultado para reportar.");
      const data = await postJson("/enterprise/report/markdown", target);
      setState({ validationResult: data });
    });

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card
        title="Validación y postproceso"
        subtitle="Parser S1P, postproceso tipo PostFEKO y reporte técnico."
      >
        <div className="grid gap-4">
          <textarea
            className="min-h-52 rounded-2xl border border-zinc-800 bg-black p-3 text-xs text-zinc-300 outline-none focus:border-orange-500"
            placeholder="Pega aquí contenido .s1p Touchstone..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button loading={state.loading === "validation-s1p"} onClick={parseS1P}>
            Parsear S1P
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" loading={state.loading === "post-process"} onClick={postProcess}>
              Postprocesar
            </Button>
            <Button variant="secondary" loading={state.loading === "report-md"} onClick={makeReport}>
              Reporte
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            label="Puntos"
            value={state.validationResult?.points?.length ?? state.validationResult?.numPatternPoints ?? "—"}
          />
          <Metric
            label="HPBW"
            value={state.validationResult?.hpbwDeg ?? "—"}
            tone="info"
          />
          <Metric
            label="Formato"
            value={state.validationResult?.format ?? state.validationResult?.model ?? "—"}
          />
        </div>
        <Card title="Resultado validación">
          <JsonBox data={state.validationResult || { info: "Sin validación todavía." }} />
        </Card>
      </div>
    </div>
  );
}
