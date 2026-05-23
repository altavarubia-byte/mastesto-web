"use client";

import { useMemo, useState } from "react";

type Punto = {
  x: number;
  y: number;
  potencia: number;
};

const paso = 0.5;

function potencia(
  routerX: number,
  routerY: number,
  x: number,
  y: number,
  frecuencia: string,
  material: string
) {
  const distancia = Math.sqrt((routerX - x) ** 2 + (routerY - y) ** 2);

  const factorFrecuencia = frecuencia === "5 GHz" ? 1.35 : 1;
  const perdidaDistancia = 20 * Math.log10(distancia + 1) * factorFrecuencia;

  const perdidaMaterial =
    material === "Hormigón"
      ? 12
      : material === "Ladrillo"
      ? 8
      : material === "Pladur"
      ? 4
      : 2;

  const penalizacionParedes =
    distancia > 4 ? perdidaMaterial : distancia > 2.5 ? perdidaMaterial / 2 : 0;

  return -30 - perdidaDistancia - penalizacionParedes;
}

function colorPorPotencia(p: number) {
  if (p > -45) return "bg-green-500/80";
  if (p > -60) return "bg-yellow-500/70";
  if (p > -72) return "bg-orange-500/70";
  return "bg-red-600/70";
}

export default function TelecoPage() {
  const [configurado, setConfigurado] = useState(false);

  const [form, setForm] = useState({
    ancho: 10,
    alto: 8,
    altura: 2.6,
    habitaciones: 5,
    frecuencia: "2.4 GHz",
    material: "Hormigón",
  });

  const [router, setRouter] = useState({ x: 2, y: 2 });

  const ancho = form.ancho;
  const alto = form.alto;

  const habitaciones = useMemo(() => {
    const lista = [];
    const columnas = Math.ceil(Math.sqrt(form.habitaciones));
    const filas = Math.ceil(form.habitaciones / columnas);
    const w = ancho / columnas;
    const h = alto / filas;

    for (let i = 0; i < form.habitaciones; i++) {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);

      lista.push({
        nombre: `Zona ${i + 1}`,
        x: col * w,
        y: fila * h,
        w,
        h,
      });
    }

    return lista;
  }, [form.habitaciones, ancho, alto]);

  const puntos = useMemo(() => {
    const datos: Punto[] = [];

    for (let x = 0; x <= ancho; x += paso) {
      for (let y = 0; y <= alto; y += paso) {
        datos.push({
          x,
          y,
          potencia: potencia(
            router.x,
            router.y,
            x,
            y,
            form.frecuencia,
            form.material
          ),
        });
      }
    }

    return datos;
  }, [router, ancho, alto, form.frecuencia, form.material]);

  const puntoOptimo = useMemo(() => {
    let mejor = { x: 0, y: 0, media: -999 };

    for (let rx = 0.5; rx <= ancho - 0.5; rx += paso) {
      for (let ry = 0.5; ry <= alto - 0.5; ry += paso) {
        const media =
          puntos.reduce((acc, p) => {
            return (
              acc +
              potencia(
                rx,
                ry,
                p.x,
                p.y,
                form.frecuencia,
                form.material
              )
            );
          }, 0) / puntos.length;

        if (media > mejor.media) {
          mejor = {
            x: Number(rx.toFixed(2)),
            y: Number(ry.toFixed(2)),
            media,
          };
        }
      }
    }

    return mejor;
  }, [puntos, ancho, alto, form.frecuencia, form.material]);

  const mediaActual =
    puntos.reduce((acc, p) => acc + p.potencia, 0) / puntos.length;

  if (!configurado) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-2xl border border-zinc-800 rounded-[2rem] p-8 md:p-10 bg-zinc-950">
          <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black italic mb-3">
            +TESTO · Simulación Teleco
          </p>

          <h1 className="text-4xl md:text-5xl font-black uppercase italic mb-8">
            Configura tu vivienda
          </h1>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Ancho piso (m)</p>
              <input
                type="number"
                min="2"
                value={form.ancho}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ancho: Number(e.target.value),
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              />
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-2">Largo piso (m)</p>
              <input
                type="number"
                min="2"
                value={form.alto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    alto: Number(e.target.value),
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              />
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-2">Altura (m)</p>
              <input
                type="number"
                min="2"
                step="0.1"
                value={form.altura}
                onChange={(e) =>
                  setForm({
                    ...form,
                    altura: Number(e.target.value),
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              />
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-2">Habitaciones</p>
              <input
                type="number"
                min="1"
                max="12"
                value={form.habitaciones}
                onChange={(e) =>
                  setForm({
                    ...form,
                    habitaciones: Number(e.target.value),
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              />
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-2">Frecuencia WiFi</p>
              <select
                value={form.frecuencia}
                onChange={(e) =>
                  setForm({
                    ...form,
                    frecuencia: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              >
                <option>2.4 GHz</option>
                <option>5 GHz</option>
              </select>
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-2">Material paredes</p>
              <select
                value={form.material}
                onChange={(e) =>
                  setForm({
                    ...form,
                    material: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white"
              >
                <option>Hormigón</option>
                <option>Ladrillo</option>
                <option>Pladur</option>
                <option>Madera</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setRouter({
                x: Math.min(2, form.ancho),
                y: Math.min(2, form.alto),
              });
              setConfigurado(true);
            }}
            className="mt-8 w-full bg-white text-black rounded-xl p-5 font-black uppercase hover:opacity-80 transition-all"
          >
            Generar simulación
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black italic mb-3">
        +TESTO · Módulo Teleco
      </p>

      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-6">
        Simulación WiFi Interior
      </h1>

      <p className="text-zinc-400 max-w-3xl mb-10">
        Mapa de calor dinámico con router desplazable, estimación de cobertura y
        cálculo automático del punto óptimo. La validación avanzada se realizará
        posteriormente con Sionna RT y trazado de rayos.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 border border-zinc-800 rounded-[2rem] p-6 bg-zinc-950">
          <div className="relative w-full aspect-[10/8] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {habitaciones.map((h) => (
              <div
                key={h.nombre}
                className="absolute border border-zinc-600/70 flex items-center justify-center text-[9px] uppercase font-black text-zinc-500"
                style={{
                  left: `${(h.x / ancho) * 100}%`,
                  top: `${(h.y / alto) * 100}%`,
                  width: `${(h.w / ancho) * 100}%`,
                  height: `${(h.h / alto) * 100}%`,
                }}
              >
                {h.nombre}
              </div>
            ))}

            {puntos.map((p) => (
              <div
                key={`${p.x}-${p.y}`}
                className={`absolute rounded-full blur-sm ${colorPorPotencia(
                  p.potencia
                )}`}
                style={{
                  left: `${(p.x / ancho) * 100}%`,
                  top: `${(p.y / alto) * 100}%`,
                  width: "4%",
                  height: "5%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <line
                x1={`${(router.x / ancho) * 100}%`}
                y1={`${(router.y / alto) * 100}%`}
                x2="85%"
                y2="20%"
                stroke="white"
                strokeOpacity="0.35"
                strokeWidth="2"
              />
              <line
                x1={`${(router.x / ancho) * 100}%`}
                y1={`${(router.y / alto) * 100}%`}
                x2="15%"
                y2="80%"
                stroke="white"
                strokeOpacity="0.25"
                strokeWidth="2"
              />
              <polyline
                points={`${(router.x / ancho) * 100},${
                  (router.y / alto) * 100
                } 50,5 90,70`}
                fill="none"
                stroke="white"
                strokeOpacity="0.18"
                strokeWidth="2"
              />
            </svg>

            <div
              className="absolute w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-black cursor-grab z-20 shadow-2xl"
              style={{
                left: `${(router.x / ancho) * 100}%`,
                top: `${(router.y / alto) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              draggable
              onDragEnd={(e) => {
                const rect =
                  e.currentTarget.parentElement!.getBoundingClientRect();

                const nuevoX =
                  ((e.clientX - rect.left) / rect.width) * ancho;

                const nuevoY =
                  ((e.clientY - rect.top) / rect.height) * alto;

                setRouter({
                  x: Math.min(ancho, Math.max(0, Number(nuevoX.toFixed(2)))),
                  y: Math.min(alto, Math.max(0, Number(nuevoY.toFixed(2)))),
                });
              }}
            >
              📡
            </div>

            <div
              className="absolute w-6 h-6 rounded-full border-2 border-white z-30 animate-pulse"
              style={{
                left: `${(puntoOptimo.x / ancho) * 100}%`,
                top: `${(puntoOptimo.y / alto) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-[10px] uppercase font-black">
            <span className="text-green-400">● Buena</span>
            <span className="text-yellow-400">● Media</span>
            <span className="text-orange-400">● Débil</span>
            <span className="text-red-500">● Mala</span>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
            <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-2">
              Escenario
            </p>

            <p className="text-sm text-zinc-400">
              Dimensiones: {ancho} m × {alto} m × {form.altura} m
            </p>
            <p className="text-sm text-zinc-400">
              Frecuencia: {form.frecuencia}
            </p>
            <p className="text-sm text-zinc-400">Material: {form.material}</p>

            <button
              onClick={() => setConfigurado(false)}
              className="mt-5 w-full py-3 rounded-xl border border-zinc-700 text-[10px] font-black uppercase hover:bg-zinc-900 transition-all"
            >
              Cambiar vivienda
            </button>
          </div>

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
            <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-2">
              Router actual
            </p>

            <h2 className="text-3xl font-black">
              x={router.x} m · y={router.y} m
            </h2>

            <p className="text-zinc-400 text-sm mt-3">
              Potencia media estimada:{" "}
              <span className="text-white font-black">
                {mediaActual.toFixed(1)} dBm
              </span>
            </p>
          </div>

          <div className="border border-green-800/60 rounded-2xl p-6 bg-green-950/10">
            <p className="text-green-500 text-[9px] uppercase font-black tracking-widest mb-2">
              Posición óptima calculada
            </p>

            <h2 className="text-3xl font-black text-green-400">
              x={puntoOptimo.x} m · y={puntoOptimo.y} m
            </h2>

            <p className="text-zinc-400 text-sm mt-3">
              Potencia media estimada en óptimo:{" "}
              <span className="text-white font-black">
                {puntoOptimo.media.toFixed(1)} dBm
              </span>
            </p>

            <button
              onClick={() =>
                setRouter({
                  x: puntoOptimo.x,
                  y: puntoOptimo.y,
                })
              }
              className="mt-5 w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase hover:opacity-80 transition-all"
            >
              Colocar router en óptimo
            </button>
          </div>

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
            <h3 className="text-xl font-black uppercase italic mb-4">
              Próximo módulo Sionna RT
            </h3>

            <ul className="space-y-3 text-sm text-zinc-400">
              <li>✓ Exportar plano a JSON</li>
              <li>✓ Generar escena tridimensional</li>
              <li>✓ Ejecutar ray tracing con Sionna RT</li>
              <li>✓ Mostrar rayos reales sobre el plano</li>
              <li>✓ Comparar modelo rápido vs simulación avanzada</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
