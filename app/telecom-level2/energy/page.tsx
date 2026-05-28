import { Lab } from "@/components/telecomLevel2/Lab";

export default function Page() {
  return (
    <Lab
      moduleKey="energy"
      title="Laboratorio Energía Universal"
      subtitle="Modelos energéticos: batería, solar, híbrido, load budget y thermal load."
      initialPayload={"model": "hybrid", "batteryCapacityWh": 200, "solarAreaM2": 1.2, "irradianceWm2": 850, "solarEfficiencyPct": 20, "solarHoursEquivalent": 4.5, "hoursPerDay": 8, "baseSystemPowerW": 2, "electronicsPowerW": 3.2, "dspPowerW": 4.5, "coolingPowerW": 0}
      nextLabel="Pipeline universal"
      guide=["model: battery, solar, hybrid, load_budget, thermal_load.", "Calcula consumo total, autonomía, solar diario y balance energético.", "Nivel 3 requiere consumos medidos y perfiles reales."]
      charts={[]}
    />
  );
}
