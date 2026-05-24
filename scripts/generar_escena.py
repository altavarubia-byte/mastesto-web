import json
from pathlib import Path


# ============================================================
# MASTESTO / TFG TELECO
# Generador de escena desde el editor 3D de vivienda
#
# Entrada:
#   salidas/vivienda-mastesto.json
#
# Salidas:
#   salidas/reporte-vivienda.txt
#   salidas/blender_crear_vivienda.py
#   salidas/escena_sionna_base.xml
#
# Conversión de ejes:
#   Web / Three.js: X horizontal, Y altura, Z profundidad
#   Blender:        X horizontal, Y profundidad, Z altura
#
#   Por tanto:
#   Blender(x, y, z) = Web(x, z, y)
# ============================================================


RUTA_JSON = Path("salidas/vivienda-mastesto.json")
CARPETA_SALIDAS = Path("salidas")

RUTA_REPORTE = CARPETA_SALIDAS / "reporte-vivienda.txt"
RUTA_BLENDER = CARPETA_SALIDAS / "blender_crear_vivienda.py"
RUTA_SIONNA_XML = CARPETA_SALIDAS / "escena_sionna_base.xml"


def asegurar_carpeta_salidas():
    CARPETA_SALIDAS.mkdir(exist_ok=True)


def cargar_json():
    if not RUTA_JSON.exists():
        raise FileNotFoundError(
            f"No existe el archivo {RUTA_JSON}. "
            "Primero pulsa 'Calcular cobertura' en la web."
        )

    with open(RUTA_JSON, "r", encoding="utf-8") as archivo:
        datos = json.load(archivo)

    return datos


def limpiar_nombre(texto):
    texto = str(texto).lower()
    texto = texto.replace(" ", "_")
    texto = texto.replace("-", "_")
    texto = texto.replace("á", "a")
    texto = texto.replace("é", "e")
    texto = texto.replace("í", "i")
    texto = texto.replace("ó", "o")
    texto = texto.replace("ú", "u")
    texto = texto.replace("ñ", "n")
    texto = texto.replace("__", "_")
    return texto


# ============================================================
# REPORTE TXT
# ============================================================

def generar_reporte(datos):
    habitaciones = datos.get("habitaciones", [])
    objetos = datos.get("objetos", [])

    lineas = []

    lineas.append("============================================")
    lineas.append("REPORTE DE VIVIENDA 3D - MASTESTO / TFG")
    lineas.append("============================================")
    lineas.append("")
    lineas.append(f"Versión: {datos.get('version', 'sin_version')}")
    lineas.append(f"Unidades: {datos.get('unidades', 'metros')}")
    lineas.append(f"Fecha: {datos.get('fecha', 'sin_fecha')}")
    lineas.append("")
    lineas.append(f"Número de habitaciones: {len(habitaciones)}")
    lineas.append(f"Número de objetos: {len(objetos)}")
    lineas.append("")

    lineas.append("--------------- HABITACIONES ---------------")

    for habitacion in habitaciones:
        lineas.append("")
        lineas.append(f"ID: {habitacion.get('id')}")
        lineas.append(f"Nombre: {habitacion.get('nombre')}")
        lineas.append(
            f"Posición Web X/Z: ({habitacion.get('x')}, {habitacion.get('z')}) m"
        )
        lineas.append(f"Ancho: {habitacion.get('ancho')} m")
        lineas.append(f"Largo: {habitacion.get('largo')} m")
        lineas.append(f"Alto: {habitacion.get('alto')} m")

    lineas.append("")
    lineas.append("------------------ OBJETOS -----------------")

    for objeto in objetos:
        lineas.append("")
        lineas.append(f"ID: {objeto.get('id')}")
        lineas.append(f"Tipo: {objeto.get('tipo')}")
        lineas.append(
            f"Posición Web X/Y/Z: ({objeto.get('x')}, {objeto.get('y')}, {objeto.get('z')}) m"
        )
        lineas.append(
            f"Escala Web X/Y/Z: ({objeto.get('sx')}, {objeto.get('sy')}, {objeto.get('sz')}) m"
        )
        lineas.append(f"Color: {objeto.get('color')}")

    lineas.append("")
    lineas.append("============================================")
    lineas.append("Este archivo sirve como documentación inicial")
    lineas.append("para justificar el modelo geométrico del TFG.")
    lineas.append("============================================")

    RUTA_REPORTE.write_text("\n".join(lineas), encoding="utf-8")


