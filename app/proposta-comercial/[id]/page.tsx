import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProposalById } from "@/services/agencia";
import { PLAN_CONFIG } from "@/lib/agencia-config";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const proposal = await getProposalById(id);
  if (!proposal) return { title: "Proposta Comercial | F5 Agência" };
  const cfg = PLAN_CONFIG[proposal.plan as "start" | "scale"];
  return {
    title: `Proposta ${cfg?.label ?? proposal.plan.toUpperCase()} | ${proposal.client.name} · F5 Agência`,
    description: `Proposta comercial exclusiva da F5 Agência para ${proposal.client.name}. Tráfego pago, landing page e portal do cliente.`,
  };
}

const TESTIMONIALS = [
  {
    name: "Dra. Fernanda Lima",
    city: "São Paulo - SP",
    specialty: "Implantodontia",
    text: "Em 3 meses com a F5, minha agenda estava lotada. Recebi mais de 80 leads qualificados só no primeiro mês. O nível de profissionalismo é outro.",
    initials: "FL",
    stars: 5,
    time: "Cliente há 8 meses",
    color: "#7c3aed",
  },
  {
    name: "Dra. Carolina Mendes",
    city: "Curitiba - PR",
    specialty: "Ortodontia & Estética",
    text: "Antes eu tinha medo de investir em tráfego. A F5 me mostrou os números em tempo real, com relatório toda semana. Hoje sei exatamente o que cada real investido traz.",
    initials: "CM",
    stars: 5,
    time: "Cliente há 14 meses",
    color: "#0ea5e9",
  },
  {
    name: "Dra. Juliana Castro",
    city: "Belo Horizonte - MG",
    specialty: "Harmonização Orofacial",
    text: "O portal do cliente é incrível — acompanho tudo em tempo real. Mas o que mais me surpreendeu foi a landing page. Várias pacientes me disseram que fecharam pelo site.",
    initials: "JC",
    stars: 5,
    time: "Cliente há 6 meses",
    color: "#10b981",
  },
];

const DIFFERENTIALS = [
  {
    icon: "🎯",
    title: "Especialistas em Odontologia",
    text: "Não somos generalistas. Entendemos o comportamento da paciente que busca implantes, facetas e harmonização. Nossas campanhas falam a língua do seu público.",
  },
  {
    icon: "📊",
    title: "Transparência total com relatórios",
    text: "Relatório semanal e mensal com métricas reais: custo por lead, quantidade de contatos, conversões. Você sabe exatamente onde cada real foi investido.",
  },
  {
    icon: "🚀",
    title: "Resultados a partir do 2º mês",
    text: "O 1º mês é dedicado à implementação completa da estrutura. A partir do 2º mês, as campanhas já estão no ar e gerando leads qualificados para a sua clínica.",
  },
  {
    icon: "🖥️",
    title: "Portal exclusivo para você",
    text: "Acesse o portal do cliente e veja suas métricas, histórico de cobranças, relatórios e comunicação com a equipe — tudo em um só lugar, disponível 24h.",
  },
  {
    icon: "🤝",
    title: "Parceria de longo prazo",
    text: "Não vendemos serviço avulso. Somos parceiros estratégicos. Nos importamos com o crescimento real da sua clínica e trabalhamos para isso todo mês.",
  },
  {
    icon: "⚡",
    title: "Suporte ágil e humano",
    text: "Nada de robôs ou tickets. Você tem um CS dedicado que responde rápido e entende o seu negócio — da segunda à sexta, sem enrolação.",
  },
];

