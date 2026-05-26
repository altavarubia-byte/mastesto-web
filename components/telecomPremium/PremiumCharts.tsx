"use client";

import {
  Area, AreaChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar,
} from "recharts";

export function LinePro({ title, data, xKey, yKey, suffix = "" }: { title: string; data: any[]; xKey: string; yKey: string; suffix?: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="mb-4 text-sm font-black uppercase italic text-white">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey={xKey} stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} formatter={(v:any)=>`${v} ${suffix}`} />
            <Line type="monotone" dataKey={yKey} stroke="#f97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AreaPro({ title, data, xKey, yKey }: { title: string; data: any[]; xKey: string; yKey: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="mb-4 text-sm font-black uppercase italic text-white">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey={xKey} stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} />
            <Area type="monotone" dataKey={yKey} stroke="#38bdf8" fill={`url(#grad-${yKey})`} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BarPro({ title, data, xKey, yKey }: { title: string; data: any[]; xKey: string; yKey: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="mb-4 text-sm font-black uppercase italic text-white">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey={xKey} stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} />
            <Bar dataKey={yKey} fill="#a855f7" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PolarPro({ title }: { title: string }) {
  const data = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    const r = 20 + 18 * Math.abs(Math.cos(angle * Math.PI / 180));
    return { angle: `${angle}`, gain: Number(r.toFixed(2)) };
  });
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="mb-4 text-sm font-black uppercase italic text-white">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,.12)" />
            <PolarAngleAxis dataKey="angle" tick={{ fontSize: 10, fill: "#a1a1aa" }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: "#71717a" }} />
            <Radar dataKey="gain" stroke="#d946ef" fill="#d946ef" fillOpacity={0.25} strokeWidth={3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GaugePro({ title, value }: { title: string; value: number }) {
  const deg = Math.round(Math.max(0, Math.min(100, value)) * 3.6);
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <h3 className="text-sm font-black uppercase italic">{title}</h3>
      <div className="mx-auto mt-5 flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(rgb(249 115 22) ${deg}deg, rgb(39 39 42) ${deg}deg)` }}>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black text-3xl font-black">{Math.round(value)}%</div>
      </div>
    </div>
  );
}
