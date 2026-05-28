import { Lab } from "@/components/telecomLevel2/Lab";

export default function Page() {
  return (
    <Lab
      moduleKey="optical"
      title="Laboratorio Óptico Universal"
      subtitle="Modelos ópticos: single fiber, WDM, PON splitter, EDFA chain, long-haul y coherent."
      initialPayload={"model": "wdm", "wavelengthNm": 1550, "lengthKm": 40, "txPowerDbm": 0, "rxSensitivityDbm": -20, "bitrateGbps": 25, "wdmChannels": 16, "connectors": 2, "connectorLossDb": 0.4, "splices": 8, "spliceLossDb": 0.1, "splitterLossDb": 0, "edfaGainDb": 12, "edfaNoiseFigureDb": 5, "dispersionPsNmKm": 17, "laserLinewidthNm": 0.1, "marginRequiredDb": 6}
      nextLabel="Pipeline universal"
      guide=["model: single_fiber, wdm, pon_splitter, edfa_chain, long_haul, coherent.", "El resultado entrega margen, OSNR aproximado, dispersión y conclusiones para RF.", "Nivel 3 requiere presupuesto óptico validado y medidas."]
      charts={[]}
    />
  );
}
