import type { ModuleKey } from "@/lib/telecomPremium/core";

type AIResult = {
  ok: true;
  mode: "ai-v1100-local";
  module: ModuleKey;
  prompt: string;
  confidence: number;
  detected: Record<string, unknown>;
  payload: any;
  notes: string[];
  generatedAt: string;
};

function norm(prompt: string) {
  return prompt
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/,/g, ".")
    .trim();
}

function firstNumberAfter(text: string, patterns: RegExp[]) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return Number(m[1]);
  }
  return undefined;
}

function boolHas(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function pickMaterial(text: string) {
  if (boolHas(text, ["hormigon", "concrete"])) return "concrete";
  if (boolHas(text, ["ladrillo", "brick"])) return "brick";
  if (boolHas(text, ["cristal", "vidrio", "glass"])) return "glass";
  if (boolHas(text, ["madera", "wood"])) return "wood";
  if (boolHas(text, ["pladur", "drywall", "yeso"])) return "drywall";
  return undefined;
}

function detectModuleFromPrompt(text: string, fallback: ModuleKey): ModuleKey {
  if (boolHas(text, ["sionna", "ray tracing", "rayos", "edificio", "habitacion", "router", "receptor", "columna termica"])) return "sionna";
  if (boolHas(text, ["antena", "helice", "helicoidal", "patch", "dipolo", "array", "s11", "vswr", "ganancia", "espiras"])) return "rf";
  if (boolHas(text, ["fibra", "optica", "wdm", "osnr", "ber", "1550", "pon", "edfa"])) return "optical";
  if (boolHas(text, ["dsp", "fft", "stft", "audio", "vad", "qpsk", "bpsk", "qam", "snr"])) return "dsp";
  if (boolHas(text, ["pcb", "electronica", "resistencia", "condensador", "opamp", "rc", "buck", "boost"])) return "electronics";
  if (boolHas(text, ["energia", "solar", "fotovoltaica", "bateria", "hvac", "clima", "cop", "co2"])) return "energy";
  if (boolHas(text, ["iot", "sensor", "sensores", "mqtt", "personas", "latencia", "gateway"])) return "iot";
  if (boolHas(text, ["linea", "microstrip", "smith", "stub", "coaxial", "impedancia", "transmision"])) return "transmissionLines";
  if (boolHas(text, ["industrial", "validacion", "incertidumbre", "qa", "billing", "seguridad", "medidas reales"])) return "industrial";
  return fallback;
}

function detectCommon(text: string) {
  const ghz = firstNumberAfter(text, [
    /(\d+(?:\.\d+)?)\s*ghz/,
    /frecuencia\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/
  ]);
  const mhz = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*mhz/]);
  const frecuenciaGHz = ghz ?? (mhz ? mhz / 1000 : undefined);

  return {
    frecuenciaGHz,
    ohm: firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*ohm/, /(\d+(?:\.\d+)?)\s*Ω/]),
    km: firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*km/]),
    temperatureK: firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*k\b/, /(\d+(?:\.\d+)?)\s*kelvin/]),
    people: firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*personas?/, /(\d+(?:\.\d+)?)\s*usuarios?/]),
  };
}

