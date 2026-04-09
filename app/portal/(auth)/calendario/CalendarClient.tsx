"use client";

import { useState } from "react";

interface Appointment {
  id: string;
  leadName: string | null;
  leadPhone: string | null;
  scheduledAt: Date;
  valueQuoted: { toString(): string } | null;
  valueClosed: { toString(): string } | null;
  status: string;
  service: { name: string } | null;
  notes: string | null;
}

interface Props {
  appointments: Appointment[];
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  closed: "Fechou",
  not_closed: "Não fechou",
  follow_up: "Em follow-up",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  closed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  not_closed: "text-red-400 bg-red-400/10 border-red-400/20",
  follow_up: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const DOT_COLORS: Record<string, string> = {
  scheduled: "bg-blue-400",
  closed: "bg-emerald-400",
  not_closed: "bg-red-400",
  follow_up: "bg-amber-400",
};

function fmtR(v: { toString(): string } | null | undefined) {
  if (!v) return null;
  return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarClient({ appointments }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group appointments by day for this month/year
  const apptByDay: Record<number, Appointment[]> = {};
  for (const a of appointments) {
    const d = new Date(a.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!apptByDay[day]) apptByDay[day] = [];
      apptByDay[day].push(a);
    }
  }

  // Selected day appointments
  const selectedAppts = selectedDay ? (apptByDay[selectedDay] ?? []) : [];

  // Build grid cells (nulls for padding before first day)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-4">
      {/* Calendar card */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#262626] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-white">
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#262626] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-[#262626]">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const hasAppts = !!apptByDay[day];
            const appts = apptByDay[day] ?? [];
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-xl transition-all min-h-[44px] ${
                  isSelected
                    ? "bg-violet-600/30 border border-violet-500/40"
                    : isToday(day)
                    ? "bg-[#222] border border-violet-500/30"
                    : "hover:bg-[#222] border border-transparent"
                }`}
              >
                <span className={`text-xs font-medium ${
                  isSelected ? "text-violet-300" : isToday(day) ? "text-violet-400" : "text-gray-400"
                }`}>
                  {day}
                </span>
                {hasAppts && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {appts.slice(0, 3).map((a, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[a.status] ?? "bg-gray-500"}`} />
                    ))}
                    {appts.length > 3 && <span className="text-[8px] text-gray-600">+{appts.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 border-t border-[#262626] flex items-center gap-3 flex-wrap">
          {Object.entries(DOT_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-gray-600">{STATUS_LABELS[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day appointments */}
      {selectedDay !== null && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
            {selectedDay} de {MONTH_NAMES[month]}
            {selectedAppts.length > 0
              ? ` — ${selectedAppts.length} agendamento${selectedAppts.length > 1 ? "s" : ""}`
              : " — nenhum agendamento"}
          </p>

          {selectedAppts.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600">Nenhum agendamento neste dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedAppts
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((a) => {
                  const serviceName = a.service?.name
                    ?? (a.notes?.startsWith("Serviço:") ? a.notes.split("|")[0].replace("Serviço:", "").trim() : null);

                  return (
                    <div key={a.id} className="bg-[#1a1a1a] border border-[#262626] rounded-2xl px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Time + status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-bold text-blue-400">{fmtTime(a.scheduledAt)}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${STATUS_COLORS[a.status]}`}>
                              {STATUS_LABELS[a.status]}
                            </span>
                          </div>

                          {/* Lead */}
                          {(a.leadName || a.leadPhone) && (
                            <p className="text-sm font-semibold text-white mt-1.5">
                              {a.leadName ?? a.leadPhone}
                              {a.leadName && a.leadPhone && (
                                <span className="text-xs text-gray-600 font-normal ml-2">{a.leadPhone}</span>
                              )}
                            </p>
                          )}

                          {/* Service */}
                          {serviceName && (
                            <p className="text-sm text-gray-400 mt-0.5">{serviceName}</p>
                          )}

                          {/* Values */}
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {a.valueQuoted && (
                              <span className="text-xs text-gray-500">Orçado: {fmtR(a.valueQuoted)}</span>
                            )}
                            {a.valueClosed && (
                              <span className="text-xs text-emerald-400 font-semibold">Fechado: {fmtR(a.valueClosed)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* No appointments this month */}
      {Object.keys(apptByDay).length === 0 && selectedDay === null && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-600">Nenhum agendamento em {MONTH_NAMES[month]}.</p>
          <p className="text-xs text-gray-700 mt-1">Registre um atendimento com status "Agendado" para ver aqui.</p>
        </div>
      )}
    </div>
  );
}
