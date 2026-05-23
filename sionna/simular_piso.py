import json
import math
from pathlib import Path

BASE = Path(__file__).resolve().parent
CONFIG = BASE / "config" / "piso.json"
RESULTADOS = (BASE.parent / "public" / "resultados").resolve()

RESULTADOS.mkdir(parents=True, exist_ok=True)

with open(CONFIG, "r", encoding="utf-8") as f:
    datos = json.load(f)

ancho = float(datos["ancho"])
alto = float(datos["alto"])
altura = float(datos["altura"])
habitaciones = int(datos["habitaciones"])
material = datos["material"]
router = datos["router"]
paso = float(datos.get("paso", 0.25))

frecuencia = 5e9 if datos["frecuencia"] == "5 GHz" else 2.45e9

PERDIDAS_MATERIAL = {
    "Hormigón": 12,
    "Ladrillo": 8,
    "Pladur": 4,
    "Madera": 2,
}

perdida_material = PERDIDAS_MATERIAL.get(material, 8)
factor_frecuencia = 1.35 if frecuencia == 5e9 else 1.0


def potencia_estimacion(rx, ry):
    distancia = math.sqrt((router["x"] - rx) ** 2 + (router["y"] - ry) ** 2)

    perdida_distancia = 20 * math.log10(distancia + 1) * factor_frecuencia

    penalizacion_paredes = (
        perdida_material
        if distancia > 4
        else perdida_material / 2
        if distancia > 2.5
        else 0
    )

    return -30 - perdida_distancia - penalizacion_paredes


puntos = []

x = 0.0
while x <= ancho:
    y = 0.0
    while y <= alto:
        puntos.append(
            {
                "x": round(x, 2),
                "y": round(y, 2),
                "potencia": round(potencia_estimacion(x, y), 2),
            }
        )
        y += paso
    x += paso


mejor = {
    "x": 0,
    "y": 0,
    "media": -999,
}

rx = 0.5
while rx <= ancho - 0.5:
    ry = 0.5
    while ry <= alto - 0.5:
        media = sum(
            potencia_estimacion(p["x"], p["y"])
            for p in puntos
        ) / len(puntos)

        if media > mejor["media"]:
            mejor = {
                "x": round(rx, 2),
                "y": round(ry, 2),
                "media": round(media, 2),
            }

        ry += paso
    rx += paso


rayos = [
    {
        "tipo": "directo",
        "puntos": [
            {"x": router["x"], "y": router["y"]},
            {"x": ancho * 0.85, "y": alto * 0.2},
        ],
    },
    {
        "tipo": "reflexion",
        "puntos": [
            {"x": router["x"], "y": router["y"]},
            {"x": ancho * 0.5, "y": 0.1},
            {"x": ancho * 0.9, "y": alto * 0.7},
        ],
    },
    {
        "tipo": "difraccion",
        "puntos": [
            {"x": router["x"], "y": router["y"]},
            {"x": ancho * 0.15, "y": alto * 0.8},
        ],
    },
]

resultado = {
    "escenario": {
        "ancho": ancho,
        "alto": alto,
        "altura": altura,
        "habitaciones": habitaciones,
        "material": material,
        "frecuencia": frecuencia,
        "router": router,
        "paso": paso,
    },
    "puntos": puntos,
    "optimo": mejor,
    "rayos": rayos,
    "nota": "Modelo rápido preparado para validación posterior con Sionna RT.",
}

with open(RESULTADOS / "cobertura.json", "w", encoding="utf-8") as f:
    json.dump(resultado, f, indent=2, ensure_ascii=False)

print("Simulación generada correctamente")
print("Resultado:", RESULTADOS / "cobertura.json")
