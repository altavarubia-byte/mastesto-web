import { Lab } from "@/components/telecomLevel2/Lab";

const initialPayload = {
  "model": "ofdm",
  "modulation": "QPSK",
  "snrDb": 18,
  "codingRate": 0.75,
  "bandwidthMHz": 20,
  "fftSize": 64,
  "occupiedSubcarriers": 52,
  "cpRatio": 0.25,
  "processingPowerW": 4.5,
  "recommendedEqualizer": false
};

const guide = [
  "model/modulation: bpsk, qpsk, 16qam, 64qam, ofdm.",
  "Calcula BER, EVM, throughput y eficiencia espectral.",
  "Nivel 3 requiere señales reales, canal real y validación."
];

export default function Page() {
  return (
    <Lab
      moduleKey="dsp"
      title="Laboratorio DSP Universal"
      subtitle="Modelos DSP: BPSK, QPSK, 16QAM, 64QAM, OFDM, BER/EVM/throughput y ecualización."
      initialPayload={initialPayload}
      nextLabel="Pipeline universal"
      guide={guide}
      charts={[]}
    />
  );
}
