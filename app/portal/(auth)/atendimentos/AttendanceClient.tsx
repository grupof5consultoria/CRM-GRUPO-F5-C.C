"use client";

import { useState, useActionState } from "react";
import { addAttendanceAction, updateAttendanceAction, deleteAttendanceAction, recordPaymentAction, markNoShowAction, rescheduleAttendanceAction } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  closed: "Fechou",
  not_closed: "Não fechou",
  follow_up: "Em follow-up",
  no_show: "Não compareceu",
  rescheduled: "Reagendou",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "text-blue-400 bg-blue-400/10",
  closed: "text-emerald-400 bg-emerald-400/10",
  not_closed: "text-red-400 bg-red-400/10",
  follow_up: "text-amber-400 bg-amber-400/10",
  no_show: "text-orange-400 bg-orange-400/10",
  rescheduled: "text-sky-400 bg-sky-400/10",
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  credit_card: "Cartão de crédito",
};

const ORIGIN_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  instagram: "Instagram (orgânico)",
  google_organic: "Google (orgânico)",
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
  leadName: string | null;
  leadPhone: string | null;
  scheduledAt: Date | null;
  valueQuoted: { toString(): string } | null;
  valueClosed: { toString(): string } | null;
  status: string;
  lostReason: string | null;
  followUpCount: number;
  origin: string;
  contactDate: Date;
  period: string;
  notes: string | null;
  paymentMethod: string | null;
  paymentInstallments: number | null;
}

interface LeadEntry {
  id: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  origin: string;
  source: string | null;
  city: string | null;
  state: string | null;
  device: string | null;
  campaignType: string | null;
  status: string;
  createdAt: Date;
}

interface Props {
  services: Service[];
  attendances: AttendanceEntry[];
  leads: LeadEntry[];
  currentPeriod: string;
  periods: string[];
}

