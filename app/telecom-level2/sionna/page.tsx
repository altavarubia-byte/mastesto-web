import { Lab } from "@/components/telecomLevel2/Lab";

const initialPayload = {
  sceneName: "mastesto_generated_scene",
  fileName: "mastesto_generated_scene.xml",
  outputDir: "generated_scenes",
  save: true,

  frequencyHz: 2450000000,

  floor: {
    width: 16,
    depth: 12,
    thicknessM: 0.08,
    material: "concrete",
    roughness: 0.45
  },

  wallThicknessM: 0.2,
  roughness: 0.35,
  epsR: 5,
  conductivitySm: 0.02,

  rooms: [
    {
      id: "room1",
      x: 0,
      z: 0,
      width: 6,
      length: 5,
      height: 2.8,
      material: "concrete",
      wallThicknessM: 0.2,
      roughness: 0.35,
      epsR: 5.2,
      conductivitySm: 0.02
    },
    {
      id: "room2",
      x: 6.1,
      z: 0,
      width: 5,
      length: 5,
      height: 2.8,
      material: "brick",
      wallThicknessM: 0.16,
      roughness: 0.45,
      epsR: 4.1,
      conductivitySm: 0.015
    }
  ],

  walls: [
    {
      id: "glass_partition",
      x: 3.2,
      y: 1.4,
      z: 2.6,
      w: 3.2,
      h: 2.8,
      d: 0.08,
      material: "glass",
      thicknessM: 0.08,
      roughness: 0.08,
      epsR: 6.5,
      conductivitySm: 0.001
    }
  ],

  obstacles: [
    {
      id: "desk_1",
      type: "box",
      x: 2.2,
      y: 0.45,
      z: 1.2,
      w: 1.4,
      h: 0.9,
      d: 0.7,
      material: "wood",
      roughness: 0.55
    },
    {
      id: "cabinet_1",
      type: "box",
      x: 5.6,
      y: 1.0,
      z: -1.8,
      w: 0.8,
      h: 2.0,
      d: 0.55,
      material: "metal",
      roughness: 0.2
    },
    {
      id: "thermal_column",
      type: "thermal_column",
      x: 0.8,
      y: 1.25,
      z: -0.9,
      r: 0.55,
      h: 2.5,
      material: "thermal_air",
      temperatureK: 850,
      roughness: 0.05
    }
  ],

  tx: [
    {
      name: "tx1",
      position: [-3, 1.5, 0],
      orientation: [0, 0, 0],
      powerDbm: 20
    }
  ],

  rx: [
    {
      name: "rx1",
      position: [3, 1.5, 1],
      orientation: [0, 0, 0]
    }
  ],

  maxDepth: 6,
  los: true,
  specularReflection: true,
  diffuseReflection: false,
  diffraction: false,
  refraction: true,
  syntheticArray: true,
  samplesPerSrc: 100000,
  seed: 42
};

const guide = [
  "Este laboratorio convierte la escena que diseñes a XML para Sionna.",
  "Pulsa Simular para llamar a /telecom/v1300/sionna/export-scene-xml.",
  "El backend guarda generated_scenes/nombre.xml y devuelve el XML.",
  "Luego usa ese scenePath con Sionna RT real.",
  "Puedes parametrizar habitaciones, paredes, grosor, rugosidad, epsR, conductividad y obstáculos."
];

export default function Page() {
  return (
    <Lab
      moduleKey="sionna"
      title="Sionna XML Exporter"
      subtitle="Diseña la escena en JSON y conviértela a XML para ejecutarla con Sionna RT real."
      initialPayload={initialPayload}
      nextLabel="Sionna RT Real"
      guide={guide}
      charts={[]}
    />
  );
}
