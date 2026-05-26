"use client";

import React from "react";
import { Button, Card, Field, JsonBox, Metric } from "./ui";
import { getJson, postJson } from "./api";

export function EnterprisePanel({
  state,
  setState,
  run,
}: {
  state: any;
  setState: (patch: any) => void;
  run: (key: string, fn: () => Promise<void>) => void;
}) {
 const runSurface = () =>
  run("enterprise-surface", async () => {
    try {
      const data = await postJson("/enterprise/surface/rwg-report", {
        widthM: state.surfaceW,
        heightM: state.surfaceH,
        nx: state.surfaceNx,
        ny: state.surfaceNy,
        frequencyHz: state.freqGHz * 1e9,
        polarization: "x",
      });

      setState({
        enterpriseResult: data,
        error: null,
      });
    } catch (e: any) {
      setState({
        enterpriseResult: {
          ok: false,
          module: "Enterprise RWG",
          error: e?.message || String(e),
          explanation:
            "El frontend está bien, pero el backend activo no tiene todavía /enterprise/surface/rwg-report. Ahora mismo probablemente solo está arrancando rf_engine.main_rf.",
        },
        error:
          "Enterprise todavía no está activo en el backend. RF Engine sí funciona.",
      });
    }
  });

  const runEfie = () =>
    run("enterprise-efie", async () => {
      const data = await postJson("/enterprise/surface/efie-plane-wave", {
        widthM: state.surfaceW,
        heightM: state.surfaceH,
        nx: state.surfaceNx,
        ny: state.surfaceNy,
        frequencyHz: state.freqGHz * 1e9,
        polarization: "x",
      });
      setState({ enterpriseResult: data });
    });

  const runRoughness = () =>
    run("enterprise-roughness", async () => {
      const data = await getJson(
        `/enterprise/materials/roughness?rmsHeightM=${state.roughness}&frequencyHz=${
          state.freqGHz * 1e9
        }&incidenceDeg=0`
      );
      setState({ enterpriseResult: data });
    });

  const runDebye = () =>
    run("enterprise-debye", async () => {
      const data = await postJson("/enterprise/materials/debye", {
        epsInf: state.epsInf,
        epsStatic: state.epsStatic,
        tauS: state.tauS,
        sigma: state.debyeSigma,
        frequencyHz: state.freqGHz * 1e9,
      });
      setState({ enterpriseResult: data });
    });

  const runMlfmm = () =>
    run("enterprise-mlfmm", async () => {
      const data = await getJson("/enterprise/mlfmm/report?numUnknowns=10000");
      setState({ enterpriseResult: data });
    });

  const runFem = () =>
    run("enterprise-fem", async () => {
      const data = await getJson(
        `/enterprise/fem/scaffold?frequencyHz=${state.freqGHz * 1e9}`
      );
      setState({ enterpriseResult: data });
    });

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card
        title="Enterprise RF"
        subtitle="RWG, superficies, materiales, FEM/MLFMM scaffold y módulos avanzados tipo FEKO-like."
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Placa W m"
              value={state.surfaceW}
              step="0.01"
              onChange={(v) => setState({ surfaceW: v })}
            />
            <Field
              label="Placa H m"
              value={state.surfaceH}
              step="0.01"
              onChange={(v) => setState({ surfaceH: v })}
            />
            <Field
              label="Nx"
              value={state.surfaceNx}
              onChange={(v) => setState({ surfaceNx: v })}
            />
            <Field
              label="Ny"
              value={state.surfaceNy}
              onChange={(v) => setState({ surfaceNy: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button loading={state.loading === "enterprise-surface"} onClick={runSurface}>
              RWG report
            </Button>
            <Button variant="secondary" loading={state.loading === "enterprise-efie"} onClick={runEfie}>
              EFIE PEC
            </Button>
          </div>

          <div className="h-px bg-zinc-800" />

          <Field
            label="Rugosidad RMS m"
            value={state.roughness}
            step="0.00001"
            onChange={(v) => setState({ roughness: v })}
          />
          <Button variant="secondary" loading={state.loading === "enterprise-roughness"} onClick={runRoughness}>
            Calcular rugosidad
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="eps inf"
              value={state.epsInf}
              step="0.1"
              onChange={(v) => setState({ epsInf: v })}
            />
            <Field
              label="eps static"
              value={state.epsStatic}
              step="0.1"
              onChange={(v) => setState({ epsStatic: v })}
            />
            <Field
              label="tau s"
              value={state.tauS}
              step="1e-12"
              onChange={(v) => setState({ tauS: v })}
            />
            <Field
              label="sigma"
              value={state.debyeSigma}
              step="0.001"
              onChange={(v) => setState({ debyeSigma: v })}
            />
          </div>

          <Button variant="secondary" loading={state.loading === "enterprise-debye"} onClick={runDebye}>
            Material Debye
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" loading={state.loading === "enterprise-fem"} onClick={runFem}>
              FEM scaffold
            </Button>
            <Button variant="ghost" loading={state.loading === "enterprise-mlfmm"} onClick={runMlfmm}>
              MLFMM report
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="OK" value={String(Boolean(state.enterpriseResult?.ok))} tone={state.enterpriseResult?.ok ? "good" : "neutral"} />
          <Metric label="Modelo" value={state.enterpriseResult?.model || "—"} tone="info" />
          <Metric label="Unknowns/RWG" value={state.enterpriseResult?.numRWG ?? state.enterpriseResult?.numUnknowns ?? "—"} />
        </div>
        <Card title="Resultado Enterprise" subtitle="Salida técnica del módulo avanzado.">
          <JsonBox data={state.enterpriseResult || { info: "Sin resultado todavía." }} />
        </Card>
      </div>
    </div>
  );
}