export default async function PropostaComercialPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) notFound();

  const cfg = PLAN_CONFIG[proposal.plan as "start" | "scale"];
  const isScale = proposal.plan === "scale";
  const priceImpl = Number(proposal.priceImpl);
  const priceMonthly = Number(proposal.priceMonthly);
  const adBudget = proposal.adBudget ? Number(proposal.adBudget) : null;
  const isExpired = proposal.expiresAt && new Date(proposal.expiresAt) < new Date();
  const isAccepted = proposal.status === "accepted";

  const accent = "#7c3aed";
  const accentLight = "#a78bfa";
  const accentDark = "#5b21b6";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans, system-ui, sans-serif); background: #080808; color: #e5e5e5; }
        .grid-bg {
          background-image: linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .glow { box-shadow: 0 0 60px rgba(124,58,237,0.15); }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        }
        .card-hover {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          border-color: rgba(124,58,237,0.3);
        }
        .gradient-text {
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, ${accent}, ${accentDark});
          color: #fff;
          text-decoration: none;
          border-radius: 14px;
          padding: 16px 36px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 24px rgba(124,58,237,0.35);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,58,237,0.5);
        }
        .btn-wa {
          background: linear-gradient(135deg, #25d366, #1da851);
          box-shadow: 0 4px 24px rgba(37,211,102,0.35);
        }
        .btn-wa:hover {
          box-shadow: 0 8px 32px rgba(37,211,102,0.5);
        }
        .star { color: #fbbf24; font-size: 14px; }
        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent);
          margin: 80px 0;
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 30px;
          padding: 6px 16px;
          color: ${accentLight};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .pulse { animation: pulse-dot 2s ease-in-out infinite; }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 30px !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="grid-bg" style={{ minHeight: "100vh" }}>

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
                F5
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>F5 Agência</p>
                <p style={{ color: "#555", fontSize: 11 }}>Especialistas em Odontologia Digital</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {proposal.expiresAt && !isExpired && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  <span style={{ color: "#10b981", fontSize: 12, fontWeight: 500 }}>Proposta ativa</span>
                </div>
              )}
              <span style={{ color: "#444", fontSize: 12 }}>{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 100px" }}>

          {/* ── HERO ───────────────────────────────────────────────── */}
          <div style={{ paddingTop: 72, paddingBottom: 80, textAlign: "center", position: "relative" }}>
            {/* Glow blob */}
            <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: `radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ position: "relative" }}>
              <div className="section-label">
                <span>✦</span> Proposta exclusiva para {proposal.client.name}
              </div>

              <h1 className="hero-title" style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: "#fff", letterSpacing: "-0.03em" }}>
                Mais pacientes.<br />
                <span className="gradient-text">Mais resultado.</span><br />
                Todo mês.
              </h1>

              <p style={{ color: "#888", fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
                Preparamos esta proposta especialmente para a <strong style={{ color: "#ddd" }}>{proposal.client.name}</strong>. Conheça o plano que vai transformar a presença digital da sua clínica.
              </p>

              {/* Plan badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: "14px 28px", marginBottom: 48 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentLight }} />
                <span style={{ color: accentLight, fontWeight: 800, fontSize: 16 }}>{cfg?.label ?? proposal.plan.toUpperCase()}</span>
                <span style={{ color: "#555", fontSize: 14 }}>—</span>
                <span style={{ color: "#aaa", fontSize: 14 }}>R$ {priceMonthly.toLocaleString("pt-BR")}/mês</span>
              </div>

              {/* Key numbers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, maxWidth: 600, margin: "0 auto" }}>
                {[
                  { n: "30+", label: "Clínicas atendidas" },
                  { n: "4.9★", label: "Avaliação dos clientes" },
                  { n: "3x", label: "Retorno médio em leads" },
                ].map((m, i) => (
                  <div key={i} className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
                    <p style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>{m.n}</p>
                    <p style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* ── POR QUE ESCOLHER A F5 ───────────────────────────────── */}
          <section>
            <div className="section-label"><span>⭐</span> Nossos diferenciais</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Por que dentistas de todo o Brasil<br />
              <span className="gradient-text">nos escolhem</span>
            </h2>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 48, maxWidth: 500 }}>
              Não somos uma agência genérica. Somos especialistas em crescimento para clínicas odontológicas.
            </p>
            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {DIFFERENTIALS.map((d, i) => (
                <div key={i} className="card card-hover" style={{ padding: "28px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{d.icon}</div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{d.title}</p>
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{d.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          {/* ── PLANOS ─────────────────────────────────────────────── */}
          <section>
            <div className="section-label"><span>📋</span> Sua proposta</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              O plano ideal para<br />
              <span className="gradient-text">o estágio da sua clínica</span>
            </h2>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 48, maxWidth: 520 }}>
              Desenvolvemos dois caminhos diferentes. Ambos com resultados comprovados — a diferença está na profundidade da parceria.
            </p>

            <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
              {/* START */}
              <div className="card" style={{ padding: "32px", border: `1px solid ${!isScale ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`, position: "relative", overflow: "hidden" }}>
                {!isScale && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: `linear-gradient(135deg, ${accent}, ${accentDark})`, borderRadius: "0 20px 0 12px", padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    SUA PROPOSTA
                  </div>
                )}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 16 }}>
                  🚀
                </div>
                <p style={{ color: accentLight, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", marginBottom: 6 }}>F5 START</p>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 28, marginBottom: 4 }}>R$ {PLAN_CONFIG.start.priceMonthly.toLocaleString("pt-BR")}<span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>/mês</span></p>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>+ R$ {PLAN_CONFIG.start.priceImpl.toLocaleString("pt-BR")} implementação</p>

                <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  Ideal para clínicas que estão iniciando no marketing digital ou que querem testar o potencial dos anúncios antes de escalar. Estrutura completa para gerar leads e lotar a agenda.
                </p>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                  {PLAN_CONFIG.start.services.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <span style={{ color: accentLight, fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#ccc", fontSize: 13 }}>{s}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: accentLight, fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: "#ccc", fontSize: 13 }}>Portal exclusivo do cliente com métricas e relatórios</span>
                  </div>
                </div>
              </div>

              {/* SCALE */}
              <div className="card" style={{ padding: "32px", border: `1px solid ${isScale ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`, position: "relative", overflow: "hidden" }}>
                {isScale && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: `linear-gradient(135deg, ${accent}, ${accentDark})`, borderRadius: "0 20px 0 12px", padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    SUA PROPOSTA
                  </div>
                )}
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: `radial-gradient(ellipse at top right, rgba(124,58,237,0.06), transparent 60%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 16 }}>
                    ⚡
                  </div>
                  <p style={{ color: accentLight, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", marginBottom: 6 }}>F5 SCALE</p>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 28, marginBottom: 4 }}>R$ {PLAN_CONFIG.scale.priceMonthly.toLocaleString("pt-BR")}<span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>/mês</span></p>
                  <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>+ R$ {PLAN_CONFIG.scale.priceImpl.toLocaleString("pt-BR")} implementação</p>

                  <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                    Para clínicas que querem crescimento acelerado e sistemático. CRM integrado, automações de atendimento, acompanhamento comercial completo e uma operação de marketing profissional.
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                    {PLAN_CONFIG.scale.services.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <span style={{ color: accentLight, fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ color: "#ccc", fontSize: 13 }}>{s}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <span style={{ color: accentLight, fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#ccc", fontSize: 13 }}>Portal exclusivo do cliente com métricas, relatórios e histórico financeiro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal highlight */}
            <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(91,33,182,0.05))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ fontSize: 36 }}>🖥️</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Portal exclusivo incluído em todos os planos</p>
                <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>
                  Você terá acesso ao seu próprio portal de cliente — visualize relatórios, métricas das campanhas, histórico de cobranças, documentos e fale com a equipe. Tudo em um painel profissional, disponível 24h no celular ou computador.
                </p>
              </div>
              <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 12, padding: "10px 20px", flexShrink: 0 }}>
                <p style={{ color: accentLight, fontWeight: 700, fontSize: 13 }}>Acesso imediato</p>
                <p style={{ color: "#555", fontSize: 11 }}>após a contratação</p>
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* ── INVESTIMENTO ────────────────────────────────────────── */}
          <section>
            <div className="section-label"><span>💰</span> Investimento</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 40, letterSpacing: "-0.02em" }}>
              Resumo financeiro da<br />
              <span className="gradient-text">sua proposta</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
              {/* Impl */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Implementação</p>
                  <p style={{ color: "#555", fontSize: 13 }}>Pagamento único — configuração completa de toda a estrutura</p>
                </div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 22, flexShrink: 0, marginLeft: 20 }}>R$ {priceImpl.toLocaleString("pt-BR")}</p>
              </div>

              {proposal.discountApplied && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 12, padding: "14px 24px" }}>
                  <span style={{ fontSize: 18 }}>🎁</span>
                  <p style={{ color: "#34d399", fontSize: 13 }}>Desconto de <strong>R$ 500</strong> aplicado na reunião de diagnóstico</p>
                </div>
              )}

              {/* Monthly */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: `rgba(124,58,237,0.08)`, border: `1px solid rgba(124,58,237,0.2)`, borderRadius: 16, padding: "20px 24px" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Mensalidade</p>
                  <p style={{ color: "#555", fontSize: 13 }}>A partir do 2º mês — gestão contínua e otimização mensal</p>
                </div>
                <p style={{ color: accentLight, fontWeight: 800, fontSize: 22, flexShrink: 0, marginLeft: 20 }}>R$ {priceMonthly.toLocaleString("pt-BR")}<span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>/mês</span></p>
              </div>

              {/* Ad budget */}
              {adBudget && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
                  <div>
                    <p style={{ color: "#aaa", fontWeight: 600, fontSize: 15 }}>Verba de Anúncios</p>
                    <p style={{ color: "#444", fontSize: 13 }}>Pago diretamente às plataformas (Meta/Google) · Não incluso na mensalidade</p>
                  </div>
                  <p style={{ color: "#888", fontWeight: 700, fontSize: 20, flexShrink: 0, marginLeft: 20 }}>R$ {adBudget.toLocaleString("pt-BR")}<span style={{ fontSize: 13 }}>/mês</span></p>
                </div>
              )}

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#555", fontSize: 13 }}>💡</span>
                <p style={{ color: "#555", fontSize: 13, lineHeight: 1.5 }}>
                  A verba de anúncios é investida diretamente na plataforma (Meta Ads / Google Ads). Você tem controle total e pode ajustar mês a mês conforme os resultados.
                </p>
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* ── CRONOGRAMA ────────────────────────────────────────────── */}
          <section>
            <div className="section-label"><span>📅</span> Cronograma</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              O que acontece após<br />
              <span className="gradient-text">a contratação</span>
            </h2>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 48 }}>
              Nossa metodologia foi refinada em mais de 30 clínicas. Sabemos exatamente o que funciona.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { day: "Dia 1 – 2", icon: "🤝", title: "Kickoff e Onboarding", desc: "Reunião de apresentação, coleta de acessos das plataformas (Meta Business, Google Ads, Google Meu Negócio) e briefing completo sobre a clínica, especialidades e público-alvo.", color: "#7c3aed" },
                { day: "Dia 3 – 5", icon: "⚙️", title: "Configuração Técnica", desc: "Instalação e configuração do pixel Meta, GA4, Google Tag Manager e conversões. Criação da landing page da clínica e ativação do Portal do Cliente.", color: "#6d28d9" },
                { day: "Dia 6 – 10", icon: "🎨", title: "Produção dos Criativos", desc: "Criação dos primeiros anúncios com copywriting persuasivo voltado ao público odontológico. Definição da estratégia de segmentação para o perfil ideal de paciente.", color: "#5b21b6" },
                { day: "Dia 10 – 14", icon: "🚀", title: "Lançamento das Campanhas", desc: "Ativação das campanhas no Meta Ads e Google Ads. Monitoramento intensivo nos primeiros dias para otimizar a entrega e o custo por lead.", color: "#4c1d95" },
                { day: "30 dias", icon: "📊", title: "1ª Reunião de Resultados", desc: "Apresentação do relatório completo do primeiro mês: leads gerados, custo por contato, conversões e planejamento estratégico para o mês seguinte.", color: "#3b0764" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 24, paddingBottom: i < 4 ? 32 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(124,58,237,0.12)`, border: `1px solid rgba(124,58,237,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {step.icon}
                    </div>
                    {i < 4 && <div style={{ width: 1, flex: 1, background: "rgba(124,58,237,0.15)", marginTop: 8 }} />}
                  </div>
                  <div style={{ paddingTop: 6, paddingBottom: i < 4 ? 16 : 0 }}>
                    <p style={{ color: accentLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{step.day}</p>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{step.title}</p>
                    <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          {/* ── CASOS DE CRESCIMENTO ──────────────────────────────────── */}
          <section>
            <div className="section-label"><span>🚀</span> Resultados reais</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Dentistas que <span className="gradient-text">cresceram conosco</span>
            </h2>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 48, maxWidth: 520 }}>
              Histórias reais de profissionais que transformaram sua carreira com estratégia, presença digital e demanda previsível.
            </p>

            <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Dra. Camila */}
              <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #7c3aed, transparent)" }} />
                <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #7c3aed, #5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>CS</div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Dra. Camila Santiago</p>
                    <p style={{ color: "#555", fontSize: 12 }}>Odontologia Estética & Implantes · São Paulo</p>
                  </div>
                </div>
                <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>📍 Antes</p>
                    <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6 }}>Atendia em 3 clínicas populares diferentes, alugando sala por hora. Sem identidade própria e sem previsibilidade de renda.</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4))" }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>↓</div>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(124,58,237,0.4), transparent)" }} />
                  </div>
                  <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🏛️ Hoje</p>
                    <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>Atende em espaço próprio, com agenda lotada e marca consolidada — sem depender de clínicas de terceiros.</p>
                  </div>
                  <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📈</span>
                    <p style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>Do aluguel de sala para o espaço próprio</p>
                  </div>
                </div>
              </div>

              {/* Dra. Sabrina */}
              <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #0ea5e9, transparent)" }} />
                <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #0ea5e9, #0369a1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>SW</div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Dra. Sabrina Wervisch</p>
                    <p style={{ color: "#555", fontSize: 12 }}>Harmonização Orofacial & Estética · São Paulo</p>
                  </div>
                </div>
                <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>📍 Antes</p>
                    <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6 }}>Atuava em clínicas populares sem autonomia, com dificuldade para fidelizar pacientes e dependendo de espaços de terceiros.</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.4))" }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>↓</div>
                    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(14,165,233,0.4), transparent)" }} />
                  </div>
                  <div style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🚀 Hoje</p>
                    <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>Com demanda própria e consistente, aluga sala diária para realizar procedimentos com total autonomia e agenda organizada.</p>
                  </div>
                  <div style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📈</span>
                    <p style={{ color: "#38bdf8", fontSize: 12, fontWeight: 600 }}>Autonomia e demanda própria consolidada</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <div className="divider" />

          {/* ── DEPOIMENTOS ───────────────────────────────────────────── */}
          <section>
            <div className="section-label"><span>💬</span> Depoimentos</div>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              O que dizem as dentistas<br />
              <span className="gradient-text">que confiam na F5</span>
            </h2>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 48 }}>
              Profissionais reais, resultados reais. Clínicas de diferentes estados e especialidades.
            </p>
            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card card-hover" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ fontSize: 28, color: "rgba(255,255,255,0.08)", fontFamily: "Georgia, serif", lineHeight: 1 }}>"</div>
                  <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, flex: 1 }}>{t.text}</p>
                  <div>
                    <div style={{ display: "flex", marginBottom: 12 }}>
                      {"★★★★★".split("").map((s, j) => <span key={j} className="star">{s}</span>)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {t.initials}
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{t.name}</p>
                        <p style={{ color: "#555", fontSize: 11 }}>{t.specialty} · {t.city}</p>
                        <p style={{ color: "#444", fontSize: 11 }}>{t.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          {/* ── OBSERVAÇÕES ───────────────────────────────────────────── */}
          {proposal.notes && (
            <>
              <section>
                <div className="section-label"><span>📝</span> Observações da proposta</div>
                <div className="card" style={{ padding: "32px", marginTop: 16 }}>
                  <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-line" }}>{proposal.notes}</p>
                </div>
              </section>
              <div className="divider" />
            </>
          )}

          {/* ── VALIDADE ──────────────────────────────────────────────── */}
          {proposal.expiresAt && (
            <div style={{ background: isExpired ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`, borderRadius: 16, padding: "16px 24px", marginBottom: 48, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{isExpired ? "⚠️" : "✅"}</span>
              <p style={{ color: isExpired ? "#f87171" : "#34d399", fontSize: 14 }}>
                {isExpired
                  ? `Esta proposta expirou em ${new Date(proposal.expiresAt).toLocaleDateString("pt-BR")}.`
                  : `Proposta válida até ${new Date(proposal.expiresAt).toLocaleDateString("pt-BR")}.`}
              </p>
            </div>
          )}

          {/* ── CTA FINAL ─────────────────────────────────────────────── */}
          {isAccepted ? (
            <div style={{ textAlign: "center", padding: "64px 40px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
              <p style={{ color: "#34d399", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Proposta Aceita!</p>
              <p style={{ color: "#555", fontSize: 15 }}>Nossa equipe já foi notificada e entrará em contato em breve para iniciar o onboarding.</p>
            </div>
          ) : (
            <section>
              <div style={{ textAlign: "center", padding: "72px 40px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <p style={{ color: accentLight, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>PRÓXIMO PASSO</p>
                  <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.02em" }}>
                    Pronta para lotar<br />
                    <span className="gradient-text">sua agenda?</span>
                  </h2>
                  <p style={{ color: "#666", fontSize: 16, marginBottom: 40, maxWidth: 440, margin: "0 auto 40px" }}>
                    Fale agora com a nossa equipe para formalizar a contratação e dar o primeiro passo rumo a uma agenda sempre cheia.
                  </p>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <a
                      href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20contratar%20o%20plano%20da%20F5%20Ag%C3%AAncia."
                      className="btn-primary btn-wa"
                    >
                      <span style={{ fontSize: 20 }}>💬</span>
                      Falar com a F5 Agência
                    </a>
                  </div>
                  <p style={{ color: "#444", fontSize: 13, marginTop: 20 }}>
                    Resposta em até 15 minutos · Segunda a Sexta, 9h–18h
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "32px 24px", textAlign: "center" }}>
          <p style={{ color: "#333", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>F5 Agência · Especialistas em Odontologia Digital</p>
          <p style={{ color: "#222", fontSize: 12 }}>
            Proposta gerada em {new Date(proposal.createdAt).toLocaleDateString("pt-BR")} · {proposal.client.name}
          </p>
        </footer>
      </div>
    </>
  );
}
