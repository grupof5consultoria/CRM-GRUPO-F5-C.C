"use client";

import { useState, useTransition } from "react";
import { createProcessAction, deleteProcessAction } from "./actions";

type Process = {
  id: string; role: string; title: string; description: string;
  frequency: string; tool: string | null; order: number; createdAt: Date;
};

const ROLES: { key: string; label: string; color: string; icon: string }[] = [
  { key: "sdr",             label: "SDR",                color: "violet",  icon: "📞" },
  { key: "closer",          label: "Closer",             color: "amber",   icon: "🤝" },
  { key: "cs",              label: "Customer Success",   color: "emerald", icon: "⭐" },
  { key: "traffic_manager", label: "Gestor de Tráfego",  color: "blue",    icon: "📊" },
  { key: "manager",         label: "Gestor / Geral",     color: "pink",    icon: "🎯" },
  { key: "other",           label: "Outros",             color: "gray",    icon: "📋" },
];

const FREQ_OPTIONS = [
  "Diário", "Semanal", "Quinzenal", "Mensal", "Trimestral",
  "Conforme demanda", "A cada novo cliente",
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/20",    text: "text-pink-400",    badge: "bg-pink-500/20 text-pink-300" },
  gray:    { bg: "bg-gray-500/10",    border: "border-gray-500/20",    text: "text-gray-400",    badge: "bg-gray-500/20 text-gray-300" },
};

const FREQ_COLOR: Record<string, string> = {
  "Diário": "text-emerald-400 bg-emerald-500/10",
  "Semanal": "text-blue-400 bg-blue-500/10",
  "Quinzenal": "text-violet-400 bg-violet-500/10",
  "Mensal": "text-amber-400 bg-amber-500/10",
  "Trimestral": "text-orange-400 bg-orange-500/10",
  "Conforme demanda": "text-gray-400 bg-gray-500/10",
  "A cada novo cliente": "text-pink-400 bg-pink-500/10",
};

