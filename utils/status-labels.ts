import type { LeadStatus, ProposalStatus, ContractStatus, ClientStatus, TaskStatus, ChargeStatus } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal_sent: "Proposta Enviada",
  negotiation: "Em Negociação",
  closed_won: "Fechado (Ganho)",
  closed_lost: "Fechado (Perdido)",
};

export const LEAD_STATUS_VARIANTS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  new: "default",
  contacted: "info",
  qualified: "warning",
  proposal_sent: "warning",
  negotiation: "info",
  closed_won: "success",
  closed_lost: "danger",
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

export const CHARGE_TYPE_LABELS = {
  one_time: "Avulso",
  recurring: "Recorrente",
  hourly: "Por Hora",
};
