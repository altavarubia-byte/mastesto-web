import { Lab } from "@/components/telecomLevel2/Lab";

export default function Page() {
  return (
    <Lab
      moduleKey="electronics"
      title="Laboratorio Electrónica Universal"
      subtitle="Modelos: receiver chain, LNA chain, low-noise receiver, mixer IF ADC, zero-IF, superheterodyne y high dynamic range."
      initialPayload={"model": "receiver_chain", "inputPowerDbm": -65, "snrDb": 18, "lnaNoiseFigureDb": 2, "lnaGainDb": 20, "mixerLossDb": 6, "ifGainDb": 30, "adcBits": 12, "adcFsMHz": 40, "frontendPowerW": 2.8, "paEfficiencyPct": 35, "txPowerDbm": 20, "channelDelaySpreadNs": 30}
      nextLabel="Pipeline universal"
      guide=["model: receiver_chain, lna_chain, low_noise_receiver, mixer_if_adc, zero_if, superheterodyne, high_dynamic_range.", "Calcula ganancia, DR de ADC, margen de sobrecarga y consumo.", "Nivel 3 requiere simulación SPICE/RF y medidas."]
      charts={[]}
    />
  );
}
