"use client";

import { useState, useActionState } from "react";
import {
  addAttendanceAction,
  addServiceAction,
  deleteServiceAction,
  deleteAttendanceAction,
} from "./actions";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  closed: "Fechou",
  not_closed: "Não fechou",
  follow_up: "Em follow-up",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "text-blue-400 bg-blue-400/10",
  closed: "text-emerald-400 bg-emerald-400/10",
  not_closed: "text-red-400 bg-red-400/10",
  follow_up: "text-amber-400 bg-amber-400/10",
};

const ORIGIN_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  referral: "Indicação",
  organic: "Orgânico",
  other: "Outro",
};

interface Service {
  id: string;
  name: string;
  price: { toString(): string } | null;
  isActive: boolean;
}

interface AttendanceEntry {
  id: string;
  serviceId: string | null;
  service: { name: string } | null;
  valueQuoted: { toString(): string } | null;
  valueClosed: { toString(): string } | null;
  status: string;
  lostReason: string | null;
  followUpCount: number;
  origin: string;
  contactDate: Date;
  period: string;
  notes: string | null;
}

interface Props {
  services: Service[];
  attendances: AttendanceEntry[];
  currentPeriod: string;
  periods: string[];
}

function fmtR(v: { toString(): string } | null | undefined) {
  if (!v) return null;
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

// ─── Add Attendance Form ──────────────────────────────────────────────────────

function AddAttendanceForm({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("scheduled");
  const [state, action, pending] = useActionState(addAttendanceAction, {});

  if (state.success && open) setOpen(false);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="relative w-full py-3 rounded-2xl text-sm font-semibold text-white overflow-hidden"
          style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
          <span className="relative flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar Atendimento
          </span>
        </button>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <p className="text-sm font-semibold text-white">Novo Atendimento</p>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form action={action} className="p-4 space-y-4">
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-sm text-red-400">
                {state.error}
              </div>
            )}

            {/* Service */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Serviço</label>
              <select
                name="serviceId"
                className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
              >
                <option value="outro">Outro / Não catalogado</option>
                {services.filter((s) => s.isActive).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.price ? ` — R$ ${Number(s.price).toLocaleString("pt-BR")}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom service name */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nome do serviço (se "Outro")</label>
              <input
                name="customService"
                type="text"
                placeholder="Ex: Implante, Clareamento..."
                className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["scheduled", "closed", "not_closed", "follow_up"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === s
                        ? s === "closed" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : s === "not_closed" ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : s === "follow_up" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-[#111111] border-[#333] text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <input type="hidden" name="status" value={status} />
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Valor orçado (R$)</label>
                <input
                  name="valueQuoted"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>
              {status === "closed" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Valor fechado (R$)</label>
                  <input
                    name="valueClosed"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Loss reason (conditional) */}
            {status === "not_closed" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Motivo de não fechamento</label>
                <input
                  name="lostReason"
                  type="text"
                  placeholder="Ex: Preço alto, sem urgência, não compareceu..."
                  className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>
            )}

            {/* Follow-up count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Follow-ups feitos</label>
                <input
                  name="followUpCount"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Data do contato</label>
                <input
                  name="contactDate"
                  type="date"
                  defaultValue={today}
                  className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Origem do contato</label>
              <select
                name="origin"
                className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
              >
                <option value="meta_ads">Meta Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Indicação</option>
                <option value="organic">Orgânico</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Observações (opcional)</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Detalhes adicionais..."
                className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="relative w-full py-3 rounded-xl text-sm font-semibold text-white overflow-hidden disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
            >
              <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
              <span className="relative">{pending ? "Salvando..." : "Salvar Atendimento"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Services Manager ─────────────────────────────────────────────────────────

function ServicesManager({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addServiceAction, {});

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors w-full"
      >
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Gerenciar Meus Serviços
        <span className="ml-auto text-xs text-gray-700">{services.length} cadastrado{services.length !== 1 ? "s" : ""}</span>
      </button>

      {open && (
        <div className="mt-3 bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
          {/* Service list */}
          {services.length > 0 && (
            <div className="divide-y divide-[#222]">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className={`text-sm font-medium ${s.isActive ? "text-gray-300" : "text-gray-600 line-through"}`}>
                      {s.name}
                    </p>
                    {s.price && (
                      <p className="text-xs text-gray-600">R$ {Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={() => toggleServiceAction(s.id, !s.isActive)}>
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          s.isActive
                            ? "text-gray-500 hover:text-amber-400"
                            : "text-emerald-600 hover:text-emerald-400"
                        }`}
                      >
                        {s.isActive ? "Ocultar" : "Ativar"}
                      </button>
                    </form>
                    <form action={() => deleteServiceAction(s.id)}>
                      <button type="submit" className="text-xs text-gray-700 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add service form */}
          <div className="border-t border-[#262626] p-4">
            <p className="text-xs text-gray-600 mb-3">Adicionar serviço</p>
            {state.error && <p className="text-xs text-red-400 mb-2">{state.error}</p>}
            <form action={action} className="space-y-2">
              <input
                name="name"
                type="text"
                placeholder="Nome do serviço *"
                required
                className="w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="description"
                  type="text"
                  placeholder="Descrição (opcional)"
                  className="bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Preço (R$)"
                  className="bg-[#111111] border border-[#333] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full py-2 rounded-xl text-sm font-medium text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors disabled:opacity-60"
              >
                {pending ? "Adicionando..." : "+ Adicionar Serviço"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Attendance list ──────────────────────────────────────────────────────────

function AttendanceList({
  attendances,
  periods,
}: {
  attendances: AttendanceEntry[];
  periods: string[];
}) {
  const [period, setPeriod] = useState(periods[0]);

  const filtered = attendances.filter((a) => a.period === period);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Registros</p>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-violet-500"
        >
          {periods.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-600">Nenhum registro em {period}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.id} className="bg-[#1a1a1a] border border-[#262626] rounded-2xl px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    <span className="text-xs text-gray-600">{ORIGIN_LABELS[a.origin]}</span>
                  </div>

                  <p className="text-sm text-gray-300 font-medium mt-1.5">
                    {a.service?.name ?? (a.notes?.startsWith("Serviço:") ? a.notes.split("|")[0].replace("Serviço:", "").trim() : "Serviço não especificado")}
                  </p>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {a.valueQuoted && (
                      <span className="text-xs text-gray-500">Orçado: {fmtR(a.valueQuoted)}</span>
                    )}
                    {a.valueClosed && (
                      <span className="text-xs text-emerald-400 font-medium">Fechado: {fmtR(a.valueClosed)}</span>
                    )}
                    {a.followUpCount > 0 && (
                      <span className="text-xs text-amber-400">{a.followUpCount} follow-up{a.followUpCount > 1 ? "s" : ""}</span>
                    )}
                  </div>

                  {a.lostReason && (
                    <p className="text-xs text-red-400/70 mt-1">Motivo: {a.lostReason}</p>
                  )}

                  <p className="text-xs text-gray-700 mt-1">
                    {new Date(a.contactDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <form action={() => deleteAttendanceAction(a.id)}>
                  <button type="submit" className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AttendanceClient({ services, attendances, currentPeriod, periods }: Props) {
  return (
    <div>
      <AddAttendanceForm services={services} />
      <AttendanceList attendances={attendances} periods={periods} />
      <ServicesManager services={services} />
    </div>
  );
}
