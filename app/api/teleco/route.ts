import { NextResponse } from "next/server";

function calcularMapa(
  ancho: number,
  largo: number,
  routerX: number,
  routerY: number,
  frecuenciaGhz: number,
  material: string,
  resolucion = 36
) {
  const penalizacion: Record<string, number> = {
    pladur: 3,
    ladrillo: 8,
    hormigon: 14,
    mixto: 10,
  };

  const p = penalizacion[material] ?? 8;
  const heatmap: number[][] = [];

  for (let j = 0; j < resolucion; j++) {
    const fila: number[] = [];

    for (let i = 0; i < resolucion; i++) {
      const x = (i / (resolucion - 1)) * ancho;
      const y = (j / (resolucion - 1)) * largo;

      let distancia = Math.sqrt((x - routerX) ** 2 + (y - routerY) ** 2);
      distancia = Math.max(distancia, 0.2);

      const perdida =
        20 * Math.log10(distancia) +
        20 * Math.log10(frecuenciaGhz) +
        32.44;

      let potencia = -25 - perdida;

      if (x > ancho * 0.5) potencia -= p * 0.6;
      if (y > largo * 0.5) potencia -= p * 0.5;
      if (x > ancho * 0.7 && y > largo * 0.6) potencia -= p * 0.4;

      fila.push(Number(potencia.toFixed(1)));
    }

    heatmap.push(fila);
  }

  return heatmap;
}

function analizar(heatmap: number[][]) {
  const valores = heatmap.flat();

  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const minimo = Math.min(...valores);
  const debiles = valores.filter((v) => v < -78).length;

  return {
    media: Number(media.toFixed(1)),
    minimo: Number(minimo.toFixed(1)),
    zona_debil: Number(((debiles / valores.length) * 100).toFixed(1)),
  };
}

function buscarOptimo(
  ancho: number,
  largo: number,
  frecuencia: number,
  material: string
) {
  const candidatos = [
    [ancho * 0.2, largo * 0.2],
    [ancho * 0.5, largo * 0.2],
    [ancho * 0.8, largo * 0.2],
    [ancho * 0.2, largo * 0.5],
    [ancho * 0.5, largo * 0.5],
    [ancho * 0.8, largo * 0.5],
    [ancho * 0.2, largo * 0.8],
    [ancho * 0.5, largo * 0.8],
    [ancho * 0.8, largo * 0.8],
  ];

  let mejor: any = null;

  for (const [x, y] of candidatos) {
    const heatmap = calcularMapa(ancho, largo, x, y, frecuencia, material);
    const metricas = analizar(heatmap);

    const puntuacion =
      metricas.media - metricas.zona_debil * 0.8 + metricas.minimo * 0.2;

    const resultado = {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      metricas,
      puntuacion: Number(puntuacion.toFixed(2)),
    };

    if (!mejor || resultado.puntuacion > mejor.puntuacion) {
      mejor = resultado;
    }
  }

  return mejor;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const ancho = Number(searchParams.get("ancho") ?? 8);
  const largo = Number(searchParams.get("largo") ?? 10);
  const routerX = Number(searchParams.get("router_x") ?? 4);
  const routerY = Number(searchParams.get("router_y") ?? 5);
  const frecuencia = Number(searchParams.get("frecuencia_ghz") ?? 2.4);
  const material = searchParams.get("material") ?? "ladrillo";

  const heatmap = calcularMapa(
    ancho,
    largo,
    routerX,
    routerY,
    frecuencia,
    material
  );

  const metricasManual = analizar(heatmap);
  const optimo = buscarOptimo(ancho, largo, frecuencia, material);

  return NextResponse.json({
    ancho,
    largo,
    frecuencia_ghz: frecuencia,
    material,
    router_manual: {
      x: routerX,
      y: routerY,
    },
    router_optimo: {
      x: optimo.x,
      y: optimo.y,
    },
    metricas_manual: metricasManual,
    metricas_optimo: optimo.metricas,
    mejora: {
      media_db: Number((optimo.metricas.media - metricasManual.media).toFixed(1)),
      zona_debil_porcentaje: Number(
        (metricasManual.zona_debil - optimo.metricas.zona_debil).toFixed(1)
      ),
    },
    heatmap,
    recomendacion: `Tu router está en x=${routerX} m, y=${routerY} m. La ubicación óptima estimada es x=${optimo.x} m, y=${optimo.y} m.`,
  });
}