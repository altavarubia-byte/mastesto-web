import Link from "next/link";
import { Card, Shell, Stat } from "@/components/telecomPremium/PremiumShell";

const cards = [
  ["/mega-telecom-lab", "MegaProyecto 3D", "Gemelo digital global"],
  ["/rf-lab", "RF Premium", "Antena 3D, S11, VSWR"],
  ["/sionna-lab", "Sionna Premium", "Ray tracing 3D animado"],
  ["/optical-lab", "Óptica", "Eye, WDM, BER"],
  ["/dsp-lab", "DSP", "FFT, STFT, espectrograma"],
  ["/electronics-lab", "Electrónica", "PCB, RC, thermal"],
  ["/energy-lab", "Energía", "PV, batería, HVAC"],
  ["/iot-lab", "IoT", "Sensores, eventos, twin"],
  ["/transmission-lines-lab", "Líneas", "Smith, VSWR, matching"],
  ["/industrial-lab", "Industrial", "QA, readiness, gauges"],
];

export default function TelecomPremiumHome() {
  return (
    <Shell title="Telecom Premium Suite" badge="Mastesto · Premium 3D + Recharts" description="UI premium con Three.js, Recharts, IA, endpoints, exportación realtime y MegaProyecto 3D.">
      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="3D Engine" value="Three.js" tone="blue" />
        <Stat label="Charts" value="Recharts" tone="green" />
        <Stat label="Módulos" value="9" />
        <Stat label="Sync" value="Realtime" tone="orange" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([href, title, desc]) => (
          <Link key={href} href={href}>
            <Card title={title} subtitle={desc}>
              <div className="h-24 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,.25),transparent_30%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02))]" />
              <p className="mt-4 text-sm text-zinc-400">Abrir módulo premium →</p>
            </Card>
          </Link>
        ))}
      </section>
    </Shell>
  );
}
