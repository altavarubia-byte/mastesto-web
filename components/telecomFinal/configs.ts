import type { ProductModuleConfig } from "./ModuleProductPage";

const bool = ["true", "false"];

export const RF_CONFIG: ProductModuleConfig = {
  key: "rf",
  title: "RF Product Lab",
  badge: "RF · FEKO-like · Antenas · Matching",
  description: "Antenas, matching, barridos, cámara sintética, patrón, S11, VSWR y validación.",
  initialPayload: {
    antennaType: "helix",
    frecuenciaGHz: 2.45,
    numRays: 900000,
    geometry: { lengthLambda: 0.48, radiusLambda: 0.002, nSegments: 181, turns: 7, helixRadiusMm: 21.1, pitchAngleDeg: 13, conductorDiameterMm: 2, groundPlaneRadiusMm: 65 },
    matching: { targetOhm: 50, network: "quarter_wave", stubEnabled: true, stripWidthMm: 6, stripLengthMm: 28 },
    sweep: { fStartGHz: 2.0, fStopGHz: 3.0, points: 201 },
    validation: { referenceCase: "helical_2_45GHz", meshConvergence: true, chamberSynthetic: true }
  },
  sections: [
    { title: "Antena", description: "Parámetros globales.", fields: [{path:"antennaType",label:"Tipo",type:"select",options:["dipole","helix","patch","array"]},{path:"frecuenciaGHz",label:"Frecuencia",type:"number",unit:"GHz"},{path:"numRays",label:"Rayos",type:"number"}] },
    { title: "Geometría", description: "Dimensiones de antena.", fields: [{path:"geometry.turns",label:"Vueltas",type:"number"},{path:"geometry.helixRadiusMm",label:"Radio hélice",type:"number",unit:"mm"},{path:"geometry.pitchAngleDeg",label:"Ángulo paso",type:"number",unit:"deg"},{path:"geometry.conductorDiameterMm",label:"Conductor",type:"number",unit:"mm"},{path:"geometry.groundPlaneRadiusMm",label:"Plano masa",type:"number",unit:"mm"},{path:"geometry.nSegments",label:"Segmentos",type:"number"}] },
    { title: "Matching", description: "Adaptación y sweep.", fields: [{path:"matching.targetOhm",label:"Objetivo",type:"number",unit:"Ω"},{path:"matching.network",label:"Red",type:"select",options:["none","quarter_wave","stub","l_network"]},{path:"matching.stubEnabled",label:"Stub",type:"boolean",options:bool},{path:"sweep.fStartGHz",label:"Inicio",type:"number",unit:"GHz"},{path:"sweep.fStopGHz",label:"Fin",type:"number",unit:"GHz"},{path:"sweep.points",label:"Puntos",type:"number"}] }
  ],
  endpoints: [{label:"Estado RF",method:"GET",path:"/_rf_app/rf/health",payloadMode:"current"},{label:"Generar RF IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"rf",prompt:"antena profesional con S11 VSWR matching",level:"pro"}},{label:"Escenario industrial",method:"POST",path:"/telecom/v900000000/scenario/industrial",payloadMode:"global"}],
  capabilities: ["S11","VSWR","patrón","matching","sweep","cámara sintética","IA"]
};

export const SIONNA_CONFIG: ProductModuleConfig = {
  key: "sionna",
  title: "Sionna Product Lab",
  badge: "Sionna · Ray tracing · Edificio",
  description: "Editor visual, habitaciones, TX/RX, materiales, rayos, columna térmica y live simulation.",
  initialPayload: { frecuenciaGHz:2.45, forceFallback:true, txPowerDbm:20, thermalTempK:700, maxDepth:6, samplesPerSrc:1000000, tx:[{id:"tx1",x:-2,y:1.2,z:0,powerDbm:20}], rx:[{id:"rx1",x:3,y:1.2,z:1},{id:"rx2",x:8,y:1.2,z:-1}], rooms:[{id:"r1",name:"Sala",x:0,z:0,width:8,length:6,height:2.8,material:"brick"},{id:"r2",name:"Despacho",x:7,z:0,width:5,length:5,height:2.8,material:"concrete"}], objects:[{id:"wall1",type:"box",x:3.5,y:1.4,z:0,sx:.25,sy:2.8,sz:6,material:"concrete"},{id:"thermal-column",type:"thermal_column",x:1,y:1.5,z:1,sx:.8,sy:3,sz:.8,material:"hot_air"}] },
  sections: [
    { title:"Solver", description:"Trazado y radio.", fields:[{path:"frecuenciaGHz",label:"Frecuencia",type:"number",unit:"GHz"},{path:"txPowerDbm",label:"TX",type:"number",unit:"dBm"},{path:"maxDepth",label:"Profundidad",type:"number"},{path:"samplesPerSrc",label:"Samples",type:"number"},{path:"forceFallback",label:"Fallback",type:"boolean",options:bool}]},
    { title:"TX/RX", description:"Posiciones.", fields:[{path:"tx.0.x",label:"TX X",type:"number"},{path:"tx.0.z",label:"TX Z",type:"number"},{path:"rx.0.x",label:"RX1 X",type:"number"},{path:"rx.0.z",label:"RX1 Z",type:"number"},{path:"rx.1.x",label:"RX2 X",type:"number"},{path:"rx.1.z",label:"RX2 Z",type:"number"}]},
    { title:"Edificio", description:"Materiales y columna.", fields:[{path:"rooms.0.material",label:"Material sala",type:"select",options:["brick","concrete","glass","wood","drywall"]},{path:"rooms.1.material",label:"Material despacho",type:"select",options:["brick","concrete","glass","wood","drywall"]},{path:"thermalTempK",label:"Temp columna",type:"number",unit:"K"},{path:"objects.1.x",label:"Columna X",type:"number"},{path:"objects.1.z",label:"Columna Z",type:"number"}]}
  ],
  endpoints: [{label:"Estado Sionna",method:"GET",path:"/_sionna_app/sionna/health",payloadMode:"current"},{label:"Live 3D",method:"POST",path:"/telecom/v500000000/simulation/live",payloadMode:"custom",payload:{timeS:1,rfPowerDbm:20,people:4,opticalLengthKm:10,solarIrradianceWm2:850,frecuenciaGHz:2.45}},{label:"Generar Sionna IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"sionna",prompt:"edificio visual ray tracing tx rx materiales",level:"pro"}}],
  capabilities: ["editor visual","TX/RX","rayos","materiales","columna térmica","live","CIR"]
};

export const OPTICAL_CONFIG: ProductModuleConfig = {
  key:"optical", title:"Optical Product Lab", badge:"Óptica · WDM · Eye · BER", description:"Fibra, WDM, FSO, BER, OSNR, presupuesto óptico y eye diagram.",
  initialPayload:{wavelengthNm:1550,lengthKm:10,txPowerDbm:0,rxSensitivityDbm:-20,fiberType:"G652D",bitrateGbps:10,connectors:2,splices:4,marginDb:3,wdm:{channels:8,spacingGHz:100},fso:{enabled:false,distanceKm:1,visibilityKm:10}},
  sections:[{title:"Fibra",description:"Enlace.",fields:[{path:"wavelengthNm",label:"λ",type:"number",unit:"nm"},{path:"lengthKm",label:"Longitud",type:"number",unit:"km"},{path:"fiberType",label:"Fibra",type:"select",options:["G652D","G655","OM3","OM4"]},{path:"bitrateGbps",label:"Bitrate",type:"number",unit:"Gbps"}]},{title:"Balance",description:"Pérdidas.",fields:[{path:"txPowerDbm",label:"TX",type:"number",unit:"dBm"},{path:"rxSensitivityDbm",label:"RX",type:"number",unit:"dBm"},{path:"connectors",label:"Conectores",type:"number"},{path:"splices",label:"Empalmes",type:"number"},{path:"marginDb",label:"Margen",type:"number",unit:"dB"}]},{title:"WDM/FSO",description:"Multiplexación.",fields:[{path:"wdm.channels",label:"Canales",type:"number"},{path:"wdm.spacingGHz",label:"Spacing",type:"number"},{path:"fso.enabled",label:"FSO",type:"boolean",options:bool},{path:"fso.distanceKm",label:"Distancia",type:"number"}]}],
  endpoints:[{label:"Estado óptica",method:"GET",path:"/_optical_app/optical/health",payloadMode:"current"},{label:"Generar óptica IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"optical",prompt:"enlace optico visual eye diagram WDM BER",level:"pro"}}],
  capabilities:["eye diagram","WDM","OSNR","BER","presupuesto","FSO"]
};

export const DSP_CONFIG: ProductModuleConfig = {
  key:"dsp", title:"DSP Product Lab", badge:"DSP · FFT · STFT · BER", description:"Señales, FFT, STFT, VAD, features, modulación, espectrograma y BER.",
  initialPayload:{signal:{kind:"chirp",frequencyHz:1000,fs:16000,durationS:1,noiseStd:.01},stft:{nFft:512,hopLength:160,window:"hann"},vad:{threshold:.05,minVoiceMs:80,minSilenceMs:100},modulation:{scheme:"QPSK",snrDb:20,bits:10000}},
  sections:[{title:"Señal",description:"Fuente.",fields:[{path:"signal.kind",label:"Tipo",type:"select",options:["sine","chirp","noise"]},{path:"signal.frequencyHz",label:"Frecuencia",type:"number"},{path:"signal.fs",label:"fs",type:"number"},{path:"signal.durationS",label:"Duración",type:"number"}]},{title:"STFT/VAD",description:"Análisis.",fields:[{path:"stft.nFft",label:"NFFT",type:"number"},{path:"stft.hopLength",label:"Hop",type:"number"},{path:"stft.window",label:"Ventana",type:"select",options:["hann","hamming","blackman"]},{path:"vad.threshold",label:"Umbral",type:"number"}]},{title:"Modulación",description:"Comunicaciones.",fields:[{path:"modulation.scheme",label:"Modulación",type:"select",options:["BPSK","QPSK","16QAM"]},{path:"modulation.snrDb",label:"SNR",type:"number"},{path:"modulation.bits",label:"Bits",type:"number"}]}],
  endpoints:[{label:"Estado DSP",method:"GET",path:"/_dsp_app/dsp/health",payloadMode:"current"},{label:"Pipeline DSP",method:"POST",path:"/_dsp_app/dsp/v40000/validation/pipeline",payloadMode:"current"},{label:"Generar DSP IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"dsp",prompt:"DSP visual FFT STFT espectrograma BER",level:"pro"}}],
  capabilities:["waveform","FFT","STFT","VAD","BER","espectrograma"]
};

export const ELECTRONICS_CONFIG: ProductModuleConfig = {
  key:"electronics", title:"Electronics Product Lab", badge:"Electrónica · PCB · Thermal", description:"Circuitos, divisor, RC, potencia, PCB thermal, fuente y esquema.",
  initialPayload:{divider:{vinV:5,r1Ohm:10000,r2Ohm:10000},rc:{rOhm:1000,cF:.000001,frequencyHz:1000},thermal:{powerW:2.5,thetaJaCPerW:40,ambientC:30},power:{vinV:12,voutV:5,ioutA:1,efficiency:.88},pcb:{layers:4,copperOz:1,boardAreaCm2:80}},
  sections:[{title:"Divisor",description:"Red resistiva.",fields:[{path:"divider.vinV",label:"Vin",type:"number"},{path:"divider.r1Ohm",label:"R1",type:"number"},{path:"divider.r2Ohm",label:"R2",type:"number"}]},{title:"RC",description:"Filtro.",fields:[{path:"rc.rOhm",label:"R",type:"number"},{path:"rc.cF",label:"C",type:"number"},{path:"rc.frequencyHz",label:"Frecuencia",type:"number"}]},{title:"PCB/Thermal",description:"Potencia.",fields:[{path:"thermal.powerW",label:"Potencia",type:"number"},{path:"thermal.thetaJaCPerW",label:"Theta",type:"number"},{path:"thermal.ambientC",label:"Ambiente",type:"number"},{path:"pcb.layers",label:"Capas",type:"number"}]}],
  endpoints:[{label:"Estado electrónica",method:"GET",path:"/_electronics_app/electronics/health",payloadMode:"current"},{label:"Pipeline electrónica",method:"POST",path:"/_electronics_app/electronics/v100000/validation/pipeline",payloadMode:"current"},{label:"Generar electrónica IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"electronics",prompt:"esquematico PCB RC thermal potencia",level:"pro"}}],
  capabilities:["esquemático","RC","PCB","thermal","power"]
};

export const ENERGY_CONFIG: ProductModuleConfig = {
  key:"energy", title:"Energy Product Lab", badge:"Energía · PV · HVAC · CO2", description:"Curvas solares, batería, HVAC, coste, CO2, microgrid y balance horario.",
  initialPayload:{pv:{areaM2:30,irradianceWm2:850,efficiency:.2},battery:{capacityKWh:12,soc:.65,loadKW:2},hvac:{areaM2:120,loadWm2:90,cop:3.2},grid:{pvKW:5,loadKW:4,batteryKW:1},cost:{eurKWh:.18,co2KgKWh:.22}},
  sections:[{title:"PV",description:"Solar.",fields:[{path:"pv.areaM2",label:"Área",type:"number"},{path:"pv.irradianceWm2",label:"Irradiancia",type:"number"},{path:"pv.efficiency",label:"Eficiencia",type:"number"}]},{title:"Batería",description:"Almacenamiento.",fields:[{path:"battery.capacityKWh",label:"Capacidad",type:"number"},{path:"battery.soc",label:"SOC",type:"number"},{path:"battery.loadKW",label:"Carga",type:"number"}]},{title:"HVAC/Coste",description:"Coste y CO2.",fields:[{path:"hvac.areaM2",label:"Área",type:"number"},{path:"hvac.loadWm2",label:"Carga",type:"number"},{path:"hvac.cop",label:"COP",type:"number"},{path:"cost.eurKWh",label:"€/kWh",type:"number"},{path:"cost.co2KgKWh",label:"CO2",type:"number"}]}],
  endpoints:[{label:"Estado energía",method:"GET",path:"/_energy_app/energy/health",payloadMode:"current"},{label:"Pipeline energía",method:"POST",path:"/_energy_app/energy/v100000/validation/pipeline",payloadMode:"current"},{label:"Generar energía IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"energy",prompt:"PV bateria HVAC coste CO2",level:"pro"}}],
  capabilities:["PV","batería","HVAC","coste","CO2"]
};

export const IOT_CONFIG: ProductModuleConfig = {
  key:"iot", title:"IoT Product Lab", badge:"IoT · Sensores · Eventos", description:"Sensores, personas, gemelo digital, eventos, latencia, paquetes y estado de red.",
  initialPayload:{network:{devices:30,packets:1000,lossRate:.015,latencyMs:28},twin:{peopleMovement:{people:4,steps:120},objects:[{id:"router",x:0,y:1.2,z:0},{id:"sensor-temp",x:2,y:1.5,z:1}]},events:{motion:true,temperature:true,presence:true}},
  sections:[{title:"Red",description:"Tráfico.",fields:[{path:"network.devices",label:"Dispositivos",type:"number"},{path:"network.packets",label:"Paquetes",type:"number"},{path:"network.lossRate",label:"Pérdidas",type:"number"},{path:"network.latencyMs",label:"Latencia",type:"number"}]},{title:"Gemelo",description:"Personas y objetos.",fields:[{path:"twin.peopleMovement.people",label:"Personas",type:"number"},{path:"twin.peopleMovement.steps",label:"Pasos",type:"number"},{path:"twin.objects.0.x",label:"Router X",type:"number"},{path:"twin.objects.0.z",label:"Router Z",type:"number"}]},{title:"Eventos",description:"Sensores.",fields:[{path:"events.motion",label:"Movimiento",type:"boolean",options:bool},{path:"events.temperature",label:"Temperatura",type:"boolean",options:bool},{path:"events.presence",label:"Presencia",type:"boolean",options:bool}]}],
  endpoints:[{label:"Estado IoT",method:"GET",path:"/_iot_app/iot/health",payloadMode:"current"},{label:"Pipeline IoT",method:"POST",path:"/_iot_app/iot/v100000/validation/pipeline",payloadMode:"current"},{label:"Generar IoT IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"iot",prompt:"iot sensores personas eventos gemelo",level:"pro"}}],
  capabilities:["sensores","gemelo","latencia","eventos","personas"]
};

export const TL_CONFIG: ProductModuleConfig = {
  key:"transmissionLines", title:"Transmission Lines Product Lab", badge:"Líneas · Smith · VSWR", description:"Microstrip, Smith conceptual, VSWR, reflexión, impedancia y matching.",
  initialPayload:{microstrip:{widthM:.003,heightM:.0016,epsR:4.2},reflection:{z0Ohm:50,loadOhm:75},input:{z0Ohm:50,loadOhm:75,lengthM:.05,frecuenciaGHz:2.45,epsEff:2.8},quarterWave:{z0Ohm:50,loadOhm:75,frecuenciaGHz:2.45,epsEff:2.8},stub:{enabled:true,type:"shunt",lengthLambda:.18}},
  sections:[{title:"Microstrip",description:"Geometría.",fields:[{path:"microstrip.widthM",label:"Ancho",type:"number"},{path:"microstrip.heightM",label:"Altura",type:"number"},{path:"microstrip.epsR",label:"EpsR",type:"number"}]},{title:"Reflexión",description:"Carga.",fields:[{path:"reflection.z0Ohm",label:"Z0",type:"number"},{path:"reflection.loadOhm",label:"Carga",type:"number"},{path:"input.lengthM",label:"Longitud",type:"number"},{path:"input.frecuenciaGHz",label:"Frecuencia",type:"number"}]},{title:"Matching",description:"Adaptación.",fields:[{path:"stub.enabled",label:"Stub",type:"boolean",options:bool},{path:"stub.type",label:"Tipo",type:"select",options:["shunt","series"]},{path:"stub.lengthLambda",label:"Longitud",type:"number"}]}],
  endpoints:[{label:"Estado líneas",method:"GET",path:"/transmission-lines/health",payloadMode:"current"},{label:"Pipeline líneas",method:"POST",path:"/transmission-lines/v200000/validation/pipeline",payloadMode:"current"},{label:"Generar líneas IA",method:"POST",path:"/telecom/v500000000/manual-ai/generate",payloadMode:"custom",payload:{module:"transmission_lines",prompt:"smith VSWR microstrip matching",level:"pro"}}],
  capabilities:["Smith","VSWR","microstrip","matching","stub"]
};

export const INDUSTRIAL_CONFIG: ProductModuleConfig = {
  key:"industrial", title:"Industrial Product Lab", badge:"Industrial · QA · Readiness", description:"Dashboards, quality gate, incertidumbre, validación, seguridad, readiness comercial e informes.",
  initialPayload:{quality:{backendStarts:true,frontendBuilds:true,apiHealthOk:true,examplesRun:true,hasReports:true,hasValidation:true,hasRealMeasurements:false,hasSecurityControls:false,hasBillingPlan:false},uncertainty:{components:[{name:"solver_numeric",std:1.5,unit:"dB"},{name:"material_model",std:1,unit:"dB"},{name:"measurement_noise",std:.5,unit:"dB"}]},validation:{syntheticTests:20,theoryComparisons:3,referenceSolverComparisons:1,realMeasurements:0,repeatabilityRuns:2,documentedReports:2},commercial:{workingBackend:true,workingFrontend:true,clearUseCase:true,demoScenario:true,reportGeneration:true,realValidationCase:false,billing:false,dataPersistence:false}},
  sections:[{title:"Quality",description:"Checks.",fields:[{path:"quality.backendStarts",label:"Backend",type:"boolean",options:bool},{path:"quality.frontendBuilds",label:"Frontend",type:"boolean",options:bool},{path:"quality.apiHealthOk",label:"API",type:"boolean",options:bool},{path:"quality.hasRealMeasurements",label:"Medidas",type:"boolean",options:bool},{path:"quality.hasSecurityControls",label:"Seguridad",type:"boolean",options:bool}]},{title:"Validación",description:"Madurez.",fields:[{path:"validation.syntheticTests",label:"Tests",type:"number"},{path:"validation.referenceSolverComparisons",label:"Solver",type:"number"},{path:"validation.realMeasurements",label:"Medidas reales",type:"number"},{path:"validation.documentedReports",label:"Informes",type:"number"}]},{title:"Comercial",description:"Readiness.",fields:[{path:"commercial.workingBackend",label:"Backend",type:"boolean",options:bool},{path:"commercial.workingFrontend",label:"Frontend",type:"boolean",options:bool},{path:"commercial.realValidationCase",label:"Caso real",type:"boolean",options:bool},{path:"commercial.billing",label:"Billing",type:"boolean",options:bool},{path:"commercial.dataPersistence",label:"Persistencia",type:"boolean",options:bool}]}],
  endpoints:[{label:"Estado industrial",method:"GET",path:"/industrial/health",payloadMode:"current"},{label:"Quality gate",method:"POST",path:"/industrial/v900000000/quality/gate",payloadMode:"current"},{label:"Uncertainty budget",method:"POST",path:"/industrial/v900000000/uncertainty/budget",payloadMode:"current"},{label:"Validation maturity",method:"POST",path:"/industrial/v900000000/validation/maturity",payloadMode:"current"},{label:"Commercial readiness",method:"POST",path:"/industrial/v900000000/commercial/readiness",payloadMode:"current"},{label:"Informe industrial",method:"POST",path:"/industrial/v900000000/report",payloadMode:"current"}],
  capabilities:["gauges","QA","readiness","uncertainty","validation","report"]
};

export const ALL_CONFIGS = [RF_CONFIG, SIONNA_CONFIG, OPTICAL_CONFIG, DSP_CONFIG, ELECTRONICS_CONFIG, ENERGY_CONFIG, IOT_CONFIG, TL_CONFIG, INDUSTRIAL_CONFIG];
