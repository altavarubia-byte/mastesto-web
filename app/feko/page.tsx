"use client";

import { useState } from "react";

const API = (process.env.NEXT_PUBLIC_FEKO_API_URL || "").replace(/\/$/, "");

export default function FekoLabPage() {
  const [frecuenciaGHz, setFrecuenciaGHz] = useState(2.45);
  const [numEspiras, setNumEspiras] = useState(7);
  const [polarizacion, setPolarizacion] = useState("RHCP");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const diseñar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/feko/design/helical`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          frecuenciaGHz,
          numEspiras,
          polarizacion,
          modo: "auto",
          objetivoS11Db: -10,
          objetivoAxialRatioDb: 3,
          objetivoGananciaDbi: 10,
        }),
      });
      setResultado(await res.json());
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="border border-orange-900 rounded-3xl p-6 bg-zinc-950">
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400 font-black">Mastesto FEKO Lab</p>
          <h1 className="text-4xl font-black uppercase mt-3">Laboratorio de antenas</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Fácil para el usuario. Motor técnico en backend: diseño, FEKO, análisis y exportación a Sionna.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <label className="text-xs text-zinc-500 uppercase font-black">Frecuencia GHz</label>
            <input className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3" type="number" step="0.01" value={frecuenciaGHz} onChange={e=>setFrecuenciaGHz(Number(e.target.value))}/>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <label className="text-xs text-zinc-500 uppercase font-black">Espiras</label>
            <input className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3" type="number" value={numEspiras} onChange={e=>setNumEspiras(Number(e.target.value))}/>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <label className="text-xs text-zinc-500 uppercase font-black">Polarización</label>
            <select className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3" value={polarizacion} onChange={e=>setPolarizacion(e.target.value)}>
              <option value="RHCP">RHCP</option>
              <option value="LHCP">LHCP</option>
            </select>
          </div>
        </div>

        <button onClick={diseñar} className="w-full py-4 rounded-2xl bg-orange-500 text-black font-black uppercase">
          {cargando ? "Calculando..." : "Diseñar hélice"}
        </button>

        {resultado?.diseño && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-orange-400 font-black uppercase text-sm">Geometría</h2>
              <pre className="text-xs text-zinc-300 mt-4 overflow-auto">{JSON.stringify(resultado.diseño.geometria, null, 2)}</pre>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-cyan-400 font-black uppercase text-sm">Estimaciones</h2>
              <pre className="text-xs text-zinc-300 mt-4 overflow-auto">{JSON.stringify(resultado.diseño.estimaciones, null, 2)}</pre>
            </div>
            <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-green-400 font-black uppercase text-sm">Fabricación</h2>
              <pre className="text-xs text-zinc-300 mt-4 overflow-auto">{JSON.stringify(resultado.diseño.fabricacion, null, 2)}</pre>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
