import defaultsJson from "./defaults.json";
export const defaults = defaultsJson as Record<string, any>;

export function buildPipelineFromBus(bus: any) {
  return {
    prompt: bus.ai?.payload?.prompt || defaults.ai.prompt,
    optical: bus.optical?.payload || defaults.optical,
    rf: bus.rf?.payload || defaults.rf,
    chamber: bus.anechoic?.payload?.chamber || defaults.anechoic.chamber,
    sionna: bus.sionna?.payload || defaults.sionna,
    electronics: bus.electronics?.payload || defaults.electronics,
    dsp: bus.dsp?.payload || defaults.dsp,
    energy: bus.energy?.payload || defaults.energy
  };
}
