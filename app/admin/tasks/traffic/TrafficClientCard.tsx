"use client";

import { useState } from "react";
import Link from "next/link";
import { TrafficPanel } from "@/app/admin/clients/[id]/TrafficPanel";

interface Task {
  id: string;
  type: string;
  title: string;
  frequency?: string | null;
  assignedTo?: string | null;
  status: string;
  comment?: string | null;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
}

interface Props {
  client: { id: string; name: string };
  platforms: string[];
  settings: {
    platforms: string[];
    caMeta?: string | null;
    caGoogle?: string | null;
    dailyBudget?: number | null;
    monthlyBudget?: number | null;
    driveLink?: string | null;
  } | null;
  tasks: Task[];
  optimizations: {
    id: string; date: string; platform: string;
    campaignName?: string | null; description?: string | null;
    frequencyType?: string | null; assignedTo?: string | null; comment?: string | null;
  }[];
  audiences: {
    id: string; audienceType: string; name: string; windowDays?: number | null;
    assignedTo?: string | null; comment?: string | null; lastUpdated?: Date | string | null;
  }[];
  instagram: {
    id: string; weekReference: string; postedDaily?: string | null;
    postedWeekly?: boolean | null; assignedTo?: string | null; comment?: string | null;
  }[];
}

const FREQ_LABELS: Record<string, string> = {
  daily: "Diária", weekly: "Semanal", monthly: "Mensal",
};

function dueDateLabel(dueDate: Date | string | null | undefined): string {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0)   return `Atrasada ${Math.abs(diff)}d`;
  if (diff === 0)  return "Hoje";
  if (diff === 1)  return "Amanhã";
  if (diff <= 7)   return `Em ${diff}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function TrafficClientCard({ client, platforms, settings, tasks, optimizations, audiences, instagram }: Props) {
  const [open, setOpen] = useState(false);

  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === "done").length;
  const pending  = tasks.filter(t => t.status === "pending");
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const allGood  = pending.length === 0 && total > 0;
  const hasOverdue = pending.some(t => t.dueDate && new Date(t.dueDate as string) < new Date());

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all ${
      hasOverdue ? "border-red-500/30" : allGood ? "border-emerald-500/20" : "border-[#262626]"
    }`}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#1f1f1f] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-200">{client.name}</p>
            {platforms.map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400">
                {p === "meta_ads" ? "Meta" : "Google"}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct === 100 ? "bg-emerald-500" : hasOverdue ? "bg-red-500" : "bg-violet-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ${
                pct === 100 ? "text-emerald-400" : hasOverdue ? "text-red-400" : "text-gray-500"
              }`}>
                {done}/{total}
              </span>
            </div>
          )}

          {/* Task summary when collapsed */}
          {!open && total > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {tasks.slice(0, 6).map(task => {
                const isDone = task.status === "done";
                const isOverdue = !isDone && task.dueDate && new Date(task.dueDate as string) < new Date();
                const label = dueDateLabel(task.dueDate);
                return (
                  <span key={task.id} className="flex items-center gap-1.5 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isDone ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-amber-400"
                    }`} />
                    <span className={isDone ? "text-gray-600 line-through" : "text-gray-400"}>{task.title}</span>
                    {label && !isDone && (
                      <span className={`${isOverdue ? "text-red-400" : label === "Hoje" ? "text-sky-400" : "text-gray-600"}`}>
                        · {label}
                      </span>
                    )}
                  </span>
                );
              })}
              {tasks.length > 6 && <span className="text-xs text-gray-600">+{tasks.length - 6} mais</span>}
            </div>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Full panel when expanded */}
      {open && (
        <div className="border-t border-[#262626] p-5">
          <TrafficPanel
            clientId={client.id}
            settings={settings}
            tasks={tasks}
            optimizations={optimizations}
            audiences={audiences}
            instagram={instagram}
          />
        </div>
      )}
    </div>
  );
}
