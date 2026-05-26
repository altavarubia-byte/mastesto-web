"use client";

import { Chart, Gauge, MetricGrid } from "./ui";

export function RFVisual({ payload }: { payload: any }) {
  const f0 = Number(payload.frecuenciaGHz ?? 2.45);
  const start = Number(payload.sweep?.fStartGHz ?? 2);
  const stop = Number(payload.sweep?.fStopGHz ?? 3);
  const s11 = Array.from({length: 60}, (_, i) => {
    const f = start + (stop-start)*i/59;
    return -3 - 30*Math.exp(-Math.pow((f-f0)/0.08,2));
  });
  const vswr = s11.map(y => Math.max(1, 1 + Math.abs(y+30)/24));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Chart title="S11 estimado" values={s11} suffix="dB" />
      <Chart title="VSWR estimado" values={vswr} />
      <div className="rounded-3xl border border-zinc-800 bg-black p-4">
        <h3 className="font-black uppercase italic">Patrón polar conceptual</h3>
        <div className="relative mx-auto mt-4 h-72 w-72 rounded-full border border-zinc-700 bg-[radial-gradient(circle,#18181b,#020202)]">
          {Array.from({length: 24}).map((_,i)=><div key={i} className="absolute left-1/2 top-1/2 h-[1px] w-1/2 origin-left bg-zinc-800" style={{transform:`rotate(${i*15}deg)`}} />)}
          <div className="absolute left-1/2 top-1/2 h-32 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400 bg-orange-500/20 shadow-[0_0_35px_rgba(249,115,22,.35)]" />
        </div>
      </div>
      <MetricGrid items={[["Antena", payload.antennaType],["f0", `${f0} GHz`],["Matching", payload.matching?.network],["Rayos", payload.numRays]]} />
    </div>
  );
}

export function SionnaVisual({ payload }: { payload: any }) {
  const rooms = payload.rooms ?? [];
  const tx = payload.tx?.[0] ?? {x:0,z:0};
  const rx = payload.rx ?? [];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="relative h-[460px] overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle,#18181b,#020202)]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:24px_24px]" />
        {rooms.map((r:any,i:number)=><div key={r.id || i} className="absolute border-2 border-sky-500/70 bg-sky-500/5" style={{left:`${14+i*30}%`,top:`${28+i*8}%`,width:`${Math.max(18,r.width*4)}%`,height:`${Math.max(18,r.length*4)}%`}}><span className="p-2 text-[10px] font-black uppercase text-sky-300">{r.name}</span></div>)}
        <Dot label="TX" x={50 + Number(tx.x)*4} y={50 + Number(tx.z)*4} color="orange" />
        {rx.map((r:any,i:number)=><Dot key={r.id || i} label={`RX${i+1}`} x={50 + Number(r.x)*4} y={50 + Number(r.z)*4} color="emerald" />)}
        <div className="absolute left-[48%] top-[42%] h-28 w-20 rounded-full border border-red-400 bg-red-500/20 blur-[1px]" />
        <Ray x1={50 + Number(tx.x)*4} y1={50 + Number(tx.z)*4} x2={62} y2={58} />
        <Ray x1={50 + Number(tx.x)*4} y1={50 + Number(tx.z)*4} x2={75} y2={46} />
      </div>
      <MetricGrid items={[["Frecuencia", `${payload.frecuenciaGHz} GHz`],["TX", `${payload.txPowerDbm} dBm`],["Temp", `${payload.thermalTempK} K`],["Profundidad", payload.maxDepth],["Samples", payload.samplesPerSrc],["RX", rx.length]]} />
    </div>
  );
}

export function OpticalVisual({ payload }: { payload: any }) {
  const margin = Number(payload.marginDb ?? 3);
  const eyeOpen = Math.max(18, Math.min(90, 50 + margin*5));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-zinc-800 bg-black p-4">
        <h3 className="font-black uppercase italic">Eye diagram conceptual</h3>
        <div className="relative mt-4 h-72 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {Array.from({length: 24}).map((_,i)=><div key={i} className="absolute left-0 top-1/2 h-[2px] w-full bg-emerald-400/40" style={{transform:`translateY(${Math.sin(i)*eyeOpen}px) rotate(${i%2?8:-8}deg)`}} />)}
          <div className="absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300/70" />
        </div>
      </div>
      <Chart title="Canales WDM" values={Array.from({length: Number(payload.wdm?.channels ?? 8)},(_,i)=> 40 + Math.sin(i)*20)} suffix="ch" />
      <MetricGrid items={[["λ", `${payload.wavelengthNm} nm`],["Longitud", `${payload.lengthKm} km`],["Bitrate", `${payload.bitrateGbps} Gbps`],["Margen", `${payload.marginDb} dB`],["Fibra", payload.fiberType],["WDM", payload.wdm?.channels]]} />
      <Chart title="Presupuesto óptico" values={[payload.txPowerDbm ?? 0, -Number(payload.lengthKm ?? 10)*0.22, -Number(payload.connectors ?? 2)*0.4, -Number(payload.splices ?? 4)*0.1, payload.rxSensitivityDbm ?? -20]} suffix="dB" />
    </div>
  );
}

