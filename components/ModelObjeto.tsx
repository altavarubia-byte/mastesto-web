"use client";

import { Clone, useGLTF } from "@react-three/drei";

export default function ModelObjeto({ tipo }: { tipo: string }) {
  const rutas: Record<string,string>={

router:"/modelos/wifi.glb",
receptor:"/modelos/wifi.glb",

}

  const ruta = rutas[tipo];

  if (!ruta) return null;

  const gltf = useGLTF(ruta);

  return <Clone object={gltf.scene} scale={0.8} />;
}
