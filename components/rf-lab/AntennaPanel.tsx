"use client";

import React from "react";
import { Button, Card, Field, Metric, SelectField } from "./ui";
import { postJson } from "./api";
import { PatternPreview } from "./PatternPreview";

export function AntennaPanel({
  state,
  setState,
  run,
}: {
  state: any;
  setState: (patch: any) => void;
  run: (key: string, fn: () => Promise<void>) => void;
}) {
  const solveAntenna = () =>
    run("antenna", async () => {
      let path = "/rf/solve/helix";
      let body: any = {
        frecuenciaGHz: state.freqGHz,
        turns: state.turns,
        radiusLambda: 0.159154943,
        pitchLambda: 0.25,
        wireRadiusLambda: 0.0075,
        polarization: state.polarization,
        z0Ohm: 50,
        config: {
          nSegments: 0,
          thetaStepDeg: state.thetaStep,
          phiStepDeg: state.phiStep,
          includePattern: true,
        },
      };

      if (state.antennaType === "dipole") {
        path = "/rf/solve/dipole";
        body = {
          frecuenciaGHz: state.freqGHz,
          lengthLambda: 0.48,
          radiusLambda: 0.002,
          z0Ohm: 50,
          config: {
            nSegments: 41,
            thetaStepDeg: state.thetaStep,
            phiStepDeg: state.phiStep,
            includePattern: true,
          },
        };
      }

      if (state.antennaType === "monopole") {
        path = "/rf/solve/monopole";
        body = {
          frecuenciaGHz: state.freqGHz,
          lengthLambda: 0.25,
          radiusLambda: 0.002,
          z0Ohm: 50,
          config: {
            nSegments: 41,
            thetaStepDeg: state.thetaStep,
            phiStepDeg: state.phiStep,
            includePattern: true,
          },
        };
      }

      if (state.antennaType === "loop") {
        path = "/rf/solve/loop";
        body = {
          frecuenciaGHz: state.freqGHz,
          radiusLambda: 0.16,
          wireRadiusLambda: 0.002,
          z0Ohm: 50,
          config: {
            nSegments: 96,
            thetaStepDeg: state.thetaStep,
            phiStepDeg: state.phiStep,
            includePattern: true,
          },
        };
      }

      if (state.antennaType === "patch") {
        path = "/rf/solve/patch";
        body = {
          frecuenciaGHz: state.freqGHz,
          epsR: 4.4,
          hMm: 1.6,
          tanDelta: 0.02,
        };
      }

      if (state.antennaType === "array") {
        path = "/rf/solve/array";
        body = {
          frecuenciaGHz: state.freqGHz,
          elementosX: 4,
          elementosY: 4,
          spacingLambda: 0.5,
          steeringThetaDeg: 0,
          steeringPhiDeg: 0,
          thetaStepDeg: state.thetaStep,
          phiStepDeg: state.phiStep,
        };
      }

      const data = await postJson(path, body);
      setState({ rfResult: data, sionnaPayload: null, activeTab: "antenna" });
    });

  const exportSionna = () =>
    run("export-sionna", async () => {
      if (!state.rfResult) throw new Error("Primero calcula una antena.");
      const data = await postJson("/rf/export/sionna", {
        result: state.rfResult,
        polarization: state.polarization,
        frequencyHz: state.freqGHz * 1e9,
      });
      setState({ sionnaPayload: data, activeTab: "sionna" });
    });

  const pattern =
    state.sionnaPayload?.pattern ||
    state.sionnaPayload?.customPatternJson ||
    state.sionnaPayload?.sionnaPayload?.customPatternJson ||
    state.rfResult?.farfield?.pattern ||
    [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card
        title="Diseño de antena"
        subtitle="MoM para hilos, patch analítico y array factor. Aquí nace el patrón que luego viajará a Sionna."
      >
        <div className="grid gap-4">
          <SelectField
            label="Tipo"
            value={state.antennaType}
            onChange={(v) => setState({ antennaType: v })}
            options={["helix", "dipole", "monopole", "loop", "patch", "array"]}
          />
          <Field
            label="Frecuencia GHz"
            value={state.freqGHz}
            step="0.01"
            onChange={(v) => setState({ freqGHz: v })}
          />
          {state.antennaType === "helix" && (
            <>
              <Field
                label="Espiras"
                value={state.turns}
                onChange={(v) => setState({ turns: v })}
              />
              <SelectField
                label="Polarización"
                value={state.polarization}
                onChange={(v) => setState({ polarization: v })}
                options={["RHCP", "LHCP", "V", "H"]}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="θ step"
              value={state.thetaStep}
              onChange={(v) => setState({ thetaStep: v })}
            />
            <Field
              label="φ step"
              value={state.phiStep}
              onChange={(v) => setState({ phiStep: v })}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              loading={state.loading === "antenna"}
              onClick={solveAntenna}
            >
              Calcular
            </Button>
            <Button
              variant="secondary"
              loading={state.loading === "export-sionna"}
              onClick={exportSionna}
              disabled={!state.rfResult}
            >
              Exportar a Sionna
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            label="Modelo"
            value={state.rfResult?.model || state.rfResult?.antenna?.solver}
            tone="info"
          />
          <Metric
            label="S11"
            value={
              state.rfResult?.s11Db !== undefined
                ? `${Number(state.rfResult.s11Db).toFixed(2)} dB`
                : "—"
            }
            tone="warn"
          />
          <Metric
            label="VSWR"
            value={
              state.rfResult?.vswr !== undefined
                ? Number(state.rfResult.vswr).toFixed(2)
                : "—"
            }
            tone="good"
          />
          <Metric
            label="Directividad"
            value={
              state.rfResult?.farfield?.directivityMaxDb !== undefined
                ? `${Number(state.rfResult.farfield.directivityMaxDb).toFixed(
                    2
                  )} dB`
                : "—"
            }
            tone="info"
          />
        </div>
        <Card
          title="Patrón de radiación"
          subtitle="Visualización rápida θ/φ. Luego se puede sustituir por Three.js polar 3D."
        >
          <PatternPreview pattern={pattern} />
        </Card>
      </div>
    </div>
  );
}
