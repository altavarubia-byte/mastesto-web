"use client";

import Link from "next/link";

export const ROUTES = [
  ["/telecom", "Inicio"],
  ["/mega-telecom-lab", "MegaProyecto"],
  ["/rf-lab", "RF"],
  ["/sionna-lab", "Sionna"],
  ["/optical-lab", "Óptica"],
  ["/dsp-lab", "DSP"],
  ["/electronics-lab", "Electrónica"],
  ["/energy-lab", "Energía"],
  ["/iot-lab", "IoT"],
  ["/transmission-lines-lab", "Líneas"],
  ["/industrial-lab", "Industrial"],
  ["/projects-lab", "Proyectos"],
  ["/validation-lab", "Validación"],
];

export function Shell({ title, badge, description, children }: { title: string; badge: string; description: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 p-7 shadow-2xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">{badge}</p>
            <h1 className="mt-3 text-4xl font-black uppercase italic tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400 md:text-base">{description}</p>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-3xl border border-zinc-900 bg-zinc-950/70 p-3">
          {ROUTES.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 transition hover:border-orange-500 hover:text-orange-300">
              {label}
            </Link>
          ))}
        </nav>

        {children}
      </section>
    </main>
  );
}

export function Card({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
      <h2 className="text-xl font-black uppercase italic md:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

export function CodeBox({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[540px] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-xs leading-5 text-zinc-300">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function Button({ children, onClick, variant = "dark", disabled=false }: { children: React.ReactNode; onClick?: () => void; variant?: "orange" | "white" | "dark" | "green" | "red" | "blue"; disabled?: boolean }) {
  const cls =
    variant === "orange" ? "bg-orange-500 text-black hover:bg-orange-400" :
    variant === "white" ? "bg-white text-black hover:bg-zinc-200" :
    variant === "green" ? "border border-emerald-700 bg-emerald-950 text-emerald-200 hover:bg-emerald-900" :
    variant === "red" ? "border border-red-900 bg-red-950 text-red-200 hover:bg-red-900" :
    variant === "blue" ? "border border-sky-700 bg-sky-950 text-sky-200 hover:bg-sky-900" :
    "border border-zinc-700 bg-black text-zinc-200 hover:border-orange-500";
  return <button disabled={disabled} onClick={onClick} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase transition disabled:opacity-50 ${cls}`}>{children}</button>;
}

export function Chart({ title, values, suffix = "" }: { title: string; values: number[]; suffix?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${100 - ((v - min) / span) * 90 - 5}`).join(" ");
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-black uppercase italic">{title}</h3>
        <span className="text-xs text-zinc-500">{values[values.length - 1]?.toFixed?.(2)} {suffix}</span>
      </div>
      <svg viewBox="0 0 100 100" className="mt-4 h-56 w-full overflow-visible rounded-2xl border border-zinc-900 bg-zinc-950 p-2">
        <polyline points={pts} fill="none" stroke="rgb(249 115 22)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export function MetricGrid({ items }: { items: Array<[string, any]> }) {
  return (
    <div className="grid gap-3 rounded-3xl border border-zinc-800 bg-black p-4 md:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-2xl border border-zinc-900 bg-zinc-950 p-3">
          <p className="text-[10px] font-black uppercase text-zinc-500">{k}</p>
          <p className="mt-1 break-all text-lg font-black text-white">{String(v)}</p>
        </div>
      ))}
    </div>
  );
}

export function Gauge({ title, value }: { title: string; value: number }) {
  const deg = Math.round(Math.max(0, Math.min(100, value)) * 3.6);
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-4">
      <h3 className="font-black uppercase italic">{title}</h3>
      <div className="mx-auto mt-5 flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(rgb(249 115 22) ${deg}deg, rgb(39 39 42) ${deg}deg)` }}>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black text-3xl font-black">{Math.round(value)}%</div>
      </div>
    </div>
  );
}
