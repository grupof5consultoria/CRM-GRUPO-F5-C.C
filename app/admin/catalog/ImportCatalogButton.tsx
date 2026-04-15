"use client";

import { useState } from "react";
import { importF5CatalogAction } from "./actions";

export function ImportCatalogButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created?: number; error?: string } | null>(null);

  async function handleImport() {
    setLoading(true);
    setResult(null);
    const res = await importF5CatalogAction();
    setResult(res);
    setLoading(false);
  }

  if (result?.created === 0 && !result.error) {
    return (
      <span className="text-xs text-gray-600 px-3 py-2 rounded-xl border border-[#262626] bg-[#111]">
        ✓ Catálogo já importado
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {result?.error && (
        <span className="text-xs text-red-400">{result.error}</span>
      )}
      {result?.created && result.created > 0 ? (
        <span className="text-xs text-emerald-400 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          ✓ {result.created} serviço{result.created !== 1 ? "s" : ""} importado{result.created !== 1 ? "s" : ""}!
        </span>
      ) : null}
      <button
        onClick={handleImport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-500/20"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        {loading ? "Importando..." : "Importar Catálogo F5"}
      </button>
    </div>
  );
}
