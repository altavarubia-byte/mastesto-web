import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="sionna"
      title="Laboratorio Sionna/Canal"
      subtitle="Path loss, SNR, potencia recibida, retardo y conclusiones para electrónica."
      initialPayload={defaults.sionna}
      nextLabel="Electrónica"
      guide={["Canal conceptual: path loss, potencia recibida, SNR, delay spread y Doppler térmico.", "Entrega a electrónica potencia de entrada, SNR y ganancia LNA requerida.", "Si Sionna real está instalado, el backend informa disponibilidad."]}
      charts={[]}
    />
  );
}
