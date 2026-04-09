"use client";

import { useState, useActionState } from "react";
import { addServiceAction, toggleServiceAction, deleteServiceAction } from "../atendimentos/actions";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string } | null;
  isActive: boolean;
}

export function ServicesClient({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial);
  const [state, action, pending] = useActionState(addServiceAction, {});

  return (
    <div className="space-y-4">

      {/* Add service form */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
        <p className="text-sm font-semibold text-white mb-3">Adicionar serviço</p>
        {state.error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mb-3">{state.error}</p>
        )}
        {state.success && (
          <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2 mb-3">Serviço adicionado!</p>
        )}
        <form action={action} className="space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Nome do serviço *"
            required
            className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="description"
              type="text"
              placeholder="Descrição (opcional)"
              className="bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">R$</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full bg-[#111111] border border-[#333] rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors"
          >
            {pending ? "Adicionando..." : "+ Adicionar Serviço"}
          </button>
        </form>
      </div>

      {/* Services list */}
      {services.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-600">Nenhum serviço cadastrado ainda.</p>
          <p className="text-xs text-gray-700 mt-1">Adicione seus serviços acima para usá-los nos atendimentos.</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#262626]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {services.length} serviço{services.length !== 1 ? "s" : ""} cadastrado{services.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-[#222]">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${s.isActive ? "text-gray-200" : "text-gray-600 line-through"}`}>
                    {s.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {s.description && (
                      <p className="text-xs text-gray-600 truncate">{s.description}</p>
                    )}
                    {s.price && (
                      <p className="text-xs text-violet-400 font-medium flex-shrink-0">
                        R$ {Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  <form action={() => toggleServiceAction(s.id, !s.isActive)}>
                    <button
                      type="submit"
                      className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                        s.isActive
                          ? "text-amber-500/70 hover:text-amber-400 hover:bg-amber-400/10"
                          : "text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-400/10"
                      }`}
                    >
                      {s.isActive ? "Ocultar" : "Ativar"}
                    </button>
                  </form>
                  <form action={() => deleteServiceAction(s.id)}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
