"use client";
import Link from "next/link";
import { routes } from "@/lib/telecomLevel2/api";

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#03050a] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(249,115,22,.18),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,.14),transparent_32%)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/50 p-5 xl:block">
          <div className="mb-6 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
            <p className="text-2xl font-black uppercase italic">Mastesto</p>
            <p className="text-[10px] font-black uppercase tracking-[.3em] text-orange-400">Level 2 Premium</p>
          </div>
          <nav className="space-y-2">
            {routes.map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-2xl border border-white/5 bg-white/[.035] px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-300 hover:border-orange-500 hover:text-white">{label}</Link>
            ))}
          </nav>
        </aside>
        <section className="w-full p-5 lg:p-8">
          <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[.045] p-6">
            <p className="text-xs font-black uppercase tracking-[.35em] text-orange-400">v1300 Level 2 Connected Simulation</p>
            <h1 className="mt-3 text-4xl font-black uppercase italic tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-4 max-w-6xl text-sm leading-7 text-zinc-400">{subtitle}</p>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="rounded-[1.6rem] border border-white/10 bg-white/[.045] p-5 shadow-xl"><h2 className="text-xl font-black uppercase italic">{title}</h2>{subtitle && <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>}<div className="mt-5">{children}</div></section>
}

export function Button({ children, onClick, disabled=false, tone="dark" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; tone?: "dark"|"orange"|"blue"|"green"|"white"|"red" }) {
  const c = tone === "orange" ? "bg-orange-500 text-black hover:bg-orange-400" : tone === "blue" ? "border border-sky-700 bg-sky-950 text-sky-200" : tone === "green" ? "border border-emerald-700 bg-emerald-950 text-emerald-200" : tone === "white" ? "bg-white text-black" : tone === "red" ? "border border-red-700 bg-red-950 text-red-200" : "border border-white/10 bg-black/50 text-zinc-200 hover:border-orange-500";
  return <button disabled={disabled} onClick={onClick} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase transition disabled:opacity-50 ${c}`}>{children}</button>;
}

export function Code({ data }: { data: unknown }) {
  return <pre className="max-h-[650px] overflow-auto rounded-2xl border border-white/10 bg-black/75 p-4 text-xs leading-5 text-zinc-300">{JSON.stringify(data, null, 2)}</pre>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-black/40 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></div>;
}

export function MiniBars({ title, data, xKey, yKey }: { title: string; data: any[]; xKey: string; yKey: string }) {
  const sample = Array.isArray(data) ? data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 60)) === 0).slice(0, 60) : [];
  const vals = sample.map(d => Number(d[yKey] || 0));
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 1);
  return (
    <Card title={title}>
      <div className="space-y-2">
        {sample.map((d, i) => {
          const v = Number(d[yKey] || 0);
          const w = ((v - min) / Math.max(max - min, 1e-9)) * 100;
          return <div key={i} className="grid grid-cols-[90px_1fr_90px] items-center gap-2 text-xs"><span className="text-zinc-500">{String(d[xKey]).slice(0, 8)}</span><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-orange-500" style={{ width: `${Math.max(2, w)}%` }} /></div><span className="text-right text-zinc-400">{v.toFixed(3)}</span></div>
        })}
      </div>
    </Card>
  );
}
