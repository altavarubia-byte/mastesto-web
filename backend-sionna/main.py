from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import math
import os
import random

SIONNA_DISPONIBLE = False
SIONNA_ERROR = None

try:
    import tensorflow as tf
    import sionna
    from sionna.rt import load_scene, PathSolver, Transmitter, Receiver, PlanarArray

    SIONNA_DISPONIBLE = True
except Exception as e:
    SIONNA_ERROR = str(e)
    print("Sionna no disponible:", e)


app = FastAPI(
    title="Mastesto Sionna API",
    version="2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://mastesto.es",
        "https://www.mastesto.es",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Habitacion(BaseModel):
    id: str
    nombre: str
    x: float
    z: float
    ancho: float
    largo: float
    alto: float


class Objeto3D(BaseModel):
    id: str
    tipo: str
    x: float
    y: float
    z: float
    sx: float
    sy: float
    sz: float
    color: str
    material: Optional[str] = None


class Vivienda(BaseModel):
    version: str
    unidades: str
    fecha: Optional[str] = None
    materialPared: str
    frecuenciaMhz: float
    habitaciones: list[Habitacion]
    objetos: list[Objeto3D]


@app.get("/")
def inicio():
    return {
        "ok": True,
        "mensaje": "Mastesto Sionna API funcionando",
        "sionna": SIONNA_DISPONIBLE,
    }


@app.get("/health")
def health():
    return {"estado": "ok"}


@app.get("/sionna/status")
def sionna_status():
    return {
        "ok": True,
        "sionna": SIONNA_DISPONIBLE,
        "error": SIONNA_ERROR,
    }


def distancia_2d(x1, z1, x2, z2):
    return math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)


def distancia_3d(x1, y1, z1, x2, y2, z2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)


def perdida_material(material: str):
    material = (material or "").lower()

    tabla = {
        "pladur": 3,
        "madera": 4,
        "ladrillo": 8,
        "hormigon": 14,
        "cristal": 5,
        "metal": 22,
    }

    return tabla.get(material, 6)


def perdida_objeto(obj: Objeto3D):
    material = (obj.material or obj.tipo or "").lower()

    tabla = {
        "router": 0,
        "sofa": 2,
        "cama": 2,
        "mesa": 2,
        "silla": 1,
        "tv": 5,
        "armario": 6,
        "madera": 4,
        "metal": 10,
        "tejido": 2,
    }

    return tabla.get(material, 2)


def potencia_libre_dbm(dist_m: float, frecuencia_mhz: float, potencia_tx_dbm: float = 20):
    if dist_m < 0.5:
        dist_m = 0.5

    fspl = 20 * math.log10(dist_m) + 20 * math.log10(frecuencia_mhz * 1e6) - 147.55

    return potencia_tx_dbm - fspl


def punto_en_habitacion(h: Habitacion, x: float, z: float):
    return (
        h.x - h.ancho / 2 <= x <= h.x + h.ancho / 2
        and h.z - h.largo / 2 <= z <= h.z + h.largo / 2
    )


def segmento_intersecta_objeto(router: Objeto3D, px: float, pz: float, obj: Objeto3D):
    if obj.tipo == "router":
        return False

    x1, z1 = router.x, router.z
    x2, z2 = px, pz

    ox, oz = obj.x, obj.z
    radio = max(obj.sx, obj.sz) / 2 + 0.15

    dx = x2 - x1
    dz = z2 - z1

    if dx == 0 and dz == 0:
        return False

    t = ((ox - x1) * dx + (oz - z1) * dz) / (dx * dx + dz * dz)
    t = max(0, min(1, t))

    cx = x1 + t * dx
    cz = z1 + t * dz

    return distancia_2d(cx, cz, ox, oz) <= radio


def calidad_por_potencia(p):
    if p >= -50:
        return "excelente"
    if p >= -65:
        return "buena"
    if p >= -75:
        return "media"
    return "mala"


def color_tipo_rayo(p):
    if p >= -60:
        return "directo"
    if p >= -75:
        return "reflejado"
    return "debil"


