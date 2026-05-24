"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Line } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type Habitacion = {
  id: string;
  nombre: string;
  x: number;
  z: number;
  ancho: number;
  largo: number;
  alto: number;
};

type Objeto3D = {
  id: string;
  tipo: string;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: string;
  material?: string;
};

type PuntoHeatmap = {
  x: number;
  z: number;
  potenciaDbm: number;
  calidad: "excelente" | "buena" | "media" | "mala";
};

type RayoCobertura = {
  id: string;
  tipo: "directo" | "reflejado" | "debil";
  potenciaDbm: number;
  puntos: {
    x: number;
    y: number;
    z: number;
  }[];
};

type ResultadoCobertura = {
  ok: boolean;
  mensaje: string;
  modelo?: {
    frecuenciaMhz: number;
    potenciaTxDbm: number;
    materialPared?: any;
    materialesObjeto?: any[];
    tipo: string;
  };

  heatmapConMesh?: PuntoHeatmap[];

estadisticasMesh?: {
  potenciaMediaDbm: number;
  puntosAnalizados: number;
  zonasMuertas: number;
  porcentajeZonasMuertas: number;
  mejoraMediaDb: number;
};

coberturaConMesh?: {
  heatmap: PuntoHeatmap[];
  score: number;
};

resumenHabitacionesConMesh?: {
  habitacion: string;
  potenciaMediaDbm: number | null;
  calidad: string;
}[];

  repetidoresOptimos?: {
  id: string;
  tipo: string;
  x: number;
  y: number;
  z: number;
}[];

  optimosPorHabitacion?: {
  habitacion: string;
  habitacionId: string;
  x: number;
  y: number;
  z: number;
  score: number;
  potenciaMediaDbm: number;
  zonasMuertas: number;
  calidad: string;
  recomendacion: string;
}[];
  routerActual?: {
    x: number;
    y: number;
    z: number;
  };
  routerOptimo: {
    x: number;
    y: number;
    z: number;
  };
  estadisticas: {
    score: number;
    potenciaMediaDbm: number;
    puntosAnalizados: number;
    zonasMuertas: number;
    porcentajeZonasMuertas: number;
  };
  heatmap: PuntoHeatmap[];
  rayos: RayoCobertura[];
  resumenHabitaciones: {
    habitacion: string;
    potenciaMediaDbm: number | null;
    calidad: string;
  }[];
  recomendaciones: string[];
};

