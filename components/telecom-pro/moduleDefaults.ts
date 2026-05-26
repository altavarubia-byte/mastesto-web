import type { ModuleKey } from "@/lib/telecomProApi";

export type EndpointDef = {
  label: string;
  method: "GET" | "POST";
  path: string;
  defaultPayload?: unknown;
};

export type ModuleConfig = {
  key: ModuleKey;
  title: string;
  subtitle: string;
  aiModule: string;
  fields: { key: string; label: string; type: "number" | "text" | "select"; options?: string[] }[];
  defaultPayload: Record<string, unknown>;
  endpoints: EndpointDef[];
};

export const MODULES: Record<ModuleKey, ModuleConfig> = {
  rf: {
    key: "rf",
    title: "RF Lab",
    subtitle: "Antenas, FEKO-like, cámara anecoica, patrón, S11, VSWR y validación RF.",
    aiModule: "rf",
    fields: [
      { key: "antennaType", label: "Tipo de antena", type: "select", options: ["dipole", "helix", "patch", "array"] },
      { key: "frecuenciaGHz", label: "Frecuencia GHz", type: "number" },
      { key: "numRays", label: "Rayos sintéticos", type: "number" },
    ],
    defaultPayload: {
      antennaType: "dipole",
      frecuenciaGHz: 2.45,
      numRays: 200000,
      geometry: { lengthLambda: 0.48, radiusLambda: 0.002, nSegments: 81 },
    },
    endpoints: [
      { label: "Estado RF", method: "GET", path: "/_rf_app/rf/health" },
      { label: "Simular global con RF", method: "POST", path: "/telecom/v500000000/scenario/ultimate" },
      { label: "Generar RF con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "rf", prompt: "antena wifi 2.45 GHz profesional", level: "pro" } },
    ],
  },
  sionna: {
    key: "sionna",
    title: "Sionna Lab",
    subtitle: "Editor de escena, edificio, router, receptores, materiales, rayos, CIR y cobertura.",
    aiModule: "sionna",
    fields: [
      { key: "frecuenciaGHz", label: "Frecuencia GHz", type: "number" },
      { key: "txPowerDbm", label: "Potencia TX dBm", type: "number" },
      { key: "thermalTempK", label: "Temperatura columna K", type: "number" },
    ],
    defaultPayload: {
      frecuenciaGHz: 2.45,
      forceFallback: true,
      txPowerDbm: 20,
      thermalTempK: 700,
      rooms: [
        { id: "r1", name: "Sala principal", x: 0, z: 0, width: 8, length: 6, height: 2.8, material: "brick" },
        { id: "r2", name: "Despacho", x: 7, z: 0, width: 5, length: 5, height: 2.8, material: "concrete" }
      ],
      objects: [
        { id: "wall1", type: "box", x: 3.5, y: 1.4, z: 0, sx: 0.25, sy: 2.8, sz: 6, material: "concrete" },
        { id: "thermal-column", type: "thermal_column", x: 1, y: 1.5, z: 1, sx: 0.8, sy: 3, sz: 0.8, material: "hot_air" }
      ],
      tx: [{ id: "tx1", x: -2, y: 1.2, z: 0, powerDbm: 20 }],
      rx: [{ id: "rx1", x: 3, y: 1.2, z: 1 }, { id: "rx2", x: 8, y: 1.2, z: -1 }]
    },
    endpoints: [
      { label: "Estado Sionna", method: "GET", path: "/_sionna_app/sionna/health" },
      { label: "Live 3D", method: "POST", path: "/telecom/v500000000/simulation/live", defaultPayload: { timeS: 1, rfPowerDbm: 20, people: 4, opticalLengthKm: 10, solarIrradianceWm2: 850, frecuenciaGHz: 2.45 } },
      { label: "Generar Sionna con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "sionna", prompt: "edificio con paredes, router, receptores y columna térmica", level: "pro" } },
    ],
  },
  optical: {
    key: "optical",
    title: "Optical Lab",
    subtitle: "Fibra, WDM, FSO, EDFA, presupuesto óptico, OSNR, BER y dispersión.",
    aiModule: "optical",
    fields: [
      { key: "wavelengthNm", label: "Longitud de onda nm", type: "number" },
      { key: "lengthKm", label: "Longitud km", type: "number" },
      { key: "bitrateGbps", label: "Bitrate Gbps", type: "number" },
    ],
    defaultPayload: {
      wavelengthNm: 1550,
      lengthKm: 10,
      txPowerDbm: 0,
      rxSensitivityDbm: -20,
      fiberType: "G652D",
      bitrateGbps: 10,
      connectors: 2,
      splices: 4,
      marginDb: 3,
    },
    endpoints: [
      { label: "Estado óptica", method: "GET", path: "/_optical_app/optical/health" },
      { label: "Simular global", method: "POST", path: "/telecom/v500000000/scenario/ultimate" },
      { label: "Generar óptica con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "optical", prompt: "enlace fibra 10G con margen y BER", level: "pro" } },
    ],
  },
  dsp: {
    key: "dsp",
    title: "DSP Lab",
    subtitle: "Señales, FFT, STFT, filtros, VAD, features, modulación y BER.",
    aiModule: "dsp",
    fields: [
      { key: "signal.frequencyHz", label: "Frecuencia señal Hz", type: "number" },
      { key: "signal.fs", label: "Frecuencia muestreo Hz", type: "number" },
      { key: "signal.durationS", label: "Duración s", type: "number" },
    ],
    defaultPayload: {
      signal: { kind: "sine", frequencyHz: 1000, fs: 16000, durationS: 0.5, noiseStd: 0.01 }
    },
    endpoints: [
      { label: "Estado DSP", method: "GET", path: "/_dsp_app/dsp/health" },
      { label: "Pipeline DSP", method: "POST", path: "/_dsp_app/dsp/v40000/validation/pipeline" },
      { label: "Generar DSP con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "dsp", prompt: "señal chirp con FFT, STFT y features", level: "pro" } },
    ],
  },
  electronics: {
    key: "electronics",
    title: "Electronics Lab",
    subtitle: "Divisores, RC, opamp, potencia, PCB thermal y validación electrónica.",
    aiModule: "electronics",
    fields: [
      { key: "divider.vinV", label: "Vin V", type: "number" },
      { key: "divider.r1Ohm", label: "R1 Ohm", type: "number" },
      { key: "divider.r2Ohm", label: "R2 Ohm", type: "number" },
    ],
    defaultPayload: {
      divider: { vinV: 5, r1Ohm: 10000, r2Ohm: 10000 },
      rc: { rOhm: 1000, cF: 0.000001, frequencyHz: 1000 },
      thermal: { powerW: 2.5, thetaJaCPerW: 40, ambientC: 30 }
    },
    endpoints: [
      { label: "Estado electrónica", method: "GET", path: "/_electronics_app/electronics/health" },
      { label: "Pipeline electrónica", method: "POST", path: "/_electronics_app/electronics/v100000/validation/pipeline" },
      { label: "Generar electrónica con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "electronics", prompt: "PCB con divisor, RC, térmica y potencia", level: "pro" } },
    ],
  },
  energy: {
    key: "energy",
    title: "Energy Lab",
    subtitle: "Solar, batería, HVAC, microgrid, costes, CO2 y balance energético.",
    aiModule: "energy",
    fields: [
      { key: "pv.areaM2", label: "Área FV m²", type: "number" },
      { key: "pv.irradianceWm2", label: "Irradiancia W/m²", type: "number" },
      { key: "battery.capacityKWh", label: "Batería kWh", type: "number" },
    ],
    defaultPayload: {
      pv: { areaM2: 30, irradianceWm2: 850, efficiency: 0.2 },
      battery: { capacityKWh: 12, soc: 0.65, loadKW: 2 },
      hvac: { areaM2: 120, loadWm2: 90, cop: 3.2 },
      grid: { pvKW: 5, loadKW: 4, batteryKW: 1 }
    },
    endpoints: [
      { label: "Estado energía", method: "GET", path: "/_energy_app/energy/health" },
      { label: "Pipeline energía", method: "POST", path: "/_energy_app/energy/v100000/validation/pipeline" },
      { label: "Generar energía con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "energy", prompt: "solar, bateria, HVAC y microgrid edificio", level: "pro" } },
    ],
  },
  iot: {
    key: "iot",
    title: "IoT Lab",
    subtitle: "Sensores, personas, gemelo digital, paquetes, latencia, pérdidas y eventos.",
    aiModule: "iot",
    fields: [
      { key: "network.devices", label: "Dispositivos", type: "number" },
      { key: "network.packets", label: "Paquetes", type: "number" },
      { key: "twin.peopleMovement.people", label: "Personas", type: "number" },
    ],
    defaultPayload: {
      network: { devices: 30, packets: 1000, lossRate: 0.015, latencyMs: 28 },
      twin: { peopleMovement: { people: 4, steps: 120 }, objects: [{ id: "router", x: 0, y: 1.2, z: 0 }] }
    },
    endpoints: [
      { label: "Estado IoT", method: "GET", path: "/_iot_app/iot/health" },
      { label: "Pipeline IoT", method: "POST", path: "/_iot_app/iot/v100000/validation/pipeline" },
      { label: "Generar IoT con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "iot", prompt: "sensores, personas moviéndose y gemelo digital", level: "pro" } },
    ],
  },
  transmissionLines: {
    key: "transmissionLines",
    title: "Transmission Lines Lab",
    subtitle: "Microstrip, coaxial, stripline, guía TE10, Smith, VSWR, S-parameters y adaptación.",
    aiModule: "transmission_lines",
    fields: [
      { key: "microstrip.widthM", label: "Microstrip width m", type: "number" },
      { key: "microstrip.heightM", label: "Substrate height m", type: "number" },
      { key: "microstrip.epsR", label: "Epsilon r", type: "number" },
    ],
    defaultPayload: {
      microstrip: { widthM: 0.003, heightM: 0.0016, epsR: 4.2 },
      reflection: { z0Ohm: 50, loadOhm: 75 },
      input: { z0Ohm: 50, loadOhm: 75, lengthM: 0.05, frecuenciaGHz: 2.45, epsEff: 2.8 },
      quarterWave: { z0Ohm: 50, loadOhm: 75, frecuenciaGHz: 2.45, epsEff: 2.8 }
    },
    endpoints: [
      { label: "Estado líneas", method: "GET", path: "/transmission-lines/health" },
      { label: "Pipeline líneas", method: "POST", path: "/transmission-lines/v200000/validation/pipeline" },
      { label: "Generar líneas con IA", method: "POST", path: "/telecom/v500000000/manual-ai/generate", defaultPayload: { module: "transmission_lines", prompt: "microstrip 50 ohm, Smith y VSWR", level: "pro" } },
    ],
  },
  industrial: {
    key: "industrial",
    title: "Industrial Lab",
    subtitle: "Quality gate, incertidumbre, trazabilidad, validación, seguridad y readiness comercial.",
    aiModule: "industrial",
    fields: [
      { key: "validation.syntheticTests", label: "Tests sintéticos", type: "number" },
      { key: "validation.realMeasurements", label: "Medidas reales", type: "number" },
      { key: "validation.referenceSolverComparisons", label: "Comparaciones solver", type: "number" },
    ],
    defaultPayload: {
      quality: { backendStarts: true, frontendBuilds: true, apiHealthOk: true, examplesRun: true, hasReports: true, hasValidation: true, hasRealMeasurements: false },
      validation: { syntheticTests: 20, theoryComparisons: 3, referenceSolverComparisons: 1, realMeasurements: 0, repeatabilityRuns: 2, documentedReports: 2 },
      commercial: { workingBackend: true, workingFrontend: true, clearUseCase: true, demoScenario: true, reportGeneration: true, realValidationCase: false }
    },
    endpoints: [
      { label: "Estado industrial", method: "GET", path: "/industrial/health" },
      { label: "Readiness comercial", method: "POST", path: "/industrial/v900000000/commercial/readiness" },
      { label: "Informe industrial", method: "POST", path: "/industrial/v900000000/report" },
    ],
  },
};
