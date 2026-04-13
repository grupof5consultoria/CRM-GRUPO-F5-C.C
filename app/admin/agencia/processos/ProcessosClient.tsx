"use client";

import { useState } from "react";

type Task = { id: string; title: string; description: string; frequency: string; tool?: string };
type Role = { key: string; label: string; color: string; icon: string; tasks: Task[] };

const ROLES: Role[] = [
  {
    key: "sdr",
    label: "SDR",
    color: "violet",
    icon: "📞",
    tasks: [
      {
        id: "sdr-1",
        title: "Qualificação de leads",
        description: "Verificar e qualificar novos leads recebidos via formulários, WhatsApp e indicações. Registrar no CRM com status inicial.",
        frequency: "Diário",
        tool: "CRM Clientes",
      },
      {
        id: "sdr-2",
        title: "Primeiro contato com lead",
        description: "Entrar em contato com o lead em até 15 minutos após a chegada. Apresentar a F5 Agência e agendar reunião com o Closer.",
        frequency: "Diário",
        tool: "WhatsApp",
      },
      {
        id: "sdr-3",
        title: "Follow-up de leads frios",
        description: "Retomar contato com leads que não responderam nos últimos 2-3 dias. Usar abordagem diferente (novo ângulo ou oferta).",
        frequency: "Diário",
        tool: "CRM Clientes",
      },
      {
        id: "sdr-4",
        title: "Atualizar funil no CRM",
        description: "Manter o kanban atualizado com o status real de cada lead. Nunca deixar lead parado sem etapa registrada.",
        frequency: "Diário",
        tool: "CRM Clientes",
      },
      {
        id: "sdr-5",
        title: "Relatório semanal de SDR",
        description: "Compilar métricas da semana: leads recebidos, contactados, reuniões agendadas, taxa de conversão SDR→Closer.",
        frequency: "Semanal",
      },
    ],
  },
  {
    key: "closer",
    label: "Closer",
    color: "amber",
    icon: "🤝",
    tasks: [
      {
        id: "closer-1",
        title: "Reunião de diagnóstico",
        description: "Realizar reunião com o potencial cliente para entender a situação atual, dores e objetivos. Coletar informações para montar proposta.",
        frequency: "Conforme demanda",
        tool: "Google Meet",
      },
      {
        id: "closer-2",
        title: "Montar proposta comercial",
        description: "Gerar proposta personalizada no sistema (plano START ou SCALE) com base no diagnóstico. Aplicar desconto se a reunião foi presencial.",
        frequency: "Conforme demanda",
        tool: "Propostas",
      },
      {
        id: "closer-3",
        title: "Apresentação e envio da proposta",
        description: "Apresentar a proposta em reunião dedicada. Enviar PDF gerado pelo sistema com link para assinatura digital.",
        frequency: "Conforme demanda",
        tool: "Propostas",
      },
      {
        id: "closer-4",
        title: "Follow-up pós-proposta",
        description: "Contatar o lead 24h, 48h e 72h após envio da proposta. Tirar dúvidas e conduzir ao fechamento.",
        frequency: "Conforme demanda",
        tool: "WhatsApp",
      },
      {
        id: "closer-5",
        title: "Onboarding após fechamento",
        description: "Após assinatura do contrato, fazer passagem de bastão para o CS com briefing completo do cliente.",
        frequency: "Conforme demanda",
      },
      {
        id: "closer-6",
        title: "Reunião semanal de pipeline",
        description: "Revisar pipeline com o gestor. Priorizar oportunidades quentes e definir estratégias para travar negociações paradas.",
        frequency: "Semanal",
      },
    ],
  },
  {
    key: "cs",
    label: "Customer Success",
    color: "emerald",
    icon: "⭐",
    tasks: [
      {
        id: "cs-1",
        title: "Onboarding do cliente",
        description: "Receber briefing do Closer, coletar acessos (Meta Business, Google Ads, GMB), apresentar cronograma de implementação ao cliente.",
        frequency: "A cada novo cliente",
      },
      {
        id: "cs-2",
        title: "Reunião mensal de resultados",
        description: "Apresentar relatório completo de performance (leads gerados, custo por lead, conversões). Definir otimizações do mês seguinte.",
        frequency: "Mensal",
        tool: "Reportei",
      },
      {
        id: "cs-3",
        title: "Check-in semanal com cliente",
        description: "Enviar atualização rápida via WhatsApp ou e-mail com as principais métricas da semana e próximas ações.",
        frequency: "Semanal",
        tool: "WhatsApp",
      },
      {
        id: "cs-4",
        title: "Gestão de saúde do cliente",
        description: "Monitorar satisfação e risco de churn. Registrar NPS e ações de retenção quando necessário.",
        frequency: "Mensal",
        tool: "Clientes",
      },
      {
        id: "cs-5",
        title: "Upsell e expansão",
        description: "Identificar oportunidades de upgrade de plano (START → SCALE) e apresentar para o Closer quando cliente está pronto.",
        frequency: "Trimestral",
      },
    ],
  },
  {
    key: "traffic_manager",
    label: "Gestor de Tráfego",
    color: "blue",
    icon: "📊",
    tasks: [
      {
        id: "tm-1",
        title: "Configuração de campanhas",
        description: "Criar e configurar campanhas no Meta Ads e Google Ads para novos clientes. Definir segmentação, criativos iniciais e verba.",
        frequency: "A cada novo cliente",
        tool: "Meta Ads / Google Ads",
      },
      {
        id: "tm-2",
        title: "Otimização diária de campanhas",
        description: "Analisar performance das campanhas ativas. Pausar anúncios com CPL elevado, escalar os rentáveis, testar novos criativos.",
        frequency: "Diário",
        tool: "Meta Ads / Google Ads",
      },
      {
        id: "tm-3",
        title: "Relatório semanal de tráfego",
        description: "Gerar e enviar relatório semanal para cada cliente com métricas de campanhas (impressões, cliques, leads, custo).",
        frequency: "Semanal",
        tool: "Reportei",
      },
      {
        id: "tm-4",
        title: "Criação de landing pages",
        description: "Implementar ou atualizar landing pages dos clientes conforme briefing. Garantir pixel, GA4 e GTM configurados.",
        frequency: "Conforme demanda",
        tool: "Sistema",
      },
      {
        id: "tm-5",
        title: "Análise mensal de resultados",
        description: "Compilar resultados mensais por cliente. Identificar padrões e recomendar ajustes de estratégia para o próximo mês.",
        frequency: "Mensal",
        tool: "Reportei",
      },
      {
        id: "tm-6",
        title: "Reunião de alinhamento de criativos",
        description: "Reunião interna para definir novos criativos a serem produzidos. Alinhar com designer e CS sobre necessidades dos clientes.",
        frequency: "Quinzenal",
      },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300" },
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

export function ProcessosClient() {
  const [activeRole, setActiveRole] = useState("sdr");
  const role = ROLES.find(r => r.key === activeRole)!;
  const colors = COLOR_MAP[role.color];

  return (
    <div>
      {/* Role tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ROLES.map(r => {
          const c = COLOR_MAP[r.color];
          const isActive = r.key === activeRole;
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
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? c.badge : "bg-[#222] text-gray-600"}`}>
                {r.tasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Role header */}
      <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
        <span className="text-2xl">{role.icon}</span>
        <div>
          <h2 className={`font-bold text-lg ${colors.text}`}>{role.label}</h2>
          <p className="text-gray-500 text-sm">{role.tasks.length} processos mapeados</p>
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {role.tasks.map((task, idx) => (
          <div key={task.id} className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`text-xs font-bold ${colors.text}`}>{String(idx + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-white font-semibold text-sm">{task.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${FREQ_COLOR[task.frequency] ?? "text-gray-400 bg-gray-500/10"}`}>
                      {task.frequency}
                    </span>
                    {task.tool && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#222] text-gray-500 border border-[#333]">
                        {task.tool}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{task.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-700 text-center mt-6">
        Os processos acima são referências internas da F5 Agência. Atualize conforme as rotinas evoluírem.
      </p>
    </div>
  );
}