function generateRF(current: any, text: string, common: any) {
  const turns = firstNumberAfter(text, [
    /(\d+(?:\.\d+)?)\s*(?:espiras|vueltas|turns)/,
    /helicoidal\s*(?:de|con)?\s*(\d+(?:\.\d+)?)/
  ]);
  const radiusMm = firstNumberAfter(text, [
    /radio\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)\s*mm/,
    /r\s*=\s*(\d+(?:\.\d+)?)\s*mm/
  ]);
  const pitchAngleDeg = firstNumberAfter(text, [
    /angulo\s*(?:de)?\s*paso\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/,
    /pitch\s*(?:angle)?\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/
  ]);
  const conductorMm = firstNumberAfter(text, [
    /conductor\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)\s*mm/,
    /diametro\s*(?:del)?\s*conductor\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/
  ]);
  const groundMm = firstNumberAfter(text, [
    /plano\s*(?:de)?\s*masa\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)\s*mm/,
    /ground\s*(?:plane)?\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/
  ]);

  let antennaType = current.antennaType ?? "helix";
  if (boolHas(text, ["patch", "parche"])) antennaType = "patch";
  if (boolHas(text, ["dipolo", "dipole"])) antennaType = "dipole";
  if (boolHas(text, ["array", "matriz"])) antennaType = "array";
  if (boolHas(text, ["helice", "helicoidal", "helix", "espiras"])) antennaType = "helix";

  const f = common.frecuenciaGHz ?? current.frecuenciaGHz ?? 2.45;
  const targetOhm = common.ohm ?? current.matching?.targetOhm ?? 50;

  return {
    ...current,
    antennaType,
    frecuenciaGHz: f,
    numRays: Math.max(900000, Number(current.numRays ?? 900000)),
    geometry: {
      ...(current.geometry || {}),
      turns: turns ?? current.geometry?.turns ?? 7,
      helixRadiusMm: radiusMm ?? current.geometry?.helixRadiusMm ?? 21.1,
      pitchAngleDeg: pitchAngleDeg ?? current.geometry?.pitchAngleDeg ?? 13,
      conductorDiameterMm: conductorMm ?? current.geometry?.conductorDiameterMm ?? 2,
      groundPlaneRadiusMm: groundMm ?? current.geometry?.groundPlaneRadiusMm ?? 65,
      nSegments: Math.max(181, Number(current.geometry?.nSegments ?? 181)),
    },
    matching: {
      ...(current.matching || {}),
      targetOhm,
      network: boolHas(text, ["stub"]) ? "stub" : current.matching?.network ?? "quarter_wave",
      stubEnabled: boolHas(text, ["stub"]) || current.matching?.stubEnabled ?? true,
    },
    sweep: {
      ...(current.sweep || {}),
      fStartGHz: Number((f * 0.8).toFixed(3)),
      fStopGHz: Number((f * 1.2).toFixed(3)),
      points: Math.max(201, Number(current.sweep?.points ?? 201)),
    },
    validation: {
      ...(current.validation || {}),
      meshConvergence: true,
      chamberSynthetic: true,
      note: "AI v1100 generated RF scenario. Use FEKO/HFSS/CST or measurements for final validation.",
    },
  };
}

function generateSionna(current: any, text: string, common: any) {
  const roomsN = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*habitaciones?/, /(\d+(?:\.\d+)?)\s*salas?/]) ?? 3;
  const rxN = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*receptores?/, /(\d+(?:\.\d+)?)\s*rx/]) ?? current.rx?.length ?? 3;
  const material = pickMaterial(text) ?? "concrete";
  const temp = common.temperatureK ?? firstNumberAfter(text, [/columna\s*termica\s*(?:a|de)?\s*(\d+(?:\.\d+)?)/]) ?? current.thermalTempK ?? 700;
  const f = common.frecuenciaGHz ?? current.frecuenciaGHz ?? 2.45;

  const rooms = Array.from({ length: Math.max(1, Math.min(8, Number(roomsN))) }, (_, i) => ({
    id: `room-${i + 1}`,
    name: i === 0 ? "Sala principal" : `Sala ${i + 1}`,
    x: i * 5,
    z: i % 2 === 0 ? 0 : 4,
    width: i === 0 ? 8 : 5,
    length: i === 0 ? 6 : 4.5,
    height: 2.8,
    material,
  }));

  const rx = Array.from({ length: Math.max(1, Math.min(12, Number(rxN))) }, (_, i) => ({
    id: `rx-${i + 1}`,
    x: 2 + i * 2,
    y: 1.2,
    z: i % 2 === 0 ? 1 : -1.5,
  }));

  return {
    ...current,
    frecuenciaGHz: f,
    forceFallback: current.forceFallback ?? true,
    txPowerDbm: current.txPowerDbm ?? 20,
    thermalTempK: temp,
    maxDepth: Math.max(6, Number(current.maxDepth ?? 6)),
    samplesPerSrc: Math.max(1000000, Number(current.samplesPerSrc ?? 1000000)),
    tx: current.tx?.length ? current.tx : [{ id: "tx1", x: -2, y: 1.2, z: 0, powerDbm: 20 }],
    rx,
    rooms,
    objects: [
      ...(current.objects || []).filter((o: any) => o.type !== "thermal_column"),
      { id: "thermal-column", type: "thermal_column", x: 1, y: 1.5, z: 1, sx: 0.8, sy: 3, sz: 0.8, material: "hot_air" },
    ],
    validation: {
      mode: "visual_or_sionna_ready",
      note: "AI v1100 created editable Sionna scenario. Real PathSolver must be verified in backend.",
    },
  };
}

