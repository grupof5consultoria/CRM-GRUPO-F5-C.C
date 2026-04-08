"use client";

import { useState } from "react";
import { ClientCredentialsForm } from "./ClientCredentialsForm";
import { PortalAccessCard } from "./PortalAccessCard";
import { UpdateHealthForm } from "./UpdateHealthForm";
import type { ClientHealth } from "@prisma/client";

const HEALTH_LABELS: Record<string, string> = {
  thriving: "Excelente",
  stable: "Estável",
  attention: "Atenção",
  at_risk: "Em risco",
};
const HEALTH_COLORS: Record<string, string> = {
  thriving: "text-emerald-400",
  stable: "text-blue-400",
  attention: "text-amber-400",
  at_risk: "text-red-400",
};
const HEALTH_DOT: Record<string, string> = {
  thriving: "bg-emerald-400",
  stable: "bg-blue-400",
  attention: "bg-amber-400",
  at_risk: "bg-red-400",
};

interface HealthLog {
  id: string;
  health: ClientHealth;
  note: string | null;
  createdAt: Date;
}

interface PortalUser {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; role: string; isActive: boolean };
}

interface Props {
  clientId: string;
  portalUrl: string;
  // Plataformas
  metaAdAccountId: string | null;
  googleAdsCustomerId: string | null;
  metaSuccess?: boolean;
  metaError?: string;
  // Informações
  ownerName: string;
  monthlyValue: { toString(): string } | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  startDate: Date | null;
  createdAt: Date;
  notes: string | null;
  // Saúde
  health: ClientHealth;
  healthNote: string | null;
  healthLogs: HealthLog[];
  // Portal
  portalUsers: PortalUser[];
}

const TABS = [
  { key: "plataformas", label: "Plataformas" },
  { key: "portal",      label: "Portal" },
  { key: "info",        label: "Informações" },
  { key: "saude",       label: "Saúde" },
] as const;

type TabKey = typeof TABS[number]["key"];

export function ClientSidebar({
  clientId, portalUrl,
  metaAdAccountId, googleAdsCustomerId, metaSuccess, metaError,
  ownerName, monthlyValue, document, email, phone, startDate, createdAt, notes,
  health, healthNote, healthLogs,
  portalUsers,
}: Props) {
  const [tab, setTab] = useState<TabKey>("plataformas");

  // Compute time as client
  let timeStr = "";
  if (startDate) {
    const now = new Date();
    const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const rem = months % 12;
    timeStr = years > 0
      ? `${years} ano${years > 1 ? "s" : ""}${rem > 0 ? ` e ${rem} mês${rem > 1 ? "es" : ""}` : ""}`
      : `${months} mês${months !== 1 ? "es" : ""}`;
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#262626]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              tab === t.key
                ? "text-white border-b-2 border-violet-500 bg-violet-500/5"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">

        {/* ── Plataformas ── */}
        {tab === "plataformas" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              {metaAdAccountId && (
                <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Meta configurado
                </span>
              )}
              {googleAdsCustomerId && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Google configurado
                </span>
              )}
              {!metaAdAccountId && !googleAdsCustomerId && (
                <p className="text-xs text-gray-600">Nenhuma plataforma configurada</p>
              )}
            </div>
            <ClientCredentialsForm
              clientId={clientId}
              metaAdAccountId={metaAdAccountId}
              googleAdsCustomerId={googleAdsCustomerId}
              hasMeta={!!metaAdAccountId}
              hasGoogle={!!googleAdsCustomerId}
              metaSuccess={metaSuccess}
              metaError={metaError}
            />
          </div>
        )}

        {/* ── Portal ── */}
        {tab === "portal" && (
          <PortalAccessCard
            clientId={clientId}
            portalUsers={portalUsers}
            portalUrl={portalUrl}
          />
        )}

        {/* ── Informações ── */}
        {tab === "info" && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[#262626]">
              <span className="text-xs text-gray-500">Responsável</span>
              <span className="text-gray-200 font-medium">{ownerName}</span>
            </div>

            {monthlyValue != null && (
              <div className="bg-emerald-500/10 rounded-xl px-3 py-3">
                <p className="text-emerald-400 text-xs font-medium mb-0.5">Valor Mensal</p>
                <p className="text-emerald-300 text-2xl font-bold">
                  R$ {Number(monthlyValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {startDate && (
              <div className="bg-violet-500/10 rounded-xl px-3 py-3">
                <p className="text-violet-400 text-xs font-medium mb-0.5">Tempo de cliente</p>
                <p className="text-violet-300 font-bold">{timeStr}</p>
                <p className="text-violet-400/70 text-xs mt-0.5">desde {new Date(startDate).toLocaleDateString("pt-BR")}</p>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              {document && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">CPF / CNPJ</span>
                  <span className="text-gray-300 text-xs">{document}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 flex-shrink-0">Email</span>
                  <span className="text-gray-300 text-xs truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Telefone</span>
                  <span className="text-gray-300 text-xs">{phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Cadastrado em</span>
                <span className="text-gray-300 text-xs">{new Date(createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            {notes && (
              <div className="bg-[#111111] rounded-xl px-3 py-2.5 mt-2">
                <p className="text-xs text-gray-500 mb-1">Observações</p>
                <p className="text-xs text-gray-400 leading-relaxed">{notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Saúde ── */}
        {tab === "saude" && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 bg-[#111111] rounded-xl px-3 py-2.5`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${HEALTH_DOT[health]}`} />
              <span className={`text-sm font-semibold ${HEALTH_COLORS[health]}`}>{HEALTH_LABELS[health]}</span>
            </div>

            {healthNote && (
              <p className="text-xs text-gray-500 bg-[#111111] rounded-xl px-3 py-2">{healthNote}</p>
            )}

            <UpdateHealthForm clientId={clientId} currentHealth={health} />

            {healthLogs.length > 0 && (
              <div className="border-t border-[#262626] pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Histórico</p>
                {healthLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 font-bold flex-shrink-0 ${HEALTH_COLORS[log.health]}`}>●</span>
                    <div>
                      <span className="font-medium text-gray-300">{HEALTH_LABELS[log.health]}</span>
                      {log.note && <span className="text-gray-500"> — {log.note}</span>}
                      <p className="text-gray-600 mt-0.5">{new Date(log.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
