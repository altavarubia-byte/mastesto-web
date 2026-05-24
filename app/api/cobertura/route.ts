import { NextResponse } from "next/server";

type Habitacion = {
  id: string;
  nombre: string;
  x: number;
  z: number;
  ancho: number;
  largo: number;
  alto: number;
};

type Objeto3D = {
  id: string;
  tipo: string;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: string;
  material?: string;
};

type Punto = {
  x: number;
  z: number;
};

type PuntoHeatmap = {
  x: number;
  z: number;
  potenciaDbm: number;
  calidad: "excelente" | "buena" | "media" | "mala";
};

type Rayo = {
  id: string;
  tipo: "directo" | "reflejado" | "debil";
  puntos: {
    x: number;
    y: number;
    z: number;
  }[];
  potenciaDbm: number;
};

type DatosVivienda = {
  version?: string;
  unidades?: string;
  fecha?: string;
  materialPared?: string;
  frecuenciaMhz?: number;
  habitaciones: Habitacion[];
  objetos: Objeto3D[];
};

type MaterialRadio = {
  nombre: string;
  permitividadRelativa: number;
  conductividadSm: number;
  perdidaDb: number;
  reflectividad: number;
};

type ObstaculoRadio = {
  id: string;
  tipo: string;
  material: MaterialRadio;
  centro: Punto;
  ancho: number;
  largo: number;
  radioAprox: number;
};

type RepetidorOptimo = {
  id: string;
  tipo: string;
  x: number;
  y: number;
  z: number;
};

const FRECUENCIA_DEFECTO_MHZ = 5000;
const POTENCIA_TX_DBM = 20;
const ALTURA_ROUTER = 1.2;
const ALTURA_RECEPTOR = 1.0;

const PASO_CANDIDATOS = 0.75;
const PASO_HEATMAP = 0.6;

const MATERIALES_RADIO: Record<string, MaterialRadio> = {
  aire: {
    nombre: "Aire",
    permitividadRelativa: 1.0,
    conductividadSm: 0.0,
    perdidaDb: 0.0,
    reflectividad: 0.02,
  },
  pladur: {
    nombre: "Pladur / yeso",
    permitividadRelativa: 2.5,
    conductividadSm: 0.02,
    perdidaDb: 3.0,
    reflectividad: 0.18,
  },
  madera: {
    nombre: "Madera",
    permitividadRelativa: 2.2,
    conductividadSm: 0.01,
    perdidaDb: 2.0,
    reflectividad: 0.12,
  },
  ladrillo: {
    nombre: "Ladrillo",
    permitividadRelativa: 4.0,
    conductividadSm: 0.08,
    perdidaDb: 6.0,
    reflectividad: 0.32,
  },
  hormigon: {
    nombre: "Hormigón",
    permitividadRelativa: 6.0,
    conductividadSm: 0.15,
    perdidaDb: 9.0,
    reflectividad: 0.45,
  },
  cristal: {
    nombre: "Cristal",
    permitividadRelativa: 6.5,
    conductividadSm: 0.01,
    perdidaDb: 4.0,
    reflectividad: 0.28,
  },
  metal: {
    nombre: "Metal genérico",
    permitividadRelativa: 50.0,
    conductividadSm: 1000000.0,
    perdidaDb: 18.0,
    reflectividad: 0.95,
  },
  tejido: {
    nombre: "Tejido / tapizado",
    permitividadRelativa: 1.8,
    conductividadSm: 0.01,
    perdidaDb: 1.5,
    reflectividad: 0.08,
  },
  objeto_generico: {
    nombre: "Objeto interior genérico",
    permitividadRelativa: 3.0,
    conductividadSm: 0.03,
    perdidaDb: 2.5,
    reflectividad: 0.2,
  },
};

const MATERIAL_PARED_DEFECTO = "ladrillo";

const MATERIAL_OBJETO_POR_TIPO: Record<string, string> = {
  sofa: "tejido",
  mesa: "madera",
  silla: "madera",
  tv: "metal",
  cama: "tejido",
  router: "objeto_generico",
  armario: "madera",
  movil: "objeto_generico",
  portatil: "metal",
  consola: "metal",
  pc: "metal",
  repetidor: "objeto_generico",
  mesh: "objeto_generico",
};

function normalizarFrecuenciaMhz(valor?: number) {
  if (!valor || Number.isNaN(valor)) return FRECUENCIA_DEFECTO_MHZ;

  const f = Number(valor);

  if (f < 1000 || f > 8000) return FRECUENCIA_DEFECTO_MHZ;

  return f;
}

