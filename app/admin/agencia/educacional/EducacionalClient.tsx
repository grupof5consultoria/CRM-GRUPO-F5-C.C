"use client";

import { useState, useTransition } from "react";
import { upsertEducacionalPageAction } from "./actions";

type WikiPage = {
  id: string; section: string; slug: string; title: string;
  content: string | null; updatedAt: Date;
};

// ─── Configuração das seções ──────────────────────────────────────────────────

const SECTIONS = [
  {
    key: "edu_cursos",
    label: "Cursos",
    icon: "🎓",
    color: "orange",
    description: "Plataformas de ensino, cursos recomendados e trilhas de aprendizado para a equipe",
    pages: [
      {
        slug: "meta-ads-cursos",
        title: "Meta Ads — Cursos e Certificações",
        placeholder: `Cursos recomendados para Meta Ads:

1. Meta Blueprint (gratuito) — https://www.facebook.com/business/learn
   - Certificação: Meta Certified Digital Marketing Associate
   - Duração: ~10 horas

2. Google Skillshop — Anúncios no Facebook
   ...

Certificações obrigatórias para cada cargo:
- SDR: nenhuma obrigatória
- Closer: Meta Blueprint básico
- Gestor de Tráfego: Meta Blueprint avançado + certificação`,
      },
      {
        slug: "google-ads-cursos",
        title: "Google Ads — Cursos e Certificações",
        placeholder: `Cursos recomendados para Google Ads:

1. Google Skillshop (gratuito) — https://skillshop.google.com
   - Google Ads Search
   - Google Ads Display
   - Google Ads Video
   - Duração: 2-4 horas por certificação

Certificações obrigatórias:
- Gestor de Tráfego: Google Ads Search + Display
...`,
      },
      {
        slug: "vendas-cursos",
        title: "Vendas e Negociação — Cursos",
        placeholder: `Cursos recomendados para a área comercial:

1. Copywriting e Persuasão
   - Plataforma: Udemy / Hotmart
   - Para: SDR e Closer

2. Técnicas de Fechamento
   - Livro recomendado: "Receita Previsível" — Aaron Ross
   - Para: Closer

3. SPIN Selling
   ...`,
      },
      {
        slug: "ferramentas-cursos",
        title: "Ferramentas da Agência — Tutoriais",
        placeholder: `Tutoriais internos e externos das ferramentas que usamos:

1. Reportei
   - Tutorial: [link do vídeo]
   - Responsável interno: [nome]

2. ClickUp
   - Documentação: https://help.clickup.com
   - Nosso workspace: [link]

3. MindMeister
   ...`,
      },
    ],
  },
  {
    key: "edu_acessos",
    label: "Acessos",
    icon: "🔑",
    color: "blue",
    description: "Credenciais, contas e acessos que cada membro da equipe precisa ter",
    pages: [
      {
        slug: "acessos-por-cargo",
        title: "Acessos por Cargo",
        placeholder: `Quais acessos cada cargo precisa ter ao entrar na agência:

── SDR ──
[ ] CRM Clientes (sistema)
[ ] WhatsApp Business
[ ] Google Workspace (e-mail @agencia)

── Closer ──
[ ] CRM Agência (sistema)
[ ] Google Meet / Zoom
[ ] Módulo de Propostas (sistema)
[ ] DocuSign ou similar para contratos

── Customer Success ──
[ ] Reportei
[ ] Meta Business Manager (perfil próprio)
[ ] Google MCC (acesso de leitura)
[ ] Google Analytics

── Gestor de Tráfego ──
[ ] Meta Business Manager (acesso gerenciar)
[ ] Google Ads MCC
[ ] Google Analytics 4
[ ] Google Tag Manager
[ ] Google Search Console
[ ] Reportei
[ ] Landing pages (Vercel / GitHub)`,
      },
      {
        slug: "plataformas-acesso",
        title: "Plataformas e Senhas",
        placeholder: `IMPORTANTE: Não salve senhas reais aqui. Use um gerenciador de senhas.

Gerenciador de senhas da agência:
- Ferramenta: [ex: 1Password / Bitwarden]
- Acesso: solicitar ao gestor

Contas compartilhadas da agência:
- Conta Google principal: [descrever sem senha]
- Meta Business Manager ID: [apenas o ID]
- Reportei: [URL de acesso]
- ClickUp: [URL do workspace]
- GitHub: [organização]

Para solicitar acesso: falar com [nome do responsável]`,
      },
      {
        slug: "onboarding-acessos",
        title: "Checklist de Onboarding — Acessos",
        placeholder: `Passo a passo para dar acesso a um novo membro da equipe:

Dia 1:
[ ] Criar e-mail corporativo (@agencia.com.br)
[ ] Adicionar ao Google Workspace
[ ] Convidar para o ClickUp
[ ] Convidar para grupos do WhatsApp
[ ] Dar acesso ao gerenciador de senhas

Semana 1:
[ ] Adicionar ao Meta Business Manager com permissão correta
[ ] Criar login no Reportei
[ ] Dar acesso ao Google MCC (apenas leitura inicialmente)
[ ] Apresentar a documentação de processos

Após 30 dias:
[ ] Revisar permissões conforme evolução do membro`,
      },
    ],
  },
  {
    key: "edu_aprendizado",
    label: "Aprendizado",
    icon: "🧠",
    color: "violet",
    description: "Processo de aprendizado interno, materiais e cultura de melhoria contínua",
    pages: [
      {
        slug: "trilha-onboarding",
        title: "Trilha de Onboarding — Novos Membros",
        placeholder: `Processo de aprendizado para novos membros da equipe:

Semana 1 — Imersão
- Ler toda a documentação de Processos do cargo
- Ler a documentação de Serviços da agência
- Fazer sombra com o membro mais experiente no cargo
- Assistir aos cursos obrigatórios do cargo

Semana 2 — Prática supervisionada
- Executar os processos com acompanhamento
- Reunião diária de feedback com o gestor
- Registrar dúvidas no ClickUp

Semana 3-4 — Autonomia gradual
- Assumir tarefas com revisão
- Primeira avaliação de performance

30 dias — Avaliação
- Reunião de feedback completo
- Definição de metas para os próximos 60 dias`,
      },
      {
        slug: "aprendizados-equipe",
        title: "Aprendizados e Lições da Equipe",
        placeholder: `Registro de aprendizados coletivos da agência (atualizar regularmente):

Data: [mês/ano]
Aprendizado: O que funcionou ou não funcionou e por quê.

---

[Exemplo]
Março/2024 — Campanhas de dentistas
Aprendizado: Criativos com "antes e depois" de sorriso têm CPL 40% menor que
imagens genéricas de clínica. Priorizar esse formato para novos clientes do setor.
Responsável: [nome do gestor de tráfego]

---

[Adicione novos aprendizados abaixo]`,
      },
      {
        slug: "biblioteca-recursos",
        title: "Biblioteca de Recursos",
        placeholder: `Links e materiais de referência que a equipe usa:

📚 Livros recomendados:
- "Tração" — Gabriel Weinberg (crescimento)
- "Receita Previsível" — Aaron Ross (vendas)
- "80/20 Sales and Marketing" — Perry Marshall (tráfego)
- "Building a StoryBrand" — Donald Miller (copywriting)

🎙️ Podcasts:
- [nome do podcast] — [tema]

📺 Canais no YouTube:
- [canal] — [tema]

🔗 Sites e blogs:
- Marketing Experiments — https://marketingexperiments.com
- Wordstream Blog — https://wordstream.com/blog

📄 Templates internos:
- Template de relatório semanal: [link Drive]
- Template de proposta: sistema interno
- Template de ata de reunião: [link Drive]`,
      },
      {
        slug: "cultura-agencia",
        title: "Cultura e Valores da Agência",
        placeholder: `Os valores e a cultura que guiam o trabalho na F5 Agência:

Nossa missão:
[Descreva a missão da agência]

Nossos valores:
1. [Valor 1] — [Descrição]
2. [Valor 2] — [Descrição]
3. [Valor 3] — [Descrição]

Como trabalhamos:
- Comunicação: [ex: direta, sem rodeios, feedback honesto]
- Prazos: [ex: combinado é combinado]
- Erros: [ex: errou, assumiu, corrigiu — sem punição]
- Crescimento: [ex: cada membro deve ter um plano de desenvolvimento]

O que esperamos de cada membro:
[Descreva as expectativas gerais]`,
      },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   dot: "bg-blue-400" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", dot: "bg-violet-400" },
};

// ─── Wiki Editor ──────────────────────────────────────────────────────────────

function WikiEditor({ section, slug, title, initialContent, placeholder }: {
  section: string; slug: string; title: string; initialContent: string; placeholder: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  function save() {
    startTransition(async () => {
      await upsertEducacionalPageAction(section, slug, title, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("edit")}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${mode === "edit" ? "bg-[#2e2e2e] text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          Editar
        </button>
        <button
          onClick={() => setMode("preview")}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${mode === "preview" ? "bg-[#2e2e2e] text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          Preview
        </button>
      </div>

      {mode === "edit" ? (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={14}
          placeholder={placeholder}
          className="w-full bg-[#0d0d0d] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 resize-y focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
        />
      ) : (
        <div className="w-full bg-[#0d0d0d] border border-[#2e2e2e] rounded-xl px-4 py-3 min-h-[196px]">
          {content ? (
            <pre className="text-gray-300 text-sm font-sans leading-relaxed whitespace-pre-wrap">{content}</pre>
          ) : (
            <p className="text-gray-700 text-sm italic">Nenhum conteúdo ainda.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-700">
          Use texto livre, listas com traços (-) ou numeradas. Linhas em branco criam parágrafos.
        </p>
        <button
          onClick={save}
          disabled={isPending}
          className={`text-xs px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
            saved
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              : "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          }`}
        >
          {isPending ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function SectionPanel({ section, savedPages }: {
  section: typeof SECTIONS[0];
  savedPages: WikiPage[];
}) {
  const [activePage, setActivePage] = useState<string | null>(null);
  const colors = COLOR_MAP[section.color];

  const pages = section.pages.map(dp => {
    const saved = savedPages.find(p => p.slug === dp.slug);
    return {
      ...dp,
      content: saved?.content ?? "",
      updatedAt: saved?.updatedAt ?? null,
      hasContent: !!(saved?.content),
    };
  });

  const activePg = pages.find(p => p.slug === activePage);

  return (
    <div>
      {/* Page tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {pages.map(p => (
          <button
            key={p.slug}
            onClick={() => setActivePage(activePage === p.slug ? null : p.slug)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              activePage === p.slug
                ? `${colors.bg} ${colors.border} ${colors.text}`
                : "bg-[#1a1a1a] border-[#262626] text-gray-500 hover:border-[#333] hover:text-gray-300"
            }`}
          >
            {p.title}
            {p.hasContent && (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot} opacity-70`} />
            )}
          </button>
        ))}
      </div>

      {activePg ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">{activePg.title}</h3>
              {activePg.updatedAt && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Atualizado em {new Date(activePg.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
          <WikiEditor
            section={section.key}
            slug={activePg.slug}
            title={activePg.title}
            initialContent={activePg.content}
            placeholder={activePg.placeholder}
          />
        </div>
      ) : (
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
          <p className={`text-xs ${colors.text}`}>
            Selecione um documento acima para visualizar ou editar.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            {pages.filter(p => p.hasContent).length} de {pages.length} documentos preenchidos
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EducacionalClient({
  cursosPages,
  acessosPages,
  aprendizadoPages,
}: {
  cursosPages: WikiPage[];
  acessosPages: WikiPage[];
  aprendizadoPages: WikiPage[];
}) {
  const [activeSection, setActiveSection] = useState("edu_cursos");

  const pagesMap: Record<string, WikiPage[]> = {
    edu_cursos:      cursosPages,
    edu_acessos:     acessosPages,
    edu_aprendizado: aprendizadoPages,
  };

  const section = SECTIONS.find(s => s.key === activeSection)!;
  const colors = COLOR_MAP[section.color];

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SECTIONS.map(s => {
          const c = COLOR_MAP[s.color];
          const isActive = s.key === activeSection;
          const filled = pagesMap[s.key].length;
          const total = s.pages.length;
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
              {filled > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? `${c.bg} ${c.text}` : "bg-[#222] text-gray-600"}`}>
                  {filled}/{total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
        <span className="text-2xl">{section.icon}</span>
        <div>
          <h2 className={`font-bold text-lg ${colors.text}`}>{section.label}</h2>
          <p className="text-gray-500 text-sm">{section.description}</p>
        </div>
      </div>

      <SectionPanel section={section} savedPages={pagesMap[activeSection]} />
    </div>
  );
}
