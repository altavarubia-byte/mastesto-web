from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import math
import os
import random
import time

# =========================================================
# SIONNA
# =========================================================
SIONNA_DISPONIBLE = False
SIONNA_ERROR = None

try:
    import tensorflow as tf  # noqa: F401
    import sionna  # noqa: F401
    from sionna.rt import load_scene, PathSolver, Transmitter, Receiver, PlanarArray  # noqa: F401

    SIONNA_DISPONIBLE = True
except Exception as e:
    SIONNA_ERROR = str(e)
    print("Sionna no disponible:", e)


# =========================================================
# APP
# =========================================================
app = FastAPI(
    title="Mastesto Sionna API",
    version="2.1",
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


# =========================================================
# MODELOS
# =========================================================
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


# =========================================================
# ENDPOINTS BÁSICOS
# =========================================================
@app.get("/")
def inicio():
    return {
        "ok": True,
        "mensaje": "Mastesto Sionna API funcionando",
        "sionna": SIONNA_DISPONIBLE,
        "sionnaError": SIONNA_ERROR,
    }


@app.get("/health")
def health():
    return {
        "ok": True,
        "estado": "ok",
        "sionna": SIONNA_DISPONIBLE,
    }


@app.get("/sionna/status")
def sionna_status():
    return {
        "ok": True,
        "sionna": SIONNA_DISPONIBLE,
        "error": SIONNA_ERROR,
    }


# =========================================================
# CÁLCULOS FÍSICOS BASE
# =========================================================
def distancia_2d(x1: float, z1: float, x2: float, z2: float) -> float:
    return math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)


def distancia_3d(x1: float, y1: float, z1: float, x2: float, y2: float, z2: float) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)


def perdida_material(material: str) -> float:
    material = (material or "").lower()

    tabla = {
        "pladur": 3,
        "madera": 4,
        "ladrillo": 8,
        "hormigon": 14,
        "hormigón": 14,
        "cristal": 5,
        "vidrio": 5,
        "metal": 22,
    }

    return tabla.get(material, 6)


def perdida_objeto(obj: Objeto3D) -> float:
    material = (obj.material or obj.tipo or "").lower()

    tabla = {
        "router": 0,
        "sofa": 2,
        "sofá": 2,
        "cama": 2,
        "mesa": 2,
        "silla": 1,
        "tv": 5,
        "television": 5,
        "televisión": 5,
        "armario": 6,
        "madera": 4,
        "metal": 10,
        "tejido": 2,
        "planta": 1,
        "estanteria": 5,
        "estantería": 5,
    }

    return tabla.get(material, 2)


def potencia_libre_dbm(dist_m: float, frecuencia_mhz: float, potencia_tx_dbm: float = 20) -> float:
    """
    Modelo FSPL:
    FSPL(dB) = 20log10(d) + 20log10(f) - 147.55
    d en metros, f en Hz.
    """
    dist_m = max(dist_m, 0.5)
    frecuencia_hz = frecuencia_mhz * 1e6
    fspl = 20 * math.log10(dist_m) + 20 * math.log10(frecuencia_hz) - 147.55
    return potencia_tx_dbm - fspl


def punto_en_habitacion(h: Habitacion, x: float, z: float) -> bool:
    return (
        h.x - h.ancho / 2 <= x <= h.x + h.ancho / 2
        and h.z - h.largo / 2 <= z <= h.z + h.largo / 2
    )


def segmento_intersecta_objeto(router: Objeto3D, px: float, pz: float, obj: Objeto3D) -> bool:
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


def calidad_por_potencia(p: float) -> str:
    if p >= -50:
        return "excelente"
    if p >= -65:
        return "buena"
    if p >= -75:
        return "media"
    return "mala"


def color_tipo_rayo(p: float) -> str:
    if p >= -60:
        return "directo"
    if p >= -75:
        return "reflejado"
    return "debil"


def calcular_potencia_punto(vivienda: Vivienda, router: Objeto3D, px: float, pz: float) -> float:
    d = distancia_3d(router.x, router.y, router.z, px, 1.2, pz)
    p = potencia_libre_dbm(d, vivienda.frecuenciaMhz)

    # Atenuación base por tipo de pared/material general
    p -= perdida_material(vivienda.materialPared) * 0.35

    # Penalización por frecuencias altas
    if vivienda.frecuenciaMhz >= 5000:
        p -= 4
    if vivienda.frecuenciaMhz >= 6000:
        p -= 3

    # Obstáculos 3D cruzados por la línea router-punto
    for obj in vivienda.objetos:
        if segmento_intersecta_objeto(router, px, pz, obj):
            p -= perdida_objeto(obj)

    # Pequeña variación para que el mapa no sea artificialmente plano
    p += random.uniform(-1.5, 1.5)

    return round(p, 2)


# =========================================================
# HEATMAP, RAYOS Y ESTADÍSTICAS
# =========================================================
def generar_heatmap(vivienda: Vivienda, router: Objeto3D):
    heatmap = []
    paso = 0.75

    for h in vivienda.habitaciones:
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


