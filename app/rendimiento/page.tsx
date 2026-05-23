"use client";

import { useEffect, useState } from "react";

type Medicion = {
  id: number;
  carga: number;
  api: number | null;
  memoria: string;
  cpu: string;
  ram: string;
  conexion: string;
  fecha: string;
};

export default function RendimientoPage() {
  const [cargando, setCargando] = useState(false);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [navegador, setNavegador] = useState("...");

  const ultima = mediciones[0];

  const obtenerMemoria = () => {
    const memoria = (performance as any).memory;

    if (!memoria) return "No disponible";

    return (
      Math.round(memoria.usedJSHeapSize / 1024 / 1024) + " MB"
    );
  };

  const obtenerCPU = () => {
    return navigator.hardwareConcurrency
      ? String(navigator.hardwareConcurrency)
      : "No disponible";
  };

  const obtenerRAM = () => {
    const nav = navigator as any;

    return nav.deviceMemory
      ? nav.deviceMemory + " GB"
      : "No disponible";
  };

  const obtenerConexion = () => {
    const nav = navigator as any;

    if (!nav.connection) return "No disponible";

    return nav.connection.effectiveType || "Desconocida";
  };

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
          messages: [
            {
              role: "user",
              content: "hola",
            },
          ],
        }),
      });

      tiempoAPI = Math.round(performance.now() - inicioAPI);
    } catch {
      tiempoAPI = null;
    }

    const nuevaMedicion: Medicion = {
      id: Date.now(),
      carga: tiempoCarga,
      api: tiempoAPI,
      memoria: obtenerMemoria(),
      cpu: obtenerCPU(),
      ram: obtenerRAM(),
      conexion: obtenerConexion(),
      fecha: new Date().toLocaleTimeString(),
    };

    setMediciones((prev) => [nuevaMedicion, ...prev].slice(0, 10));
    setNavegador(navigator.userAgent);
    setCargando(false);
  }

  useEffect(() => {
    medir();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black italic mb-3">
            +TESTO · Monitorización técnica
          </p>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
            Análisis de rendimiento
          </h1>
        </div>

        <button
          onClick={medir}
          disabled={cargando}
          className="px-6 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase hover:opacity-80 transition-all disabled:opacity-40"
        >
          {cargando ? "Midiendo..." : "Repetir medición"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">Tiempo carga</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? `${ultima.carga} ms` : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">Tiempo API IA</div>
          <div className="text-4xl font-black mt-2">
            {ultima
              ? ultima.api !== null
                ? `${ultima.api} ms`
                : "Error"
              : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">Memoria JS</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? ultima.memoria : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">Núcleos CPU</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? ultima.cpu : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">RAM dispositivo</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? ultima.ram : "..."}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-2xl bg-black">
          <div className="text-zinc-400 text-sm">Conexión</div>
          <div className="text-4xl font-black mt-2">
            {ultima ? ultima.conexion : "..."}
          </div>
        </div>
      </div>

      <div className="mt-10 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-2xl font-black mb-4 uppercase italic">
          Cliente
        </h2>

        <p className="text-sm text-zinc-300 break-words">
          {navegador}
        </p>
      </div>

      <div className="mt-10 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-2xl font-black mb-6 uppercase italic">
          Historial de mediciones
        </h2>

        {mediciones.length === 0 ? (
          <p className="text-zinc-500 text-sm">Sin mediciones todavía.</p>
        ) : (
          <div className="space-y-3">
            {mediciones.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-1 md:grid-cols-7 gap-3 border border-zinc-900 rounded-xl p-4 text-sm text-zinc-300"
              >
                <span>{m.fecha}</span>
                <span>Carga: {m.carga} ms</span>
                <span>
                  API IA: {m.api !== null ? `${m.api} ms` : "Error"}
                </span>
                <span>Memoria: {m.memoria}</span>
                <span>CPU: {m.cpu}</span>
                <span>RAM: {m.ram}</span>
                <span>Red: {m.conexion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 border border-zinc-800 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">
          Sistema monitorizado
        </h2>

        <ul className="space-y-3 text-zinc-300">
          <li>✓ Tiempo real de carga mediante Performance API</li>
          <li>✓ Tiempo de respuesta de la API de IA</li>
          <li>✓ Latencia cliente-servidor</li>
          <li>✓ Memoria JavaScript utilizada por el navegador</li>
          <li>✓ Núcleos lógicos disponibles en el dispositivo</li>
          <li>✓ Memoria RAM estimada del dispositivo</li>
          <li>✓ Tipo de conexión de red cuando el navegador lo permite</li>
          <li>✓ Historial dinámico de mediciones</li>
        </ul>
      </div>
    </main>
  );
}
