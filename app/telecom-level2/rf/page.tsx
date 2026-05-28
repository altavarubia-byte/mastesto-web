import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="rf"
      title="Laboratorio RF"
      subtitle="Antena helicoidal, ganancia, S11, VSWR y modulación."
      initialPayload={defaults.rf}
      nextLabel="Cámara/Sionna"
      guide=["Calcula métricas de antena helicoidal axial-mode semiempírica.", "Entrega ganancia, HPBW, S11, VSWR y AR conceptual.", "No sustituye FEKO/HFSS/CST."]
      charts=[]
    />
  );
}
