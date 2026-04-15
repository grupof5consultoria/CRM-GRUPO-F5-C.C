"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clients: Client[];
}

export function CRMClienteFilters({ clients }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const clientId  = params.get("clientId")  ?? "";
  const dateFrom  = params.get("dateFrom")  ?? "";
  const dateTo    = params.get("dateTo")    ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      router.push(`/admin/crm-cliente?${p.toString()}`);
    },
    [params, router]
  );

  function clearAll() {
    router.push("/admin/crm-cliente");
  }

  const hasFilter = clientId || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* Cliente */}
      <div className="relative">
        <select
          value={clientId}
          onChange={e => update("clientId", e.target.value)}
          className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 cursor-pointer min-w-[180px]"
        >
          <option value="">Todos os clientes</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Divisor */}
      <div className="h-6 w-px bg-[#2a2a2a]" />

      {/* Date from */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 whitespace-nowrap">De</span>
        <input
          type="date"
          value={dateFrom}
          onChange={e => update("dateFrom", e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 cursor-pointer"
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 whitespace-nowrap">até</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => update("dateTo", e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 cursor-pointer"
        />
      </div>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-2 rounded-xl border border-[#2a2a2a] hover:border-red-500/30"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar
        </button>
      )}

      {/* Badge do filtro ativo */}
      {clientId && (
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
          {clients.find(c => c.id === clientId)?.name ?? "Cliente"}
        </span>
      )}
    </div>
  );
}
