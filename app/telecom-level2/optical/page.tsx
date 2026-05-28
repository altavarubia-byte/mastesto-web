import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="optical"
      title="Laboratorio Óptico"
      subtitle="Fibra, WDM, margen óptico y conclusiones para RF."
      initialPayload={defaults.optical}
      nextLabel="RF"
      guide=["Calcula pérdidas por fibra, conectores, empalmes, splitters y EDFA.", "Entrega a RF ancho de banda sugerido, modulación y margen.", "Si el margen es bajo, reduce modulación o revisa potencia."]
      charts=[]
    />
  );
}