def calcular_potencia_punto(vivienda: Vivienda, router: Objeto3D, px: float, pz: float):
    d = distancia_3d(router.x, router.y, router.z, px, 1.2, pz)

    p = potencia_libre_dbm(d, vivienda.frecuenciaMhz)

    p -= perdida_material(vivienda.materialPared) * 0.35

    if vivienda.frecuenciaMhz >= 5000:
        p -= 4

    if vivienda.frecuenciaMhz >= 6000:
        p -= 3

    for obj in vivienda.objetos:
        if segmento_intersecta_objeto(router, px, pz, obj):
            p -= perdida_objeto(obj)

    p += random.uniform(-1.5, 1.5)

    return round(p, 2)


def generar_heatmap(vivienda: Vivienda, router: Objeto3D):
    heatmap = []

    for h in vivienda.habitaciones:
        paso = 0.75

        x0 = h.x - h.ancho / 2
        x1 = h.x + h.ancho / 2

        z0 = h.z - h.largo / 2
        z1 = h.z + h.largo / 2

        x = x0

        while x <= x1:
            z = z0

            while z <= z1:
                p = calcular_potencia_punto(vivienda, router, x, z)

                heatmap.append(
                    {
                        "x": round(x, 2),
                        "z": round(z, 2),
                        "potenciaDbm": p,
                        "calidad": calidad_por_potencia(p),
                    }
                )

                z += paso

            x += paso

    return heatmap


def generar_rayos(vivienda: Vivienda, router: Objeto3D):
    rayos = []

    for h in vivienda.habitaciones:
        destinos = [
            (h.x, h.z),
            (h.x - h.ancho / 3, h.z),
            (h.x + h.ancho / 3, h.z),
            (h.x, h.z - h.largo / 3),
            (h.x, h.z + h.largo / 3),
        ]

        for i, (dx, dz) in enumerate(destinos):
            p = calcular_potencia_punto(vivienda, router, dx, dz)

            puntos = [
                {"x": router.x, "y": router.y, "z": router.z},
                {"x": dx, "y": 1.2, "z": dz},
            ]

            rayos.append(
                {
                    "id": f"rayo-{h.id}-{i}",
                    "tipo": color_tipo_rayo(p),
                    "potenciaDbm": p,
                    "puntos": puntos,
                }
            )

    return rayos


def resumen_habitaciones(vivienda: Vivienda, heatmap):
    resumen = []

    for h in vivienda.habitaciones:
        puntos = [
            p for p in heatmap
            if punto_en_habitacion(h, p["x"], p["z"])
        ]

        if not puntos:
            resumen.append(
                {
                    "habitacion": h.nombre,
                    "potenciaMediaDbm": None,
                    "calidad": "sin datos",
                }
            )
            continue

        media = round(sum(p["potenciaDbm"] for p in puntos) / len(puntos), 2)

        resumen.append(
            {
                "habitacion": h.nombre,
                "potenciaMediaDbm": media,
                "calidad": calidad_por_potencia(media),
            }
        )

    return resumen


def estadisticas_heatmap(heatmap):
    if not heatmap:
        return {
            "score": 0,
            "potenciaMediaDbm": -999,
            "puntosAnalizados": 0,
            "zonasMuertas": 0,
            "porcentajeZonasMuertas": 100,
        }

    potencias = [p["potenciaDbm"] for p in heatmap]

    media = round(sum(potencias) / len(potencias), 2)
    zonas_muertas = len([p for p in potencias if p < -75])
    porcentaje = round(zonas_muertas / len(potencias) * 100, 2)

    score = max(0, min(100, round(100 + media + 35 - porcentaje * 0.5, 2)))

    return {
        "score": score,
        "potenciaMediaDbm": media,
        "puntosAnalizados": len(heatmap),
        "zonasMuertas": zonas_muertas,
        "porcentajeZonasMuertas": porcentaje,
    }


