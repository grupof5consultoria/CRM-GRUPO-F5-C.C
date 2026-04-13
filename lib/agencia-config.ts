// Constantes puras da Agência — sem imports de servidor/Prisma
// Pode ser importado tanto por Client Components quanto por Server Components

export const ROLE_LABELS: Record<string, string> = {
  sdr:             "SDR",
  closer:          "Closer",
  cs:              "Customer Success",
  traffic_manager: "Gestor de Tráfego",
  designer:        "Designer",
  manager:         "Gestor",
  other:           "Outro",
};

export const STATUS_LABELS: Record<string, string> = {
  active:    "Ativo",
  vacation:  "Férias",
  dismissed: "Desligado",
};

export const OFFBOARDING_ITEMS = [
  { item: "drive",       label: "Drive da agência e dos clientes" },
  { item: "meta",        label: "Gerenciador de Negócios — Meta Ads" },
  { item: "google_mcc",  label: "MCC Google Ads" },
  { item: "analytics",   label: "Analytics dos clientes" },
  { item: "gtm",         label: "GTM dos clientes" },
  { item: "reportei",    label: "Reportei" },
  { item: "mindmeister", label: "Mapa Mental (MindMeister)" },
  { item: "clickup",     label: "ClickUp" },
  { item: "google_biz",  label: "Perfil do Google dos clientes" },
  { item: "whatsapp",    label: "Grupos de WhatsApp" },
];

export const PLAN_CONFIG = {
  start: {
    label: "F5 START",
    priceImpl: 2500,
    priceImplDiscount: 2000,
    priceMonthly: 1800,
    services: [
      "Anúncios Meta Ads e Google Ads",
      "Relatório semanal e mensal",
      "Implementação de planilha de controle",
      "Acompanhamento comercial",
      "Landing Page para a clínica",
      "Otimização de ficha no Google",
    ],
  },
  scale: {
    label: "F5 SCALE",
    priceImpl: 6500,
    priceImplDiscount: 6000,
    priceMonthly: 2300,
    services: [
      "Anúncios Meta Ads e Google Ads",
      "Implementação de CRM",
      "Implementação de planilha de controle",
      "Acompanhamento comercial completo",
      "Ficha no Google otimizada",
      "Implementação de API de automação",
      "Automação de CRM",
      "Landing Page para a clínica",
    ],
  },
};
