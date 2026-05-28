import { Lab } from "@/components/telecomLevel2/Lab";

const initialPayload = {
  "antennaType": "helix",
  "frequencyGHz": 2.45,
  "txPowerDbm": 20,
  "geometry": {
    "turns": 20,
    "helixRadiusMm": 21.1,
    "pitchAngleDeg": 13,
    "lengthLambda": 0.5,
    "substrateHeightMm": 1.6,
    "epsR": 4.4,
    "apertureM": 0.18,
    "diameterM": 0.6,
    "directors": 5,
    "nx": 8,
    "ny": 1,
    "elementGainDbi": 2.15,
    "radiusLambda": 0.16
  }
};

const guide = [
  "antennaType: helix, dipole, monopole, patch, horn, parabolic, yagi, array, loop, generic.",
  "Entrega ganancia, directividad, HPBW, S11, VSWR, AR y polarización.",
  "Nivel 3 requiere FEKO/HFSS/CST + VNA/cámara."
];

export default function Page() {
  return (
    <Lab
      moduleKey="rf"
      title="Laboratorio RF Universal"
      subtitle="Antenas: helicoidal, dipolo, monopolo, patch, bocina, parabólica, Yagi, array, loop y genérica."
      initialPayload={initialPayload}
      nextLabel="Pipeline universal"
      guide={guide}
      charts={[]}
    />
  );
}
