"use client";

import { useState, useTransition } from "react";
import { LandingPagePanel } from "./LandingPagePanel";
import { createLandingPageAction } from "./actions";

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  status: string;
  assignedTo?: string | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  comment?: string | null;
}

interface Project {
  id: string;
  clientId: string;
  companyName: string;
  services?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  references?: string | null;
  domain?: string | null;
  hasDomain: boolean;
  businessHours?: string | null;
  businessDays: string[];
  wantsBlog: boolean;
  purpose?: string | null;
  progress: number;
  phases: Phase[];
}

interface Props {
  client: { id: string; name: string };
  project: Project | null;
}

const STATUS_DOT: Record<string, string> = {
  not_started:    "bg-gray-600",
  in_progress:    "bg-amber-400",
  done:           "bg-emerald-500",
  waiting_client: "bg-blue-400",
};

export function LandingPageClientCard({ client, project }: Props) {
  const [open, setOpen]     = useState(false);
  const [pending, startTransition] = useTransition();

  if (!project) {
    return (
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{client.name}</p>
        <button
          disabled={pending}
          onClick={() => startTransition(() => createLandingPageAction(client.id, client.name))}
          className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
        >
          {pending ? "Criando..." : "Criar projeto"}
        </button>
      </div>
    );
  }

  const pct     = project.progress;
  const allDone = pct === 100;
  const phases  = project.phases;
  const inProg  = phases.filter(p => p.status === "in_progress").length;

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all ${
      allDone ? "border-emerald-500/20" : inProg > 0 ? "border-violet-500/20" : "border-[#262626]"
    }`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#1f1f1f] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-200">{client.name}</p>
            {project.companyName !== client.name && (
              <span className="text-xs text-gray-600">{project.companyName}</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#262626] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-violet-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${allDone ? "text-emerald-400" : "text-gray-500"}`}>
              {pct}%
            </span>
          </div>

          {/* Phase summary when collapsed */}
          {!open && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {phases.map(phase => (
                <span key={phase.id} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[phase.status] ?? "bg-gray-600"}`} />
                  <span className={phase.status === "done" ? "text-gray-600 line-through" : "text-gray-400"}>
                    {phase.phaseNumber}. {phase.title}
                  </span>
                </span>
              ))}
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
          <LandingPagePanel project={project} />
        </div>
      )}
    </div>
  );
}
