import Link from "next/link";
import { Card, Shell, Stat } from "@/components/telecomFinal/ui";

const cards = [
  ["/mega-telecom-lab", "MegaProyecto", "Centro global integrado"],
  ["/rf-lab", "RF", "Antenas, S11, VSWR, matching"],
  ["/sionna-lab", "Sionna", "Edificio, rayos, TX/RX"],
  ["/optical-lab", "Óptica", "Fibra, WDM, eye diagram"],
  ["/dsp-lab", "DSP", "FFT, STFT, espectrograma"],
  ["/electronics-lab", "Electrónica", "PCB, RC, térmica"],
  ["/energy-lab", "Energía", "PV, batería, HVAC, CO2"],
  ["/iot-lab", "IoT", "Sensores, personas, eventos"],
  ["/transmission-lines-lab", "Líneas", "Smith, VSWR, microstrip"],
  ["/industrial-lab", "Industrial", "QA, readiness, validación"],
  ["/projects-lab", "Proyectos", "Guardar/cargar escenarios"],
  ["/validation-lab", "Validación", "Checklist global"],
];

export default function TelecomHomePage() {
  return (
    <Shell title="Mastesto Telecom Platform" badge="Final Productivo v∞" description="Entrada principal de la plataforma: módulos independientes, MegaProyecto integrado, proyectos, validación e informes.">
      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Módulos" value="9" />
        <Stat label="Modo" value="Producto local" />
        <Stat label="Backend" value="HF Space" />
        <Stat label="Estado" value="v∞" />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(([href, title, desc]) => (
          <Link key={href} href={href}>
            <Card title={title} subtitle={desc}>
              <p className="text-sm text-zinc-400">Abrir módulo →</p>
            </Card>
          </Link>
        ))}
      </section>
    </Shell>
  );
}
