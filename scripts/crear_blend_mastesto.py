# scripts/crear_blend_mastesto.py
# =========================================================
# +TESTO / MASTESTO - Generador Blender desde JSON
# =========================================================
# Uso local:
# 1) Exporta tu vivienda desde la web como vivienda-mastesto.json
# 2) Pon vivienda-mastesto.json en la misma carpeta desde donde ejecutes este script
# 3) Abre Blender > Scripting > Open > crear_blend_mastesto.py > Run Script
# 4) Genera:
#    - vivienda_mastesto.blend
#    - vivienda_mastesto.glb
#
# También puedes ejecutarlo desde terminal:
# blender --background --python scripts/crear_blend_mastesto.py -- vivienda-mastesto.json
# =========================================================

import bpy
import json
import sys
from pathlib import Path


# =========================================================
# RUTAS
# =========================================================
def obtener_ruta_json():
    """
    Permite dos modos:
    - Desde Blender UI: busca vivienda-mastesto.json junto al script.
    - Desde terminal: blender --background --python script.py -- ruta/al/json
    """
    if "--" in sys.argv:
        idx = sys.argv.index("--")
        if len(sys.argv) > idx + 1:
            return Path(sys.argv[idx + 1]).expanduser().resolve()

    return Path(__file__).resolve().parent / "vivienda-mastesto.json"


JSON_PATH = obtener_ruta_json()
BASE_DIR = JSON_PATH.parent
BLEND_OUT = BASE_DIR / "vivienda_mastesto.blend"
GLB_OUT = BASE_DIR / "vivienda_mastesto.glb"


# =========================================================
# UTILIDADES
# =========================================================
def limpiar_escena():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def crear_material(nombre, color, roughness=0.55, metallic=0.0, alpha=1.0):
    mat = bpy.data.materials.new(nombre)
    mat.use_nodes = True

    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (
            color[0],
            color[1],
            color[2],
            alpha,
        )
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic

        if alpha < 1:
            bsdf.inputs["Alpha"].default_value = alpha
            mat.blend_method = "BLEND"
            mat.use_screen_refraction = True

    return mat


def material_por_nombre(nombre):
    n = (nombre or "").lower()

    if "hormigon" in n or "hormigón" in n or "concrete" in n:
        return MAT_HORMIGON

    if "ladrillo" in n or "brick" in n:
        return MAT_LADRILLO

    if "madera" in n or "wood" in n:
        return MAT_MADERA

    if "metal" in n or "tv" in n:
        return MAT_METAL

    if "cristal" in n or "vidrio" in n or "glass" in n or "ventana" in n:
        return MAT_CRISTAL

    if "pladur" in n or "yeso" in n or "drywall" in n:
        return MAT_PLADUR

    if "tejido" in n or "sofa" in n or "sofá" in n or "cama" in n:
        return MAT_TELA

    return MAT_OBJETO


