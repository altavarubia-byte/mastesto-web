import { Lab } from "@/components/telecomLevel2/Lab";

const initialPayload = {
  "model": "thermal_column",
  "frequencyGHz": 2.45,
  "distanceM": 10,
  "txPowerDbm": 20,
  "antennaGainDbi": 8,
  "rxGainDbi": 2,
  "bandwidthMHz": 20,
  "noiseFigureDb": 5,
  "wallLossDb": 12,
  "multipathLossDb": 4,
  "shadowingDb": 0,
  "thermalTempK": 800,
  "velocityMs": 0,
  "requiredSnrDb": 10
};

const guide = [
  "model: free_space, indoor, thermal_column, material_walls, urban, nlos.",
  "Entrega path loss, potencia RX, SNR, retardo y Doppler térmico.",
  "Sionna real/PathSolver sería Nivel 3."
];

export default function Page() {
  return (
    <Lab
      moduleKey="sionna"
      title="Laboratorio Canal/Sionna Universal"
      subtitle="Modelos de canal: free_space, indoor, thermal_column, material_walls, urban y nlos."
      initialPayload={initialPayload}
      nextLabel="Pipeline universal"
      guide={guide}
      charts={[]}
    />
  );
}
