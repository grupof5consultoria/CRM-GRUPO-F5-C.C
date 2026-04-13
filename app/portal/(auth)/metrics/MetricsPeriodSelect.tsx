"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const PRESETS = [
  { key: "today",     label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d",        label: "Últimos 7 dias" },
  { key: "30d",       label: "Últimos 30 dias" },
  { key: "thismonth", label: "Este mês" },
  { key: "lastmonth", label: "Mês passado" },
  { key: "3m",        label: "3 meses" },
  { key: "6m",        label: "6 meses" },
  { key: "thisyear",  label: "Este ano" },
  { key: "lastyear",  label: "Ano passado" },
] as const;

function today() { return new Date().toISOString().split("T")[0]; }
function firstOfMonth() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split("T")[0];
}

function applyPreset(key: string): { from: string; to: string } {
  const now = new Date();
  const t = now.toISOString().split("T")[0];
  const d = (offset: number) => {
    const x = new Date(now); x.setDate(x.getDate() - offset);
    return x.toISOString().split("T")[0];
  };
  const m = (monthsBack: number) =>
    new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString().split("T")[0];

  switch (key) {
    case "today":     return { from: t, to: t };
    case "yesterday": { const y = d(1); return { from: y, to: y }; }
    case "7d":        return { from: d(6), to: t };
    case "30d":       return { from: d(29), to: t };
    case "thismonth": return { from: firstOfMonth(), to: t };
    case "lastmonth": {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lmStart.toISOString().split("T")[0], to: lmEnd.toISOString().split("T")[0] };
    }
    case "3m":        return { from: m(2), to: t };
    case "6m":        return { from: m(5), to: t };
    case "thisyear":  return { from: `${now.getFullYear()}-01-01`, to: t };
    case "lastyear":  return { from: `${now.getFullYear() - 1}-01-01`, to: `${now.getFullYear() - 1}-12-31` };
    default:          return { from: firstOfMonth(), to: t };
  }
}

function fmtDateShort(iso: string) {
  const [, mm, dd] = iso.split("-");
  return `${dd}/${mm}`;
}

export function MetricsPeriodSelect({
  currentFrom,
  currentTo,
}: {
  currentFrom: string;
  currentTo: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(currentFrom);
  const [to, setTo]     = useState(currentTo);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function navigate(f: string, t: string) {
    router.push(`/portal/metrics?dateFrom=${f}&dateTo=${t}`);
  }

  function handlePreset(key: string) {
    const { from: f, to: t } = applyPreset(key);
    setFrom(f); setTo(t);
    setActivePreset(key);
    navigate(f, t);
    setOpen(false);
  }

  function handleFrom(v: string) {
    setFrom(v); setActivePreset(null);
    if (v <= to) navigate(v, to);
  }

  function handleTo(v: string) {
    setTo(v); setActivePreset(null);
    if (v >= from) navigate(from, v);
  }

  const label = activePreset
    ? PRESETS.find(p => p.key === activePreset)?.label ?? `${fmtDateShort(from)} → ${fmtDateShort(to)}`
    : from === to
      ? fmtDateShort(from)
      : `${fmtDateShort(from)} → ${fmtDateShort(to)}`;

  const dateCls = "bg-[#111111] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-violet-500 [color-scheme:dark] flex-1";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] hover:border-violet-500/40 rounded-xl px-3 py-2 text-sm text-gray-300 transition-all"
      >
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">{label}</span>
        <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-11 w-64 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Presets list */}
          <div className="p-2">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  activePreset === p.key
                    ? "bg-violet-600/20 text-violet-300 font-semibold"
                    : "text-gray-400 hover:bg-[#262626] hover:text-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="border-t border-[#262626] px-3 py-3 space-y-2">
            <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Personalizado</p>
            <div className="flex items-center gap-2">
              <input type="date" value={from} max={to}
                onChange={e => handleFrom(e.target.value)}
                className={dateCls}
              />
              <span className="text-gray-600 text-xs">→</span>
              <input type="date" value={to} min={from}
                onChange={e => handleTo(e.target.value)}
                className={dateCls}
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
