"use client";

import { useState } from "react";

export default function TelecoPage() {
  const [ancho, setAncho] = useState(8);
  const [largo, setLargo] = useState(10);
  const [frecuencia, setFrecuencia] = useState(2.4);
  const [material, setMaterial] = useState("ladrillo");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const optimizar = async () => {
    setCargando(true);

    const url =
      `http://127.0.0.1:8000/optimizar?` +
      `ancho=${ancho}&` +
      `largo=${largo}&` +
      `frecuencia_ghz=${frecuencia}&` +
      `material=${material}`;

    const res = await fetch(url);
    const data = await res.json();

    setResultado(data);
    setCargando(false);
  };

  const colorPotencia = (v: number) => {
    if (v > -55) return "rgb(34,197,94)";
    if (v > -67) return "rgb(234,179,8)";
    if (v > -78) return "rgb(249,115,22)";
    return "rgb(239,68,68)";
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-500 font-black italic mb-3">
            TFG Teleco · +TESTO
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Optimización automática de cobertura WiFi
          </h1>

          <p className="text-zinc-500 mt-4 max-w-3xl text-sm leading-relaxed">
            Módulo experimental para estimar automáticamente la mejor ubicación
            del router dentro de una vivienda, maximizando la potencia media
            recibida y reduciendo las zonas débiles de cobertura.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 h-fit">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-orange-500">
              Datos de la vivienda
            </h2>

            <div className="space-y-5">
              <CampoNumero
                label="Ancho del piso"
                value={ancho}
                setValue={setAncho}
                unidad="m"
              />

              <CampoNumero
                label="Largo del piso"
                value={largo}
                setValue={setLargo}
                unidad="m"
              />

              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest block mb-2">
                  Frecuencia WiFi
                </label>

                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none"
                >
                  <option value={2.4}>2.4 GHz</option>
                  <option value={5}>5 GHz</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest block mb-2">
                  Material principal
                </label>

                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none"
                >
                  <option value="pladur">Pladur</option>
                  <option value="ladrillo">Ladrillo</option>
                  <option value="hormigon">Hormigón</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              <button
                onClick={optimizar}
                disabled={cargando}
                className="w-full mt-6 py-4 rounded-xl bg-orange-600 text-black font-black uppercase text-[10px] hover:bg-white transition-all disabled:opacity-40"
              >
                {cargando ? "Calculando..." : "Optimizar cobertura"}
              </button>
            </div>
          </aside>

          <section className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 md:p-8">
            {!resultado ? (
              <div className="min-h-[520px] flex items-center justify-center text-center">
                <div>
                  <p className="text-5xl mb-6">📡</p>
                  <h2 className="text-2xl font-black uppercase italic mb-3">
                    Esperando análisis automático
                  </h2>
                  <p className="text-zinc-500 text-sm max-w-md">
                    Introduce las dimensiones de la vivienda y pulsa optimizar.
                    El sistema evaluará varias posiciones candidatas del router
                    y seleccionará la mejor.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black uppercase italic">
                      Resultado de optimización
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1">
                      Mapa de potencia recibida estimada en dBm
                    </p>
                  </div>

                  <div className="bg-black/60 border border-zinc-900 rounded-2xl p-4">
                    <p className="text-[9px] text-zinc-500 uppercase">
                      Mejor posición router
                    </p>
                    <p className="text-sm font-mono text-orange-500">
                      X: {resultado.mejor_router.x} m · Y:{" "}
                      {resultado.mejor_router.y} m
                    </p>
                  </div>
                </div>

                <div
                  className="relative border border-zinc-800 bg-black rounded-2xl overflow-hidden"
                  style={{ aspectRatio: `${resultado.ancho}/${resultado.largo}` }}
                >
                  <div
                    className="grid w-full h-full"
                    style={{
                      gridTemplateColumns: `repeat(${
                        resultado.heatmap[0]?.length || 1
                      }, 1fr)`,
                    }}
                  >
                    {resultado.heatmap.flat().map((v: number, i: number) => (
                      <div
                        key={i}
                        title={`${v} dBm`}
                        style={{
                          backgroundColor: colorPotencia(v),
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>

                  <div
                    className="absolute w-6 h-6 rounded-full bg-white border-4 border-orange-500 shadow-2xl"
                    style={{
                      left: `${
                        (resultado.mejor_router.x / resultado.ancho) * 100
                      }%`,
                      top: `${
                        (resultado.mejor_router.y / resultado.largo) * 100
                      }%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Metrica
                    titulo="Cobertura media"
                    valor={`${resultado.metricas.media} dBm`}
                  />
                  <Metrica
                    titulo="Peor punto"
                    valor={`${resultado.metricas.minimo} dBm`}
                  />
                  <Metrica
                    titulo="Zona débil"
                    valor={`${resultado.metricas.zona_debil}%`}
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-3 mt-6">
                  <Leyenda color="bg-green-500" texto="Excelente" valor=">-55 dBm" />
                  <Leyenda color="bg-yellow-500" texto="Buena" valor="-55 a -67" />
                  <Leyenda color="bg-orange-500" texto="Media" valor="-67 a -78" />
                  <Leyenda color="bg-red-500" texto="Débil" valor="<-78 dBm" />
                </div>

                <div className="mt-8 bg-black/60 border border-zinc-900 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase text-orange-500 mb-2">
                    Recomendación automática
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {resultado.recomendacion}
                  </p>
                </div>

                <div className="mt-6 bg-black/60 border border-zinc-900 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase text-orange-500 mb-2">
                    Justificación TFG
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    El sistema evalúa diferentes ubicaciones candidatas del punto
                    de acceso y selecciona automáticamente la que maximiza la
                    cobertura media y minimiza las zonas con baja potencia
                    recibida. En una fase posterior, este modelo aproximado puede
                    validarse mediante Sionna RT usando ray tracing y mapas de
                    cobertura radioeléctrica.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function CampoNumero({
  label,
  value,
  setValue,
  unidad,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  unidad: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest block mb-2">
        {label}
      </label>

      <div className="flex gap-3">
        <input
          type="number"
          value={value}
          min={1}
          step={0.5}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none"
        />

        <div className="w-16 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-xs font-black">
          {unidad}
        </div>
      </div>
    </div>
  );
}

function Metrica({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-black/60 border border-zinc-900 rounded-2xl p-5">
      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
        {titulo}
      </p>
      <p className="text-2xl font-black text-white mt-2">{valor}</p>
    </div>
  );
}

function Leyenda({
  color,
  texto,
  valor,
}: {
  color: string;
  texto: string;
  valor: string;
}) {
  return (
    <div className="bg-black/50 border border-zinc-900 rounded-xl p-3">
      <div className={`w-full h-2 rounded-full ${color} mb-3`} />
      <p className="text-[10px] uppercase font-black">{texto}</p>
      <p className="text-[9px] text-zinc-500 font-mono mt-1">{valor}</p>
    </div>
  );
}
