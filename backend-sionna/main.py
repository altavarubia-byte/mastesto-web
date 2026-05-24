from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import random

# =====================================================
# SIONNA + TENSORFLOW
# =====================================================

SIONNA_DISPONIBLE = False
SIONNA_ERROR = None

try:

    import tensorflow as tf
    import sionna

    from sionna.rt import (
        load_scene,
        PathSolver,
        Transmitter,
        Receiver,
        PlanarArray
    )

    SIONNA_DISPONIBLE = True

except Exception as e:

    SIONNA_ERROR = str(e)

    print("Error Sionna:")
    print(e)


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="Mastesto Sionna API",
    version="1.0"
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


# =====================================================
# MODELOS
# =====================================================

class Habitacion(BaseModel):

    id:str
    nombre:str

    x:float
    z:float

    ancho:float
    largo:float
    alto:float


class Objeto3D(BaseModel):

    id:str
    tipo:str

    x:float
    y:float
    z:float

    sx:float
    sy:float
    sz:float

    color:str


class Vivienda(BaseModel):

    version:str
    unidades:str

    materialPared:str

    frecuenciaMhz:float

    habitaciones:list[Habitacion]

    objetos:list[Objeto3D]


# =====================================================
# TEST
# =====================================================

@app.get("/")
def inicio():

    return {

        "ok":True,

        "mensaje":
        "Mastesto backend funcionando"

    }


@app.get("/health")
def health():

    return {

        "estado":"ok"

    }


@app.get("/sionna/status")
def estado_sionna():

    return {

        "ok":True,

        "sionna":
        SIONNA_DISPONIBLE,

        "error":
        SIONNA_ERROR

    }


# =====================================================
# DISTANCIA
# =====================================================

def distancia(
    x1,
    z1,
    x2,
    z2
):

    return math.sqrt(

        (x2-x1)**2+
        (z2-z1)**2

    )


# =====================================================
# POTENCIA
# =====================================================

def potencia_dbm(

    distancia_m,
    frecuencia_mhz

):

    if distancia_m<0.5:

        distancia_m=0.5

    frecuencia_hz=(
        frecuencia_mhz*
        1000000
    )

    perdida=(

        20*
        math.log10(
            distancia_m
        )

        +

        20*
        math.log10(
            frecuencia_hz
        )

        -

        147.55

    )

    potencia_tx=20

    potencia_rx=(
        potencia_tx-
        perdida
    )

    ruido=random.uniform(
        -3,
        3
    )

    return round(
        potencia_rx+ruido,
        2
    )


# =====================================================
# COBERTURA
# =====================================================

@app.post("/calcular")
def calcular(
    vivienda:Vivienda
):

    routers=[]

    for obj in vivienda.objetos:

        if obj.tipo=="router":

            routers.append(
                obj
            )

    if len(routers)==0:

        return{

            "ok":False,
            "mensaje":
            "No hay routers"

        }

    puntos=[]

    media=0
    total=0

    mejor=-999
    peor=999

    zonas_muertas=0

    for hab in vivienda.habitaciones:

        paso=0.7

        x_actual=hab.x

        while x_actual<=(
            hab.x+
            hab.ancho
        ):

            z_actual=hab.z

            while z_actual<=(
                hab.z+
                hab.largo
            ):

                mejor_punto=-999

                for r in routers:

                    d=distancia(

                        x_actual,
                        z_actual,

                        r.x,
                        r.z

                    )

                    p=potencia_dbm(
                        d,
                        vivienda.frecuenciaMhz
                    )

                    if vivienda.materialPared=="hormigon":

                        p-=12

                    elif vivienda.materialPared=="ladrillo":

                        p-=6

                    elif vivienda.materialPared=="pladur":

                        p-=3

                    mejor_punto=max(
                        mejor_punto,
                        p
                    )

                if mejor_punto<-75:

                    zonas_muertas+=1

                media+=mejor_punto

                total+=1

                mejor=max(
                    mejor,
                    mejor_punto
                )

                peor=min(
                    peor,
                    mejor_punto
                )

                puntos.append({

                    "x":
                    round(
                        x_actual,
                        2
                    ),

                    "z":
                    round(
                        z_actual,
                        2
                    ),

                    "potencia":
                    round(
                        mejor_punto,
                        2
                    )

                })

                z_actual+=paso

            x_actual+=paso

    media=round(
        media/total,
        2
    )

    porcentaje=round(

        zonas_muertas/
        total*
        100,

        2

    )

    return{

        "ok":True,

        "estadisticas":{

            "potenciaMediaDbm":
            media,

            "mejorDbm":
            mejor,

            "peorDbm":
            peor,

            "porcentajeZonasMuertas":
            porcentaje

        },

        "puntos":
        puntos

    }


# =====================================================
# OPTIMIZAR
# =====================================================

@app.post("/optimizar")
def optimizar(
    vivienda:Vivienda
):

    habitaciones=(
        vivienda.habitaciones
    )

    minx=min(
        h.x
        for h in habitaciones
    )

    maxx=max(
        h.x+h.ancho
        for h in habitaciones
    )

    minz=min(
        h.z
        for h in habitaciones
    )

    maxz=max(
        h.z+h.largo
        for h in habitaciones
    )

    mejorx=0
    mejorz=0

    mejorscore=-999999

    for x in range(
        int(minx),
        int(maxx)
    ):

        for z in range(
            int(minz),
            int(maxz)
        ):

            score=0

            for h in habitaciones:

                cx=(
                    h.x+
                    h.ancho/2
                )

                cz=(
                    h.z+
                    h.largo/2
                )

                d=distancia(
                    x,
                    z,
                    cx,
                    cz
                )

                score-=d

            if score>mejorscore:

                mejorscore=score

                mejorx=x
                mejorz=z

    return{

        "ok":True,

        "x":mejorx,
        "z":mejorz,

        "mensaje":
        "Posición óptima encontrada"

    }