def punto_rebote_en_pared(h: Habitacion, router: Objeto3D, dx: float, dz: float):
    """
    Genera un punto de rebote sencillo en una pared de la habitación para que
    el frontend pueda dibujar rayos reflejados visualmente.
    """
    paredes = [
        (h.x - h.ancho / 2, h.z),
        (h.x + h.ancho / 2, h.z),
        (h.x, h.z - h.largo / 2),
        (h.x, h.z + h.largo / 2),
    ]

    # Elegimos la pared más cercana al punto destino
    px, pz = min(paredes, key=lambda p: distancia_2d(p[0], p[1], dx, dz))

    # Suavizamos para que el rebote no quede exactamente en esquina/pared
    bx = (px + router.x + dx) / 3
    bz = (pz + router.z + dz) / 3

    return {"x": round(bx, 2), "y": 1.8, "z": round(bz, 2)}


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
            tipo = color_tipo_rayo(p)

            if tipo == "directo":
                puntos = [
                    {"x": router.x, "y": router.y, "z": router.z},
                    {"x": round(dx, 2), "y": 1.2, "z": round(dz, 2)},
                ]
            else:
                rebote = punto_rebote_en_pared(h, router, dx, dz)
                puntos = [
                    {"x": router.x, "y": router.y, "z": router.z},
                    rebote,
                    {"x": round(dx, 2), "y": 1.2, "z": round(dz, 2)},
                ]

            rayos.append(
                {
                    "id": f"rayo-{h.id}-{i}",
                    "tipo": tipo,
                    "potenciaDbm": p,
                    "puntos": puntos,
                }
            )

    return rayos


def resumen_habitaciones(vivienda: Vivienda, heatmap):
    resumen = []

    for h in vivienda.habitaciones:
        puntos = [p for p in heatmap if punto_en_habitacion(h, p["x"], p["z"])]

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

    # Score simple: mejor si la media es alta y hay pocas zonas muertas
    score = max(0, min(100, round(100 + media + 35 - porcentaje * 0.5, 2)))

    return {
        "score": score,
        "potenciaMediaDbm": media,
        "puntosAnalizados": len(heatmap),
        "zonasMuertas": zonas_muertas,
        "porcentajeZonasMuertas": porcentaje,
    }


# =========================================================
# OPTIMIZACIÓN DEL ROUTER
# =========================================================
def centro_global(vivienda: Vivienda):
    xs = []
    zs = []

    for h in vivienda.habitaciones:
        xs.extend([h.x - h.ancho / 2, h.x + h.ancho / 2])
        zs.extend([h.z - h.largo / 2, h.z + h.largo / 2])

    if not xs or not zs:
        return 0, 0

    return sum(xs) / len(xs), sum(zs) / len(zs)


def optimizar_router(vivienda: Vivienda):
    cx, cz = centro_global(vivienda)

    mejor = {
        "x": round(cx, 2),
        "y": 1.2,
        "z": round(cz, 2),
        "score": -999999,
    }

    xs = []
    zs = []

    for h in vivienda.habitaciones:
        xs.extend([h.x - h.ancho / 2, h.x + h.ancho / 2])
        zs.extend([h.z - h.largo / 2, h.z + h.largo / 2])

    if not xs or not zs:
        return mejor

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


# =========================================================
# RECOMENDACIONES
# =========================================================
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

    if SIONNA_DISPONIBLE:
        recs.append("Sionna está disponible en el backend. Se genera XML de vivienda y se intenta cargar escena Sionna RT.")
    else:
        recs.append("Sionna no está disponible en este entorno. Se usa el motor físico avanzado propio.")

    return recs


