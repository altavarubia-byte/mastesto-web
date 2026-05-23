from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import math

app = FastAPI(title="Mastesto Teleco API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def calcular_heatmap(ancho, largo, router_x, router_y, frecuencia_ghz, resolucion=40):
    heatmap = []

    for j in range(resolucion):
        fila = []

        for i in range(resolucion):
            x = (i / (resolucion - 1)) * ancho
            y = (j / (resolucion - 1)) * largo

            distancia = math.sqrt((x - router_x) ** 2 + (y - router_y) ** 2)
            distancia = max(distancia, 0.2)

            perdida = (
                20 * math.log10(distancia)
                + 20 * math.log10(frecuencia_ghz)
                + 32.44
            )

            potencia = -25 - perdida

            if x > ancho * 0.55:
                potencia -= 8

            if y > largo * 0.55:
                potencia -= 6

            fila.append(round(potencia, 1))

        heatmap.append(fila)

    return heatmap


def metricas(heatmap):
    valores = [v for fila in heatmap for v in fila]
    media = sum(valores) / len(valores)
    minimo = min(valores)
    debiles = len([v for v in valores if v < -78])
    porcentaje_debil = (debiles / len(valores)) * 100

    return {
        "media": round(media, 1),
        "minimo": round(minimo, 1),
        "zonas_debiles": round(porcentaje_debil, 1),
    }


@app.get("/")
def inicio():
    return {
        "estado": "ok",
        "mensaje": "API Teleco Mastesto activa",
    }


@app.get("/simular")
def simular(
    ancho: float = Query(8),
    largo: float = Query(10),
    router_x: float = Query(2),
    router_y: float = Query(2),
    frecuencia_ghz: float = Query(2.4),
    resolucion: int = Query(40),
):
    heatmap = calcular_heatmap(
        ancho,
        largo,
        router_x,
        router_y,
        frecuencia_ghz,
        resolucion,
    )

    return {
        "heatmap": heatmap,
        "metricas": metricas(heatmap),
        "router": {
            "x": router_x,
            "y": router_y,
        },
    }


@app.get("/optimizar")
def optimizar(
    ancho: float = Query(8),
    largo: float = Query(10),
    frecuencia_ghz: float = Query(2.4),
    resolucion: int = Query(40),
):
    posiciones = []

    for px in [0.15, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85]:
        for py in [0.15, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85]:
            posiciones.append((ancho * px, largo * py))

    mejor = None

    for x, y in posiciones:
        heatmap = calcular_heatmap(
            ancho,
            largo,
            x,
            y,
            frecuencia_ghz,
            resolucion,
        )

        m = metricas(heatmap)

        score = m["media"] - (m["zonas_debiles"] * 0.4)

        candidato = {
            "x": round(x, 2),
            "y": round(y, 2),
            "score": round(score, 2),
            "heatmap": heatmap,
            "metricas": m,
        }

        if mejor is None or candidato["score"] > mejor["score"]:
            mejor = candidato

    return {
        "mejor_router": {
            "x": mejor["x"],
            "y": mejor["y"],
        },
        "heatmap": mejor["heatmap"],
        "metricas": mejor["metricas"],
        "score": mejor["score"],
        "recomendacion": "La posición óptima estimada reduce las zonas débiles y mejora la potencia media recibida.",
    }