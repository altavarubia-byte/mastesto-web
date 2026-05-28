import { Lab } from "@/components/telecomLevel2/Lab";
import { defaults } from "@/lib/telecomLevel2/defaults";

export default function Page() {
  return (
    <Lab
      moduleKey="anechoic"
      title="Cámara Anecoica"
      subtitle="Patrón angular, ganancia, S11, VSWR, axial ratio y calidad."
      initialPayload={defaults.anechoic}
      nextLabel="Sionna"
      guide=["Campo lejano R >= 2D^2/lambda.", "Patrón angular, S11, VSWR, axial ratio y ganancia realizada.", "Para cámara real necesitas calibración, VNA y antena patrón."]
      charts=[{"title": "Patr\u00f3n angular", "path": "pattern2D", "x": "thetaDeg", "y": "normalizedGainDb"}, {"title": "Ganancia realizada", "path": "pattern2D", "x": "thetaDeg", "y": "realizedGainDbi"}, {"title": "S11", "path": "frequencySweep", "x": "frequencyGHz", "y": "s11Db"}, {"title": "VSWR", "path": "frequencySweep", "x": "frequencyGHz", "y": "vswr"}]
    />
  );
}
