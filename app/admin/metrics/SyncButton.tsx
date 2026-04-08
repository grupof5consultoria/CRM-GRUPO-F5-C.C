"use client";

import { useState } from "react";
import { syncMetricsAction } from "./actions";

interface Props {
  clientId: string;
  platform: "meta" | "google";
  dateFrom: string;
  dateTo: string;
}

export function SyncButton({ clientId, platform, dateFrom, dateTo }: Props) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setMsg(null);
    const res = await syncMetricsAction(clientId, platform, dateFrom, dateTo);
    setLoading(false);
    if (res.success) setMsg({ type: "ok", text: "Sincronizado!" });
    else setMsg({ type: "err", text: res.error ?? "Erro" });
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="flex items-center gap-2">
      {msg && (
        <span className={`text-xs ${msg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {msg.text}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        title="Sincronizar dados da plataforma"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-40"
      >
        <svg
          className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}