export default function CrearViviendaPage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([
    {
      id: "habitacion-1",
      nombre: "Salón",
      x: 0,
      z: 0,
      ancho: 8,
      largo: 6,
      alto: 2.6,
    },
  ]);

  const [modoCalculo, setModoCalculo] = useState<"rapido" | "sionna">("rapido");
  const [materialPared, setMaterialPared] = useState("ladrillo");
  const [frecuenciaMhz, setFrecuenciaMhz] = useState(5000);

  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState("habitacion-1");

  const [objetos, setObjetos] = useState<Objeto3D[]>([
    {
      id: "router-1",
      tipo: "router",
      x: 0,
      y: 1.2,
      z: 0,
      sx: 0.35,
      sy: 0.35,
      sz: 0.35,
      color: "#f97316",
    },
  ]);

  const [objetoSeleccionado, setObjetoSeleccionado] = useState("router-1");

  const [resultadoCobertura, setResultadoCobertura] =
    useState<ResultadoCobertura | null>(null);

  const [calculandoCobertura, setCalculandoCobertura] = useState(false);
  const [mostrarMesh, setMostrarMesh] = useState(true);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(true);
  const [mostrarRayos, setMostrarRayos] = useState(true);
  const [mostrarRouterOptimo, setMostrarRouterOptimo] = useState(true);

  const habitacionActual = habitaciones.find(
    (h) => h.id === habitacionSeleccionada
  );

  const objetoActual = objetos.find((o) => o.id === objetoSeleccionado);

  const crearHabitacion = () => {
    const nueva: Habitacion = {
      id: `habitacion-${Date.now()}`,
      nombre: `Habitación ${habitaciones.length + 1}`,
      x: habitaciones.length * 3,
      z: habitaciones.length * 2,
      ancho: 4,
      largo: 4,
      alto: 2.6,
    };

    setHabitaciones((prev) => [...prev, nueva]);
    setHabitacionSeleccionada(nueva.id);
  };

  const actualizarHabitacion = (
    campo: keyof Habitacion,
    valor: number | string
  ) => {
    setHabitaciones((prev) =>
      prev.map((h) =>
        h.id === habitacionSeleccionada ? { ...h, [campo]: valor } : h
      )
    );

    setResultadoCobertura(null);
  };

  const eliminarHabitacion = () => {
    if (habitaciones.length <= 1) {
      alert("Debe quedar al menos una habitación.");
      return;
    }

    const habitacionesRestantes = habitaciones.filter(
      (h) => h.id !== habitacionSeleccionada
    );

    setHabitaciones(habitacionesRestantes);
    setHabitacionSeleccionada(habitacionesRestantes[0].id);
    setResultadoCobertura(null);
  };

  const crearObjeto = (tipo: string) => {
    const base: Record<string, Partial<Objeto3D>> = {
      sofa: { sx: 1.8, sy: 0.6, sz: 0.8, color: "#7c2d12", material: "tejido" },
      mesa: { sx: 1.2, sy: 0.25, sz: 0.8, color: "#92400e", material: "madera" },
      silla: { sx: 0.5, sy: 0.8, sz: 0.5, color: "#57534e", material: "madera" },
      tv: { sx: 1.3, sy: 0.08, sz: 0.8, color: "#020617", material: "metal" },
      cama: { sx: 2, sy: 0.45, sz: 1.4, color: "#1e3a8a", material: "tejido" },
      router: { sx: 0.35, sy: 0.35, sz: 0.35, color: "#f97316" },
      armario: { sx: 1.2, sy: 2, sz: 0.5, color: "#44403c", material: "madera" },
    };

    const h = habitacionActual;
    const config = base[tipo] || {};

    const nuevo: Objeto3D = {
      id: `${tipo}-${Date.now()}`,
      tipo,
      x: h ? h.x : 0,
      y: tipo === "tv" ? 1.4 : tipo === "router" ? 1.2 : 0.4,
      z: h ? h.z : 0,
      sx: config.sx || 1,
      sy: config.sy || 1,
      sz: config.sz || 1,
      color: config.color || "#ffffff",
      material: config.material,
    };

    setObjetos((prev) => [...prev, nuevo]);
    setObjetoSeleccionado(nuevo.id);
    setResultadoCobertura(null);
  };

  const actualizarObjeto = (campo: keyof Objeto3D, valor: number | string) => {
    setObjetos((prev) =>
      prev.map((o) =>
        o.id === objetoSeleccionado ? { ...o, [campo]: valor } : o
      )
    );

    setResultadoCobertura(null);
  };

  const eliminarSeleccionado = () => {
    setObjetos((prev) => prev.filter((o) => o.id !== objetoSeleccionado));
    setObjetoSeleccionado("");
    setResultadoCobertura(null);
  };

  const crearDatosVivienda = () => {
    return {
      version: "mastesto-vivienda-3d-v3",
      unidades: "metros",
      fecha: new Date().toISOString(),
      materialPared,
      frecuenciaMhz,
      habitaciones,
      objetos,
    };
  };

  const exportarJSON = () => {
    const datos = crearDatosVivienda();
    const json = JSON.stringify(datos, null, 2);

    const archivo = new Blob([json], {
      type: "application/json",
    });

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "vivienda-mastesto.json";

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(enlace.href);

    console.log(json);
    alert("Vivienda exportada correctamente.");
  };

  const calcularCobertura = async () => {
    try {
      setCalculandoCobertura(true);

      const datos = crearDatosVivienda();

    if (!API_URL) {
  alert("Falta configurar NEXT_PUBLIC_API_URL en Vercel.");
  return;
}

const url = `${API_URL}/raytrace`;

const res = await fetch(url,{
 method:"POST",
 headers:{
   "Content-Type":"application/json"
 },
 body:JSON.stringify(datos)
});

     const resultado = await res.json();

console.log("URL usada:", url);
console.log("Status HTTP:", res.status);
console.log("Resultado cobertura:", resultado);

if (!res.ok || !resultado.ok) {
  alert(
    "Error calculando cobertura: " +
      (resultado?.mensaje || resultado?.error || res.status)
  );
  return;
}
      setResultadoCobertura(resultado);
      alert("Cobertura calculada correctamente.");
    } catch (error) {
      console.error("Error enviando datos a /api/cobertura:", error);
      alert("No se pudo conectar con la API de cobertura.");
    } finally {
      setCalculandoCobertura(false);
    }
  };

  const aplicarRouterOptimo = () => {
    if (!resultadoCobertura) return;

    setObjetos((prev) =>
      prev.map((obj) =>
        obj.tipo === "router"
          ? {
              ...obj,
              x: resultadoCobertura.routerOptimo.x,
              y: resultadoCobertura.routerOptimo.y,
              z: resultadoCobertura.routerOptimo.z,
            }
          : obj
      )
    );

    setResultadoCobertura(null);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <section className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-500 font-black italic mb-3">
            TFG Teleco · Editor 3D · WiFi Planning
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Creador de vivienda 3D
          </h1>

          <p className="text-zinc-500 mt-4 max-w-3xl text-sm leading-relaxed">
            Editor tipo juego para crear varias habitaciones, colocar objetos,
            calcular cobertura WiFi, visualizar rayos, estimar zonas muertas y
            recomendar la posición óptima del router.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-[2rem] p-5 h-fit">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-5">
              Habitaciones
            </h2>

            <button
              onClick={crearHabitacion}
              className="w-full py-4 rounded-xl bg-orange-600 text-black text-[10px] font-black uppercase hover:bg-white transition-all mb-4"
            >
              Añadir habitación
            </button>

            <select
              value={habitacionSeleccionada}
              onChange={(e) => setHabitacionSeleccionada(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none mb-5"
            >
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre}
                </option>
              ))}
            </select>

            {habitacionActual ? (
              <div className="space-y-4 mb-6">
                <input
                  value={habitacionActual.nombre}
                  onChange={(e) =>
                    actualizarHabitacion("nombre", e.target.value)
                  }
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
                />

                <Control
                  label="X habitación"
                  value={habitacionActual.x}
                  min={-20}
                  max={20}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("x", v)}
                />

                <Control
                  label="Z habitación"
                  value={habitacionActual.z}
                  min={-20}
                  max={20}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("z", v)}
                />

                <Control
                  label="Ancho"
                  value={habitacionActual.ancho}
                  min={2}
                  max={15}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("ancho", v)}
                />

                <Control
                  label="Largo"
                  value={habitacionActual.largo}
                  min={2}
                  max={15}
                  step={0.5}
                  onChange={(v) => actualizarHabitacion("largo", v)}
                />

                <Control
                  label="Alto"
                  value={habitacionActual.alto}
                  min={2.2}
                  max={4}
                  step={0.1}
                  onChange={(v) => actualizarHabitacion("alto", v)}
                />

                <button
                  onClick={eliminarHabitacion}
                  className="w-full py-3 rounded-xl bg-red-700 text-white text-[10px] font-black uppercase hover:bg-red-600 transition-all"
                >
                  Eliminar habitación
                </button>
              </div>
            ) : null}

            <div className="mb-6 border-t border-zinc-900 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">
                Material de paredes
              </h2>

              <select
                value={materialPared}
                onChange={(e) => {
                  setMaterialPared(e.target.value);
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value="pladur">Pladur / yeso</option>
                <option value="madera">Madera</option>
                <option value="ladrillo">Ladrillo</option>
                <option value="hormigon">Hormigón</option>
                <option value="cristal">Cristal</option>
                <option value="metal">Metal</option>
              </select>

              <p className="mt-3 text-[9px] text-zinc-500 uppercase leading-relaxed">
                Este material afecta a la atenuación, permitividad y reflexión
                de los rayos.
              </p>
            </div>

            <div className="mb-6 border-t border-zinc-900 pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">
                Frecuencia WiFi
              </h2>

              <select
                value={frecuenciaMhz}
                onChange={(e) => {
                  setFrecuenciaMhz(Number(e.target.value));
                  setResultadoCobertura(null);
                }}
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value={2400}>2.4 GHz</option>
                <option value={5000}>5 GHz</option>
                <option value={6000}>6 GHz WiFi 6E / WiFi 7</option>
              </select>

              <p className="mt-3 text-[9px] text-zinc-500 uppercase leading-relaxed">
                2.4 GHz mayor cobertura · 5 GHz equilibrio · 6 GHz más velocidad
                y menor alcance.
              </p>
            </div>

            <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-5">
              Añadir objetos
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Boton texto="Sofá" onClick={() => crearObjeto("sofa")} />
              <Boton texto="Mesa" onClick={() => crearObjeto("mesa")} />
              <Boton texto="Silla" onClick={() => crearObjeto("silla")} />
              <Boton texto="TV" onClick={() => crearObjeto("tv")} />
              <Boton texto="Cama" onClick={() => crearObjeto("cama")} />
              <Boton texto="Router" onClick={() => crearObjeto("router")} />
              <Boton texto="Armario" onClick={() => crearObjeto("armario")} />
            </div>

            <button
              onClick={exportarJSON}
              className="mt-5 w-full py-4 rounded-xl bg-orange-600 text-black text-[10px] font-black uppercase hover:bg-white transition-all"
            >
              Exportar JSON
            </button>
            <select
 value={modoCalculo}
 onChange={(e)=>
   setModoCalculo(
     e.target.value as "rapido"|"sionna"
   )
 }
 className="mt-5 w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
>

<option value="rapido">
Modelo rápido actual
</option>

<option value="sionna">
Verificar con Sionna
</option>

</select>
            <button
              onClick={calcularCobertura}
              disabled={calculandoCobertura}
              className="mt-3 w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase hover:opacity-80 transition-all disabled:opacity-40"
            >
              {calculandoCobertura ? "Calculando..." : "Calcular cobertura"}
            </button>

            {resultadoCobertura && (
              <button
                onClick={aplicarRouterOptimo}
                className="mt-3 w-full py-4 rounded-xl bg-green-500 text-black text-[10px] font-black uppercase hover:bg-white transition-all"
              >
                Mover router al punto óptimo
              </button>
            )}

            {resultadoCobertura ? (
              <div className="mt-5 bg-black border border-zinc-900 rounded-xl p-4">
                <p className="text-[9px] uppercase text-zinc-500 font-black mb-2">
                  Modelo
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  {resultadoCobertura.modelo?.tipo ??
                    "Modelo de cobertura aproximado"}
                </p>
              </div>
            ) : null}
          </aside>

          <section className="lg:col-span-6 bg-white border border-zinc-300 rounded-[2.5rem] overflow-hidden min-h-[680px]">
            <Canvas
              camera={{ position: [10, 8, 10], fov: 48 }}
              style={{ background: "#ffffff" }}
            >
              <ambientLight intensity={1.8} />
              <directionalLight position={[10, 12, 10]} intensity={2.2} />

              <Grid
                args={[60, 60]}
                cellColor="#d4d4d4"
                sectionColor="#737373"
                cellSize={1}
                cellThickness={1}
                sectionSize={5}
                sectionThickness={2}
                infiniteGrid={false}
              />

              {habitaciones.map((h) => (
                <GrupoHabitacion
                  key={h.id}
                  habitacion={h}
                  seleccionada={h.id === habitacionSeleccionada}
                  onClick={() => setHabitacionSeleccionada(h.id)}
                />
              ))}

              {objetos.map((obj) => (
                <ObjetoMovible
                  key={obj.id}
                  obj={obj}
                  seleccionado={obj.id === objetoSeleccionado}
                  onSeleccionar={() => setObjetoSeleccionado(obj.id)}
                  onMover={(x, z) => {
                    setObjetos((prev) =>
                      prev.map((o) =>
                        o.id === obj.id
                          ? {
                              ...o,
                              x,
                              z,
                            }
                          : o
                      )
                    );

                    setResultadoCobertura(null);
                  }}
                />
              ))}

              {resultadoCobertura && (
                <CapaCobertura
                  resultado={resultadoCobertura}
                  mostrarHeatmap={mostrarHeatmap}
                  mostrarRayos={mostrarRayos}
                  mostrarRouterOptimo={mostrarRouterOptimo}
                />
              )}

              <axesHelper args={[4]} />

              <OrbitControls
                makeDefault
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                target={[0, 0.8, 0]}
                maxPolarAngle={Math.PI / 2.05}
              />
            </Canvas>
          </section>

          <aside className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-[2rem] p-5 h-fit">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-5">
              Editor de objeto
            </h2>

            {!objetoActual ? (
              <p className="text-zinc-500 text-xs uppercase">
                Selecciona un objeto del plano.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-black uppercase">
                  {objetoActual.tipo}
                </p>

                <Control
                  label="X"
                  value={objetoActual.x}
                  min={-20}
                  max={20}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("x", v)}
                />

                <Control
                  label="Z"
                  value={objetoActual.z}
                  min={-20}
                  max={20}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("z", v)}
                />

                <Control
                  label="Altura"
                  value={objetoActual.y}
                  min={0}
                  max={4}
                  step={0.1}
                  onChange={(v) => actualizarObjeto("y", v)}
                />

                <div className="border-t border-zinc-900 pt-4 space-y-4">
                  <Control
                    label="Escala X"
                    value={objetoActual.sx}
                    min={0.1}
                    max={8}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sx", v)}
                  />

                  <Control
                    label="Escala Y"
                    value={objetoActual.sy}
                    min={0.1}
                    max={4}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sy", v)}
                  />

                  <Control
                    label="Escala Z"
                    value={objetoActual.sz}
                    min={0.1}
                    max={8}
                    step={0.1}
                    onChange={(v) => actualizarObjeto("sz", v)}
                  />
                </div>

                <button
                  onClick={eliminarSeleccionado}
                  className="w-full py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-500 transition-all"
                >
                  Eliminar objeto
                </button>
              </div>
            )}

            {resultadoCobertura && (
  <div className="mt-6 border-t border-zinc-900 pt-5 space-y-4">
    <h2 className="text-xs font-black uppercase tracking-widest text-orange-500">
      Resultado WiFi
    </h2>

    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => setMostrarHeatmap((v) => !v)}
        className="py-3 rounded-xl bg-black border border-zinc-800 text-[9px] font-black uppercase text-zinc-300 hover:border-orange-500"
      >
        Heatmap {mostrarHeatmap ? "ON" : "OFF"}
      </button>

      <button
        onClick={() => setMostrarRayos((v) => !v)}
        className="py-3 rounded-xl bg-black border border-zinc-800 text-[9px] font-black uppercase text-zinc-300 hover:border-orange-500"
      >
        Rayos {mostrarRayos ? "ON" : "OFF"}
      </button>

      <button
        onClick={() => setMostrarRouterOptimo((v) => !v)}
        className="col-span-2 py-3 rounded-xl bg-black border border-zinc-800 text-[9px] font-black uppercase text-zinc-300 hover:border-orange-500"
      >
        Router óptimo {mostrarRouterOptimo ? "ON" : "OFF"}
      </button>
    </div>

    <div className="bg-black border border-zinc-900 rounded-xl p-4 space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Potencia media
      </p>
      <p className="text-2xl font-black text-orange-500">
        {resultadoCobertura.estadisticas.potenciaMediaDbm} dBm
      </p>
    </div>

    <div className="bg-black border border-zinc-900 rounded-xl p-4 space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Zonas muertas
      </p>
      <p className="text-xl font-black text-white">
        {resultadoCobertura.estadisticas.porcentajeZonasMuertas}%
      </p>
    </div>

    {resultadoCobertura.estadisticasMesh && (
  <div className="bg-black border border-sky-900 rounded-xl p-4 space-y-2">
    <p className="text-[9px] uppercase text-zinc-500 font-black">
      Cobertura con Mesh
    </p>

    <p className="text-xl font-black text-sky-400">
      {resultadoCobertura.estadisticasMesh.potenciaMediaDbm} dBm
    </p>

    <p className="text-[9px] text-zinc-500 uppercase leading-relaxed">
      Mejora media: {resultadoCobertura.estadisticasMesh.mejoraMediaDb} dB ·
      Zonas muertas:{" "}
      {resultadoCobertura.estadisticasMesh.porcentajeZonasMuertas}%
    </p>
  </div>
)}

    <div className="bg-black border border-zinc-900 rounded-xl p-4 space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Router recomendado
      </p>
      <p className="text-xs text-zinc-300 leading-relaxed">
        X: {resultadoCobertura.routerOptimo.x.toFixed(2)} · Z:{" "}
        {resultadoCobertura.routerOptimo.z.toFixed(2)} · Altura:{" "}
        {resultadoCobertura.routerOptimo.y.toFixed(2)} m
      </p>
    </div>

    {resultadoCobertura.optimosPorHabitacion && (
      <div className="space-y-2">
        <p className="text-[9px] uppercase text-zinc-500 font-black">
          Mejor posición por habitación
        </p>

        {resultadoCobertura.optimosPorHabitacion.map((o) => (
          <div
            key={o.habitacionId}
            className="bg-black border border-zinc-900 rounded-xl p-3"
          >
            <p className="text-[10px] font-black uppercase text-white">
              {o.habitacion}
            </p>

            <p className="text-[9px] text-zinc-500 uppercase leading-relaxed">
              X: {o.x.toFixed(2)} · Z: {o.z.toFixed(2)} · Media:{" "}
              {o.potenciaMediaDbm} dBm · Zonas muertas: {o.zonasMuertas}
            </p>
          </div>
        ))}
      </div>
    )}

    <div className="space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Habitaciones
      </p>

      {resultadoCobertura.resumenHabitaciones.map((h) => (
        <div
          key={h.habitacion}
          className="bg-black border border-zinc-900 rounded-xl p-3"
        >
          <p className="text-[10px] font-black uppercase text-white">
            {h.habitacion}
          </p>
          <p className="text-[9px] text-zinc-500 uppercase">
            {h.potenciaMediaDbm ?? "Sin datos"} dBm · {h.calidad}
          </p>
        </div>
      ))}
    </div>

    {resultadoCobertura.repetidoresOptimos &&
  resultadoCobertura.repetidoresOptimos.length > 0 && (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Repetidores / Mesh recomendados
      </p>

      {resultadoCobertura.repetidoresOptimos.map((rep) => (
        <div
          key={rep.id}
          className="bg-black border border-sky-900 rounded-xl p-3"
        >
          <p className="text-[10px] font-black uppercase text-sky-400">
            {rep.tipo}
          </p>

          <p className="text-[9px] text-zinc-500 uppercase leading-relaxed">
            X: {rep.x.toFixed(2)} · Z: {rep.z.toFixed(2)} · Altura:{" "}
            {rep.y.toFixed(2)} m
          </p>
        </div>
      ))}
    </div>
)}

    <div className="space-y-2">
      <p className="text-[9px] uppercase text-zinc-500 font-black">
        Recomendaciones
      </p>

      {resultadoCobertura.recomendaciones.map((r, i) => (
        <p
          key={i}
          className="text-[10px] text-zinc-400 leading-relaxed bg-black border border-zinc-900 rounded-xl p-3"
        >
          {r}
        </p>
      ))}
    </div>
  </div>
)}

            <div className="mt-6 border-t border-zinc-900 pt-5">
              <p className="text-[9px] text-zinc-500 uppercase font-bold leading-relaxed">
                Controles: rueda para zoom, click derecho o dos dedos para mover
                cámara, click izquierdo para rotar. Selecciona habitaciones u
                objetos y edítalos desde los paneles.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function GrupoHabitacion({
  habitacion,
  seleccionada,
  onClick,
}: {
  habitacion: Habitacion;
  seleccionada: boolean;
  onClick: () => void;
}) {
  const { x, z, ancho, largo, alto } = habitacion;
  const grosor = 0.12;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh position={[x, -0.02, z]} scale={[ancho, 0.04, largo]}>
        <boxGeometry />
        <meshStandardMaterial color={seleccionada ? "#fff7ed" : "#f5f5f5"} />
      </mesh>

      <mesh
        position={[x, alto / 2, z - largo / 2]}
        scale={[ancho, alto, grosor]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x, alto / 2, z + largo / 2]}
        scale={[ancho, alto, grosor]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x - ancho / 2, alto / 2, z]}
        scale={[grosor, alto, largo]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh
        position={[x + ancho / 2, alto / 2, z]}
        scale={[grosor, alto, largo]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={seleccionada ? 0.75 : 0.45}
        />
      </mesh>

      <mesh position={[x, alto, z]} scale={[ancho, 0.04, largo]}>
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}




function ObjetoMovible({
  obj,
  seleccionado,
  onSeleccionar,
  onMover,
}: {
  obj: Objeto3D;
  seleccionado: boolean;
  onSeleccionar: () => void;
  onMover: (x: number, z: number) => void;
}) {
  const { camera, gl } = useThree();

  const planoSuelo = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const puntoInterseccion = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [arrastrando, setArrastrando] = useState(false);

  const moverEnSuelo = (event: any) => {
    if (!arrastrando) return;
    if (obj.tipo !== "router") return;

    const rect = gl.domElement.getBoundingClientRect();

    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    const hayInterseccion = raycaster.current.ray.intersectPlane(
      planoSuelo.current,
      puntoInterseccion.current
    );

    if (!hayInterseccion) return;

    onMover(
      Number(puntoInterseccion.current.x.toFixed(2)),
      Number(puntoInterseccion.current.z.toFixed(2))
    );
  };

  return (
    <group>
      <mesh
        position={[obj.x, obj.y, obj.z]}
        scale={[obj.sx, obj.sy, obj.sz]}
        onClick={(e) => {
          e.stopPropagation();
          onSeleccionar();
        }}
        onPointerDown={(e: any) => {
          e.stopPropagation();
          onSeleccionar();

          if (obj.tipo === "router") {
            setArrastrando(true);
            gl.domElement.style.cursor = "grabbing";

            if (e.target?.setPointerCapture) {
              e.target.setPointerCapture(e.pointerId);
            }
          }
        }}
        onPointerMove={(e: any) => {
          e.stopPropagation();
          moverEnSuelo(e);
        }}
        onPointerUp={(e: any) => {
          e.stopPropagation();
          setArrastrando(false);
          gl.domElement.style.cursor = "default";

          if (e.target?.releasePointerCapture) {
            e.target.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerLeave={() => {
          if (!arrastrando) {
            gl.domElement.style.cursor = "default";
          }
        }}
        onPointerOver={() => {
          if (obj.tipo === "router") {
            gl.domElement.style.cursor = "grab";
          }
        }}
        onPointerOut={() => {
          if (!arrastrando) {
            gl.domElement.style.cursor = "default";
          }
        }}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={obj.color}
          emissive={obj.tipo === "router" ? "#7c2d12" : "#000000"}
          emissiveIntensity={obj.tipo === "router" ? 0.45 : 0}
        />
      </mesh>

      {obj.tipo === "router" && (
        <mesh
          position={[obj.x, 0.06, obj.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.45, 0.7, 32]} />
          <meshBasicMaterial
            color={seleccionado ? "#f97316" : "#fb923c"}
            transparent
            opacity={seleccionado ? 0.55 : 0.25}
          />
        </mesh>
      )}
    </group>
  );
}

function CapaCobertura({
  resultado,
  mostrarHeatmap,
  mostrarRayos,
  mostrarRouterOptimo,
}: {
  resultado: ResultadoCobertura;
  mostrarHeatmap: boolean;
  mostrarRayos: boolean;
  mostrarRouterOptimo: boolean;
}) {
  const heatmapBase = resultado.heatmap ?? [];
  const heatmapMesh =
    resultado.heatmapConMesh ?? resultado.coberturaConMesh?.heatmap ?? [];

  return (
    <group>


      {(resultado.heatmapConMesh ?? resultado.coberturaConMesh?.heatmap ?? []).map(
  (p, index) => (
    <mesh
      key={`heatmap-mesh-${index}`}
      position={[p.x, 0.085, p.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[0.32, 32]} />
      <meshBasicMaterial
        color={colorHeatmapMesh(p.potenciaDbm)}
        transparent
        opacity={0.65}
      />
    </mesh>
  )
)}
      {mostrarHeatmap &&
        heatmapBase.map((p, i) => (
          <mesh
            key={`heatmap-${i}`}
            position={[p.x, 0.05, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.22, 24]} />
            <meshBasicMaterial
              color={colorHeatmap(p.potenciaDbm)}
              transparent
              opacity={0.55}
            />
          </mesh>
        ))}

      {mostrarHeatmap &&
        heatmapMesh.map((p, i) => (
          <mesh
            key={`heatmap-mesh-${i}`}
            position={[p.x, 0.08, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.24, 0.34, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        ))}

      {mostrarRayos &&
        resultado.rayos?.map((rayo) => {
          const puntos = rayo.puntos.map(
            (p) => [p.x, p.y, p.z] as [number, number, number]
          );

          if (puntos.length < 2) return null;

          return (
            <Line
              key={rayo.id}
              points={puntos}
              color={colorRayo(rayo.tipo)}
              lineWidth={rayo.tipo === "directo" ? 3 : 1.5}
            />
          );
        })}

      {mostrarRouterOptimo && resultado.routerOptimo && (
        <group
          position={[
            resultado.routerOptimo.x,
            resultado.routerOptimo.y,
            resultado.routerOptimo.z,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#14532d"
              emissiveIntensity={0.8}
            />
          </mesh>

          <mesh
            position={[0, -resultado.routerOptimo.y + 0.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.35, 0.55, 32]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {resultado.repetidoresOptimos?.map((rep) => (
        <group key={rep.id} position={[rep.x, rep.y, rep.z]}>
          <mesh>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#075985"
              emissiveIntensity={0.7}
            />
          </mesh>

          <mesh
            position={[0, -rep.y + 0.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.25, 0.42, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function colorHeatmap(potenciaDbm: number) {
  if (potenciaDbm >= -50) return "#22c55e";
  if (potenciaDbm >= -65) return "#a3e635";
  if (potenciaDbm >= -75) return "#f97316";
  return "#ef4444";
}

function colorHeatmapMesh(potenciaDbm: number) {
  if (potenciaDbm >= -50) return "#7dd3fc";
  if (potenciaDbm >= -65) return "#38bdf8";
  if (potenciaDbm >= -75) return "#0284c7";

  return "#0c4a6e";
}

function colorRayo(tipo: RayoCobertura["tipo"]) {
  if (tipo === "directo") return "#22c55e";
  if (tipo === "reflejado") return "#f97316";
  return "#ef4444";
}

function Boton({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-3 rounded-xl bg-black border border-zinc-800 text-[9px] font-black uppercase text-zinc-300 hover:text-white hover:border-orange-500 transition-all"
    >
      {texto}
    </button>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[8px] uppercase text-zinc-500 font-black">
          {label}
        </label>

        <span className="text-[8px] text-orange-500 font-mono">
          {value.toFixed(1)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-600"
      />
    </div>
  );
}
