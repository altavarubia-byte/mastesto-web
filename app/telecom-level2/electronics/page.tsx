import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="electronics"
      title="Laboratorio Electrónica"
      subtitle="LNA, ADC, ganancia, ruido, consumo y conclusiones para DSP/Energía."
      initialPayload={defaults.electronics}
      nextLabel="DSP/Energía"
      guide={["Predimensiona LNA, ganancia analógica, ADC, rango dinámico y consumo.", "Entrega SNR efectivo y parámetros de muestreo a DSP.", "Entrega consumo a energía."]}
      charts={[]}
    />
  );
}
