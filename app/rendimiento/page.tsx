"use client";

import { useEffect, useState } from "react";

type Medicion = {
  id: number;
  carga: number;
  api: number | null;
  fecha: string;
};

export default function RendimientoPage() {
  const [cargando, setCargando] = useState(false);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [navegador, setNavegador] = useState("...");

  const ultima = mediciones[0];

  async function medir() {
    setCargando(true);

    const navegacion = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;

    const tiempoCarga =
      navegacion && navegacion.loadEventEnd > 0
        ? Math.round(navegacion.loadEventEnd)
        : Math.round(performance.now());

    const inicioAPI = performance.now();

    let tiempoAPI: number | null = null;

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "hola" }],
        }),
      });

      tiempoAPI = Math.round(performance.now() - inicioAPI);
    } catch {
      tiempoAPI = null;
    }

    const nueva: Medicion = {
      id: Date.now(),
      carga: tiempoCarga,
      api: tiempoAPI,
      fecha: new Date().toLocaleTimeString(),
    };

    setMediciones((prev) => [nueva, ...prev].slice(0, 10));
    setNavegador(navigator.userAgent);
    setCargando(false);
  }

  useEffect(() => {
    medir();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex items-center justify-between gap-6 mb-10">
        <h1 className="text-5xl font-black uppercase italic">
          Análisis de rendimiento
        </h1>

        <button
          onClick={medir}
          disabled={cargando}
          className="px-5 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase disabled:opacity-40"
        >
          {cargando ? "Midiendo..." : "Repetir medición"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Tiempo carga</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? `${ultima.carga} ms` : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Tiempo API IA</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? ultima.api !== null ? `${ultima.api} ms` : "Error" : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Cliente</div>
          <div className="text-sm mt-2 break-words">{navegador}</div>
        </div>
      </div>

      <div className="mt-12 border border-zinc-800 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Historial de mediciones</h2>

        <div className="space-y-3">
          {mediciones.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-3 gap-4 border border-zinc-900 rounded-xl p-4 text-sm"
            >
              <span>{m.fecha}</span>
              <span>Carga: {m.carga} ms</span>
              <span>API IA: {m.api !== null ? `${m.api} ms` : "Error"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border border-zinc-800 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Sistema monitorizado</h2>

        <ul className="space-y-3 text-zinc-300">
          <li>✓ Mediciones dinámicas bajo demanda</li>
          <li>✓ Tiempo real de carga mediante Performance API</li>
          <li>✓ Tiempo de respuesta de la API de IA</li>
          <li>✓ Latencia cliente-servidor</li>
          <li>✓ Rendimiento de plataforma cloud</li>
        </ul>
      </div>
    </main>
  );
}
