from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PERDIDAS_MATERIAL = {
    "Hormigón": 12,
    "Ladrillo": 8,
    "Pladur": 4,
    "Madera": 2,
}

@app.post("/simular")
def simular(datos: dict):
    ancho = float(datos.get("ancho", 10))
    alto = float(datos.get("alto", 8))
    altura = float(datos.get("altura", 2.6))
    habitaciones = int(datos.get("habitaciones", 5))
    frecuencia_txt = datos.get("frecuencia", "2.4 GHz")
    material = datos.get("material", "Hormigón")
    router = datos.get("router", {"x": 2, "y": 2, "z": 1.5})
    paso = float(datos.get("paso", 0.25))

    frecuencia = 5e9 if frecuencia_txt == "5 GHz" else 2.45e9
    factor_frecuencia = 1.35 if frecuencia_txt == "5 GHz" else 1.0
    perdida_material = PERDIDAS_MATERIAL.get(material, 8)

    def potencia(router_x, router_y, x, y):
        distancia = math.sqrt((router_x - x) ** 2 + (router_y - y) ** 2)
        perdida_distancia = 20 * math.log10(distancia + 1) * factor_frecuencia

        penalizacion = (
            perdida_material
            if distancia > 4
            else perdida_material / 2
            if distancia > 2.5
            else 0
        )

        return -30 - perdida_distancia - penalizacion

    puntos = []

    x = 0.0
    while x <= ancho:
        y = 0.0
        while y <= alto:
            puntos.append({
                "x": round(x, 2),
                "y": round(y, 2),
                "potencia": round(
                    potencia(router["x"], router["y"], x, y),
                    2
                )
            })
            y += paso
        x += paso

    mejor = {"x": 0, "y": 0, "media": -999}

    rx = 0.5
    while rx <= ancho - 0.5:
        ry = 0.5
        while ry <= alto - 0.5:
            media = sum(
                potencia(rx, ry, p["x"], p["y"])
                for p in puntos
            ) / len(puntos)

            if media > mejor["media"]:
                mejor = {
                    "x": round(rx, 2),
                    "y": round(ry, 2),
                    "media": round(media, 2)
                }

            ry += paso
        rx += paso

    rayos = [
        {
            "tipo": "directo",
            "puntos": [
                {"x": router["x"], "y": router["y"]},
                {"x": round(ancho * 0.85, 2), "y": round(alto * 0.2, 2)}
            ]
        },
        {
            "tipo": "reflexion",
            "puntos": [
                {"x": router["x"], "y": router["y"]},
                {"x": round(ancho * 0.5, 2), "y": 0.1},
                {"x": round(ancho * 0.9, 2), "y": round(alto * 0.7, 2)}
            ]
        }
    ]

    return {
        "ok": True,
        "escenario": {
            "ancho": ancho,
            "alto": alto,
            "altura": altura,
            "habitaciones": habitaciones,
            "frecuencia": frecuencia,
            "frecuencia_texto": frecuencia_txt,
            "material": material,
            "router": router,
            "paso": paso
        },
        "puntos": puntos,
        "optimo": mejor,
        "rayos": rayos,
        "nota": "API Python automática preparada para sustituir el modelo rápido por Sionna RT real."
    }
