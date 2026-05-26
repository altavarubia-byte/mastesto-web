"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const ROUTES = [
  ["/telecom-premium", "Premium"],
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
];

export function Shell({ title, badge, description, children }: { title: string; badge: string; description: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,.18),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,.16),transparent_30%)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/40 p-5 backdrop-blur-xl lg:block">
          <div className="mb-8">
            <div className="text-2xl font-black uppercase tracking-tight">Mastesto</div>
            <div className="text-xs uppercase tracking-[0.25em] text-orange-400">Telecom Suite</div>
          </div>
          <nav className="space-y-2">
            {ROUTES.map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-2xl border border-transparent px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-300 transition hover:border-orange-500/60 hover:bg-orange-500/10 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs font-black uppercase text-emerald-300">Realtime sync</p>
            <p className="mt-2 text-xs text-zinc-400">Cada módulo se exporta al MegaProyecto en localStorage.</p>
          </div>
        </aside>

        <section className="w-full px-5 py-6 lg:px-8">
          <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">{badge}</p>
                <h1 className="mt-3 text-4xl font-black uppercase italic tracking-tight md:text-6xl">{title}</h1>
                <p className="mt-4 max-w-5xl text-sm leading-7 text-zinc-400 md:text-base">{description}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/mega-telecom-lab" className="rounded-full border border-orange-500/40 bg-orange-500/10 px-5 py-3 text-xs font-black uppercase text-orange-200">MegaProyecto</Link>
                <Link href="/telecom-premium" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase text-white">Home</Link>
              </div>
            </div>
          </header>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </section>
      </div>
    </main>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
      <h2 className="text-xl font-black uppercase italic md:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "green" | "orange" | "blue" }) {
  const toneClass = tone === "green" ? "text-emerald-300" : tone === "orange" ? "text-orange-300" : tone === "blue" ? "text-sky-300" : "text-white";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

export function Button({ children, onClick, variant = "dark", disabled=false }: { children: React.ReactNode; onClick?: () => void; variant?: "orange" | "white" | "dark" | "green" | "red" | "blue" | "purple"; disabled?: boolean }) {
  const cls =
    variant === "orange" ? "bg-orange-500 text-black hover:bg-orange-400" :
    variant === "white" ? "bg-white text-black hover:bg-zinc-200" :
    variant === "green" ? "border border-emerald-700 bg-emerald-950 text-emerald-200 hover:bg-emerald-900" :
    variant === "red" ? "border border-red-900 bg-red-950 text-red-200 hover:bg-red-900" :
    variant === "blue" ? "border border-sky-700 bg-sky-950 text-sky-200 hover:bg-sky-900" :
    variant === "purple" ? "border border-purple-700 bg-purple-950 text-purple-200 hover:bg-purple-900" :
    "border border-white/10 bg-black/50 text-zinc-200 hover:border-orange-500";
  return <button disabled={disabled} onClick={onClick} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase transition disabled:opacity-50 ${cls}`}>{children}</button>;
}

export function CodeBox({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[540px] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-xs leading-5 text-zinc-300">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