def cubo(nombre, pos, escala, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.name = nombre
    obj.dimensions = escala
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if mat:
        obj.data.materials.append(mat)

    return obj


def cilindro(nombre, pos, radio, profundidad, mat, vertices=32, rotacion=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radio,
        depth=profundidad,
        location=pos,
    )
    obj = bpy.context.object
    obj.name = nombre

    if rotacion:
        obj.rotation_euler = rotacion

    if mat:
        obj.data.materials.append(mat)

    return obj


def esfera(nombre, pos, radio, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        radius=radio,
        location=pos,
    )
    obj = bpy.context.object
    obj.name = nombre

    if mat:
        obj.data.materials.append(mat)

    return obj


# =========================================================
# OBJETOS
# =========================================================
def crear_router(obj):
    x, y, z = obj["x"], obj["y"], obj["z"]

    body = cubo(
        obj.get("id", "router") + "_body",
        (x, y, z),
        (0.9, 0.18, 0.42),
        MAT_ROUTER,
    )

    cubo(
        obj.get("id", "router") + "_top",
        (x, y + 0.11, z),
        (0.72, 0.035, 0.28),
        MAT_ROUTER_TOP,
    )

    for i, dx in enumerate([-0.34, -0.12, 0.12, 0.34]):
        ant = cilindro(
            f"{obj.get('id', 'router')}_antena_{i}",
            (x + dx, y + 0.48, z + 0.23),
            0.018,
            0.75,
            MAT_NEGRO,
            20,
        )
        ant.rotation_euler[0] = 0.25 if dx > 0 else -0.25

    # LEDs frontales
    for i, dx in enumerate([-0.25, -0.08, 0.08, 0.25]):
        mat_led = MAT_LED_VERDE if i != 2 else MAT_LED_NARANJA
        cubo(
            f"{obj.get('id', 'router')}_led_{i}",
            (x + dx, y + 0.13, z - 0.225),
            (0.055, 0.018, 0.012),
            mat_led,
        )

    return body


def crear_receptor(obj):
    x, y, z = obj["x"], obj["y"], obj["z"]

    rx = esfera(
        obj.get("id", "receptor"),
        (x, y, z),
        0.18,
        MAT_RX,
    )

    cilindro(
        obj.get("id", "receptor") + "_base",
        (x, 0.04, z),
        0.28,
        0.035,
        MAT_RX_BASE,
        32,
    )

    return rx


def crear_cama(obj):
    x, y, z = obj["x"], obj["y"], obj["z"]
    sx, sy, sz = obj["sx"], obj["sy"], obj["sz"]

    base = cubo(obj["id"], (x, y, z), (sx, sy, sz), MAT_TELA)
    cubo(
        obj["id"] + "_colchon",
        (x, y + sy * 0.55, z),
        (sx * 0.95, sy * 0.35, sz * 0.92),
        MAT_COLCHON,
    )
    cubo(
        obj["id"] + "_almohada_1",
        (x - sx * 0.28, y + sy * 0.85, z - sz * 0.22),
        (sx * 0.28, sy * 0.22, sz * 0.32),
        MAT_BLANCO,
    )
    cubo(
        obj["id"] + "_almohada_2",
        (x - sx * 0.28, y + sy * 0.85, z + sz * 0.22),
        (sx * 0.28, sy * 0.22, sz * 0.32),
        MAT_BLANCO,
    )

    return base


def crear_sofa(obj):
    x, y, z = obj["x"], obj["y"], obj["z"]
    sx, sy, sz = obj["sx"], obj["sy"], obj["sz"]

    base = cubo(obj["id"], (x, y, z), (sx, sy, sz), MAT_TELA)
    cubo(
        obj["id"] + "_respaldo",
        (x, y + sy * 0.45, z + sz * 0.42),
        (sx, sy * 0.9, sz * 0.18),
        MAT_TELA,
    )
    cubo(
        obj["id"] + "_brazo_izq",
        (x - sx * 0.48, y + sy * 0.25, z),
        (sx * 0.08, sy * 0.7, sz),
        MAT_TELA,
    )
    cubo(
        obj["id"] + "_brazo_der",
        (x + sx * 0.48, y + sy * 0.25, z),
        (sx * 0.08, sy * 0.7, sz),
        MAT_TELA,
    )

    return base


def crear_tv(obj):
    x, y, z = obj["x"], obj["y"], obj["z"]
    sx, sy, sz = obj["sx"], obj["sy"], obj["sz"]

    pantalla = cubo(obj["id"], (x, y, z), (sx, max(sy, 0.05), sz), MAT_NEGRO)
    cubo(
        obj["id"] + "_marco",
        (x, y, z),
        (sx * 1.05, max(sy, 0.055), sz * 1.08),
        MAT_METAL,
    )
    cubo(
        obj["id"] + "_soporte",
        (x, y - 0.45, z),
        (0.12, 0.45, 0.08),
        MAT_METAL,
    )

    return pantalla


def crear_mueble(obj):
    tipo = obj.get("tipo", "")
    x, y, z = obj["x"], obj["y"], obj["z"]
    sx, sy, sz = obj["sx"], obj["sy"], obj["sz"]
    mat = material_por_nombre(obj.get("material") or tipo)

    if tipo == "cama":
        return crear_cama(obj)

    if tipo in ["sofa", "sofá"]:
        return crear_sofa(obj)

    if tipo == "tv":
        return crear_tv(obj)

    if tipo == "mesa":
        tablero = cubo(obj["id"], (x, y, z), (sx, max(sy, 0.08), sz), MAT_MADERA)
        for i, (dx, dz) in enumerate(
            [
                (-sx * 0.42, -sz * 0.42),
                (sx * 0.42, -sz * 0.42),
                (-sx * 0.42, sz * 0.42),
                (sx * 0.42, sz * 0.42),
            ]
        ):
            cubo(
                obj["id"] + f"_pata_{i}",
                (x + dx, y - 0.35, z + dz),
                (0.06, 0.7, 0.06),
                MAT_MADERA,
            )
        return tablero

    if tipo == "silla":
        asiento = cubo(obj["id"], (x, y, z), (sx, max(sy * 0.25, 0.08), sz), MAT_MADERA)
        cubo(
            obj["id"] + "_respaldo",
            (x, y + sy * 0.45, z + sz * 0.38),
            (sx, sy * 0.8, 0.06),
            MAT_MADERA,
        )
        return asiento

    if tipo == "ventana":
        return cubo(obj["id"], (x, y, z), (sx, sy, max(sz, 0.04)), MAT_CRISTAL)

    return cubo(obj["id"], (x, y, z), (sx, sy, sz), mat)


# =========================================================
# HABITACIONES
# =========================================================
def crear_paredes_y_suelos(data):
    mat_global_pared = data.get("materialPared", "ladrillo")
    mat_global_suelo = data.get("materialSuelo", "hormigon")
    mat_global_techo = data.get("materialTecho", "pladur")

    for h in data.get("habitaciones", []):
        x, z = h["x"], h["z"]
        ancho, largo, alto = h["ancho"], h["largo"], h["alto"]
        grosor = 0.12

        mat_pared = material_por_nombre(h.get("materialPared") or mat_global_pared)
mat_suelo = material_por_nombre(h.get("materialSuelo") or mat_global_suelo)
mat_techo = material_por_nombre(h.get("materialTecho") or mat_global_techo)

material_techo_final = MAT_TECHO_TRANSPARENTE

cubo(
    h["id"] + "_suelo",
    (x, 0, z),
    (ancho, 0.04, largo),
    mat_suelo
)

cubo(
    h["id"] + "_techo",
    (x, alto, z),
    (ancho, 0.02, largo),
    material_techo_final
)

        cubo(
            h["id"] + "_pared_norte",
            (x, alto / 2, z - largo / 2),
            (ancho, alto, grosor),
            mat_pared,
        )
        cubo(
            h["id"] + "_pared_sur",
            (x, alto / 2, z + largo / 2),
            (ancho, alto, grosor),
            mat_pared,
        )
        cubo(
            h["id"] + "_pared_oeste",
            (x - ancho / 2, alto / 2, z),
            (grosor, alto, largo),
            mat_pared,
        )
        cubo(
            h["id"] + "_pared_este",
            (x + ancho / 2, alto / 2, z),
            (grosor, alto, largo),
            mat_pared,
        )


def crear_escena(data):
    crear_paredes_y_suelos(data)

    for obj in data.get("objetos", []):
        tipo = obj.get("tipo", "")

        if tipo == "router":
            crear_router(obj)

        elif tipo in ["receptor", "rx", "receiver"]:
            crear_receptor(obj)

        else:
            crear_mueble(obj)


# =========================================================
# CÁMARA / LUCES / RENDER
# =========================================================
def configurar_camara_y_luces():
    bpy.ops.object.light_add(type="AREA", location=(0, 7, 0))
    l = bpy.context.object
    l.name = "Luz principal suave"
    l.data.energy = 700
    l.data.size = 6

    bpy.ops.object.light_add(type="SUN", location=(6, 8, 5))
    sun = bpy.context.object
    sun.name = "Sol lateral"
    sun.data.energy = 1.5

    bpy.ops.object.camera_add(location=(8, 7, 8), rotation=(1.05, 0, 0.78))
    cam = bpy.context.object
    bpy.context.scene.camera = cam
    cam.data.lens = 28

    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.samples = 64
    bpy.context.scene.world.color = (1, 1, 1)


# =========================================================
# MAIN
# =========================================================
limpiar_escena()


MAT_TECHO_TRANSPARENTE = crear_material(
    "Techo transparente",
    (0.8,0.9,1.0),
    0.1,
    0,
    0.15
)
MAT_HORMIGON = crear_material("Hormigón", (0.55, 0.55, 0.52), 0.8)
MAT_LADRILLO = crear_material("Ladrillo", (0.63, 0.25, 0.16), 0.7)
MAT_PLADUR = crear_material("Pladur / yeso", (0.86, 0.86, 0.82), 0.6)
MAT_MADERA = crear_material("Madera", (0.45, 0.26, 0.12), 0.55)
MAT_METAL = crear_material("Metal", (0.45, 0.46, 0.48), 0.35, 0.8)
MAT_CRISTAL = crear_material("Cristal", (0.55, 0.8, 1.0), 0.05, 0.0, 0.35)
MAT_TELA = crear_material("Tejido", (0.13, 0.23, 0.48), 0.75)
MAT_OBJETO = crear_material("Objeto genérico", (0.35, 0.35, 0.35), 0.7)
MAT_ROUTER = crear_material("Router negro", (0.02, 0.025, 0.035), 0.5)
MAT_ROUTER_TOP = crear_material("Router panel", (0.08, 0.1, 0.14), 0.35)
MAT_NEGRO = crear_material("Negro", (0.005, 0.005, 0.008), 0.5)
MAT_RX = crear_material("Receptor verde", (0.05, 0.8, 0.28), 0.35)
MAT_RX_BASE = crear_material("Base receptor", (0.03, 0.35, 0.12), 0.45)
MAT_BLANCO = crear_material("Blanco", (0.92, 0.92, 0.88), 0.55)
MAT_COLCHON = crear_material("Colchón", (0.88, 0.88, 0.82), 0.65)
MAT_LED_VERDE = crear_material("LED verde", (0.05, 1.0, 0.25), 0.2)
MAT_LED_NARANJA = crear_material("LED naranja", (1.0, 0.35, 0.05), 0.2)

if not JSON_PATH.exists():
    raise FileNotFoundError(
        f"No encuentro {JSON_PATH}. "
        "Exporta tu JSON como vivienda-mastesto.json y ponlo junto al script, "
        "o ejecútalo con: blender --background --python scripts/crear_blend_mastesto.py -- ruta/al/json"
    )

data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

crear_escena(data)
configurar_camara_y_luces()

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))
bpy.ops.export_scene.gltf(filepath=str(GLB_OUT), export_format="GLB")

# render automático
bpy.context.scene.render.filepath = str(BASE_DIR / "render.png")

bpy.context.scene.render.engine = "CYCLES"

bpy.context.scene.cycles.samples = 128

bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

bpy.ops.render.render(write_still=True)

print(f"BLEND generado: {BLEND_OUT}")
print(f"GLB generado: {GLB_OUT}")
