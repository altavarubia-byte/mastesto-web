"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Code, Shell, Stat } from "@/components/telecomLevel2/Shell";
import { getApi, readBus, routes } from "@/lib/telecomLevel2/api";

export default function Page() {
  const [status, setStatus] = useState<any>(null);
  const [bus, setBus] = useState<any>({});
  async function load() {
    setBus(readBus());
    try { setStatus(await getApi("/telecom/v1300/status")); }
    catch (e:any) { setStatus({ ok:false, error:e.message }); }
  }
  useEffect(() => { load(); }, []);
  const done = Object.keys(bus).filter(k=>k!=="meta").length;
  return (
    <Shell title="Nivel 2 Premium" subtitle="Simulación técnica conectada: óptica → RF → cámara anecoica → Sionna/canal → electrónica → DSP → energía → informe.">
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Backend" value={status?.ok ? "OK" : "CHECK"} />
        <Stat label="Nivel" value="2" />
        <Stat label="Bus módulos" value={done} />
        <Stat label="Validación real" value="Pendiente" />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.filter(r => r[0] !== "/telecom-level2").map(([href,label]) => (
          <Link key={href} href={href}>
            <Card title={label}>
              <div className="h-28 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,.30),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,.20),transparent_30%)]" />
              <p className="mt-4 text-sm text-zinc-400">Abrir laboratorio →</p>
            </Card>
          </Link>
        ))}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title="Status"><div className="mb-3"><Button tone="orange" onClick={load}>Recargar</Button></div><Code data={status} /></Card>
        <Card title="Bus global"><Code data={bus} /></Card>
      </section>
    </Shell>
  );
}
