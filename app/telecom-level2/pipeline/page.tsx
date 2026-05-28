"use client";
import { useEffect, useState } from "react";
import { Button, Card, Code, Shell, Stat } from "@/components/telecomLevel2/Shell";
import { downloadJson, postApi, readBus, writeBus } from "@/lib/telecomLevel2/api";
import { buildPipelineFromBus, defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  const [bus, setBus] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [payloadText, setPayloadText] = useState(JSON.stringify({
    prompt: defaults.ai.prompt,
    optical: defaults.optical,
    rf: defaults.rf,
    chamber: defaults.anechoic.chamber,
    sionna: defaults.sionna,
    electronics: defaults.electronics,
    dsp: defaults.dsp,
    energy: defaults.energy
  }, null, 2));
  useEffect(()=>setBus(readBus()), []);
  function importBus() {
    const b = readBus();
    setBus(b);
    setPayloadText(JSON.stringify(buildPipelineFromBus(b), null, 2));
  }
  async function run() {
    setLoading(true);
    try {
      const payload = JSON.parse(payloadText);
      const data = await postApi("/telecom/v1300/pipeline/run", payload);
      setResult(data);
      writeBus("pipeline", payload, data);
    } catch (e:any) { setResult({ ok:false, error:e.message }); }
    finally { setLoading(false); }
  }
  const final = result?.final || {};
  return (
    <Shell title="Pipeline Nivel 2" subtitle="Ejecuta la cadena completa y saca conclusiones entre ramas.">
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Estado" value={loading ? "Ejecutando" : "Listo"} />
        <Stat label="Sistema" value={final.systemOk === true ? "OK" : final.systemOk === false ? "Riesgos" : "Pendiente"} />
        <Stat label="BER" value={result?.dsp?.ber ? result.dsp.ber.toExponential(2) : "-"} />
        <Stat label="Batería" value={result?.energy?.batteryHours ? `${result.energy.batteryHours.toFixed(1)} h` : "-"} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card title="Payload pipeline">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button tone="blue" onClick={importBus}>Importar bus</Button>
            <Button tone="orange" onClick={run} disabled={loading}>Ejecutar pipeline</Button>
            <Button onClick={() => downloadJson("pipeline-level2-payload.json", JSON.parse(payloadText))}>Descargar payload</Button>
          </div>
          <textarea value={payloadText} onChange={e=>setPayloadText(e.target.value)} rows={36} className="w-full rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-zinc-300 outline-none focus:border-orange-500" />
        </Card>
        <section className="space-y-5">
          <Card title="Conclusión final">
            <p className="text-sm leading-7 text-zinc-300">{final.engineeringConclusion || "Ejecuta el pipeline."}</p>
            {final.orderedRisks?.length > 0 && <p className="mt-3 text-sm text-red-300">{final.orderedRisks.join(" · ")}</p>}
          </Card>
          <Card title="Resultado completo"><Code data={result} /></Card>
          <Card title="Bus actual"><Code data={bus} /></Card>
        </section>
      </section>
    </Shell>
  );
}
