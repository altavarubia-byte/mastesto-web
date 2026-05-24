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

habitaciones = [{'id': 'habitacion-1', 'nombre': 'Salón', 'x': 0, 'z': 0, 'ancho': 8, 'largo': 6, 'alto': 2.6}]

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

objetos = [{'id': 'router-1', 'tipo': 'router', 'x': 0, 'y': 1.2, 'z': 0, 'sx': 0.35, 'sy': 0.35, 'sz': 0.35, 'color': '#f97316'}]

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