# ============================================================
# SCRIPT BLENDER
# ============================================================

def generar_script_blender(datos):
    habitaciones = datos.get("habitaciones", [])
    objetos = datos.get("objetos", [])

    habitaciones_json = repr(habitaciones)
    objetos_json = repr(objetos)

    codigo = f'''
import bpy


# ============================================================
# SCRIPT GENERADO AUTOMÁTICAMENTE DESDE MASTESTO
#
# Conversión correcta:
# Web / Three.js: X horizontal, Y altura, Z profundidad
# Blender:        X horizontal, Y profundidad, Z altura
#
# Blender(x, y, z) = Web(x, z, y)
# ============================================================


# ------------------------------------------------------------
# LIMPIAR ESCENA
# ------------------------------------------------------------

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()


# ------------------------------------------------------------
# MATERIALES
# ------------------------------------------------------------

def crear_material(nombre, color, alpha=1.0):
    mat = bpy.data.materials.new(nombre)
    mat.diffuse_color = color

    if alpha < 1.0:
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Alpha"].default_value = alpha

        mat.blend_method = "BLEND"
        mat.use_screen_refraction = True
        mat.show_transparent_back = True

    return mat


mat_suelo = crear_material("mat_suelo_hormigon", (0.80, 0.80, 0.80, 1), 1.0)
mat_pared = crear_material("mat_pared_concreto", (0.86, 0.86, 0.86, 0.55), 0.55)
mat_techo = crear_material("mat_techo_transparente", (1.00, 1.00, 1.00, 0.18), 0.18)

mat_router = crear_material("mat_router_wifi", (0.95, 0.45, 0.08, 1), 1.0)
mat_sofa = crear_material("mat_sofa", (0.45, 0.16, 0.07, 1), 1.0)
mat_mesa = crear_material("mat_mesa", (0.55, 0.25, 0.05, 1), 1.0)
mat_silla = crear_material("mat_silla", (0.35, 0.33, 0.31, 1), 1.0)
mat_tv = crear_material("mat_tv", (0.01, 0.02, 0.05, 1), 1.0)
mat_cama = crear_material("mat_cama", (0.10, 0.23, 0.54, 1), 1.0)
mat_armario = crear_material("mat_armario", (0.27, 0.25, 0.24, 1), 1.0)
mat_default = crear_material("mat_default", (0.8, 0.8, 0.8, 1), 1.0)


def material_por_tipo(tipo):
    if tipo == "router":
        return mat_router
    if tipo == "sofa":
        return mat_sofa
    if tipo == "mesa":
        return mat_mesa
    if tipo == "silla":
        return mat_silla
    if tipo == "tv":
        return mat_tv
    if tipo == "cama":
        return mat_cama
    if tipo == "armario":
        return mat_armario

    return mat_default


# ------------------------------------------------------------
# CREAR CUBO ESCALADO
# ------------------------------------------------------------

def crear_caja(nombre, posicion, dimensiones, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=posicion)

    obj = bpy.context.object
    obj.name = nombre
    obj.dimensions = dimensiones

    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if material is not None:
        obj.data.materials.append(material)

    return obj


# ------------------------------------------------------------
# CREAR HABITACIONES
# ------------------------------------------------------------

habitaciones = {habitaciones_json}

for habitacion in habitaciones:
    x = float(habitacion["x"])
    z = float(habitacion["z"])
    ancho = float(habitacion["ancho"])
    largo = float(habitacion["largo"])
    alto = float(habitacion["alto"])
    nombre = str(habitacion["nombre"]).replace(" ", "_")

    grosor = 0.12

    # Suelo
    # Web:     position [x, -0.02, z], scale [ancho, 0.04, largo]
    # Blender: position (x, z, -0.02), dimensions (ancho, largo, 0.04)

    crear_caja(
        "suelo_" + nombre,
        (x, z, -0.02),
        (ancho, largo, 0.04),
        mat_suelo,
    )

    # Pared frontal

    crear_caja(
        "pared_frontal_" + nombre,
        (x, z - largo / 2, alto / 2),
        (ancho, grosor, alto),
        mat_pared,
    )

    # Pared trasera

    crear_caja(
        "pared_trasera_" + nombre,
        (x, z + largo / 2, alto / 2),
        (ancho, grosor, alto),
        mat_pared,
    )

    # Pared izquierda

    crear_caja(
        "pared_izquierda_" + nombre,
        (x - ancho / 2, z, alto / 2),
        (grosor, largo, alto),
        mat_pared,
    )

    # Pared derecha

    crear_caja(
        "pared_derecha_" + nombre,
        (x + ancho / 2, z, alto / 2),
        (grosor, largo, alto),
        mat_pared,
    )

    # Techo

    crear_caja(
        "techo_" + nombre,
        (x, z, alto),
        (ancho, largo, 0.04),
        mat_techo,
    )


# ------------------------------------------------------------
# CREAR OBJETOS
# ------------------------------------------------------------

objetos = {objetos_json}

for objeto in objetos:
    tipo = objeto["tipo"]
    nombre = objeto["id"]

    x_web = float(objeto["x"])
    y_web = float(objeto["y"])
    z_web = float(objeto["z"])

    sx_web = float(objeto["sx"])
    sy_web = float(objeto["sy"])
    sz_web = float(objeto["sz"])

    # Web:     position [x, y, z], scale [sx, sy, sz]
    # Blender: position (x, z, y), dimensions (sx, sz, sy)

    crear_caja(
        nombre,
        (
            x_web,
            z_web,
            y_web,
        ),
        (
            sx_web,
            sz_web,
            sy_web,
        ),
        material_por_tipo(tipo),
    )


# ------------------------------------------------------------
# MARCAR ROUTERS COMO TRANSMISORES VISUALES
# ------------------------------------------------------------

for obj in bpy.context.scene.objects:
    if "router" in obj.name.lower():
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=32,
            ring_count=16,
            radius=0.18,
            location=(obj.location.x, obj.location.y, obj.location.z + 0.35),
        )
        esfera = bpy.context.object
        esfera.name = "tx_wifi_" + obj.name
        esfera.data.materials.append(mat_router)


# ------------------------------------------------------------
# LUZ Y CÁMARA
# ------------------------------------------------------------

bpy.ops.object.light_add(type="SUN", location=(0, 0, 8))
luz = bpy.context.object
luz.name = "Sol"
luz.data.energy = 3


bpy.ops.object.camera_add(location=(10, -10, 8), rotation=(1.1, 0, 0.78))
bpy.context.scene.camera = bpy.context.object


# ------------------------------------------------------------
# UNIDADES
# ------------------------------------------------------------

bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 1.0


# ------------------------------------------------------------
# GUARDAR ARCHIVO BLEND
# ------------------------------------------------------------

bpy.ops.wm.save_as_mainfile(filepath="salidas/vivienda_mastesto.blend")

print("Escena Blender creada correctamente: salidas/vivienda_mastesto.blend")
'''

    RUTA_BLENDER.write_text(codigo.strip(), encoding="utf-8")


