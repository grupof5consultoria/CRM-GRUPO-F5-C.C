import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { getProposalById, PLAN_CONFIG } from "@/services/agencia";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;

  const proposal = await getProposalById(id);
  if (!proposal) return new NextResponse("Proposta não encontrada", { status: 404 });

  const cfg = PLAN_CONFIG[proposal.plan as "start" | "scale"];
  const implPrice = Number(proposal.priceImpl);
  const monthlyPrice = Number(proposal.priceMonthly);
  const adBudget = proposal.adBudget ? Number(proposal.adBudget) : 1500;
  const createdDate = new Date(proposal.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const html = buildProposalHtml({
    clientName: proposal.client.name,
    plan: cfg.label,
    implPrice,
    monthlyPrice,
    discountApplied: proposal.discountApplied,
    adBudget,
    services: cfg.services,
    notes: proposal.notes,
    createdDate,
  });

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function buildProposalHtml(p: {
  clientName: string;
  plan: string;
  implPrice: number;
  monthlyPrice: number;
  discountApplied: boolean;
  adBudget: number;
  services: string[];
  notes: string | null;
  createdDate: string;
}) {
  const servicesList = p.services.map(s => `<li>✓ ${s}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Proposta Comercial — ${p.clientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #1a1a1a; }
    .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1e1b4b; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
    .print-bar-title { color: #c4b5fd; font-size: 13px; font-weight: 600; }
    .print-btn { background: #7c3aed; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600; }
    .back-btn { background: rgba(255,255,255,0.1); color: #c4b5fd; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; }
    body { padding-top: 52px; }

    .page { max-width: 210mm; margin: 0 auto; background: white; min-height: 297mm; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }

    /* Cover */
    .cover { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); padding: 60px 50px; min-height: 200px; position: relative; overflow: hidden; }
    .cover::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.05); }
    .cover-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #c4b5fd; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
    .cover-title { font-size: 28px; font-weight: 800; color: white; line-height: 1.2; margin-bottom: 8px; }
    .cover-subtitle { font-size: 14px; color: rgba(196,181,253,0.8); margin-bottom: 30px; }
    .cover-client { font-size: 18px; font-weight: 700; color: #a78bfa; }
    .cover-plan { display: inline-block; margin-top: 12px; background: #7c3aed; color: white; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 20px; }

    /* Sections */
    .section { padding: 40px 50px; border-bottom: 1px solid #f0f0f0; }
    .section-title { font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #7c3aed; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #7c3aed; display: inline-block; }
    .section h2 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }

    /* Cenário */
    .problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
    .problem-card { background: #fafafa; border: 1px solid #eeeeee; border-radius: 12px; padding: 16px; }
    .problem-icon { font-size: 20px; margin-bottom: 8px; }
    .problem-title { font-size: 11px; font-weight: 700; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .problem-text { font-size: 12px; color: #444; line-height: 1.5; }

    /* Plano de ação */
    .action-step { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
    .action-num { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-content h3 { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .action-content p { font-size: 12px; color: #555; line-height: 1.5; }

    /* Fluxo */
    .flow { display: flex; gap: 0; margin: 20px 0; }
    .flow-step { flex: 1; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 14px; text-align: center; position: relative; }
    .flow-step:not(:last-child)::after { content: '→'; position: absolute; right: -10px; top: 50%; transform: translateY(-50%); background: white; padding: 0 4px; font-size: 14px; color: #7c3aed; z-index: 1; }
    .flow-step:first-child { border-radius: 8px 0 0 8px; }
    .flow-step:last-child { border-radius: 0 8px 8px 0; }
    .flow-step .step-icon { font-size: 18px; margin-bottom: 6px; }
    .flow-step .step-label { font-size: 11px; font-weight: 700; color: #4c1d95; }

    /* Pricing */
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
    .price-card { border: 2px solid #7c3aed; border-radius: 16px; padding: 24px; text-align: center; }
    .price-card.secondary { border-color: #e5e7eb; }
    .price-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; margin-bottom: 12px; }
    .price-card.secondary .price-label { color: #6b7280; }
    .price-amount { font-size: 32px; font-weight: 900; color: #1a1a1a; line-height: 1; }
    .price-period { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .price-discount { display: inline-block; margin-top: 8px; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }

    /* Services */
    .services-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .services-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #333; }
    .services-list li span:first-child { color: #7c3aed; font-weight: 700; flex-shrink: 0; }

    /* Timeline */
    .timeline { margin-top: 16px; }
    .timeline-item { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
    .timeline-week { background: #7c3aed; color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; flex-shrink: 0; white-space: nowrap; }
    .timeline-desc { font-size: 12px; color: #444; padding-top: 2px; line-height: 1.5; }

    /* FAQ */
    .faq-item { margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 10px; }
    .faq-q { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
    .faq-a { font-size: 12px; color: #555; line-height: 1.5; }

    /* Footer */
    .footer { padding: 30px 50px; background: #1e1b4b; text-align: center; }
    .footer p { color: rgba(196,181,253,0.6); font-size: 11px; line-height: 1.8; }
    .footer strong { color: #c4b5fd; }

    .ad-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-top: 16px; font-size: 12px; color: #92400e; }

    @media print {
      body { background: white; padding-top: 0; }
      .print-bar { display: none; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="back-btn" onclick="window.close()">← Fechar</button>
    <span class="print-bar-title">Proposta Comercial — ${p.clientName}</span>
    <button class="print-btn" onclick="window.print()">⬇ Baixar / Imprimir PDF</button>
  </div>

  <div class="page">
    <!-- Cover -->
    <div class="cover">
      <div class="cover-badge">Grupo F5 · Proposta Comercial</div>
      <div class="cover-title">Transforme sua clínica com<br>marketing de resultado</div>
      <div class="cover-subtitle">Método F5 para clínicas odontológicas</div>
      <div class="cover-client">${p.clientName}</div>
      <div><span class="cover-plan">${p.plan}</span></div>
    </div>

    <!-- Cenário Atual -->
    <div class="section">
      <div class="section-title">01 · Cenário Atual</div>
      <h2>Por que sua clínica precisa de marketing digital?</h2>
      <div class="problem-grid">
        <div class="problem-card">
          <div class="problem-icon">🔍</div>
          <div class="problem-title">Visibilidade</div>
          <div class="problem-text">Sua clínica não aparece nas buscas de quem procura tratamentos odontológicos na região</div>
        </div>
        <div class="problem-card">
          <div class="problem-icon">⚡</div>
          <div class="problem-title">Atendimento</div>
          <div class="problem-text">Sem automação e CRM, leads que chegam fora do horário comercial perdem o interesse</div>
        </div>
        <div class="problem-card">
          <div class="problem-icon">🔄</div>
          <div class="problem-title">Processo Comercial</div>
          <div class="problem-text">Pacientes em potencial não retornam após o primeiro contato, sem recorrência</div>
        </div>
      </div>
    </div>

    <!-- Plano de Ação -->
    <div class="section">
      <div class="section-title">02 · Plano de Ação</div>
      <h2>O que vamos fazer pela sua clínica</h2>
      <div class="action-step">
        <div class="action-num">1</div>
        <div class="action-content">
          <h3>Estruturação Comercial</h3>
          <p>Refinamos o atendimento da clínica e criamos um funil para nenhum paciente passar despercebido — do primeiro contato ao agendamento</p>
        </div>
      </div>
      <div class="action-step">
        <div class="action-num">2</div>
        <div class="action-content">
          <h3>Anúncios Estratégicos</h3>
          <p>Entregamos anúncios direcionados para quem busca tratamentos odontológicos na sua região no Meta Ads e Google Ads</p>
        </div>
      </div>
      <div class="action-step">
        <div class="action-num">3</div>
        <div class="action-content">
          <h3>Acompanhamento de Resultados</h3>
          <p>Analisamos suas conversas e resultados para identificar gargalos e aumentar agendamentos continuamente</p>
        </div>
      </div>
    </div>

    <!-- Metodologia -->
    <div class="section">
      <div class="section-title">03 · Metodologia</div>
      <h2>Nosso Fluxo de Trabalho</h2>
      <div class="flow">
        <div class="flow-step"><div class="step-icon">📋</div><div class="step-label">Briefing</div></div>
        <div class="flow-step"><div class="step-icon">🎯</div><div class="step-label">Estratégia</div></div>
        <div class="flow-step"><div class="step-icon">⚙️</div><div class="step-label">Produção</div></div>
        <div class="flow-step"><div class="step-icon">📈</div><div class="step-label">Publicação</div></div>
        <div class="flow-step"><div class="step-icon">🔍</div><div class="step-label">Análise</div></div>
      </div>
    </div>

    <!-- Investimento -->
    <div class="section">
      <div class="section-title">04 · Investimento</div>
      <h2>Plano ${p.plan}</h2>
      <div class="pricing-grid">
        <div class="price-card">
          <div class="price-label">Implementação (1º mês)</div>
          <div class="price-amount">R$ ${fmt(p.implPrice)}</div>
          <div class="price-period">Taxa única de setup</div>
          ${p.discountApplied ? `<div class="price-discount">✓ Desconto de R$ 500 aplicado</div>` : ""}
        </div>
        <div class="price-card secondary">
          <div class="price-label">Mensalidade (2º mês+)</div>
          <div class="price-amount">R$ ${fmt(p.monthlyPrice)}</div>
          <div class="price-period">por mês</div>
        </div>
      </div>
      <div class="ad-note">
        ⚠️ <strong>Investimento em Anúncios:</strong> a partir de R$ ${fmt(adBudget)}/mês (R$ ${fmt(adBudget / 30)}/dia) — pago diretamente às plataformas Meta e Google. Não incluso nos valores acima.
      </div>

      <ul class="services-list">
        ${servicesList}
      </ul>
    </div>

    <!-- Cronograma -->
    <div class="section">
      <div class="section-title">05 · Cronograma</div>
      <h2>Implantação em 4 semanas</h2>
      <div class="timeline">
        <div class="timeline-item"><span class="timeline-week">Semana 1</span><div class="timeline-desc">Assinatura do contrato e Reunião de Kick-off com a clínica</div></div>
        <div class="timeline-item"><span class="timeline-week">Semana 2</span><div class="timeline-desc">Definição dos criativos e campanhas voltadas para agendamentos</div></div>
        <div class="timeline-item"><span class="timeline-week">Semana 3</span><div class="timeline-desc">Anúncios no ar para captação de pacientes · acompanhamento de resultados</div></div>
        <div class="timeline-item"><span class="timeline-week">Semana 4</span><div class="timeline-desc">Implementação das ferramentas: CRM, API, Automação e Landing Page</div></div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="section">
      <div class="section-title">06 · Dúvidas Comuns</div>
      <div class="faq-item">
        <div class="faq-q">💬 Os anúncios estão inclusos?</div>
        <div class="faq-a">Não. O valor dos anúncios é pago diretamente às plataformas (Meta e Google). Recomendamos a partir de R$ ${fmt(adBudget)}/mês para resultados consistentes.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">🔒 Tem fidelidade?</div>
        <div class="faq-a">Trabalhamos com contrato mínimo de 3 meses para garantir a maturação das campanhas. Após os 3 meses, oferecemos renovação ao cliente.</div>
      </div>
      ${p.notes ? `<div class="faq-item"><div class="faq-q">📝 Observações</div><div class="faq-a">${p.notes}</div></div>` : ""}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Grupo F5 – Consultoria de Marketing Empresarial</strong><br>
      CNPJ: 44.106.618/0001-06<br>
      Proposta gerada em ${p.createdDate} · Válida por 7 dias</p>
    </div>
  </div>
</body>
</html>`;
}