export function DSPVisual({ payload }: { payload: any }) {
  const fs = Number(payload.signal?.fs ?? 16000);
  const f = Number(payload.signal?.frequencyHz ?? 1000);
  const wave = Array.from({length:80},(_,i)=> Math.sin(2*Math.PI*f*i/fs*80));
  const fft = Array.from({length:48},(_,i)=> Math.exp(-Math.pow((i-14)/5,2))*80 + Math.sin(i)*5);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Chart title="Forma de onda" values={wave} />
      <Chart title="FFT conceptual" values={fft} />
      <div className="rounded-3xl border border-zinc-800 bg-black p-4 lg:col-span-2">
        <h3 className="font-black uppercase italic">Espectrograma conceptual</h3>
        <div className="mt-4 grid h-72 grid-cols-32 gap-[2px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-2">
          {Array.from({length: 32*16}).map((_,i)=> <div key={i} className="rounded-sm" style={{background:`rgba(236,72,153,${0.08 + 0.8*Math.abs(Math.sin(i/17))})`}} />)}
        </div>
      </div>
      <MetricGrid items={[["Tipo", payload.signal?.kind],["fs", `${payload.signal?.fs} Hz`],["NFFT", payload.stft?.nFft],["Mod", payload.modulation?.scheme],["SNR", `${payload.modulation?.snrDb} dB`],["Bits", payload.modulation?.bits]]} />
    </div>
  );
}

export function ElectronicsVisual({ payload }: { payload: any }) {
  const vout = Number(payload.divider?.vinV ?? 5) * Number(payload.divider?.r2Ohm ?? 1) / (Number(payload.divider?.r1Ohm ?? 1) + Number(payload.divider?.r2Ohm ?? 1));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-zinc-800 bg-black p-4">
        <h3 className="font-black uppercase italic">Esquemático conceptual</h3>
        <div className="relative mt-4 h-72 rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="absolute left-[10%] top-1/2 h-[2px] w-[18%] bg-yellow-400" />
          <Block label="R1" x="30%" y="38%" />
          <div className="absolute left-[42%] top-1/2 h-[2px] w-[13%] bg-yellow-400" />
          <Block label="R2" x="57%" y="38%" />
          <div className="absolute left-[69%] top-1/2 h-[2px] w-[19%] bg-yellow-400" />
          <span className="absolute left-[8%] top-[44%] text-xs text-yellow-300">Vin</span><span className="absolute right-[8%] top-[44%] text-xs text-yellow-300">Vout</span>
        </div>
      </div>
      <Chart title="RC response" values={Array.from({length:60},(_,i)=> 100/(1+i/8))} />
      <MetricGrid items={[["Vout divisor", `${vout.toFixed(2)} V`],["R", payload.rc?.rOhm],["C", payload.rc?.cF],["P térmica", `${payload.thermal?.powerW} W`],["PCB capas", payload.pcb?.layers],["Eficiencia", payload.power?.efficiency]]} />
      <Chart title="Temperatura estimada" values={Array.from({length:30},(_,i)=> Number(payload.thermal?.ambientC ?? 30)+i*Number(payload.thermal?.powerW ?? 2)*0.8)} suffix="°C" />
    </div>
  );
}

export function EnergyVisual({ payload }: { payload: any }) {
  const pv = Number(payload.pv?.areaM2 ?? 30)*Number(payload.pv?.irradianceWm2 ?? 850)*Number(payload.pv?.efficiency ?? .2)/1000;
  const daily = Array.from({length:24},(_,h)=> Math.max(0, Math.sin((h-6)/12*Math.PI))*pv);
  const load = Array.from({length:24},(_,h)=> Number(payload.grid?.loadKW ?? 4) + (h>8 && h<20 ? 1 : -0.5));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Chart title="Producción FV diaria" values={daily} suffix="kW" />
      <Chart title="Carga edificio" values={load} suffix="kW" />
      <MetricGrid items={[["PV pico", `${pv.toFixed(2)} kW`],["Batería", `${payload.battery?.capacityKWh} kWh`],["SOC", payload.battery?.soc],["COP", payload.hvac?.cop],["€/kWh", payload.cost?.eurKWh],["CO2", payload.cost?.co2KgKWh]]} />
      <Chart title="SOC batería conceptual" values={Array.from({length:24},(_,h)=> 50 + 30*Math.sin((h-4)/24*Math.PI*2))} suffix="%" />
    </div>
  );
}

