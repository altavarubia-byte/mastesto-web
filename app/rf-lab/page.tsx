"use client";

import React, { useState } from "react";
import { getJson } from "@/components/rf-lab/api";
import { AntennaPanel } from "@/components/rf-lab/AntennaPanel";
import { EnterprisePanel } from "@/components/rf-lab/EnterprisePanel";
import { FullWavePanel } from "@/components/rf-lab/FullWavePanel";
import { SionnaPanel } from "@/components/rf-lab/SionnaPanel";
import { ValidationPanel } from "@/components/rf-lab/ValidationPanel";
import { Button, Card, JsonBox, Metric, StatusPill, cx } from "@/components/rf-lab/ui";

type Tab = "dashboard" | "antenna" | "fdtd" | "enterprise" | "sionna" | "validation" | "raw";

export default function RFLabPage() {
  const [state, setRawState] = useState<any>({
    activeTab: "dashboard" as Tab,
    loading: null,
    error: null,

    health: null,
    enterpriseHealth: null,

    antennaType: "helix",
    freqGHz: 2.45,
    turns: 7,
    polarization: "RHCP",
    thetaStep: 20,
    phiStep: 30,

    rfResult: null,
    sionnaPayload: null,

    fdtdResult: null,
    fdtdN: 24,
    fdtdSteps: 60,
    fdtdPec: false,
    fdtdSource: "gaussian",
    epsR: 1,
    sigma: 0,

    surfaceW: 0.2,
    surfaceH: 0.15,
    surfaceNx: 8,
    surfaceNy: 6,
    roughness: 0.0001,
    epsInf: 2,
    epsStatic: 4,
    tauS: 1e-11,
    debyeSigma: 0,
    enterpriseResult: null,

    validationResult: null,

    sionnaEndpoint: "/raytrace",
    sionnaResult: null,
  });

  const setState = (patch: any) =>
    setRawState((s: any) => ({
      ...s,
      ...patch,
    }));

  const run = async (key: string, fn: () => Promise<void>) => {
    setState({ error: null, loading: key });
    try {
      await fn();
    } catch (e: any) {
      setState({ error: e?.message || String(e) });
    } finally {
      setState({ loading: null });
    }
  };

  const checkHealth = () =>
    run("health", async () => {
      const h = await getJson("/rf/health");
      setState({ health: h });
    });

  const checkEnterprise = () =>
    run("enterprise-health", async () => {
      const h = await getJson("/enterprise/health");
      setState({ enterpriseHealth: h });
    });

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "dashboard", label: "Centro" },
    { id: "antenna", label: "Antenas" },
    { id: "fdtd", label: "Full-wave" },
    { id: "enterprise", label: "Enterprise" },
    { id: "sionna", label: "Sionna" },
    { id: "validation", label: "Validación" },
    { id: "raw", label: "Raw" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-5 py-8">
        <header className="overflow-hidden rounded-[2rem] border border-orange-900/40 bg-zinc-950/80 p-6 shadow-2xl shadow-black">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-orange-400">
                Mastesto RF Enterprise
              </p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
                Laboratorio FEKO-like propio
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                Frontend profesional para tu motor RF: MoM, FDTD full-wave,
                RWG, materiales, validación, postproceso y exportación a
                Sionna. Fácil por fuera, complicado por dentro.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill ok={Boolean(state.health?.ok)} label="RF Engine" />
              <StatusPill
                ok={Boolean(state.enterpriseHealth?.ok)}
                label="Enterprise"
              />
              <StatusPill
                ok={Boolean(state.sionnaPayload)}
                label="Sionna Payload"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button loading={state.loading === "health"} onClick={checkHealth}>
              Check RF
            </Button>
            <Button
              variant="secondary"
              loading={state.loading === "enterprise-health"}
              onClick={checkEnterprise}
            >
              Check Enterprise
            </Button>
          </div>

          {state.error && (
            <div className="mt-5 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
              {state.error}
            </div>
          )}
        </header>

        <nav className="flex gap-2 overflow-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setState({ activeTab: tab.id })}
              className={cx(
                "whitespace-nowrap rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition",
                state.activeTab === tab.id
                  ? "bg-orange-500 text-black"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {state.activeTab === "dashboard" && (
          <div className="grid gap-5 lg:grid-cols-3">
            <Card
              title="Flujo recomendado"
              subtitle="Primero antena, luego patrón, después Sionna."
            >
              <div className="space-y-3 text-sm text-zinc-300">
                <p>1. Calcula una hélice o dipolo en Antenas.</p>
                <p>2. Exporta el patrón angular a Sionna.</p>
                <p>3. Ejecuta FDTD si quieres campo propio.</p>
                <p>4. Usa Enterprise para materiales/RWG/validación.</p>
              </div>
            </Card>

            <Card title="Estado RF">
              <div className="grid gap-3">
                <Metric
                  label="RF Engine"
                  value={state.health?.ok ? "online" : "sin comprobar"}
                  tone={state.health?.ok ? "good" : "neutral"}
                />
                <Metric
                  label="Enterprise"
                  value={
                    state.enterpriseHealth?.ok ? "online" : "sin comprobar"
                  }
                  tone={state.enterpriseHealth?.ok ? "good" : "neutral"}
                />
              </div>
            </Card>

            <Card title="Últimos resultados">
              <div className="grid gap-3">
                <Metric
                  label="Antena"
                  value={state.rfResult?.antenna?.type || "—"}
                  tone="info"
                />
                <Metric
                  label="FDTD"
                  value={state.fdtdResult?.ok ? "calculado" : "—"}
                  tone="info"
                />
              </div>
            </Card>
          </div>
        )}

        {state.activeTab === "antenna" && (
          <AntennaPanel state={state} setState={setState} run={run} />
        )}

        {state.activeTab === "fdtd" && (
          <FullWavePanel state={state} setState={setState} run={run} />
        )}

        {state.activeTab === "enterprise" && (
          <EnterprisePanel state={state} setState={setState} run={run} />
        )}

        {state.activeTab === "sionna" && (
          <SionnaPanel state={state} setState={setState} run={run} />
        )}

        {state.activeTab === "validation" && (
          <ValidationPanel state={state} setState={setState} run={run} />
        )}

        {state.activeTab === "raw" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="RF Result">
              <JsonBox data={state.rfResult || {}} />
            </Card>
            <Card title="FDTD Result">
              <JsonBox data={state.fdtdResult || {}} />
            </Card>
            <Card title="Enterprise Result">
              <JsonBox data={state.enterpriseResult || {}} />
            </Card>
            <Card title="Sionna Payload">
              <JsonBox data={state.sionnaPayload || {}} />
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
