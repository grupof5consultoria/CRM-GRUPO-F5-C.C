"use client";

import { useState, useTransition } from "react";
import { upsertWikiPageAction } from "./actions";

type WikiPage = {
  id: string;
  section: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: Date;
};

type Section = {
  key: string;
  label: string;
  color: string;
  icon: string;
  description: string;
  defaultPages: { slug: string; title: string; placeholder: string }[];
};

const SECTIONS: Section[] = [
  {
    key: "trafego",
    label: "Tráfego Pago",
    color: "blue",
    icon: "📊",
    description: "Documentação sobre Meta Ads, Google Ads e gestão de campanhas",
    defaultPages: [
      { slug: "meta-ads", title: "Meta Ads — Processo de Criação", placeholder: "Descreva o processo de criação de campanhas no Meta Ads: estrutura de campanha, conjuntos de anúncios, criativos, segmentação..." },
      { slug: "google-ads", title: "Google Ads — Processo de Criação", placeholder: "Descreva o processo de criação de campanhas no Google Ads: tipos de campanha, palavras-chave, anúncios, extensões..." },
      { slug: "relatorios", title: "Relatórios — Padrão de Entrega", placeholder: "Como gerar e entregar os relatórios para clientes: ferramentas, métricas, frequência, formato..." },
      { slug: "checklist-onboarding", title: "Checklist de Onboarding de Tráfego", placeholder: "Passos para onboarding de um novo cliente no tráfego: acessos necessários, configurações iniciais, pixel, GA4, GTM..." },
    ],
  },
  {
    key: "landing",
    label: "Landing Page",
    color: "violet",
    icon: "🖥️",
    description: "Processo de criação e entrega de landing pages para clientes",
    defaultPages: [
      { slug: "briefing", title: "Briefing — Coleta de Informações", placeholder: "O que coletar do cliente antes de criar a landing page: fotos, depoimentos, serviços, identidade visual, WhatsApp..." },
      { slug: "desenvolvimento", title: "Desenvolvimento — Passo a Passo", placeholder: "Como desenvolver a landing page: tecnologia usada, estrutura de seções, componentes, deploy..." },
      { slug: "entrega", title: "Entrega e Publicação", placeholder: "Como fazer o deploy e publicar a landing page: domínio, DNS, configurações de SEO, indexação..." },
      { slug: "manutencao", title: "Manutenção e Atualizações", placeholder: "Processo para fazer atualizações na landing page após entrega: solicitações do cliente, alterações de urgência..." },
    ],
  },
  {
    key: "automacao",
    label: "Automação",
    color: "emerald",
    icon: "⚡",
    description: "Fluxos de automação, integrações e APIs utilizadas nos projetos",
    defaultPages: [
      { slug: "whatsapp-api", title: "API WhatsApp — Configuração", placeholder: "Como configurar a API oficial do WhatsApp: número, Business Account, webhooks, mensagens automáticas..." },
      { slug: "crm-automacao", title: "CRM — Automação de Funil", placeholder: "Fluxos de automação no CRM: notificações, follow-ups automáticos, mudança de etapa, alertas..." },
      { slug: "integrações", title: "Integrações Disponíveis", placeholder: "Lista de integrações que a agência utiliza: Google Sheets, Zapier, Make, n8n, webhooks..." },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; btn: string }> = {
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    btn: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  btn: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", btn: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" },
};

function WikiEditor({ section, slug, title, initialContent, placeholder, onSaved }: {
  section: string;
  slug: string;
  title: string;
  initialContent: string;
  placeholder: string;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await upsertWikiPageAction(section, slug, title, content);
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); }, 1500);
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-y focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600">Suporta texto livre — use marcadores, listas e subtítulos conforme necessário.</p>
        <button
          onClick={save}
          disabled={isPending}
          className={`text-xs px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
            saved ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          }`}
        >
          {isPending ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function SectionPanel({ section, pages }: { section: Section; pages: WikiPage[] }) {
  const [activePage, setActivePage] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const colors = COLOR_MAP[section.color];

  const allPages = section.defaultPages.map(dp => {
    const saved = pages.find(p => p.slug === dp.slug);
    return {
      slug: dp.slug,
      title: dp.title,
      placeholder: dp.placeholder,
      content: saved?.content ?? "",
      updatedAt: saved?.updatedAt ?? null,
    };
  });

  const activePg = allPages.find(p => p.slug === activePage);

  return (
    <div>
      {/* Page tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {allPages.map(p => (
          <button
            key={p.slug}
            onClick={() => setActivePage(activePage === p.slug ? null : p.slug)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              activePage === p.slug
                ? `${colors.bg} ${colors.border} ${colors.text}`
                : "bg-[#1a1a1a] border-[#262626] text-gray-500 hover:border-[#333] hover:text-gray-400"
            }`}
          >
            {p.title}
            {p.content && <span className={`ml-1.5 w-1.5 h-1.5 rounded-full inline-block ${colors.bg} border ${colors.border}`} />}
          </button>
        ))}
      </div>

      {activePg && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">{activePg.title}</h3>
            {activePg.updatedAt && (
              <p className="text-xs text-gray-600">
                Atualizado {new Date(activePg.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <WikiEditor
            section={section.key}
            slug={activePg.slug}
            title={activePg.title}
            initialContent={activePg.content}
            placeholder={activePg.placeholder}
            onSaved={() => forceUpdate(n => n + 1)}
          />
        </div>
      )}

      {!activePage && (
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
          <p className={`text-xs ${colors.text}`}>Selecione um documento acima para visualizar ou editar.</p>
        </div>
      )}
    </div>
  );
}

export function ServicosClient({
  trafegoPages,
  landingPages,
  automacaoPages,
}: {
  trafegoPages: WikiPage[];
  landingPages: WikiPage[];
  automacaoPages: WikiPage[];
}) {
  const [activeSection, setActiveSection] = useState("trafego");

  const pagesMap: Record<string, WikiPage[]> = {
    trafego: trafegoPages,
    landing: landingPages,
    automacao: automacaoPages,
  };

  const section = SECTIONS.find(s => s.key === activeSection)!;

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SECTIONS.map(s => {
          const c = COLOR_MAP[s.color];
          const isActive = s.key === activeSection;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? `${c.bg} ${c.border} ${c.text}`
                  : "bg-[#1a1a1a] border-[#262626] text-gray-500 hover:border-[#333] hover:text-gray-400"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className={`${COLOR_MAP[section.color].bg} border ${COLOR_MAP[section.color].border} rounded-2xl p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h2 className={`font-bold text-lg ${COLOR_MAP[section.color].text}`}>{section.label}</h2>
            <p className="text-gray-500 text-sm">{section.description}</p>
          </div>
        </div>
      </div>

      <SectionPanel section={section} pages={pagesMap[section.key]} />
    </div>
  );
}