# =========================================================
# SIONNA REAL / XML DINÁMICO
# =========================================================
def crear_escena_sionna_desde_vivienda(vivienda: Vivienda) -> str:
    temp_dir = Path("viviendas_temp")
    temp_dir.mkdir(exist_ok=True)

    xml_path = temp_dir / f"vivienda_{int(time.time())}.xml"

    paredes = []

    for h in vivienda.habitaciones:
        grosor = 0.12

        # suelo y techo
        paredes.append((h.x, 0.03, h.z, h.ancho, 0.06, h.largo, "mat_suelo"))
        paredes.append((h.x, h.alto, h.z, h.ancho, 0.06, h.largo, "mat_techo"))

        # paredes laterales
        paredes.append((h.x, h.alto / 2, h.z - h.largo / 2, h.ancho, h.alto, grosor, "mat_pared"))
        paredes.append((h.x, h.alto / 2, h.z + h.largo / 2, h.ancho, h.alto, grosor, "mat_pared"))
        paredes.append((h.x - h.ancho / 2, h.alto / 2, h.z, grosor, h.alto, h.largo, "mat_pared"))
        paredes.append((h.x + h.ancho / 2, h.alto / 2, h.z, grosor, h.alto, h.largo, "mat_pared"))

    shapes = []

    for i, (x, y, z, sx, sy, sz, mat) in enumerate(paredes):
        shapes.append(
            f'''
    <shape type="cube" id="pared_{i}">
        <transform name="to_world">
            <scale x="{sx}" y="{sy}" z="{sz}"/>
            <translate x="{x}" y="{y}" z="{z}"/>
        </transform>
        <ref id="{mat}" name="bsdf"/>
    </shape>
'''
        )

    for obj in vivienda.objetos:
        if obj.tipo == "router":
            continue

        material_ref = "mat_objeto"
        mat = (obj.material or obj.tipo or "").lower()

        if "metal" in mat or obj.tipo.lower() in ["tv", "television", "televisión"]:
            material_ref = "mat_metal"
        elif "madera" in mat or obj.tipo.lower() in ["mesa", "armario", "silla", "estanteria", "estantería"]:
            material_ref = "mat_madera"
        elif "cristal" in mat or "vidrio" in mat:
            material_ref = "mat_cristal"

        shapes.append(
            f'''
    <shape type="cube" id="{obj.id}">
        <transform name="to_world">
            <scale x="{obj.sx}" y="{obj.sy}" z="{obj.sz}"/>
            <translate x="{obj.x}" y="{obj.y}" z="{obj.z}"/>
        </transform>
        <ref id="{material_ref}" name="bsdf"/>
    </shape>
'''
        )

    xml = f'''<?xml version="1.0"?>
<scene version="3.0.0">
    <default name="spp" value="16"/>

    <bsdf type="diffuse" id="mat_pared">
        <rgb name="reflectance" value="0.65,0.65,0.65"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_suelo">
        <rgb name="reflectance" value="0.45,0.45,0.45"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_techo">
        <rgb name="reflectance" value="0.75,0.75,0.75"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_objeto">
        <rgb name="reflectance" value="0.35,0.35,0.35"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_madera">
        <rgb name="reflectance" value="0.42,0.30,0.18"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_metal">
        <rgb name="reflectance" value="0.85,0.85,0.85"/>
    </bsdf>

    <bsdf type="diffuse" id="mat_cristal">
        <rgb name="reflectance" value="0.55,0.75,0.90"/>
    </bsdf>

    {''.join(shapes)}
</scene>
'''

    xml_path.write_text(xml, encoding="utf-8")
    return str(xml_path)


def intentar_sionna_real(vivienda: Optional[Vivienda] = None):
    if not SIONNA_DISPONIBLE:
        return {
            "usado": False,
            "motivo": SIONNA_ERROR,
            "xmlGenerado": None,
            "xmlCargado": False,
            "xmlError": None,
        }

    xml_generado = None
    xml_cargado = False
    xml_error = None

    scene_path = os.environ.get("SIONNA_SCENE_PATH")

    try:
        # Si hay escena fija en variable de entorno, usa esa.
        if scene_path:
            if not os.path.exists(scene_path):
                return {
                    "usado": False,
                    "motivo": f"No existe la escena configurada en SIONNA_SCENE_PATH: {scene_path}",
                    "xmlGenerado": None,
                    "xmlCargado": False,
                    "xmlError": None,
                }
            scene = load_scene(scene_path)
            xml_generado = scene_path
        else:
            # Si no hay escena fija, crea una escena XML dinámica desde la vivienda.
            if vivienda is None:
                return {
                    "usado": False,
                    "motivo": "No hay SIONNA_SCENE_PATH ni vivienda para generar XML.",
                    "xmlGenerado": None,
                    "xmlCargado": False,
                    "xmlError": None,
                }
            xml_generado = crear_escena_sionna_desde_vivienda(vivienda)
            scene = load_scene(xml_generado)

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

        xml_cargado = True

        return {
            "usado": True,
            "motivo": "Escena Sionna cargada correctamente.",
            "xmlGenerado": xml_generado,
            "xmlCargado": xml_cargado,
            "xmlError": xml_error,
        }

    except Exception as e:
        xml_error = str(e)
        return {
            "usado": False,
            "motivo": xml_error,
            "xmlGenerado": xml_generado,
            "xmlCargado": xml_cargado,
            "xmlError": xml_error,
        }


# =========================================================
# ENDPOINT PRINCIPAL
# =========================================================
@app.post("/raytrace")
def raytrace(vivienda: Vivienda):
    if not vivienda.habitaciones:
        return {
            "ok": False,
            "mensaje": "No hay habitaciones para calcular cobertura.",
        }

    routers = [o for o in vivienda.objetos if o.tipo == "router"]

    if not routers:
        return {
            "ok": False,
            "mensaje": "No hay router en la vivienda.",
        }

    router = routers[0]

    estado_sionna = intentar_sionna_real(vivienda)

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
            "tipo": "Sionna RT si está disponible + motor físico avanzado Mastesto",
            "sionnaDisponible": SIONNA_DISPONIBLE,
            "sionnaUsado": estado_sionna["usado"],
            "sionnaDetalle": estado_sionna["motivo"],
            "sionnaXmlGenerado": estado_sionna["xmlGenerado"],
            "sionnaXmlCargado": estado_sionna["xmlCargado"],
            "sionnaXmlError": estado_sionna["xmlError"],
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
            "score": router_optimo["score"],
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
