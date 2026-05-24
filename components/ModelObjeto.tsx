"use client";

import { Clone, useGLTF } from "@react-three/drei";

export default function ModelObjeto({ tipo }: { tipo: string }) {
<<<<<<< HEAD

  const rutas: Record<string,string> = {
    router:"/modelos/wifi.glb",
    receptor:"/modelos/wifi.glb",
  };
=======
  const rutas: Record<string,string>={

router:"/modelos/wifi.glb",
receptor:"/modelos/wifi.glb",

}
>>>>>>> 9e785fec3a8a43a0a2e8cd65160049c57fe5bfd9

  const ruta = rutas[tipo];

  if(!ruta) return null;

  const gltf = useGLTF(ruta);

<<<<<<< HEAD
  return (
    <Clone
      object={gltf.scene}
      scale={0.8}
    />
  );
}
=======
  return <Clone object={gltf.scene} scale={0.8} />;
}
>>>>>>> 9e785fec3a8a43a0a2e8cd65160049c57fe5bfd9