# ============================================================
# XML BASE PARA SIONNA / MITSUBA
# ============================================================

def generar_xml_sionna(datos):
    habitaciones = datos.get("habitaciones", [])
    objetos = datos.get("objetos", [])

    lineas = []

    lineas.append('<?xml version="1.0" encoding="utf-8"?>')
    lineas.append('<scene version="2.1.0">')
    lineas.append("")
    lineas.append("  <!-- ================================================== -->")
    lineas.append("  <!-- ESCENA BASE GENERADA DESDE MASTESTO               -->")
    lineas.append("  <!-- Base geométrica para Sionna RT / Mitsuba          -->")
    lineas.append("  <!-- Conversión: Blender/Sionna(x,y,z)=Web(x,z,y)      -->")
    lineas.append("  <!-- ================================================== -->")
    lineas.append("")
    lineas.append('  <integrator type="path"/>')
    lineas.append("")

    lineas.append("  <!-- Materiales base -->")
    lineas.append('  <bsdf type="diffuse" id="mat_pared">')
    lineas.append('    <rgb name="reflectance" value="0.75, 0.75, 0.75"/>')
    lineas.append("  </bsdf>")
    lineas.append("")

    lineas.append('  <bsdf type="diffuse" id="mat_suelo">')
    lineas.append('    <rgb name="reflectance" value="0.55, 0.55, 0.55"/>')
    lineas.append("  </bsdf>")
    lineas.append("")

    lineas.append('  <bsdf type="diffuse" id="mat_objeto">')
    lineas.append('    <rgb name="reflectance" value="0.35, 0.35, 0.35"/>')
    lineas.append("  </bsdf>")
    lineas.append("")

    lineas.append('  <bsdf type="diffuse" id="mat_router">')
    lineas.append('    <rgb name="reflectance" value="0.95, 0.45, 0.08"/>')
    lineas.append("  </bsdf>")
    lineas.append("")

    grosor = 0.12

    for habitacion in habitaciones:
        nombre = limpiar_nombre(habitacion.get("nombre", "habitacion"))

        x = float(habitacion.get("x", 0))
        z = float(habitacion.get("z", 0))
        ancho = float(habitacion.get("ancho", 4))
        largo = float(habitacion.get("largo", 4))
        alto = float(habitacion.get("alto", 2.6))

        piezas = [
            {
                "id": f"suelo_{nombre}",
                "pos": (x, z, -0.02),
                "scale": (ancho, largo, 0.04),
                "mat": "mat_suelo",
            },
            {
                "id": f"pared_frontal_{nombre}",
                "pos": (x, z - largo / 2, alto / 2),
                "scale": (ancho, grosor, alto),
                "mat": "mat_pared",
            },
            {
                "id": f"pared_trasera_{nombre}",
                "pos": (x, z + largo / 2, alto / 2),
                "scale": (ancho, grosor, alto),
                "mat": "mat_pared",
            },
            {
                "id": f"pared_izquierda_{nombre}",
                "pos": (x - ancho / 2, z, alto / 2),
                "scale": (grosor, largo, alto),
                "mat": "mat_pared",
            },
            {
                "id": f"pared_derecha_{nombre}",
                "pos": (x + ancho / 2, z, alto / 2),
                "scale": (grosor, largo, alto),
                "mat": "mat_pared",
            },
            {
                "id": f"techo_{nombre}",
                "pos": (x, z, alto),
                "scale": (ancho, largo, 0.04),
                "mat": "mat_pared",
            },
        ]

        for pieza in piezas:
            px, py, pz = pieza["pos"]
            sx, sy, sz = pieza["scale"]

            lineas.append(f'  <shape type="cube" id="{pieza["id"]}">')
            lineas.append('    <transform name="to_world">')
            lineas.append(f'      <scale x="{sx / 2}" y="{sy / 2}" z="{sz / 2}"/>')
            lineas.append(f'      <translate x="{px}" y="{py}" z="{pz}"/>')
            lineas.append("    </transform>")
            lineas.append(f'    <ref id="{pieza["mat"]}"/>')
            lineas.append("  </shape>")
            lineas.append("")

    for objeto in objetos:
        oid = limpiar_nombre(objeto.get("id", "objeto"))
        tipo = objeto.get("tipo", "objeto")

        x_web = float(objeto.get("x", 0))
        y_web = float(objeto.get("y", 0))
        z_web = float(objeto.get("z", 0))

        sx_web = float(objeto.get("sx", 1))
        sy_web = float(objeto.get("sy", 1))
        sz_web = float(objeto.get("sz", 1))

        # Conversión Web -> Sionna/Blender
        x = x_web
        y = z_web
        z = y_web

        sx = sx_web
        sy = sz_web
        sz = sy_web

        mat = "mat_router" if tipo == "router" else "mat_objeto"

        lineas.append(f'  <shape type="cube" id="{oid}">')
        lineas.append('    <transform name="to_world">')
        lineas.append(f'      <scale x="{sx / 2}" y="{sy / 2}" z="{sz / 2}"/>')
        lineas.append(f'      <translate x="{x}" y="{y}" z="{z}"/>')
        lineas.append("    </transform>")
        lineas.append(f'    <ref id="{mat}"/>')
        lineas.append("  </shape>")
        lineas.append("")

    lineas.append("</scene>")

    RUTA_SIONNA_XML.write_text("\n".join(lineas), encoding="utf-8")


# ============================================================
# MAIN
# ============================================================

def main():
    asegurar_carpeta_salidas()

    datos = cargar_json()

    generar_reporte(datos)
    generar_script_blender(datos)
    generar_xml_sionna(datos)

    print("")
    print("============================================")
    print("GENERACIÓN COMPLETADA")
    print("============================================")
    print(f"JSON leído:       {RUTA_JSON}")
    print(f"Reporte creado:   {RUTA_REPORTE}")
    print(f"Blender script:   {RUTA_BLENDER}")
    print(f"XML Sionna base:  {RUTA_SIONNA_XML}")
    print("============================================")
    print("")
    print("Ahora ejecuta:")
    print("/Applications/Blender.app/Contents/MacOS/Blender --background --python salidas/blender_crear_vivienda.py")
    print("")
    print("Luego abre:")
    print("open -a Blender salidas/vivienda_mastesto.blend")
    print("")


if __name__ == "__main__":
    main()