// Processos padrão embutidos (não salvos no banco, apenas referência)
const DEFAULT_PROCESSES: Record<string, Omit<Process, "id" | "createdAt" | "order">[]> = {
  sdr: [
    { role: "sdr", title: "Qualificação de leads", description: "Verificar e qualificar novos leads recebidos via formulários, WhatsApp e indicações. Registrar no CRM com status inicial.", frequency: "Diário", tool: "CRM Clientes" },
    { role: "sdr", title: "Primeiro contato com lead", description: "Entrar em contato com o lead em até 15 minutos após a chegada. Apresentar a F5 Agência e agendar reunião com o Closer.", frequency: "Diário", tool: "WhatsApp" },
    { role: "sdr", title: "Follow-up de leads frios", description: "Retomar contato com leads que não responderam nos últimos 2-3 dias. Usar abordagem diferente (novo ângulo ou oferta).", frequency: "Diário", tool: "CRM Clientes" },
    { role: "sdr", title: "Atualizar funil no CRM", description: "Manter o kanban atualizado com o status real de cada lead. Nunca deixar lead parado sem etapa registrada.", frequency: "Diário", tool: "CRM Clientes" },
    { role: "sdr", title: "Relatório semanal de SDR", description: "Compilar métricas da semana: leads recebidos, contactados, reuniões agendadas, taxa de conversão SDR→Closer.", frequency: "Semanal", tool: null },
  ],
  closer: [
    { role: "closer", title: "Reunião de diagnóstico", description: "Realizar reunião com o potencial cliente para entender a situação atual, dores e objetivos. Coletar informações para montar proposta.", frequency: "Conforme demanda", tool: "Google Meet" },
    { role: "closer", title: "Montar proposta comercial", description: "Gerar proposta personalizada no sistema (plano START ou SCALE) com base no diagnóstico. Aplicar desconto se a reunião foi presencial.", frequency: "Conforme demanda", tool: "Propostas" },
    { role: "closer", title: "Apresentação e envio da proposta", description: "Apresentar a proposta em reunião dedicada. Enviar link da landing page da proposta ao cliente.", frequency: "Conforme demanda", tool: "Propostas" },
    { role: "closer", title: "Follow-up pós-proposta", description: "Contatar o lead 24h, 48h e 72h após envio da proposta. Tirar dúvidas e conduzir ao fechamento.", frequency: "Conforme demanda", tool: "WhatsApp" },
    { role: "closer", title: "Onboarding após fechamento", description: "Após assinatura do contrato, fazer passagem de bastão para o CS com briefing completo do cliente.", frequency: "Conforme demanda", tool: null },
  ],
  cs: [
    { role: "cs", title: "Onboarding do cliente", description: "Receber briefing do Closer, coletar acessos (Meta Business, Google Ads, GMB), apresentar cronograma de implementação ao cliente.", frequency: "A cada novo cliente", tool: null },
    { role: "cs", title: "Reunião mensal de resultados", description: "Apresentar relatório completo de performance (leads gerados, custo por lead, conversões). Definir otimizações do mês seguinte.", frequency: "Mensal", tool: "Reportei" },
    { role: "cs", title: "Check-in semanal com cliente", description: "Enviar atualização rápida via WhatsApp ou e-mail com as principais métricas da semana e próximas ações.", frequency: "Semanal", tool: "WhatsApp" },
    { role: "cs", title: "Gestão de saúde do cliente", description: "Monitorar satisfação e risco de churn. Registrar NPS e ações de retenção quando necessário.", frequency: "Mensal", tool: "Clientes" },
  ],
  traffic_manager: [
    { role: "traffic_manager", title: "Configuração de campanhas", description: "Criar e configurar campanhas no Meta Ads e Google Ads para novos clientes. Definir segmentação, criativos iniciais e verba.", frequency: "A cada novo cliente", tool: "Meta Ads / Google Ads" },
    { role: "traffic_manager", title: "Otimização diária de campanhas", description: "Analisar performance das campanhas ativas. Pausar anúncios com CPL elevado, escalar os rentáveis, testar novos criativos.", frequency: "Diário", tool: "Meta Ads / Google Ads" },
    { role: "traffic_manager", title: "Relatório semanal de tráfego", description: "Gerar e enviar relatório semanal para cada cliente com métricas de campanhas (impressões, cliques, leads, custo).", frequency: "Semanal", tool: "Reportei" },
  ],
};

function NewProcessModal({ activeRole, onClose, onCreated }: {
  activeRole: string;
  onClose: () => void;
  onCreated: (p: Process) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createProcessAction(fd);
      // optimistic — just reload handled by revalidate
      onCreated({
        id: Math.random().toString(),
        role: fd.get("role") as string,
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        frequency: fd.get("frequency") as string,
        tool: (fd.get("tool") as string) || null,
        order: 99,
        createdAt: new Date(),
      });
      onClose();
    });
  }

  const role = ROLES.find(r => r.key === activeRole)!;
  const colors = COLOR_MAP[role.color];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 w-full max-w-lg">
        <h3 className={`font-bold text-lg mb-1 ${colors.text}`}>Novo Processo — {role.label}</h3>
        <p className="text-gray-600 text-xs mb-5">O processo será salvo e ficará visível para toda a equipe.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="role" value={activeRole} />
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Cargo *</label>
            <select name="role" defaultValue={activeRole} className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500">
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Título do processo *</label>
            <input name="title" required placeholder="Ex: Relatório semanal de performance" className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Descrição *</label>
            <textarea name="description" required rows={3} placeholder="Descreva o passo a passo ou o que deve ser feito..." className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Frequência *</label>
              <select name="frequency" required className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500">
                {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">Ferramenta</label>
              <input name="tool" placeholder="Ex: WhatsApp, Reportei..." className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e] text-gray-400 text-sm hover:border-[#3e3e3e] transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? "Salvando..." : "Criar Processo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProcessCard({ p, idx, colors, onDelete }: {
  p: Omit<Process, "id" | "createdAt" | "order"> & { id?: string; createdAt?: Date };
  idx: number;
  colors: { bg: string; border: string; text: string };
  onDelete?: () => void;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <span className={`text-xs font-bold ${colors.text}`}>{String(idx + 1).padStart(2, "0")}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-white font-semibold text-sm">{p.title}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${FREQ_COLOR[p.frequency] ?? "text-gray-400 bg-gray-500/10"}`}>
                {p.frequency}
              </span>
              {p.tool && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#222] text-gray-500 border border-[#333]">
                  {p.tool}
                </span>
              )}
              {onDelete && (
                <button onClick={onDelete} className="text-[10px] px-1.5 py-0.5 rounded text-red-500/50 hover:text-red-400 transition-colors" title="Excluir">✕</button>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">{p.description}</p>
        </div>
      </div>
    </div>
  );
}

