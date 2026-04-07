import type { LeadStatus, ProposalStatus, ContractStatus, ClientStatus, ClientHealth, TaskStatus, ChargeStatus } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo Lead",
  contacted: "Em Contato",
  qualified: "Qualificado",
  proposal_sent: "Proposta Enviada",
  negotiation: "Em Negociação",
  closed_won: "Fechado (Ganho)",
  closed_lost: "Fechado (Perdido)",
  onboarding: "Onboarding",
  active_client: "Cliente Ativo",
  upsell_opportunity: "Oportunidade Upsell",
  at_risk_churn: "Risco de Churn",
  churned: "Churn",
};

export const LEAD_STATUS_VARIANTS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  new: "default",
  contacted: "info",
  qualified: "warning",
  proposal_sent: "warning",
  negotiation: "info",
  closed_won: "success",
  closed_lost: "danger",
  onboarding: "info",
  active_client: "success",
  upsell_opportunity: "success",
  at_risk_churn: "danger",
  churned: "gray",
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
};

export const PROPOSAL_STATUS_VARIANTS: Record<ProposalStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  draft: "gray",
  sent: "default",
  accepted: "success",
  rejected: "danger",
  expired: "warning",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Rascunho",
  pending_signature: "Aguardando Assinatura",
  active: "Ativo",
  paused: "Pausado",
  cancelled: "Cancelado",
  finished: "Finalizado",
};

export const CONTRACT_STATUS_VARIANTS: Record<ContractStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  draft: "gray",
  pending_signature: "warning",
  active: "success",
  paused: "info",
  cancelled: "danger",
  finished: "default",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export const CLIENT_STATUS_VARIANTS: Record<ClientStatus, "success" | "gray" | "danger"> = {
  active: "success",
  inactive: "gray",
  blocked: "danger",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  waiting_client: "Aguardando Cliente",
  done: "Concluída",
  cancelled: "Cancelada",
};

export const TASK_STATUS_VARIANTS: Record<TaskStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "gray",
  in_progress: "default",
  waiting_client: "warning",
  done: "success",
  cancelled: "danger",
};

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

export const CHARGE_STATUS_VARIANTS: Record<ChargeStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "warning",
  paid: "success",
  overdue: "danger",
  cancelled: "gray",
  refunded: "info",
};

export const CLIENT_HEALTH_LABELS: Record<ClientHealth, string> = {
  thriving: "Ativo e Engajado",
  stable: "Estável",
  attention: "Requer Atenção",
  at_risk: "Em Risco",
};

export const CLIENT_HEALTH_VARIANTS: Record<ClientHealth, "success" | "default" | "warning" | "danger"> = {
  thriving: "success",
  stable: "default",
  attention: "warning",
  at_risk: "danger",
};

export const CLIENT_HEALTH_COLORS: Record<ClientHealth, string> = {
  thriving: "text-emerald-500",
  stable: "text-indigo-500",
  attention: "text-amber-500",
  at_risk: "text-red-500",
};

export const CHARGE_TYPE_LABELS = {
  one_time: "Avulso",
  recurring: "Recorrente",
  hourly: "Por Hora",
};
