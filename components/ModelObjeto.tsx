"use client";

import dynamic from "next/dynamic";

const Modelo3D = dynamic(
  () => import("./ModelObjetoCliente"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ModelObjeto({
  tipo,
}: {
  tipo: string;
}) {
  return <Modelo3D tipo={tipo} />;
}
