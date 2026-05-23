"use client";

import { useEffect, useState } from "react";

export default function RendimientoPage() {
  const [datos, setDatos] = useState({
    carga: "...",
    api: "...",
    navegador: "...",
  });

  useEffect(() => {
    async function medir() {
      const navegacion = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;

      const tiempoCarga =
        navegacion && navegacion.loadEventEnd > 0
          ? Math.round(navegacion.loadEventEnd)
          : Math.round(performance.now());

      const inicioAPI = performance.now();

      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: "hola",
              },
            ],
          }),
        });

        const finAPI = performance.now();

        setDatos({
          carga: tiempoCarga + " ms",
          api: Math.round(finAPI - inicioAPI) + " ms",
          navegador: navigator.userAgent,
        });
      } catch {
        setDatos({
          carga: tiempoCarga + " ms",
          api: "Error",
          navegador: navigator.userAgent,
        });
      }
    }

    medir();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-black mb-10 uppercase italic">
        Análisis de rendimiento
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Tiempo carga</div>
          <div className="text-4xl font-black mt-2">{datos.carga}</div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Tiempo API IA</div>
          <div className="text-4xl font-black mt-2">{datos.api}</div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl">
          <div className="text-zinc-400">Cliente</div>
          <div className="text-sm mt-2 break-words">{datos.navegador}</div>
        </div>
      </div>

      <div className="mt-12 border border-zinc-800 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Sistema monitorizado</h2>

        <ul className="space-y-3 text-zinc-300">
          <li>✓ Tiempo real de carga mediante Performance API</li>
          <li>✓ Tiempo de respuesta de la API de IA</li>
          <li>✓ Latencia cliente-servidor</li>
          <li>✓ Monitorización del navegador cliente</li>
          <li>✓ Rendimiento de la plataforma cloud</li>
        </ul>
      </div>
    </main>
  );
}
