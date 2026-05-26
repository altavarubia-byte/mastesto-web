"use client";

import React from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl shadow-black/40">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.24em] text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  loading,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cx(
        "rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-orange-500 text-black hover:bg-orange-400",
        variant === "secondary" &&
          "border border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500",
        variant === "ghost" &&
          "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-400"
      )}
    >
      {loading ? "Calculando..." : children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "number",
  step,
  min,
}: {
  label: string;
  value: string | number;
  onChange: (v: any) => void;
  type?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none focus:border-orange-500"
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <select
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none focus:border-orange-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "info";
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p
        className={cx(
          "mt-2 break-words text-xl font-black",
          tone === "good" && "text-emerald-400",
          tone === "warn" && "text-yellow-400",
          tone === "info" && "text-cyan-400",
          tone === "neutral" && "text-white"
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

export function JsonBox({
  data,
  maxHeight = "max-h-[420px]",
}: {
  data: any;
  maxHeight?: string;
}) {
  return (
    <pre
      className={cx(
        "overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 text-[11px] leading-5 text-zinc-300",
        maxHeight
      )}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function StatusPill({
  ok,
  label,
}: {
  ok?: boolean | null;
  label: string;
}) {
  return (
    <span
      className={cx(
        "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-900 text-zinc-400"
      )}
    >
      {label}
    </span>
  );
}
