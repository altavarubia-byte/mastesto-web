from sionna.rt import *
import matplotlib.pyplot as plt
import numpy as np

scene = load_scene()

scene.frequency = 2.45e9

scene.tx_array = PlanarArray(
    num_rows=1,
    num_cols=1,
    vertical_spacing=0.5,
    horizontal_spacing=0.5,
    pattern="iso",
    polarization="V"
)

scene.rx_array = PlanarArray(
    num_rows=1,
    num_cols=1,
    vertical_spacing=0.5,
    horizontal_spacing=0.5,
    pattern="iso",
    polarization="V"
)

tx = Transmitter(
    name="router",
    position=[2,2,1.5]
)

scene.add(tx)

potencias=[]

X=[]
Y=[]

for x in np.arange(0,10,0.25):

    for y in np.arange(0,8,0.25):

        rx=Receiver(
            name=f"rx{x}_{y}",
            position=[x,y,1.2]
        )

        scene.add(rx)

solver=PathSolver()

paths=solver(
    scene,
    max_depth=4,
    los=True,
    specular_reflection=True,
    diffraction=True,
    synthetic_array=True
)

a,tau=paths.cir()

pot=np.abs(a.numpy()).mean(axis=-1)

plt.imshow(
    pot.reshape(40,32),
    origin="lower"
)

plt.colorbar()

plt.savefig(
    "cobertura.png"
)

plt.show()
