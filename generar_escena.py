import bpy
import json

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

with open("vivienda.json") as f:
    datos=json.load(f)

for h in datos["habitaciones"]:

    x=h["x"]
    y=h["y"]
    ancho=h["ancho"]
    largo=h["largo"]

    bpy.ops.mesh.primitive_cube_add(
        location=(x+ancho/2, y+largo/2,1.25)
    )

    habitacion=bpy.context.object

    habitacion.scale=(
        ancho/2,
        largo/2,
        1.25
    )

for obj in datos["objetos"]:

    tipo=obj["tipo"]

    bpy.ops.mesh.primitive_cube_add(
        location=(
            obj["x"],
            obj["y"],
            0.5
        )
    )

    o=bpy.context.object

    if tipo=="sofa":
        o.scale=(1.2,0.5,0.4)

    elif tipo=="tv":
        o.scale=(0.7,0.1,0.5)

    elif tipo=="router":
        o.scale=(0.15,0.15,0.15)

bpy.ops.wm.save_as_mainfile(
filepath="escena_generada.blend"
)