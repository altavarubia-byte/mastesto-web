import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="ai"
      title="IA Pro"
      subtitle="Generación inteligente de escenario completo conectado."
      initialPayload={defaults.ai}
      nextLabel="Pipeline"
      guide=["Genera un escenario completo y lo previsualiza con pipeline.", "Extrae frecuencia, espiras, km, Gbps, habitaciones, receptores y temperatura.", "Nivel 2: coherencia técnica; nivel 3 requiere medición real."]
      charts=[]
    />
  );
}
