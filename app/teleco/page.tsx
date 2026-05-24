"use client";

import { useMemo, useRef, useState } from "react";

export default function TelecoPage() {
  const [material, setMaterial] = useState("ladrillo");
  const [ancho, setAncho] = useState(8);
  const [largo, setLargo] = useState(10);
  const [frecuencia, setFrecuencia] = useState(2.4);

  const [routerX, setRouterX] = useState(2);
  const [routerY, setRouterY] = useState(2);

  const [arrastrando, setArrastrando] = useState(false);
  const [calculandoOptimo, setCalculandoOptimo] = useState(false);
  const [mensaje, setMensaje] = useState(
    "Mueve el router sobre el plano para ver el mapa en tiempo real."
  );

  const planoRef = useRef<HTMLDivElement | null>(null);

  const heatmap = useMemo(() => {
    return calcularHeatmapLocal(
      ancho,
      largo,
      routerX,
      routerY,
      frecuencia,
      material,
      42
    );
  }, [ancho, largo, routerX, routerY, frecuencia, material]);

  const metricas = useMemo(() => calcularMetricas(heatmap), [heatmap]);

  const moverRouter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastrando || !planoRef.current) return;

    const rect = planoRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const nuevoX = (xPx / rect.width) * ancho;
    const nuevoY = (yPx / rect.height) * largo;

    setRouterX(Math.max(0, Math.min(ancho, nuevoX)));
    setRouterY(Math.max(0, Math.min(largo, nuevoY)));
  };

  const calcularOptimo = async () => {
    setCalculandoOptimo(true);
    setMensaje("Calculando ubicación óptima del router...");

    try {
      const url =
        `/api/teleco?` +
        `ancho=${ancho}&` +
        `largo=${largo}&` +
        `router_x=${routerX}&` +
        `router_y=${routerY}&` +
        `frecuencia_ghz=${frecuencia}&` +
        `material=${material}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Error en API Teleco");
      }

      const data = await res.json();

      const destinoX = data.router_optimo.x;
      const destinoY = data.router_optimo.y;

      animarRouter(destinoX, destinoY);

      setMensaje(
        `Óptimo detectado: X=${destinoX} m · Y=${destinoY} m. ` +
          `Mejora estimada: ${data.mejora.media_db} dB de cobertura media ` +
          `y ${data.mejora.zona_debil_porcentaje}% menos zona débil.`
      );
    } catch {
      setMensaje(
        "Error conectando con la API integrada. Revisa app/api/teleco/route.ts."
      );
    }

    setCalculandoOptimo(false);
  };

  const animarRouter = (destinoX: number, destinoY: number) => {
    const inicioX = routerX;
    const inicioY = routerY;

    const pasos = 45;
    let paso = 0;

    const intervalo = setInterval(() => {
      paso++;

      const t = paso / pasos;
      const suavizado = 1 - Math.pow(1 - t, 3);

      const nx = inicioX + (destinoX - inicioX) * suavizado;
      const ny = inicioY + (destinoY - inicioY) * suavizado;

      setRouterX(nx);
      setRouterY(ny);

      if (paso >= pasos) {
        clearInterval(intervalo);
        setRouterX(destinoX);
        setRouterY(destinoY);
      }
    }, 16);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <section className="max-w-7xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-500 font-black italic mb-3">
            TFG TELECO · +TESTO
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Optimización inteligente de cobertura WiFi
          </h1>

          <p className="text-zinc-500 mt-4 max-w-3xl text-sm leading-relaxed">
            Sistema interactivo para analizar la cobertura inalámbrica de una
            vivienda. El usuario puede mover el router en tiempo real y el
            sistema calcula automáticamente la posición óptima.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 h-fit">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-orange-500">
              Parámetros de simulación
            </h2>

            <div className="space-y-6">
              <Control
                label="Ancho vivienda"
                value={ancho}
                min={4}
                max={15}
                step={0.5}
                unit="m"
                onChange={setAncho}
              />

              <Control
                label="Largo vivienda"
                value={largo}
                min={4}
                max={18}
                step={0.5}
                unit="m"
                onChange={setLargo}
              />

              <Control
                label="Frecuencia WiFi"
                value={frecuencia}
                min={2.4}
                max={6}
                step={0.1}
                unit="GHz"
                onChange={setFrecuencia}
              />

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
            </div>

            <button
              onClick={calcularOptimo}
              disabled={calculandoOptimo}
              className="mt-8 w-full py-4 rounded-xl bg-orange-600 hover:bg-white hover:text-black text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
            >
              {calculandoOptimo
                ? "Calculando..."
                : "Calcular posición óptima"}
            </button>

            <div className="mt-6 border border-zinc-900 bg-black/50 rounded-2xl p-4">
              <p className="text-[9px] text-zinc-500 uppercase font-black mb-2">
                Estado del sistema
              </p>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {mensaje}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Metrica titulo="Media" valor={`${metricas.media} dBm`} />
              <Metrica titulo="Mínima" valor={`${metricas.minimo} dBm`} />
              <Metrica titulo="Débil" valor={`${metricas.zonasDebiles}%`} />
            </div>
          </aside>

          <section className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-black uppercase italic">
                  Plano radioeléctrico interactivo
                </h2>

                <p className="text-[10px] text-zinc-500 uppercase mt-1">
                  Arrastra el router para recalcular el mapa al instante
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] text-zinc-500 uppercase">Router</p>

                <p className="text-xs font-mono text-orange-500">
                  X:{routerX.toFixed(2)} · Y:{routerY.toFixed(2)}
                </p>
              </div>
            </div>

            <div
              ref={planoRef}
              className="relative border border-zinc-800 bg-black rounded-2xl overflow-hidden touch-none select-none"
              style={{ aspectRatio: `${ancho}/${largo}` }}
              onPointerMove={moverRouter}
              onPointerUp={() => setArrastrando(false)}
              onPointerLeave={() => setArrastrando(false)}
            >
              <div
                className="grid absolute inset-0"
                style={{
                  gridTemplateColumns: `repeat(${
                    heatmap[0]?.length || 1
                  }, 1fr)`,
                }}
              >
                {heatmap.flat().map((v, i) => (
                  <div
                    key={i}
                    title={`${v} dBm`}
                    style={{
                      backgroundColor: colorPotencia(v),
                      opacity: 0.84,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute left-[55%] top-0 bottom-0 w-[2px] bg-white" />
                <div className="absolute top-[55%] left-0 right-0 h-[2px] bg-white" />
              </div>

              <div
                onPointerDown={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                className="absolute w-7 h-7 rounded-full bg-white border-4 border-orange-500 shadow-2xl z-20 cursor-grab active:cursor-grabbing"
                style={{
                  left: `${(routerX / ancho) * 100}%`,
                  top: `${(routerY / largo) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 30px rgba(249,115,22,0.8)",
                }}
              />

              <div className="absolute left-3 top-3 bg-black/70 border border-zinc-800 rounded-xl px-3 py-2">
                <p className="text-[9px] text-zinc-400 uppercase font-black">
                  Router WiFi
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3 mt-6">
              <Leyenda
                color="bg-green-500"
                texto="Excelente"
                valor=">-55 dBm"
              />

              <Leyenda
                color="bg-yellow-500"
                texto="Buena"
                valor="-55 a -67"
              />

              <Leyenda
                color="bg-orange-500"
                texto="Media"
                valor="-67 a -78"
              />

              <Leyenda
                color="bg-red-500"
                texto="Débil"
                valor="<-78 dBm"
              />
            </div>

            <div className="mt-8 bg-black/60 border border-zinc-900 rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase text-orange-500 mb-2">
                Enfoque técnico del TFG
              </h3>

              <p className="text-sm text-zinc-400 leading-relaxed">
                La interfaz permite modificar en tiempo real la posición del
                punto de acceso y visualizar la variación espacial de potencia
                recibida. La optimización automática evalúa posiciones
                candidatas y selecciona la que maximiza la cobertura media y
                minimiza zonas débiles. En la fase avanzada, este resultado se
                validará con Sionna RT mediante ray tracing.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function calcularHeatmapLocal(
  ancho: number,
  largo: number,
  routerX: number,
  routerY: number,
  frecuenciaGhz: number,
  material: string,
  resolucion: number
) {
  const mapa: number[][] = [];

  const penalizacionMaterial: Record<string, number> = {
    pladur: 3,
    ladrillo: 8,
    hormigon: 14,
    mixto: 10,
  };

  const penalizacion = penalizacionMaterial[material] ?? 8;

  for (let j = 0; j < resolucion; j++) {
    const fila: number[] = [];

    for (let i = 0; i < resolucion; i++) {
      const x = (i / (resolucion - 1)) * ancho;
      const y = (j / (resolucion - 1)) * largo;

      const distancia = Math.max(
        Math.sqrt((x - routerX) ** 2 + (y - routerY) ** 2),
        0.2
      );

      const perdida =
        20 * Math.log10(distancia) +
        20 * Math.log10(frecuenciaGhz) +
        32.44;

      let potencia = -25 - perdida;

      if (x > ancho * 0.55) potencia -= penalizacion;
      if (y > largo * 0.55) potencia -= penalizacion * 0.75;
      if (x > ancho * 0.7 && y > largo * 0.6) potencia -= penalizacion * 0.4;

      fila.push(Number(potencia.toFixed(1)));
    }

    mapa.push(fila);
  }

  return mapa;
}

function calcularMetricas(heatmap: number[][]) {
  const valores = heatmap.flat();

  const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
  const minimo = Math.min(...valores);

  const zonasDebiles =
    (valores.filter((v) => v < -78).length / valores.length) * 100;

  return {
    media: Number(media.toFixed(1)),
    minimo: Number(minimo.toFixed(1)),
    zonasDebiles: Number(zonasDebiles.toFixed(1)),
  };
}

function colorPotencia(v: number) {
  if (v > -55) return "rgb(34,197,94)";
  if (v > -67) return "rgb(234,179,8)";
  if (v > -78) return "rgb(249,115,22)";
  return "rgb(239,68,68)";
}

function Control({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">
          {label}
        </label>

        <span className="text-[10px] font-mono text-orange-500">
          {value.toFixed(1)} {unit}
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

function Metrica({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="bg-black/60 border border-zinc-900 rounded-xl p-3">
      <p className="text-[8px] text-zinc-500 uppercase font-black">
        {titulo}
      </p>

      <p className="text-xs font-mono text-white mt-1">{valor}</p>
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