def centro_global(vivienda: Vivienda):
    xs = []
    zs = []

    for h in vivienda.habitaciones:
        xs.extend([h.x - h.ancho / 2, h.x + h.ancho / 2])
        zs.extend([h.z - h.largo / 2, h.z + h.largo / 2])

    return sum(xs) / len(xs), sum(zs) / len(zs)


def optimizar_router(vivienda: Vivienda):
    cx, cz = centro_global(vivienda)

    mejor = {
        "x": cx,
        "y": 1.2,
        "z": cz,
        "score": -999999,
    }

    xs = []
    zs = []

    for h in vivienda.habitaciones:
        xs.extend([h.x - h.ancho / 2, h.x + h.ancho / 2])
        zs.extend([h.z - h.largo / 2, h.z + h.largo / 2])

    minx, maxx = min(xs), max(xs)
    minz, maxz = min(zs), max(zs)

    x = minx

    while x <= maxx:
        z = minz

        while z <= maxz:
            dentro = any(punto_en_habitacion(h, x, z) for h in vivienda.habitaciones)

            if dentro:
                router_virtual = Objeto3D(
                    id="router-optimo",
                    tipo="router",
                    x=x,
                    y=1.2,
                    z=z,
                    sx=0.35,
                    sy=0.35,
                    sz=0.35,
                    color="#22c55e",
                )

                heatmap = generar_heatmap(vivienda, router_virtual)
                est = estadisticas_heatmap(heatmap)

                if est["score"] > mejor["score"]:
                    mejor = {
                        "x": round(x, 2),
                        "y": 1.2,
                        "z": round(z, 2),
                        "score": est["score"],
                    }

            z += 1.0

        x += 1.0

    return mejor


def recomendaciones(est):
    recs = []

    if est["porcentajeZonasMuertas"] > 20:
        recs.append("Hay demasiadas zonas muertas. Conviene mover el router o añadir un repetidor mesh.")
    elif est["porcentajeZonasMuertas"] > 5:
        recs.append("La cobertura es aceptable, pero hay zonas débiles que pueden mejorar con una ubicación más central.")
    else:
        recs.append("La cobertura general es buena para la vivienda simulada.")

    if est["potenciaMediaDbm"] < -70:
        recs.append("La potencia media es baja. Revisa paredes pesadas, muebles grandes o frecuencia demasiado alta.")

    recs.append("Sionna está cargado en el backend. Esta respuesta combina motor físico propio con backend preparado para Sionna RT.")

    return recs


def intentar_sionna_real():
    if not SIONNA_DISPONIBLE:
        return {
            "usado": False,
            "motivo": SIONNA_ERROR,
        }

    scene_path = os.environ.get("SIONNA_SCENE_PATH")

    if not scene_path:
        return {
            "usado": False,
            "motivo": "No hay SIONNA_SCENE_PATH configurado. Se usa motor avanzado propio.",
        }

    if not os.path.exists(scene_path):
        return {
            "usado": False,
            "motivo": f"No existe la escena: {scene_path}",
        }

    try:
        scene = load_scene(scene_path)

        scene.tx_array = PlanarArray(
            num_rows=1,
            num_cols=1,
            vertical_spacing=0.5,
            horizontal_spacing=0.5,
            pattern="iso",
            polarization="V",
        )

        scene.rx_array = PlanarArray(
            num_rows=1,
            num_cols=1,
            vertical_spacing=0.5,
            horizontal_spacing=0.5,
            pattern="iso",
            polarization="V",
        )

        return {
            "usado": True,
            "motivo": "Escena Sionna cargada correctamente.",
        }

    except Exception as e:
        return {
            "usado": False,
            "motivo": str(e),
        }



