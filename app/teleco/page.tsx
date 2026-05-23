"use client";

import { useMemo, useState } from "react";

type Punto = {
  x: number;
  y: number;
  potencia: number;
};

const ancho = 10;
const alto = 8;
const paso = 0.5;

const habitaciones = [
  { nombre: "Salón", x: 0, y: 0, w: 5, h: 4 },
  { nombre: "Habitación", x: 5, y: 0, w: 3, h: 3 },
  { nombre: "Pasillo", x: 0, y: 4, w: 8, h: 1.5 },
  { nombre: "Cocina", x: 8, y: 0, w: 2, h: 4 },
  { nombre: "Baño", x: 8, y: 4, w: 2, h: 2 },
];

function potencia(routerX: number, routerY: number, x: number, y: number) {
  const distancia = Math.sqrt((routerX - x) ** 2 + (routerY - y) ** 2);
  const perdidaDistancia = 20 * Math.log10(distancia + 1);
  const penalizacionParedes = distancia > 4 ? 12 : distancia > 2.5 ? 6 : 0;

  return -30 - perdidaDistancia - penalizacionParedes;
}

function colorPorPotencia(p: number) {
  if (p > -45) return "bg-green-500/80";
  if (p > -60) return "bg-yellow-500/70";
  if (p > -72) return "bg-orange-500/70";
  return "bg-red-600/70";
}

export default function TelecoPage() {
  const [router, setRouter] = useState({ x: 2, y: 2 });

  const puntos = useMemo(() => {
    const datos: Punto[] = [];

    for (let x = 0; x <= ancho; x += paso) {
      for (let y = 0; y <= alto; y += paso) {
        datos.push({
          x,
          y,
          potencia: potencia(router.x, router.y, x, y),
        });
      }
    }

    return datos;
  }, [router]);

  const puntoOptimo = useMemo(() => {
    let mejor = { x: 0, y: 0, media: -999 };

    for (let rx = 0.5; rx <= ancho - 0.5; rx += paso) {
      for (let ry = 0.5; ry <= alto - 0.5; ry += paso) {
        const media =
          puntos.reduce((acc, p) => {
            return acc + potencia(rx, ry, p.x, p.y);
          }, 0) / puntos.length;

        if (media > mejor.media) {
          mejor = { x: rx, y: ry, media };
        }
      }
    }

    return mejor;
  }, [puntos]);

  const mediaActual =
    puntos.reduce((acc, p) => acc + p.potencia, 0) / puntos.length;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black italic mb-3">
        +TESTO · Módulo Teleco
      </p>

      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-6">
        Simulación WiFi Interior
      </h1>

      <p className="text-zinc-400 max-w-3xl mb-10">
        Primer prototipo de optimización de cobertura. Puedes mover el router y
        ver cómo cambia el mapa de calor. Después este resultado se validará con
        Sionna RT.
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

            <div
              className="absolute w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-black cursor-grab z-20 shadow-2xl"
              style={{
                left: `${(router.x / ancho) * 100}%`,
                top: `${(router.y / alto) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              draggable
              onDragEnd={(e) => {
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();

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

          <div className="flex gap-3 mt-4 text-[10px] uppercase font-black">
            <span className="text-green-400">● Buena</span>
            <span className="text-yellow-400">● Media</span>
            <span className="text-orange-400">● Débil</span>
            <span className="text-red-500">● Mala</span>
          </div>
        </section>

        <section className="space-y-6">
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
              Siguiente paso
            </h3>

            <ul className="space-y-3 text-sm text-zinc-400">
              <li>✓ Exportar plano a JSON</li>
              <li>✓ Generar escena para Sionna RT</li>
              <li>✓ Validar la posición óptima con ray tracing</li>
              <li>✓ Mostrar rayos principales sobre el plano</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