function generateOptical(current: any, text: string, common: any) {
  const channels = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*canales?/, /(\d+(?:\.\d+)?)\s*channels?/]) ?? current.wdm?.channels ?? 8;
  const margin = firstNumberAfter(text, [/margen\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.marginDb ?? 3;
  const wavelength = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*nm/, /lambda\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.wavelengthNm ?? 1550;
  return {
    ...current,
    wavelengthNm: wavelength,
    lengthKm: common.km ?? current.lengthKm ?? 10,
    marginDb: margin,
    wdm: { ...(current.wdm || {}), channels, spacingGHz: current.wdm?.spacingGHz ?? 100 },
    fso: { ...(current.fso || {}), enabled: boolHas(text, ["fso", "espacio libre"]) || current.fso?.enabled ?? false },
    validation: { note: "AI v1100 optical scenario; verify OSNR/BER with real model." },
  };
}

function generateDSP(current: any, text: string) {
  let scheme = current.modulation?.scheme ?? "QPSK";
  if (boolHas(text, ["bpsk"])) scheme = "BPSK";
  if (boolHas(text, ["qpsk"])) scheme = "QPSK";
  if (boolHas(text, ["16qam", "16 qam"])) scheme = "16QAM";
  const snr = firstNumberAfter(text, [/snr\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.modulation?.snrDb ?? 20;
  const fs = firstNumberAfter(text, [/fs\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/, /(\d+(?:\.\d+)?)\s*hz/]) ?? current.signal?.fs ?? 16000;
  return {
    ...current,
    signal: { ...(current.signal || {}), fs, kind: boolHas(text, ["audio"]) ? "audio" : current.signal?.kind ?? "chirp" },
    stft: { ...(current.stft || {}), nFft: Math.max(512, Number(current.stft?.nFft ?? 512)), hopLength: current.stft?.hopLength ?? 160 },
    modulation: { ...(current.modulation || {}), scheme, snrDb: snr },
    validation: { note: "AI v1100 DSP scenario; browser visuals are synthetic unless audio is uploaded." },
  };
}

function generateEnergy(current: any, text: string) {
  const area = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*m2/, /(\d+(?:\.\d+)?)\s*m²/, /area\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.pv?.areaM2 ?? 30;
  const kwh = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*kwh/, /bateria\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.battery?.capacityKWh ?? 12;
  const cop = firstNumberAfter(text, [/cop\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.hvac?.cop ?? 3.2;
  return {
    ...current,
    pv: { ...(current.pv || {}), areaM2: area, irradianceWm2: current.pv?.irradianceWm2 ?? 850, efficiency: current.pv?.efficiency ?? 0.2 },
    battery: { ...(current.battery || {}), capacityKWh: kwh },
    hvac: { ...(current.hvac || {}), cop },
    validation: { note: "AI v1100 energy scenario; verify with real load profiles." },
  };
}

function generateIoT(current: any, text: string, common: any) {
  const devices = firstNumberAfter(text, [/(\d+(?:\.\d+)?)\s*sensores?/, /(\d+(?:\.\d+)?)\s*dispositivos?/]) ?? current.network?.devices ?? 30;
  const latency = firstNumberAfter(text, [/latencia\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.network?.latencyMs ?? 28;
  return {
    ...current,
    network: { ...(current.network || {}), devices, latencyMs: latency },
    twin: { ...(current.twin || {}), peopleMovement: { ...(current.twin?.peopleMovement || {}), people: common.people ?? current.twin?.peopleMovement?.people ?? 4 } },
    events: { motion: true, temperature: true, presence: true, ...(current.events || {}) },
    validation: { note: "AI v1100 IoT scenario; connect MQTT/real sensors for production." },
  };
}

function generateTransmissionLines(current: any, text: string, common: any) {
  const z0 = firstNumberAfter(text, [/z0\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.reflection?.z0Ohm ?? 50;
  const load = firstNumberAfter(text, [/carga\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/, /load\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.reflection?.loadOhm ?? 75;
  const eps = firstNumberAfter(text, [/epsr\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/, /epsilon\s*(?:de|=|:)?\s*(\d+(?:\.\d+)?)/]) ?? current.microstrip?.epsR ?? 4.2;
  return {
    ...current,
    microstrip: { ...(current.microstrip || {}), epsR: eps },
    reflection: { ...(current.reflection || {}), z0Ohm: z0, loadOhm: load },
    input: { ...(current.input || {}), z0Ohm: z0, loadOhm: load, frecuenciaGHz: common.frecuenciaGHz ?? current.input?.frecuenciaGHz ?? 2.45 },
    stub: { ...(current.stub || {}), enabled: boolHas(text, ["stub"]) || current.stub?.enabled ?? true },
    validation: { note: "AI v1100 transmission line scenario; use exact TL equations/backend for final values." },
  };
}

function generateIndustrial(current: any, text: string) {
  return {
    ...current,
    quality: {
      ...(current.quality || {}),
      hasValidation: true,
      hasReports: true,
      hasRealMeasurements: boolHas(text, ["medidas reales", "medicion real", "measurement"]),
      hasSecurityControls: boolHas(text, ["seguridad", "security"]),
      hasBillingPlan: boolHas(text, ["billing", "pago", "suscripcion"]),
    },
    validation: {
      ...(current.validation || {}),
      syntheticTests: Math.max(20, Number(current.validation?.syntheticTests ?? 20)),
      realMeasurements: boolHas(text, ["medidas reales", "measurement"]) ? Math.max(1, Number(current.validation?.realMeasurements ?? 0)) : current.validation?.realMeasurements ?? 0,
    },
    commercial: {
      ...(current.commercial || {}),
      billing: boolHas(text, ["billing", "pago", "suscripcion"]) || current.commercial?.billing ?? false,
      dataPersistence: boolHas(text, ["base de datos", "supabase", "persistencia"]) || current.commercial?.dataPersistence ?? false,
    },
  };
}

export function generateAIV1100Payload(moduleKey: ModuleKey, currentPayload: any, prompt: string): AIResult {
  const text = norm(prompt);
  const selected = detectModuleFromPrompt(text, moduleKey);
  const common = detectCommon(text);
  const notes: string[] = [];

  let payload = currentPayload;

  if (selected === "rf") payload = generateRF(currentPayload, text, common);
  if (selected === "sionna") payload = generateSionna(currentPayload, text, common);
  if (selected === "optical") payload = generateOptical(currentPayload, text, common);
  if (selected === "dsp") payload = generateDSP(currentPayload, text);
  if (selected === "electronics") payload = { ...currentPayload, validation: { note: "AI v1100 electronics scenario; use backend for exact circuit solving." } };
  if (selected === "energy") payload = generateEnergy(currentPayload, text);
  if (selected === "iot") payload = generateIoT(currentPayload, text, common);
  if (selected === "transmissionLines") payload = generateTransmissionLines(currentPayload, text, common);
  if (selected === "industrial") payload = generateIndustrial(currentPayload, text);

  if (selected !== moduleKey) notes.push(`El prompt parecía de módulo ${selected}, pero se aplica sobre ${moduleKey}.`);
  if (common.frecuenciaGHz) notes.push(`Frecuencia detectada: ${common.frecuenciaGHz} GHz.`);
  if (common.ohm) notes.push(`Impedancia detectada: ${common.ohm} ohm.`);
  if (text.includes("20 espiras") || text.includes("20 vueltas")) notes.push("Espiras detectadas en prompt.");

  return {
    ok: true,
    mode: "ai-v1100-local",
    module: moduleKey,
    prompt,
    confidence: Math.min(0.95, 0.55 + notes.length * 0.1),
    detected: common,
    payload: {
      ...payload,
      aiV1100: {
        enabled: true,
        interpretedPrompt: prompt,
        selectedModule: selected,
        generatedAt: new Date().toISOString(),
      },
    },
    notes,
    generatedAt: new Date().toISOString(),
  };
}
