import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="energy"
      title="Laboratorio Energía"
      subtitle="Consumo total, batería, solar y autonomía."
      initialPayload={defaults.energy}
      nextLabel="Informe"
      guide=["Calcula consumo total, autonomía, energía diaria y solar.", "Evalúa si batería y solar sostienen el sistema.", "Recibe consumos desde electrónica y DSP."]
      charts=[]
    />
  );
}
