"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireInternalAuth } from "@/lib/auth";

// ─── Template das 16 etapas ───────────────────────────────────────────────────

interface ChecklistItem { id: string; label: string; checked: boolean }
interface StepTemplate {
  num: number;
  title: string;
  checklist?: ChecklistItem[];
  fields?: Record<string, string>;
}

function getOnboardingTemplate(): StepTemplate[] {
  return [
    {
      num: 1,
      title: "Coletar dados de contrato e cobrança",
      // Etapa 1: campos de texto preenchidos pelo agente com os dados enviados pelo cliente
      fields: {
        cnpj:             "",
        endereco_empresa: "",
        socio_nome:       "",
        socio_endereco:   "",
        socio_cpf:        "",
        socio_email:      "",
        resp_nome:        "",
        resp_telefone:    "",
        resp_email:       "",
      },
    },
    {
      num: 2,
      title: "Elaborar contrato e enviar para assinatura",
      fields: {
        linkContrato: "",
        dataEnvio:    "",
        observacoes:  "",
      },
      checklist: [
        { id: "contrato_enviado", label: "Contrato enviado para assinatura", checked: false },
        { id: "contrato_assinado", label: "Contrato assinado pelo cliente",  checked: false },
      ],
    },
    {
      num: 3,
      title: "Cadastrar o cliente no Asaas e enviar o boleto de cobrança",
      checklist: [
        { id: "asaas_cadastrado", label: "Cliente cadastrado no Asaas",        checked: false },
        { id: "boleto_enviado",   label: "Boleto de cobrança enviado",          checked: false },
      ],
    },
    {
      num: 4,
      title: "Criar o grupo no WhatsApp",
      checklist: [
        { id: "logo",       label: "Colocar logo da agência",                                                      checked: false },
        { id: "membros",    label: "Adicionar gestor, cliente + equipe do cliente (se necessário)",                 checked: false },
        { id: "drive",      label: "Criar o Drive com pastas do cliente — seguir modelo e usar domínio da agência", checked: false },
        { id: "drive_link", label: "Adicionar link do Drive na descrição do grupo",                                 checked: false },
      ],
    },
    {
      num: 5,
      title: "Avisar o cliente sobre cobrança e contrato",
      checklist: [
        { id: "msg_enviada", label: "Mensagem enviada para a responsável da empresa", checked: false },
      ],
    },
    {
      num: 6,
      title: "Agendar a reunião de kickoff com cliente",
      fields: {
        dataReuniao: "",
        linkReuniao: "",
      },
      checklist: [
        { id: "reuniao_agendada", label: "Reunião agendada (introdução às plataformas)", checked: false },
      ],
    },
    {
      num: 7,
      title: "Preparar a Ata da Reunião",
      checklist: [
        { id: "ata_preparada", label: "Ata da reunião preparada", checked: false },
      ],
    },
    {
      num: 8,
      title: "Criar pasta do cliente no Google Drive — reuniões",
      fields: {
        linkDrive: "",
      },
      checklist: [
        { id: "pasta_criada", label: "Pasta criada no Google Drive", checked: false },
      ],
    },
    {
      num: 9,
      title: "Reunião de Kickoff — Liberação dos acessos",
      fields: {
        loginGoogle:     "",
        senhaGoogle:     "",
        loginFacebook:   "",
        senhaFacebook:   "",
        loginInstagram:  "",
        senhaInstagram:  "",
      },
      checklist: [
        { id: "acessos_liberados", label: "Acessos recebidos e salvos", checked: false },
        { id: "kickoff_realizado", label: "Reunião de kickoff realizada", checked: false },
      ],
    },
    {
      num: 10,
      title: "Enviar solicitação e manual de criativos",
      checklist: [
        { id: "solicitacao_enviada", label: "Solicitação de criativos enviada", checked: false },
        { id: "manual_enviado",      label: "Manual de criativos enviado",      checked: false },
      ],
    },
    {
      num: 11,
      title: "Criação e estruturação das contas",
      checklist: [
        { id: "contas",       label: "Criar e/ou configurar as contas: Gmail, Google Ads, Gerenciador",                   checked: false },
        { id: "publicos",     label: "Criação e alteração de públicos Meta e Google — ajustar nomenclaturas",              checked: false },
        { id: "pixel",        label: "Instalar pixel — configurar eventos",                                                checked: false },
        { id: "gtm",          label: "Instalação de GTM — configurar eventos (Tag Google, remarketing, conversão, etc.)",  checked: false },
        { id: "analytics",    label: "Criar, vincular com Google Ads e configurar eventos no Analytics",                   checked: false },
        { id: "whatsapp_fan", label: "Vincular WhatsApp na Fanpage e criar 2 contas de anúncios (Pix e cartão)",           checked: false },
        { id: "regras",       label: "Verificar regras personalizadas na conta — excluir se houver",                       checked: false },
        { id: "site",         label: "Fazer análise de site: GTmetrix e PageSpeed",                                        checked: false },
      ],
    },
    {
      num: 12,
      title: "Criação de planejamento estratégico / benchmarking",
      checklist: [
        { id: "conta_ads",    label: "Estudar conta de anúncios (se houver dados)",                                     checked: false },
        { id: "mapa_mental",  label: "Criar mapa mental — usar modelo MindMeister como base",                           checked: false },
        { id: "benchmark",    label: "Montar Benchmarking — 3 concorrentes",                                            checked: false },
        { id: "verba",        label: "Definir divisão de verba / estratégia de campanhas / plataformas e criativos",    checked: false },
        { id: "apresentacao", label: "Montar apresentação no Canva com link do mapa mental — usar modelo como base",    checked: false },
        { id: "google_plan",  label: "Google Ads: Montar planejamento das campanhas — Planilha Gianini como base",      checked: false },
      ],
    },
    {
      num: 13,
      title: "Agendar reunião de apresentação das estratégias",
      fields: {
        dataReuniao:  "",
        linkReuniao:  "",
        estrategiaIA: "",
      },
      checklist: [
        { id: "reuniao_est", label: "Reunião de apresentação agendada", checked: false },
      ],
    },
    {
      num: 14,
      title: "Reunião de apresentação das estratégias",
      checklist: [
        { id: "plano_midia",  label: "Apresentar plano de mídia",                                              checked: false },
        { id: "mapa_bench",   label: "Apresentar mapa mental com benchmarking e estratégias",                  checked: false },
        { id: "estrutura",    label: "Apresentar estrutura das contas com públicos criados",                   checked: false },
        { id: "tags",         label: "Apresentar tags instaladas — GTM, Analytics, eventos pixel Meta",        checked: false },
      ],
    },
    {
      num: 15,
      title: "Subir as campanhas",
      checklist: [
        { id: "campanhas_ar", label: "Campanhas no ar",                                  checked: false },
        { id: "links_envio",  label: "Links de acompanhamento enviados ao cliente",      checked: false },
      ],
    },
    {
      num: 16,
      title: "Encaminhar forms para captação de dados",
      fields: {
        linkFormulario: "",
      },
      checklist: [
        { id: "form_enviado",  label: "Formulário enviado",             checked: false },
        { id: "confirmacao",   label: "Confirmação de recebimento",     checked: false },
      ],
    },
  ];
}

// ─── Criar onboarding ao cadastrar cliente ────────────────────────────────────

export async function createOnboardingForClient(clientId: string) {
  const steps = getOnboardingTemplate();

  await prisma.onboardingTask.createMany({
    data: steps.map((s) => ({
      clientId,
      stepNumber: s.num,
      title: s.title,
      status: "pending",
      data: {
        checklistItems: s.checklist ?? [],
        fields: s.fields ?? {},
      },
    })),
  });
}

// ─── Atualizar status de uma etapa ───────────────────────────────────────────

export async function updateOnboardingTaskAction(
  taskId: string,
  clientId: string,
  updates: {
    status?: string;
    assignedTo?: string | null;
    data?: Record<string, unknown>;
  }
) {
  await requireInternalAuth();

  await prisma.onboardingTask.update({
    where: { id: taskId },
    data: {
      ...updates,
      completedAt: updates.status === "done" ? new Date() : updates.status ? null : undefined,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
}