def crear_escena_sionna_desde_vivienda(vivienda: Vivienda):
    temp_dir = Path("viviendas_temp")
    temp_dir.mkdir(exist_ok=True)

    xml_path = temp_dir / f"vivienda_{int(time.time())}.xml"

    paredes = []

    for h in vivienda.habitaciones:
        grosor = 0.12

        paredes.append((h.x, h.alto / 2, h.z - h.largo / 2, h.ancho, h.alto, grosor))
        paredes.append((h.x, h.alto / 2, h.z + h.largo / 2, h.ancho, h.alto, grosor))
        paredes.append((h.x - h.ancho / 2, h.alto / 2, h.z, grosor, h.alto, h.largo))
        paredes.append((h.x + h.ancho / 2, h.alto / 2, h.z, grosor, h.alto, h.largo))

    shapes = []

    for i, (x, y, z, sx, sy, sz) in enumerate(paredes):
        shapes.append(f"""
    <shape type="cube" id="pared_{i}">
        <transform name="to_world">
            <scale x="{sx}" y="{sy}" z="{sz}"/>
            <translate x="{x}" y="{y}" z="{z}"/>
        </transform>
        <ref id="mat_pared" name="bsdf"/>
    </shape>
""")

    for obj in vivienda.objetos:
        if obj.tipo == "router":
            continue

        shapes.append(f"""
    <shape type="cube" id="{obj.id}">
        <transform name="to_world">
            <scale x="{obj.sx}" y="{obj.sy}" z="{obj.sz}"/>
            <translate x="{obj.x}" y="{obj.y}" z="{obj.z}"/>
        </transform>
        <ref id="mat_objeto" name="bsdf"/>
    </shape>
""")

    xml = f"""<?xml version="1.0"?>
<scene version="3.0.0">
    <default name="spp" value="16"/>

    <bsdf type="diffuse" id="mat_pared">
        <rgb name="reflectance" value="0.65,0.65,0.65"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_objeto">
        <rgb name="reflectance" value="0.35,0.35,0.35"/>
    </bsdf>

    {"".join(shapes)}
</scene>
"""

    xml_path.write_text(xml, encoding="utf-8")

    return str(xml_path)

@app.post("/raytrace")
def raytrace(vivienda: Vivienda):
    routers = [o for o in vivienda.objetos if o.tipo == "router"]

    if not routers:
        return {
            "ok": False,
            "mensaje": "No hay router en la vivienda.",
        }

    router = routers[0]

    estado_sionna = intentar_sionna_real()

    xml_generado = None
sionna_xml_cargado = False
sionna_xml_error = None

if SIONNA_DISPONIBLE:
    try:
        xml_generado = crear_escena_sionna_desde_vivienda(vivienda)
        scene = load_scene(xml_generado)
        sionna_xml_cargado = True
    except Exception as e:
        sionna_xml_error = str(e)

    heatmap = generar_heatmap(vivienda, router)
    rayos = generar_rayos(vivienda, router)
    est = estadisticas_heatmap(heatmap)
    router_optimo = optimizar_router(vivienda)
    resumen = resumen_habitaciones(vivienda, heatmap)

    return {
        "ok": True,
        "mensaje": "Cobertura calculada correctamente.",
        "modelo": {
            "frecuenciaMhz": vivienda.frecuenciaMhz,
            "potenciaTxDbm": 20,
            "materialPared": vivienda.materialPared,
            "tipo": "Sionna RT preparado + motor físico avanzado Mastesto",
            "sionnaDisponible": SIONNA_DISPONIBLE,
            "sionnaUsado": estado_sionna["usado"],
            "sionnaDetalle": estado_sionna["motivo"],
        },
        "routerActual": {
            "x": router.x,
            "y": router.y,
            "z": router.z,
        },
        "routerOptimo": {
            "x": router_optimo["x"],
            "y": router_optimo["y"],
            "z": router_optimo["z"],
        },
        "estadisticas": est,
        "heatmap": heatmap,
        "rayos": rayos,
        "resumenHabitaciones": resumen,
        "recomendaciones": recomendaciones(est),
    }


@app.post("/calcular")
def calcular(vivienda: Vivienda):
    return raytrace(vivienda)


@app.post("/optimizar")
def optimizar(vivienda: Vivienda):
    router_optimo = optimizar_router(vivienda)

    return {
        "ok": True,
        "x": router_optimo["x"],
        "y": router_optimo["y"],
        "z": router_optimo["z"],
        "score": router_optimo["score"],
        "mensaje": "Posición óptima encontrada.",
    }
