import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="dsp"
      title="Laboratorio DSP"
      subtitle="SNR, BER, EVM, throughput y modulación."
      initialPayload={defaults.dsp}
      nextLabel="Energía"
      guide={["Calcula BER, EVM y throughput según modulación y SNR.", "Decide si el enlace es usable.", "Entrega consumo DSP a energía."]}
      charts={[]}
    />
  );
}
