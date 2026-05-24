"use client";

import { Clone, useGLTF } from "@react-three/drei";

export default function ModelObjeto({ tipo }: { tipo: string }) {
  const rutas: Record<string,string>={

router:"/modelos/wifi.glb",
receptor:"/modelos/wifi.glb",

cama:"/modelos/cama.glb",
sofa:"/modelos/sofa.glb",
tv:"/modelos/tv.glb",
armario:"/modelos/armario.glb",
mesa:"/modelos/mesa.glb",
silla:"/modelos/silla.glb"

}

  const ruta = rutas[tipo];

  if (!ruta) return null;

  const gltf = useGLTF(ruta);

  return <Clone object={gltf.scene} scale={0.8} />;
}