export function IoTVisual({ payload }: { payload: any }) {
  const devices = Number(payload.network?.devices ?? 30);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="relative h-[420px] rounded-3xl border border-zinc-800 bg-[radial-gradient(circle,#18181b,#020202)]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:24px_24px]" />
        {Array.from({length: Math.min(devices,50)}).map((_,i)=><Dot key={i} label="" x={10+((i*13)%80)} y={15+((i*29)%70)} color={i%3===0?"purple":i%3===1?"sky":"emerald"} />)}
        <Dot label="GW" x={50} y={50} color="orange" />
      </div>
      <div className="space-y-4">
        <MetricGrid items={[["Dispositivos", devices],["Paquetes", payload.network?.packets],["Latencia", `${payload.network?.latencyMs} ms`],["Loss", payload.network?.lossRate],["Personas", payload.twin?.peopleMovement?.people],["Eventos", Object.values(payload.events ?? {}).filter(Boolean).length]]} />
        <Chart title="Latencia eventos" values={Array.from({length:40},(_,i)=> Number(payload.network?.latencyMs ?? 28)+Math.sin(i)*8)} suffix="ms" />
      </div>
    </div>
  );
}

export function TransmissionVisual({ payload }: { payload: any }) {
  const gamma = Math.abs((Number(payload.reflection?.loadOhm ?? 75)-Number(payload.reflection?.z0Ohm ?? 50))/(Number(payload.reflection?.loadOhm ?? 75)+Number(payload.reflection?.z0Ohm ?? 50)));
  const vswr = (1+gamma)/(1-gamma);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-zinc-800 bg-black p-4">
        <h3 className="font-black uppercase italic">Smith chart conceptual</h3>
        <div className="relative mx-auto mt-4 h-72 w-72 rounded-full border border-amber-400/70 bg-[radial-gradient(circle,#18181b,#020202)]">
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-zinc-800" />
          <div className="absolute left-0 top-1/2 h-[1px] w-full bg-zinc-800" />
          <div className="absolute left-[52%] top-[42%] h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,.6)]" style={{transform:`translate(${gamma*80}px,${gamma*35}px)`}} />
        </div>
      </div>
      <Chart title="VSWR conceptual" values={Array.from({length:60},(_,i)=> vswr + Math.sin(i/5)*0.2)} />
      <MetricGrid items={[["Z0", `${payload.reflection?.z0Ohm} Ω`],["Carga", `${payload.reflection?.loadOhm} Ω`],["Γ", gamma.toFixed(3)],["VSWR", vswr.toFixed(2)],["epsR", payload.microstrip?.epsR],["Stub", payload.stub?.type]]} />
      <Chart title="Impedancia a lo largo de línea" values={Array.from({length:60},(_,i)=> Number(payload.reflection?.z0Ohm ?? 50)+20*Math.sin(i/8))} suffix="Ω" />
    </div>
  );
}

export function IndustrialVisual({ payload }: { payload: any }) {
  const q = payload.quality ?? {};
  const v = payload.validation ?? {};
  const c = payload.commercial ?? {};
  const qualityScore = Object.values(q).filter(Boolean).length / Math.max(1,Object.values(q).length) * 100;
  const validationScore = Math.min(100, (Number(v.syntheticTests ?? 0)*1.5 + Number(v.realMeasurements ?? 0)*12 + Number(v.referenceSolverComparisons ?? 0)*8));
  const commercialScore = Object.values(c).filter(Boolean).length / Math.max(1,Object.values(c).length) * 100;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Gauge title="Quality" value={qualityScore} />
      <Gauge title="Validation" value={validationScore} />
      <Gauge title="Commercial" value={commercialScore} />
      <div className="lg:col-span-3"><Chart title="Madurez industrial" values={[qualityScore, validationScore, commercialScore, (qualityScore+validationScore+commercialScore)/3]} suffix="%" /></div>
      <MetricGrid items={[["Tests", v.syntheticTests],["Medidas reales", v.realMeasurements],["Solver comps", v.referenceSolverComparisons],["Billing", String(c.billing)],["Persistencia", String(c.dataPersistence)],["Caso real", String(c.realValidationCase)]]} />
    </div>
  );
}

function Dot({ label, x, y, color }: { label: string; x: number; y: number; color: string }) {
  const bg = color === "orange" ? "bg-orange-400" : color === "emerald" ? "bg-emerald-400" : color === "sky" ? "bg-sky-400" : "bg-purple-400";
  return <div className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${bg} shadow-lg`} style={{left:`${x}%`,top:`${y}%`}}><span className="absolute left-4 top-[-4px] text-[10px] font-black text-white">{label}</span></div>
}

function Ray({ x1,y1,x2,y2 }: { x1:number;y1:number;x2:number;y2:number }) {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy), ang=Math.atan2(dy,dx)*180/Math.PI;
  return <div className="absolute h-[2px] origin-left bg-orange-400/70" style={{left:`${x1}%`,top:`${y1}%`,width:`${len}%`,transform:`rotate(${ang}deg)`}} />
}

function Block({ label,x,y }: { label:string;x:string;y:string }) {
  return <div className="absolute flex h-14 w-20 items-center justify-center rounded-xl border border-yellow-400 bg-yellow-500/10 text-xs font-black text-yellow-200" style={{left:x,top:y}}>{label}</div>
}