function fmtR(v: { toString(): string } | null | undefined) {
  if (!v) return null;
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

function fmtDateTime(d: Date | null) {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const inputCls = "w-full bg-[#111111] border border-[#333] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-violet-500";

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
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-sm text-red-400">{state.error}</div>
            )}

            {/* Lead info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nome do lead</label>
                <input name="leadName" type="text" placeholder="Ex: Maria Silva" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Telefone do lead</label>
                <input name="leadPhone" type="tel" placeholder="(11) 99999-9999" className={inputCls} />
              </div>
            </div>

            {/* Service */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Serviço</label>
              <select name="serviceId" className={inputCls}>
                <option value="outro">Outro / Não catalogado</option>
                {services.filter((s) => s.isActive).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.price ? ` — R$ ${Number(s.price).toLocaleString("pt-BR")}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nome do serviço (se "Outro")</label>
              <input name="customService" type="text" placeholder="Ex: Implante, Clareamento..." className={inputCls} />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["scheduled", "closed", "not_closed", "follow_up"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === s
                        ? s === "closed" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : s === "not_closed" ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : s === "follow_up" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-[#111111] border-[#333] text-gray-500"
                    }`}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <input type="hidden" name="status" value={status} />
            </div>

            {/* Scheduled date + time */}
            {status === "scheduled" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Data do agendamento</label>
                  <input name="scheduledDate" type="date" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Horário</label>
                  <input name="scheduledTime" type="time" className={inputCls} />
                </div>
              </div>
            )}

            {/* Values */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Valor orçado (R$)</label>
                <input name="valueQuoted" type="number" step="0.01" min="0" placeholder="0,00" className={inputCls} />
              </div>
              {status === "closed" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Valor fechado (R$)</label>
                  <input name="valueClosed" type="number" step="0.01" min="0" placeholder="0,00" className={inputCls} />
                </div>
              )}
            </div>

            {status === "not_closed" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Motivo de não fechamento</label>
                <input name="lostReason" type="text" placeholder="Ex: Preço alto, sem urgência..." className={inputCls} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Follow-ups feitos</label>
                <input name="followUpCount" type="number" min="0" defaultValue="0" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Data do contato</label>
                <input name="contactDate" type="date" defaultValue={today} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Origem do contato</label>
              <select name="origin" className={inputCls}>
                <option value="meta_ads">Meta Ads (anúncio)</option>
                <option value="google_ads">Google Ads (anúncio)</option>
                <option value="instagram">Instagram (orgânico)</option>
                <option value="google_organic">Google (orgânico)</option>
                <option value="referral">Indicação</option>
                <option value="organic">Orgânico (outros)</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Observações (opcional)</label>
              <textarea name="notes" rows={2} placeholder="Detalhes adicionais..." className={inputCls + " resize-none"} />
            </div>

            <button type="submit" disabled={pending}
              className="relative w-full py-3 rounded-xl text-sm font-semibold text-white overflow-hidden disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}>
              <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
              <span className="relative">{pending ? "Salvando..." : "Salvar Atendimento"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Edit Attendance Form ─────────────────────────────────────────────────────

function EditAttendanceForm({ a, onClose }: { a: AttendanceEntry; onClose: () => void }) {
  const [status, setStatus] = useState(a.status);
  const [state, action, pending] = useActionState(updateAttendanceAction, {});

  if (state.success) { onClose(); return null; }

  const scheduledDate = a.scheduledAt ? new Date(a.scheduledAt).toISOString().split("T")[0] : "";
  const scheduledTime = a.scheduledAt
    ? new Date(a.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", ":")
    : "";

  return (
    <div className="border-t border-[#262626] bg-[#111] px-4 py-4">
      <p className="text-xs font-semibold text-gray-400 mb-3">Editar acompanhamento</p>
      {state.error && <p className="text-xs text-red-400 mb-3">{state.error}</p>}

      <form action={action} className="space-y-3">
        <input type="hidden" name="attendanceId" value={a.id} />

        {/* Lead info */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nome do lead</label>
            <input name="leadName" type="text" defaultValue={a.leadName ?? ""} placeholder="Nome" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Telefone</label>
            <input name="leadPhone" type="tel" defaultValue={a.leadPhone ?? ""} placeholder="(11) 99999-9999" className={inputCls} />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1.5">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(["scheduled", "closed", "not_closed", "follow_up"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  status === s
                    ? s === "closed" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : s === "not_closed" ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : s === "follow_up" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : "bg-[#1a1a1a] border-[#333] text-gray-500"
                }`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <input type="hidden" name="status" value={status} />
        </div>

        {/* Scheduled date + time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Data agendamento</label>
            <input name="scheduledDate" type="date" defaultValue={scheduledDate} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Horário</label>
            <input name="scheduledTime" type="time" defaultValue={scheduledTime} className={inputCls} />
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Valor orçado</label>
            <input name="valueQuoted" type="number" step="0.01" min="0"
              defaultValue={a.valueQuoted ? Number(a.valueQuoted) : ""}
              placeholder="0,00" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Valor fechado</label>
            <input name="valueClosed" type="number" step="0.01" min="0"
              defaultValue={a.valueClosed ? Number(a.valueClosed) : ""}
              placeholder="0,00" className={inputCls} />
          </div>
        </div>

        {/* Lost reason */}
        {status === "not_closed" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Motivo da perda</label>
            <input name="lostReason" type="text" defaultValue={a.lostReason ?? ""}
              placeholder="Ex: Preço alto, sem urgência..." className={inputCls} />
          </div>
        )}

        {/* Follow-up count */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Quantidade de follow-ups</label>
          <input name="followUpCount" type="number" min="0" defaultValue={a.followUpCount} className={inputCls} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Observações</label>
          <textarea name="notes" rows={2} defaultValue={a.notes ?? ""}
            placeholder="Detalhes adicionais..." className={inputCls + " resize-none"} />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={pending}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors">
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 border border-[#333] transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Payment Form ─────────────────────────────────────────────────────────────

function PaymentForm({ a, onClose }: { a: AttendanceEntry; onClose: () => void }) {
  const [method, setMethod] = useState<"pix" | "cash" | "credit_card">("pix");
  const [state, action, pending] = useActionState(recordPaymentAction, {});

  if (state.success) { onClose(); return null; }

  return (
    <div className="border-t border-[#262626] bg-[#0d0d0d] px-4 py-4">
      <p className="text-xs font-semibold text-emerald-400 mb-3">Registrar pagamento</p>
      {state.error && <p className="text-xs text-red-400 mb-2">{state.error}</p>}
      <form action={action} className="space-y-3">
        <input type="hidden" name="attendanceId" value={a.id} />
        <input type="hidden" name="paymentMethod" value={method} />

        {/* Payment method buttons */}
        <div className="grid grid-cols-3 gap-2">
          {(["pix", "cash", "credit_card"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                method === m
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-[#1a1a1a] border-[#333] text-gray-500"
              }`}
            >
              {m === "pix" ? "PIX" : m === "cash" ? "Dinheiro" : "Cartão"}
            </button>
          ))}
        </div>

        {/* Installments — only for credit card */}
        {method === "credit_card" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Parcelas</label>
            <select name="paymentInstallments" className={inputCls} defaultValue="1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x {n === 1 ? "(à vista)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Optional: confirm/override value */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Valor recebido (R$)</label>
          <input
            name="valueClosed"
            type="number"
            step="0.01"
            min="0"
            defaultValue={a.valueQuoted ? Number(a.valueQuoted) : ""}
            placeholder="0,00"
            className={inputCls}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {pending ? "Salvando..." : "Confirmar pagamento"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 border border-[#333] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Reschedule Form ──────────────────────────────────────────────────────────

function RescheduleForm({ a, onClose }: { a: AttendanceEntry; onClose: () => void }) {
  const [state, action, pending] = useActionState(rescheduleAttendanceAction, {});
  if (state.success) { onClose(); return null; }

  const currentDate = a.scheduledAt ? new Date(a.scheduledAt).toISOString().split("T")[0] : "";
  const currentTime = a.scheduledAt
    ? new Date(a.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="border-t border-[#262626] bg-[#0d0d0d] px-4 py-4">
      <p className="text-xs font-semibold text-sky-400 mb-3">Nova data de agendamento</p>
      {state.error && <p className="text-xs text-red-400 mb-2">{state.error}</p>}
      <form action={action} className="space-y-3">
        <input type="hidden" name="attendanceId" value={a.id} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nova data</label>
            <input
              name="scheduledDate"
              type="date"
              defaultValue={currentDate}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Horário</label>
            <input
              name="scheduledTime"
              type="time"
              defaultValue={currentTime}
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {pending ? "Salvando..." : "Confirmar nova data"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 border border-[#333] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Attendance Card ──────────────────────────────────────────────────────────

function AttendanceCard({ a }: { a: AttendanceEntry }) {
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const serviceName = a.service?.name
    ?? (a.notes?.startsWith("Serviço:") ? a.notes.split("|")[0].replace("Serviço:", "").trim() : null);

  // Show quick-action bar for scheduled AND rescheduled
  const isScheduled = a.status === "scheduled" || a.status === "rescheduled";

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Status + origin */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[a.status]}`}>
                {STATUS_LABELS[a.status]}
              </span>
              <span className="text-xs text-gray-600">{ORIGIN_LABELS[a.origin] ?? a.origin}</span>
            </div>

            {/* Lead name + phone */}
            {(a.leadName || a.leadPhone) && (
              <p className="text-sm font-semibold text-white mt-1.5">
                {a.leadName ?? a.leadPhone}
                {a.leadName && a.leadPhone && <span className="text-xs text-gray-600 font-normal ml-2">{a.leadPhone}</span>}
              </p>
            )}

            {/* Service */}
            {serviceName && (
              <p className="text-sm text-gray-400 mt-0.5">{serviceName}</p>
            )}

            {/* Scheduled date */}
            {a.scheduledAt && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-blue-400 font-medium">{fmtDateTime(a.scheduledAt)}</span>
              </div>
            )}

            {/* Values */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {a.valueQuoted && <span className="text-xs text-gray-500">Orçado: {fmtR(a.valueQuoted)}</span>}
              {a.valueClosed && <span className="text-xs text-emerald-400 font-medium">Fechado: {fmtR(a.valueClosed)}</span>}
              {a.followUpCount > 0 && (
                <span className="text-xs text-amber-400">{a.followUpCount} follow-up{a.followUpCount > 1 ? "s" : ""}</span>
              )}
            </div>

            {/* Payment info */}
            {a.paymentMethod && (
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs text-emerald-400">
                  {PAYMENT_LABELS[a.paymentMethod]}
                  {a.paymentMethod === "credit_card" && a.paymentInstallments
                    ? ` — ${a.paymentInstallments}x`
                    : ""}
                </span>
              </div>
            )}

            {a.lostReason && <p className="text-xs text-red-400/70 mt-1">Motivo: {a.lostReason}</p>}

            <p className="text-xs text-gray-700 mt-1">
              Contato: {new Date(a.contactDate).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { setEditing(!editing); setPaying(false); setRescheduling(false); }}
              className={`p-1.5 rounded-lg transition-colors ${editing ? "text-violet-400 bg-violet-400/10" : "text-gray-600 hover:text-violet-400 hover:bg-violet-400/10"}`}
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <form action={() => deleteAttendanceAction(a.id)}>
              <button type="submit" className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Excluir">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Quick-action bar for scheduled / rescheduled */}
        {isScheduled && !editing && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#262626]">
            <button
              onClick={() => { setPaying(!paying); setRescheduling(false); setEditing(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                paying
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagou
            </button>
            <form action={() => markNoShowAction(a.id)} className="flex-1">
              <button
                type="submit"
                onClick={() => { setPaying(false); setRescheduling(false); }}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
              >
                Não compareceu
              </button>
            </form>
            <button
              onClick={() => { setRescheduling(!rescheduling); setPaying(false); setEditing(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                rescheduling
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-300"
                  : "bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20"
              }`}
            >
              Outra data
            </button>
          </div>
        )}
      </div>

      {paying && !editing && !rescheduling && <PaymentForm a={a} onClose={() => setPaying(false)} />}
      {rescheduling && !editing && !paying && <RescheduleForm a={a} onClose={() => setRescheduling(false)} />}
      {editing && <EditAttendanceForm a={a} onClose={() => setEditing(false)} />}
    </div>
  );
}

// ─── Attendance list ──────────────────────────────────────────────────────────

function AttendanceList({ attendances, periods }: { attendances: AttendanceEntry[]; periods: string[] }) {
  const [period, setPeriod] = useState(periods[0]);
  const filtered = attendances.filter((a) => a.period === period);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Registros</p>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-violet-500">
          {periods.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-600">Nenhum registro em {period}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => <AttendanceCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}

// ─── Origin config ────────────────────────────────────────────────────────────

const ORIGIN_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  meta_ads:       { label: "Meta Ads",          color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",    icon: "📘" },
  google_ads:     { label: "Google Ads",         color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20", icon: "🔍" },
  instagram:      { label: "Instagram",          color: "text-pink-400",   bg: "bg-pink-400/10 border-pink-400/20",    icon: "📸" },
  google_organic: { label: "Google Orgânico",    color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",  icon: "🌿" },
  referral:       { label: "Indicação",          color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20",icon: "🤝" },
  organic:        { label: "Orgânico",           color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20",icon: "✨" },
  other:          { label: "Outro",              color: "text-gray-400",   bg: "bg-gray-400/10 border-gray-400/20",    icon: "💬" },
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  frio:        "Lead Frio",
  remarketing: "Remarketing",
  organico:    "Orgânico",
};

const DEVICE_LABELS: Record<string, string> = {
  mobile:  "📱 Celular",
  tablet:  "📟 Tablet",
  desktop: "🖥️ Desktop",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const min  = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (min < 1)   return "agora";
  if (min < 60)  return `${min}min atrás`;
  if (hrs < 24)  return `${hrs}h atrás`;
  if (days < 7)  return `${days}d atrás`;
  return new Date(date).toLocaleDateString("pt-BR");
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead }: { lead: LeadEntry }) {
  const cfg = ORIGIN_CONFIG[lead.origin] ?? ORIGIN_CONFIG.other;
  const initials = lead.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[#262626] flex items-center justify-center">
          {lead.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.photoUrl} alt={lead.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-gray-400">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
            <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(lead.createdAt)}</span>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>

          {/* Origin badge + campaign type */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            {lead.campaignType && (
              <span className="text-xs text-gray-600 bg-[#262626] px-2 py-0.5 rounded-lg">
                {CAMPAIGN_TYPE_LABELS[lead.campaignType] ?? lead.campaignType}
              </span>
            )}
          </div>

          {/* City + device */}
          {(lead.city || lead.device) && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {lead.city && (
                <span className="text-xs text-gray-600">
                  📍 {lead.city}{lead.state ? `, ${lead.state}` : ""}
                </span>
              )}
              {lead.device && (
                <span className="text-xs text-gray-600">
                  {DEVICE_LABELS[lead.device] ?? lead.device}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp quick link */}
      <div className="px-4 pb-3">
        <a
          href={`https://wa.me/${(lead.phone ?? "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.529 5.855L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.741-.516-5.299-1.415l-.38-.224-3.762.892.952-3.655-.247-.397A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Abrir no WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─── Leads list ───────────────────────────────────────────────────────────────

function LeadsList({ leads }: { leads: LeadEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? leads : leads.slice(0, 5);

  if (leads.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Leads Recebidos</p>
          <span className="text-xs font-bold text-white bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/30">
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-gray-600">via WhatsApp</p>
      </div>

      {/* Info bar */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-500">
          Leads capturados pelo rastreamento. Registre o atendimento manualmente ao fazer o contato.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {visible.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
      </div>

      {leads.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 border border-[#262626] hover:border-[#333] transition-colors"
        >
          {expanded ? "Ver menos" : `Ver mais ${leads.length - 5} leads`}
        </button>
      )}

      <div className="h-px bg-[#262626] my-5" />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AttendanceClient({ services, attendances, leads, currentPeriod, periods }: Props) {
  return (
    <div>
      <AddAttendanceForm services={services} />
      <LeadsList leads={leads} />
      <AttendanceList attendances={attendances} periods={periods} />
    </div>
  );
}
