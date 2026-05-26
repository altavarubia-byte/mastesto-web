"use client";

import React from "react";
import { Button, Card, JsonBox, Metric } from "./ui";
import { downloadJson, postJson } from "./api";
import { PatternPreview } from "./PatternPreview";

export function SionnaPanel({
  state,
  setState,
  run,
}: {
  state: any;
  setState: (patch: any) => void;
  run: (key: string, fn: () => Promise<void>) => void;
}) {
  const pattern =
    state.sionnaPayload?.pattern ||
    state.sionnaPayload?.customPatternJson ||
    state.sionnaPayload?.sionnaPayload?.customPatternJson ||
    [];

  const postToSionna = () =>
    run("sionna-post", async () => {
      if (!state.sionnaPayload) throw new Error("Primero exporta un patrón.");
      const data = await postJson(state.sionnaEndpoint, {
        version: "rf-lab-frontend",
        unidades: "m",
        materialPared: "ladrillo",
        frecuenciaMhz: state.freqGHz * 1000,
        habitaciones: [],
        objetos: [],
        usarPatronRfEngine: true,
        antennaTypeTx: "mastesto_rf_engine",
        polarizationTx: state.polarization,
        customPatternJson: pattern,
      });
      setState({ sionnaResult: data });
    });

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card
        title="Exportación a Sionna"
        subtitle="Convierte el patrón del RF Engine en payload para el simulador de canal."
      >
        <div className="grid gap-4">
          <Metric label="Puntos patrón" value={pattern?.length ?? 0} tone="info" />
          <Metric label="Polarización" value={state.polarization} />
          <Metric label="Endpoint" value={state.sionnaEndpoint} />

          <Button
            variant="secondary"
            disabled={!state.sionnaPayload}
            onClick={() => downloadJson("sionna_pattern_payload.json", state.sionnaPayload)}
          >
            Descargar payload
          </Button>

          <Button
            loading={state.loading === "sionna-post"}
            disabled={!state.sionnaPayload}
            onClick={postToSionna}
          >
            Enviar a Sionna
          </Button>
        </div>
      </Card>

      <div className="grid gap-5">
        <Card title="Patrón exportado">
          <PatternPreview pattern={pattern} />
        </Card>
        <Card title="Respuesta Sionna">
          <JsonBox data={state.sionnaResult || { info: "Todavía no enviado a Sionna." }} />
        </Card>
      </div>
    </div>
  );
}
