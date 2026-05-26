"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, getModuleKeys, getScenario } from "@/lib/telecomFinal/core";
import { Button, Card, CodeBox, Gauge, Shell, Stat } from "@/components/telecomFinal/ui";

export default function ValidationLabPage() {
  const [scenario, setScenario] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const keys = getModuleKeys(scenario);
  const score = Math.round((keys.length / 9) * 100);

  useEffect(() => {
    setScenario(getScenario());
  }, []);

  async function checkBackend() {
    try {
      setStatus(await apiGet("/telecom/v900000000/status"));
    } catch (e: any) {
      setStatus({ ok: false, error: e.message });
    }
  }

  async function runValidation() {
    try {
      setResult(await apiPost("/telecom/v900000000/scenario/industrial", {
        scenario,
        industrial: (scenario as any).industrial || {},
        live: { timeS: Date.now()/1000, rfPowerDbm: 20, people: 4, opticalLengthKm: 10, solarIrradianceWm2: 850 }
      }));
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    }
  }

  return (
    <Shell title="Validation Lab" badge="QA · Integración · Backend checks" description="Panel de validación global del producto: comprueba backend, módulos exportados, escenario industrial y readiness.">
      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Módulos" value={keys.length} />
        <Stat label="Score integración" value={`${score}%`} />
        <Stat label="Backend" value={status?.ok ? "OK" : "pendiente"} />
        <Stat label="Resultado" value={result?.ok ? "OK" : "pendiente"} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Gauge title="Integración" value={score} />
          <Card title="Acciones">
            <div className="grid gap-2">
              <Button onClick={checkBackend} variant="orange">Comprobar backend</Button>
              <Button onClick={() => { setScenario(getScenario()); }} variant="green">Recargar escenario</Button>
              <Button onClick={runValidation} variant="blue">Ejecutar validación industrial</Button>
            </div>
          </Card>
          <Card title="Checklist">
            <div className="grid gap-2">
              {["rf","sionna","optical","dsp","electronics","energy","iot","transmissionLines","industrial"].map((k) => (
                <div key={k} className={`rounded-2xl border p-3 ${keys.includes(k) ? "border-emerald-600 bg-emerald-950/40" : "border-zinc-800 bg-black"}`}>
                  <p className="text-xs font-black uppercase">{k}</p>
                  <p className="text-[11px] text-zinc-500">{keys.includes(k) ? "presente" : "faltante"}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Status backend"><CodeBox data={status ?? { info: "Pulsa comprobar backend." }} /></Card>
          <Card title="Resultado validación"><CodeBox data={result ?? { info: "Pulsa ejecutar validación." }} /></Card>
          <Card title="Escenario"><CodeBox data={scenario} /></Card>
        </div>
      </section>
    </Shell>
  );
}
