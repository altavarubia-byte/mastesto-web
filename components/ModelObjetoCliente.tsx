"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";

export default function ModelObjetoCliente({
  tipo,
}:{
  tipo:string
}){

const rutas:Record<string,string>={

router:"/modelos/wifi.glb",
receptor:"/modelos/wifi.glb",

cama:"/modelos/cama.glb",
sofa:"/modelos/sofa.glb",
tv:"/modelos/tv.glb",
armario:"/modelos/armario.glb",
mesa:"/modelos/mesa.glb",
silla:"/modelos/silla.glb"

};

const ruta=rutas[tipo];

if(!ruta) return null;

const gltf=useGLTF(ruta);

const escena=useMemo(
()=>gltf.scene.clone(),
[gltf.scene]
);

return(

<group scale={0.8}>

<Clone object={escena}/>

</group>

);

}

useGLTF.preload("/modelos/wifi.glb");