function factorFrecuencia(frecuenciaMhz: number) {
  return frecuenciaMhz / FRECUENCIA_DEFECTO_MHZ;
}

function distancia2D(a: Punto, b: Punto) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function distancia3D(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fsplDb(distanciaM: number, frecuenciaMhz: number) {
  const dKm = Math.max(distanciaM / 1000, 0.001);
  return 32.44 + 20 * Math.log10(frecuenciaMhz) + 20 * Math.log10(dKm);
}

function puntoDentroHabitacion(p: Punto, h: Habitacion) {
  return (
    p.x >= h.x - h.ancho / 2 &&
    p.x <= h.x + h.ancho / 2 &&
    p.z >= h.z - h.largo / 2 &&
    p.z <= h.z + h.largo / 2
  );
}

function puntoDentroVivienda(p: Punto, habitaciones: Habitacion[]) {
  return habitaciones.some((h) => puntoDentroHabitacion(p, h));
}

function habitacionDePunto(p: Punto, habitaciones: Habitacion[]) {
  return habitaciones.find((h) => puntoDentroHabitacion(p, h)) ?? null;
}

function limitesVivienda(habitaciones: Habitacion[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const h of habitaciones) {
    minX = Math.min(minX, h.x - h.ancho / 2);
    maxX = Math.max(maxX, h.x + h.ancho / 2);
    minZ = Math.min(minZ, h.z - h.largo / 2);
    maxZ = Math.max(maxZ, h.z + h.largo / 2);
  }

  return { minX, maxX, minZ, maxZ };
}

function generarPuntosVivienda(habitaciones: Habitacion[], paso: number) {
  const limites = limitesVivienda(habitaciones);
  const puntos: Punto[] = [];

  for (let x = limites.minX; x <= limites.maxX; x += paso) {
    for (let z = limites.minZ; z <= limites.maxZ; z += paso) {
      const p = {
        x: Number(x.toFixed(2)),
        z: Number(z.toFixed(2)),
      };

      if (puntoDentroVivienda(p, habitaciones)) {
        puntos.push(p);
      }
    }
  }

  return puntos;
}

function paredesDeHabitaciones(habitaciones: Habitacion[]) {
  const paredes: { a: Punto; b: Punto; id: string }[] = [];

  for (const h of habitaciones) {
    const minX = h.x - h.ancho / 2;
    const maxX = h.x + h.ancho / 2;
    const minZ = h.z - h.largo / 2;
    const maxZ = h.z + h.largo / 2;

    paredes.push({
      id: `${h.id}-norte`,
      a: { x: minX, z: minZ },
      b: { x: maxX, z: minZ },
    });

    paredes.push({
      id: `${h.id}-sur`,
      a: { x: minX, z: maxZ },
      b: { x: maxX, z: maxZ },
    });

    paredes.push({
      id: `${h.id}-oeste`,
      a: { x: minX, z: minZ },
      b: { x: minX, z: maxZ },
    });

    paredes.push({
      id: `${h.id}-este`,
      a: { x: maxX, z: minZ },
      b: { x: maxX, z: maxZ },
    });
  }

  return paredes;
}

function interseccionSegmentos(a: Punto, b: Punto, c: Punto, d: Punto) {
  const r = {
    x: b.x - a.x,
    z: b.z - a.z,
  };

  const s = {
    x: d.x - c.x,
    z: d.z - c.z,
  };

  const denom = r.x * s.z - r.z * s.x;

  if (Math.abs(denom) < 1e-9) {
    return null;
  }

  const u = ((c.x - a.x) * r.z - (c.z - a.z) * r.x) / denom;
  const t = ((c.x - a.x) * s.z - (c.z - a.z) * s.x) / denom;

  if (t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999) {
    return {
      x: a.x + t * r.x,
      z: a.z + t * r.z,
      t,
    };
  }

  return null;
}

function contarParedesCruzadas(
  origen: Punto,
  destino: Punto,
  habitaciones: Habitacion[]
) {
  const paredes = paredesDeHabitaciones(habitaciones);
  let cruces = 0;

  for (const pared of paredes) {
    const inter = interseccionSegmentos(origen, destino, pared.a, pared.b);

    if (inter) {
      cruces++;
    }
  }

  return cruces;
}

function distanciaPuntoSegmento(p: Punto, a: Punto, b: Punto) {
  const apx = p.x - a.x;
  const apz = p.z - a.z;
  const abx = b.x - a.x;
  const abz = b.z - a.z;

  const ab2 = abx * abx + abz * abz;

  if (ab2 === 0) {
    return distancia2D(p, a);
  }

  let t = (apx * abx + apz * abz) / ab2;
  t = Math.max(0, Math.min(1, t));

  const proy = {
    x: a.x + abx * t,
    z: a.z + abz * t,
  };

  return distancia2D(p, proy);
}

function materialDeObjeto(obj: Objeto3D): MaterialRadio {
  const materialDeclarado = obj.material;

  if (materialDeclarado && MATERIALES_RADIO[materialDeclarado]) {
    return MATERIALES_RADIO[materialDeclarado];
  }

  const materialPorTipo = MATERIAL_OBJETO_POR_TIPO[obj.tipo];

  if (materialPorTipo && MATERIALES_RADIO[materialPorTipo]) {
    return MATERIALES_RADIO[materialPorTipo];
  }

  return MATERIALES_RADIO.objeto_generico;
}

function materialPared(materialId?: string): MaterialRadio {
  if (materialId && MATERIALES_RADIO[materialId]) {
    return MATERIALES_RADIO[materialId];
  }

  return MATERIALES_RADIO[MATERIAL_PARED_DEFECTO];
}

function perdidaMaterialEnFrecuencia(
  material: MaterialRadio,
  frecuenciaMhz: number
) {
  const factor = factorFrecuencia(frecuenciaMhz);
  return material.perdidaDb * Math.pow(factor, 0.35);
}

function reflectividadEnFrecuencia(
  material: MaterialRadio,
  frecuenciaMhz: number
) {
  const factor = factorFrecuencia(frecuenciaMhz);
  const r = material.reflectividad * Math.pow(factor, 0.15);
  return Math.max(0.01, Math.min(0.98, r));
}

function objetosRadio(objetos: Objeto3D[]): ObstaculoRadio[] {
  return objetos
    .filter((obj) => obj.tipo !== "router" && obj.tipo !== "repetidor")
    .map((obj) => {
      const material = materialDeObjeto(obj);

      return {
        id: obj.id,
        tipo: obj.tipo,
        material,
        centro: {
          x: obj.x,
          z: obj.z,
        },
        ancho: obj.sx,
        largo: obj.sz,
        radioAprox: Math.max(obj.sx, obj.sz) / 2,
      };
    });
}

function perdidaObjetosEnTrayecto(
  origen: Punto,
  destino: Punto,
  objetos: Objeto3D[],
  frecuenciaMhz: number
) {
  let perdidaTotal = 0;

  for (const obj of objetos) {
    if (obj.tipo === "router" || obj.tipo === "repetidor") continue;

    const material = materialDeObjeto(obj);
    const radioAprox = Math.max(obj.sx, obj.sz) / 2;

    const d = distanciaPuntoSegmento(
      { x: obj.x, z: obj.z },
      origen,
      destino
    );

    if (d < radioAprox + 0.15) {
      perdidaTotal += perdidaMaterialEnFrecuencia(material, frecuenciaMhz);
    }
  }

  return perdidaTotal;
}

function calcularPotencia(
  router: Punto,
  receptor: Punto,
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  const d3 = distancia3D(
    { x: router.x, y: ALTURA_ROUTER, z: router.z },
    { x: receptor.x, y: ALTURA_RECEPTOR, z: receptor.z }
  );

  const perdidaDistancia = fsplDb(d3, frecuenciaMhz);

  const paredes = contarParedesCruzadas(router, receptor, habitaciones);

  const perdidaParedes =
    paredes *
    perdidaMaterialEnFrecuencia(materialPared(materialParedId), frecuenciaMhz);

  const perdidaObjetos = perdidaObjetosEnTrayecto(
    router,
    receptor,
    objetos,
    frecuenciaMhz
  );

  const potencia =
    POTENCIA_TX_DBM - perdidaDistancia - perdidaParedes - perdidaObjetos;

  return Number(potencia.toFixed(1));
}

function calidadDePotencia(p: number): PuntoHeatmap["calidad"] {
  if (p >= -50) return "excelente";
  if (p >= -65) return "buena";
  if (p >= -75) return "media";
  return "mala";
}

function calcularHeatmap(
  router: Punto,
  puntos: Punto[],
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  return puntos.map((p) => {
    const potenciaDbm = calcularPotencia(
      router,
      p,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    return {
      x: p.x,
      z: p.z,
      potenciaDbm,
      calidad: calidadDePotencia(potenciaDbm),
    };
  });
}

function calcularHeatmapConMesh(
  router: Punto,
  repetidores: RepetidorOptimo[],
  puntos: Punto[],
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  return puntos.map((p) => {
    const potenciaRouter = calcularPotencia(
      router,
      p,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const potenciasMesh = repetidores.map((rep) =>
      calcularPotencia(
        {
          x: rep.x,
          z: rep.z,
        },
        p,
        habitaciones,
        objetos,
        materialParedId,
        frecuenciaMhz
      )
    );

    const potenciaDbm =
      potenciasMesh.length > 0
        ? Math.max(potenciaRouter, ...potenciasMesh)
        : potenciaRouter;

    return {
      x: p.x,
      z: p.z,
      potenciaDbm,
      calidad: calidadDePotencia(potenciaDbm),
    };
  });
}

function scoreHeatmap(heatmap: PuntoHeatmap[]) {
  if (heatmap.length === 0) return -9999;

  const media =
    heatmap.reduce((acc, p) => acc + p.potenciaDbm, 0) / heatmap.length;

  const zonasMalas = heatmap.filter((p) => p.potenciaDbm < -75).length;
  const penalizacionZonasMalas = zonasMalas * 1.5;

  return media - penalizacionZonasMalas;
}

function encontrarRouterOptimo(
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  const candidatos = generarPuntosVivienda(habitaciones, PASO_CANDIDATOS);
  const puntosEvaluacion = generarPuntosVivienda(habitaciones, PASO_HEATMAP);

  let mejor = candidatos[0];
  let mejorScore = -Infinity;
  let mejorHeatmap: PuntoHeatmap[] = [];

  for (const candidato of candidatos) {
    const heatmap = calcularHeatmap(
      candidato,
      puntosEvaluacion,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const score = scoreHeatmap(heatmap);

    if (score > mejorScore) {
      mejor = candidato;
      mejorScore = score;
      mejorHeatmap = heatmap;
    }
  }

  return {
    router: mejor,
    score: Number(mejorScore.toFixed(1)),
    heatmap: mejorHeatmap,
  };
}

function encontrarRouterOptimoPorHabitacion(
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  const puntosEvaluacion = generarPuntosVivienda(habitaciones, PASO_HEATMAP);

  return habitaciones.map((habitacion) => {
    const candidatos = generarPuntosVivienda([habitacion], PASO_CANDIDATOS);

    let mejor = candidatos[0];
    let mejorScore = -Infinity;
    let mejorHeatmap: PuntoHeatmap[] = [];

    for (const candidato of candidatos) {
      const heatmap = calcularHeatmap(
        candidato,
        puntosEvaluacion,
        habitaciones,
        objetos,
        materialParedId,
        frecuenciaMhz
      );

      const score = scoreHeatmap(heatmap);

      if (score > mejorScore) {
        mejor = candidato;
        mejorScore = score;
        mejorHeatmap = heatmap;
      }
    }

    const potenciaMedia =
      mejorHeatmap.reduce((acc, p) => acc + p.potenciaDbm, 0) /
      Math.max(mejorHeatmap.length, 1);

    const zonasMuertas = mejorHeatmap.filter((p) => p.potenciaDbm < -75).length;

    return {
      habitacion: habitacion.nombre,
      habitacionId: habitacion.id,
      x: mejor.x,
      y: ALTURA_ROUTER,
      z: mejor.z,
      score: Number(mejorScore.toFixed(1)),
      potenciaMediaDbm: Number(potenciaMedia.toFixed(1)),
      zonasMuertas,
      calidad: calidadDePotencia(potenciaMedia),
      recomendacion: `Si colocas el router en ${
        habitacion.nombre
      }, el mejor punto estimado es X=${mejor.x.toFixed(
        2
      )}, Z=${mejor.z.toFixed(2)}.`,
    };
  });
}

function obtenerRouterActual(
  objetos: Objeto3D[],
  habitaciones: Habitacion[]
): Punto {
  const router = objetos.find((obj) => obj.tipo === "router");

  if (router) {
    return {
      x: router.x,
      z: router.z,
    };
  }

  const h = habitaciones[0];

  return {
    x: h?.x ?? 0,
    z: h?.z ?? 0,
  };
}

function encontrarPrimerChoque(
  origen: Punto,
  angulo: number,
  habitaciones: Habitacion[]
) {
  const distanciaMax = 40;

  const destino = {
    x: origen.x + Math.cos(angulo) * distanciaMax,
    z: origen.z + Math.sin(angulo) * distanciaMax,
  };

  const paredes = paredesDeHabitaciones(habitaciones);

  let mejor: { x: number; z: number; t: number } | null = null;

  for (const pared of paredes) {
    const inter = interseccionSegmentos(origen, destino, pared.a, pared.b);

    if (!inter) continue;

    if (!mejor || inter.t < mejor.t) {
      mejor = inter;
    }
  }

  return mejor;
}

function encontrarPrimerChoqueObjeto(
  origen: Punto,
  angulo: number,
  objetos: Objeto3D[]
) {
  const dir = {
    x: Math.cos(angulo),
    z: Math.sin(angulo),
  };

  let mejor:
    | {
        punto: Punto;
        objeto: Objeto3D;
        distancia: number;
      }
    | null = null;

  for (const obj of objetos) {
    if (obj.tipo === "router" || obj.tipo === "repetidor") continue;

    const radio = Math.max(obj.sx, obj.sz) / 2;

    const oc = {
      x: origen.x - obj.x,
      z: origen.z - obj.z,
    };

    const a = dir.x * dir.x + dir.z * dir.z;
    const b = 2 * (oc.x * dir.x + oc.z * dir.z);
    const c = oc.x * oc.x + oc.z * oc.z - radio * radio;

    const discriminante = b * b - 4 * a * c;

    if (discriminante < 0) continue;

    const t = (-b - Math.sqrt(discriminante)) / (2 * a);

    if (t <= 0.05) continue;

    const punto = {
      x: origen.x + dir.x * t,
      z: origen.z + dir.z * t,
    };

    if (!mejor || t < mejor.distancia) {
      mejor = {
        punto,
        objeto: obj,
        distancia: t,
      };
    }
  }

  return mejor;
}

function reflejarDireccionSobreObjeto(
  origen: Punto,
  puntoChoque: Punto,
  objeto: Objeto3D
) {
  const dirEntrada = {
    x: puntoChoque.x - origen.x,
    z: puntoChoque.z - origen.z,
  };

  const modEntrada = Math.sqrt(
    dirEntrada.x * dirEntrada.x + dirEntrada.z * dirEntrada.z
  );

  if (modEntrada === 0) {
    return {
      x: 1,
      z: 0,
    };
  }

  const d = {
    x: dirEntrada.x / modEntrada,
    z: dirEntrada.z / modEntrada,
  };

  const normal = {
    x: puntoChoque.x - objeto.x,
    z: puntoChoque.z - objeto.z,
  };

  const modNormal = Math.sqrt(normal.x * normal.x + normal.z * normal.z);

  if (modNormal === 0) {
    return {
      x: -d.x,
      z: -d.z,
    };
  }

  const n = {
    x: normal.x / modNormal,
    z: normal.z / modNormal,
  };

  const dot = d.x * n.x + d.z * n.z;

  return {
    x: d.x - 2 * dot * n.x,
    z: d.z - 2 * dot * n.z,
  };
}

function generarRayos(
  router: Punto,
  habitaciones: Habitacion[],
  objetos: Objeto3D[],
  materialParedId: string,
  frecuenciaMhz: number
) {
  const rayos: Rayo[] = [];
  const totalRayos = 72;

  for (let i = 0; i < totalRayos; i++) {
    const angulo = (Math.PI * 2 * i) / totalRayos;

    const choquePared = encontrarPrimerChoque(router, angulo, habitaciones);
    const choqueObjeto = encontrarPrimerChoqueObjeto(router, angulo, objetos);

    let tipoChoque: "pared" | "objeto" | null = null;
    let puntoChoque: Punto | null = null;
    let objetoChoque: Objeto3D | null = null;
    let distanciaChoque = Infinity;

    if (choquePared) {
      tipoChoque = "pared";
      puntoChoque = {
        x: choquePared.x,
        z: choquePared.z,
      };
      distanciaChoque = distancia2D(router, puntoChoque);
    }

    if (choqueObjeto) {
      const dObjeto = distancia2D(router, choqueObjeto.punto);

      if (dObjeto < distanciaChoque) {
        tipoChoque = "objeto";
        puntoChoque = choqueObjeto.punto;
        objetoChoque = choqueObjeto.objeto;
        distanciaChoque = dObjeto;
      }
    }

    if (!puntoChoque || !tipoChoque) continue;

    const potenciaDbm = calcularPotencia(
      router,
      puntoChoque,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    rayos.push({
      id: `rayo-directo-${i}`,
      tipo:
        potenciaDbm > -65
          ? "directo"
          : potenciaDbm > -75
          ? "reflejado"
          : "debil",
      potenciaDbm,
      puntos: [
        {
          x: router.x,
          y: ALTURA_ROUTER,
          z: router.z,
        },
        {
          x: Number(puntoChoque.x.toFixed(2)),
          y: ALTURA_ROUTER,
          z: Number(puntoChoque.z.toFixed(2)),
        },
      ],
    });

    if (distanciaChoque > 1.0) {
      let dirRebote = {
        x: Math.cos(angulo + Math.PI * 0.65),
        z: Math.sin(angulo + Math.PI * 0.65),
      };

      let perdidaReflexion = 8;

      if (tipoChoque === "objeto" && objetoChoque) {
        const material = materialDeObjeto(objetoChoque);

        dirRebote = reflejarDireccionSobreObjeto(
          router,
          puntoChoque,
          objetoChoque
        );

        const reflectividad = reflectividadEnFrecuencia(material, frecuenciaMhz);

        perdidaReflexion = 12 * (1 - reflectividad);

        if (reflectividad < 0.1) {
          continue;
        }
      }

      if (tipoChoque === "pared") {
        const material = materialPared(materialParedId);
        const reflectividad = reflectividadEnFrecuencia(material, frecuenciaMhz);

        perdidaReflexion = 10 * (1 - reflectividad);
      }

      const longitudRebote = Math.min(4.5, distanciaChoque * 0.65);

      const segundoPunto = {
        x: puntoChoque.x + dirRebote.x * longitudRebote,
        z: puntoChoque.z + dirRebote.z * longitudRebote,
      };

      if (puntoDentroVivienda(segundoPunto, habitaciones)) {
        const potenciaReflejada = Number(
          (potenciaDbm - perdidaReflexion).toFixed(1)
        );

        rayos.push({
          id: `rayo-rebotado-${tipoChoque}-${i}`,
          tipo: potenciaReflejada > -75 ? "reflejado" : "debil",
          potenciaDbm: potenciaReflejada,
          puntos: [
            {
              x: router.x,
              y: ALTURA_ROUTER,
              z: router.z,
            },
            {
              x: Number(puntoChoque.x.toFixed(2)),
              y: ALTURA_ROUTER,
              z: Number(puntoChoque.z.toFixed(2)),
            },
            {
              x: Number(segundoPunto.x.toFixed(2)),
              y: ALTURA_ROUTER,
              z: Number(segundoPunto.z.toFixed(2)),
            },
          ],
        });
      }
    }
  }

  return rayos;
}

function encontrarRepetidoresOptimos(
  heatmap: PuntoHeatmap[],
  habitaciones: Habitacion[]
): RepetidorOptimo[] {
  const zonasMuertas = heatmap.filter((p) => p.potenciaDbm < -75);

  if (zonasMuertas.length === 0) {
    return [];
  }

  const grupos: PuntoHeatmap[][] = [];

  for (const punto of zonasMuertas) {
    let añadido = false;

    for (const grupo of grupos) {
      const centro = {
        x: grupo.reduce((a, p) => a + p.x, 0) / grupo.length,
        z: grupo.reduce((a, p) => a + p.z, 0) / grupo.length,
      };

      const dx = punto.x - centro.x;
      const dz = punto.z - centro.z;
      const distancia = Math.sqrt(dx * dx + dz * dz);

      if (distancia < 3) {
        grupo.push(punto);
        añadido = true;
        break;
      }
    }

    if (!añadido) {
      grupos.push([punto]);
    }
  }

  const repetidores: RepetidorOptimo[] = [];

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];

    const centroX = grupo.reduce((a, p) => a + p.x, 0) / grupo.length;
    const centroZ = grupo.reduce((a, p) => a + p.z, 0) / grupo.length;

    const candidato = {
      x: Number(centroX.toFixed(2)),
      y: 1.2,
      z: Number(centroZ.toFixed(2)),
    };

    if (
      puntoDentroVivienda(
        {
          x: candidato.x,
          z: candidato.z,
        },
        habitaciones
      )
    ) {
      repetidores.push({
        id: `mesh-${i + 1}`,
        tipo: "mesh",
        ...candidato,
      });
    }
  }

  return repetidores;
}

function resumenPorHabitaciones(
  heatmap: PuntoHeatmap[],
  habitaciones: Habitacion[]
) {
  return habitaciones.map((h) => {
    const puntos = heatmap.filter((p) =>
      puntoDentroHabitacion({ x: p.x, z: p.z }, h)
    );

    if (puntos.length === 0) {
      return {
        habitacion: h.nombre,
        potenciaMediaDbm: null,
        calidad: "sin_datos",
      };
    }

    const media =
      puntos.reduce((acc, p) => acc + p.potenciaDbm, 0) / puntos.length;

    return {
      habitacion: h.nombre,
      potenciaMediaDbm: Number(media.toFixed(1)),
      calidad: calidadDePotencia(media),
    };
  });
}

function generarRecomendaciones(
  heatmap: PuntoHeatmap[],
  router: Punto,
  habitaciones: Habitacion[],
  frecuenciaMhz: number,
  materialParedId: string
) {
  const recomendaciones: string[] = [];

  const media =
    heatmap.reduce((acc, p) => acc + p.potenciaDbm, 0) /
    Math.max(heatmap.length, 1);

  const malas = heatmap.filter((p) => p.potenciaDbm < -75).length;
  const porcentajeMalo = (malas / Math.max(heatmap.length, 1)) * 100;

  const habitacionRouter = habitacionDePunto(router, habitaciones);

  recomendaciones.push(
    `Ubicación óptima estimada: ${
      habitacionRouter?.nombre ?? "zona central"
    } en X=${router.x.toFixed(2)}, Z=${router.z.toFixed(2)}.`
  );

  recomendaciones.push(
    `Cálculo realizado a ${(frecuenciaMhz / 1000).toFixed(
      1
    )} GHz con paredes de ${materialPared(materialParedId).nombre}.`
  );

  if (media > -60) {
    recomendaciones.push(
      "La cobertura media estimada es buena para una vivienda convencional."
    );
  } else if (media > -70) {
    recomendaciones.push(
      "La cobertura media es aceptable, aunque podrían aparecer zonas débiles en extremos de la vivienda."
    );
  } else {
    recomendaciones.push(
      "La cobertura media es baja. Conviene estudiar un repetidor o sistema mesh."
    );
  }

  if (porcentajeMalo > 20) {
    recomendaciones.push(
      "Se detectan varias zonas muertas. Recomendación: añadir un repetidor o nodo mesh en una zona intermedia."
    );
  }

  if (frecuenciaMhz <= 2500) {
    recomendaciones.push(
      "La banda de 2.4 GHz ofrece mayor alcance y mejor penetración, aunque menor velocidad máxima."
    );
  } else if (frecuenciaMhz >= 5900) {
    recomendaciones.push(
      "La banda de 6 GHz ofrece gran velocidad cerca del router, pero sufre más pérdidas por distancia, paredes y objetos."
    );
  } else {
    recomendaciones.push(
      "La banda de 5 GHz ofrece equilibrio entre velocidad y cobertura, pero pierde más que 2.4 GHz al atravesar paredes."
    );
  }

  recomendaciones.push(
    "Evita colocar el router pegado al suelo, dentro de armarios, detrás de TV o junto a elementos metálicos."
  );

  return recomendaciones;
}

export async function POST(req: Request) {
  try {
    const datos = (await req.json()) as DatosVivienda;

    const habitaciones = datos.habitaciones ?? [];
    const objetos = datos.objetos ?? [];

    const materialParedId =
      datos.materialPared && MATERIALES_RADIO[datos.materialPared]
        ? datos.materialPared
        : MATERIAL_PARED_DEFECTO;

    const frecuenciaMhz = normalizarFrecuenciaMhz(datos.frecuenciaMhz);

    if (habitaciones.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "No hay habitaciones para calcular cobertura.",
        },
        { status: 400 }
      );
    }

    const puntosEvaluacion = generarPuntosVivienda(habitaciones, PASO_HEATMAP);
    const routerActual = obtenerRouterActual(objetos, habitaciones);

    const heatmapActual = calcularHeatmap(
      routerActual,
      puntosEvaluacion,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const rayosActual = generarRayos(
      routerActual,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const resultadoOptimo = encontrarRouterOptimo(
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const optimosPorHabitacion = encontrarRouterOptimoPorHabitacion(
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const repetidoresOptimos = encontrarRepetidoresOptimos(
      resultadoOptimo.heatmap,
      habitaciones
    );

    const heatmapConMesh = calcularHeatmapConMesh(
      resultadoOptimo.router,
      repetidoresOptimos,
      puntosEvaluacion,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const rayosOptimos = generarRayos(
      resultadoOptimo.router,
      habitaciones,
      objetos,
      materialParedId,
      frecuenciaMhz
    );

    const resumenHabitaciones = resumenPorHabitaciones(
      resultadoOptimo.heatmap,
      habitaciones
    );

    const resumenHabitacionesConMesh = resumenPorHabitaciones(
      heatmapConMesh,
      habitaciones
    );

    const potenciaMedia =
      resultadoOptimo.heatmap.reduce((acc, p) => acc + p.potenciaDbm, 0) /
      Math.max(resultadoOptimo.heatmap.length, 1);

    const potenciaMediaConMesh =
      heatmapConMesh.reduce((acc, p) => acc + p.potenciaDbm, 0) /
      Math.max(heatmapConMesh.length, 1);

    const zonasMuertas = resultadoOptimo.heatmap.filter(
      (p) => p.potenciaDbm < -75
    );

    const zonasMuertasConMesh = heatmapConMesh.filter(
      (p) => p.potenciaDbm < -75
    );

    const mejoraMediaMesh = potenciaMediaConMesh - potenciaMedia;

    const recomendaciones = generarRecomendaciones(
      resultadoOptimo.heatmap,
      resultadoOptimo.router,
      habitaciones,
      frecuenciaMhz,
      materialParedId
    );

    if (repetidoresOptimos.length > 0) {
      recomendaciones.push(
        `Se recomiendan ${repetidoresOptimos.length} nodo(s) mesh para mejorar las zonas con baja cobertura.`
      );
      recomendaciones.push(
        `Con mesh, la potencia media pasa de ${potenciaMedia.toFixed(
          1
        )} dBm a ${potenciaMediaConMesh.toFixed(1)} dBm.`
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Cobertura calculada correctamente",

      modelo: {
        frecuenciaMhz,
        potenciaTxDbm: POTENCIA_TX_DBM,
        materialPared: materialPared(materialParedId),
        materialesObjeto: objetosRadio(objetos).map((o) => ({
          id: o.id,
          tipo: o.tipo,
          material: o.material,
        })),
        tipo:
          "ray-tracing simplificado + pérdidas por distancia + frecuencia configurable + pérdidas por material + reflexión en paredes, objetos y estimación mesh",
      },

      routerActual: {
        x: routerActual.x,
        y: ALTURA_ROUTER,
        z: routerActual.z,
      },

      coberturaActual: {
        heatmap: heatmapActual,
        rayos: rayosActual,
        score: Number(scoreHeatmap(heatmapActual).toFixed(1)),
      },

      routerOptimo: {
        x: resultadoOptimo.router.x,
        y: ALTURA_ROUTER,
        z: resultadoOptimo.router.z,
      },

      repetidoresOptimos,
      optimosPorHabitacion,

      coberturaOptima: {
        heatmap: resultadoOptimo.heatmap,
        rayos: rayosOptimos,
        score: resultadoOptimo.score,
      },

      coberturaConMesh: {
        heatmap: heatmapConMesh,
        score: Number(scoreHeatmap(heatmapConMesh).toFixed(1)),
      },

      estadisticas: {
        score: resultadoOptimo.score,
        potenciaMediaDbm: Number(potenciaMedia.toFixed(1)),
        puntosAnalizados: resultadoOptimo.heatmap.length,
        zonasMuertas: zonasMuertas.length,
        porcentajeZonasMuertas: Number(
          (
            (zonasMuertas.length /
              Math.max(resultadoOptimo.heatmap.length, 1)) *
            100
          ).toFixed(1)
        ),
      },

      estadisticasMesh: {
        potenciaMediaDbm: Number(potenciaMediaConMesh.toFixed(1)),
        puntosAnalizados: heatmapConMesh.length,
        zonasMuertas: zonasMuertasConMesh.length,
        porcentajeZonasMuertas: Number(
          (
            (zonasMuertasConMesh.length / Math.max(heatmapConMesh.length, 1)) *
            100
          ).toFixed(1)
        ),
        mejoraMediaDb: Number(mejoraMediaMesh.toFixed(1)),
      },

      heatmap: heatmapActual,
      rayos: rayosActual,
      heatmapOptimo: resultadoOptimo.heatmap,
      heatmapConMesh,
      rayosOptimos,

      resumenHabitaciones,
      resumenHabitacionesConMesh,
      recomendaciones,
    });
  } catch (error) {
    console.error("Error en /api/cobertura:", error);

    return NextResponse.json(
      {
        ok: false,
        mensaje: "Error procesando la cobertura",
      },
      { status: 500 }
    );
  }
}