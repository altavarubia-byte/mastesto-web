"use client";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Code, Shell, Stat } from "@/components/telecomLevel2/Shell";
import { downloadJson, readBus } from "@/lib/telecomLevel2/api";

export default function Page() {
  const [bus, setBus] = useState<any>({});
  useEffect(()=>setBus(readBus()), []);
  const pipeline = bus.pipeline?.result;
  const report = useMemo(()=>({
    title: "Informe técnico Nivel 2",
    generatedAt: new Date().toISOString(),
    level: "Nivel 2",
    modules: Object.keys(bus).filter(k=>k!=="meta"),
    final: pipeline?.final,
    optical: pipeline?.optical,
    rf: pipeline?.rf,
    anechoic: pipeline?.anechoicChamber?.metrics,
    sionna: pipeline?.sionna,
    electronics: pipeline?.electronics,
    dsp: pipeline?.dsp,
    energy: pipeline?.energy,
    warnings: pipeline?.warnings || ["No sustituye medidas reales ni solver full-wave."]
  }), [bus, pipeline]);
  return (
    <Shell title="Informe Nivel 2" subtitle="Resumen de laboratorios, pipeline y conclusiones técnicas.">
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Módulos" value={report.modules.length} />
        <Stat label="Sistema" value={report.final?.systemOk === true ? "OK" : report.final?.systemOk === false ? "Riesgos" : "Pendiente"} />
        <Stat label="BER" value={report.dsp?.ber ? report.dsp.ber.toExponential(2) : "-"} />
        <Stat label="Autonomía" value={report.energy?.batteryHours ? `${report.energy.batteryHours.toFixed(1)} h` : "-"} />
      </section>
      <div className="mb-5 flex gap-2">
        <Button tone="orange" onClick={() => setBus(readBus())}>Recargar bus</Button>
        <Button onClick={() => downloadJson("informe-level2.json", report)}>Descargar informe JSON</Button>
      </div>
      <section className="grid gap-5 xl:grid-cols-2">
        <Card title="Conclusión"><p className="text-sm leading-7 text-zinc-300">{report.final?.engineeringConclusion || "Ejecuta primero el pipeline."}</p></Card>
        <Card title="Informe JSON"><Code data={report} /></Card>
      </section>
    </Shell>
  );
}