export function ProcessosClient({ processes }: { processes: Process[] }) {
  const [activeRole, setActiveRole] = useState("sdr");
  const [showNew, setShowNew] = useState(false);
  const [customProcesses, setCustomProcesses] = useState<Process[]>(processes);
  const [, startTransition] = useTransition();

  const role = ROLES.find(r => r.key === activeRole)!;
  const colors = COLOR_MAP[role.color];

  const defaults = DEFAULT_PROCESSES[activeRole] ?? [];
  const saved = customProcesses.filter(p => p.role === activeRole);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProcessAction(id);
      setCustomProcesses(prev => prev.filter(p => p.id !== id));
    });
  }

  return (
    <div>
      {showNew && (
        <NewProcessModal
          activeRole={activeRole}
          onClose={() => setShowNew(false)}
          onCreated={p => setCustomProcesses(prev => [...prev, p])}
        />
      )}

      {/* Role tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ROLES.map(r => {
          const c = COLOR_MAP[r.color];
          const isActive = r.key === activeRole;
          const total = (DEFAULT_PROCESSES[r.key]?.length ?? 0) + customProcesses.filter(p => p.role === r.key).length;
          return (
            <button
              key={r.key}
              onClick={() => setActiveRole(r.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? `${c.bg} ${c.border} ${c.text}`
                  : "bg-[#1a1a1a] border-[#262626] text-gray-500 hover:border-[#333] hover:text-gray-400"
              }`}
            >
              <span>{r.icon}</span>
              {r.label}
              {total > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? c.badge : "bg-[#222] text-gray-600"}`}>
                  {total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4 mb-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{role.icon}</span>
          <div>
            <h2 className={`font-bold text-lg ${colors.text}`}>{role.label}</h2>
            <p className="text-gray-500 text-sm">{defaults.length + saved.length} processos mapeados</p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colors.border} ${colors.text} ${colors.bg} text-sm font-medium hover:opacity-80 transition-opacity`}
        >
          + Novo Processo
        </button>
      </div>

      {/* Default processes */}
      {defaults.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Processos padrão</p>
          <div className="space-y-3">
            {defaults.map((p, idx) => (
              <ProcessCard key={`default-${idx}`} p={p} idx={idx} colors={colors} />
            ))}
          </div>
        </div>
      )}

      {/* Custom (saved) processes */}
      {saved.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 mt-2">
            Processos personalizados ({saved.length})
          </p>
          <div className="space-y-3">
            {saved.map((p, idx) => (
              <ProcessCard
                key={p.id}
                p={p}
                idx={defaults.length + idx}
                colors={colors}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {defaults.length === 0 && saved.length === 0 && (
        <div className="text-center py-12 text-gray-600 text-sm">
          Nenhum processo cadastrado para este cargo ainda.<br />
          <span className="text-gray-700">Clique em "+ Novo Processo" para começar.</span>
        </div>
      )}

      <p className="text-xs text-gray-700 text-center mt-6">
        Processos padrão são referências internas. Processos personalizados ficam salvos no banco de dados.
      </p>
    </div>
  );
}
