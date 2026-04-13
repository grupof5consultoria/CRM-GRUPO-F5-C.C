import { notFound } from "next/navigation";
import { getProposalById } from "@/services/agencia";
import { PLAN_CONFIG } from "@/lib/agencia-config";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropostaComercialPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) notFound();

  const cfg = PLAN_CONFIG[proposal.plan as "start" | "scale"];
  const isExpired = proposal.expiresAt && new Date(proposal.expiresAt) < new Date();
  const isAccepted = proposal.status === "accepted";
  const priceImpl = Number(proposal.priceImpl);
  const priceMonthly = Number(proposal.priceMonthly);
  const adBudget = proposal.adBudget ? Number(proposal.adBudget) : null;
  const isScale = proposal.plan === "scale";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)", borderBottom: "1px solid #222", padding: "20px 0" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff" }}>
              F5
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>F5 Agência</p>
              <p style={{ color: "#666", fontSize: 12, margin: 0 }}>Proposta Comercial</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#555", fontSize: 11, margin: 0 }}>Emitida em</p>
            <p style={{ color: "#aaa", fontSize: 13, fontWeight: 600, margin: 0 }}>{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)", border: "1px solid #2a2a2a", borderRadius: 20, padding: "40px 36px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: isScale ? "rgba(124,58,237,0.08)" : "rgba(139,92,246,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: isScale ? "rgba(124,58,237,0.15)" : "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 30, padding: "6px 16px", marginBottom: 20 }}>
              <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 700 }}>{cfg?.label ?? proposal.plan.toUpperCase()}</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>
              Transforme a presença digital<br />
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                da sua clínica
              </span>
            </h1>
            <p style={{ color: "#888", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
              Preparado exclusivamente para <strong style={{ color: "#ddd" }}>{proposal.client.name}</strong>.
              Conheça o plano completo da F5 Agência para crescer com tráfego pago, landing page e gestão profissional.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
                <p style={{ color: "#a78bfa", fontSize: 22, fontWeight: 800, margin: 0 }}>R$ {priceMonthly.toLocaleString("pt-BR")}</p>
                <p style={{ color: "#666", fontSize: 11, margin: 0 }}>por mês</p>
              </div>
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
                <p style={{ color: "#ddd", fontSize: 22, fontWeight: 800, margin: 0 }}>R$ {priceImpl.toLocaleString("pt-BR")}</p>
                <p style={{ color: "#555", fontSize: 11, margin: 0 }}>implementação</p>
              </div>
              {adBudget && (
                <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
                  <p style={{ color: "#ddd", fontSize: 22, fontWeight: 800, margin: 0 }}>R$ {adBudget.toLocaleString("pt-BR")}</p>
                  <p style={{ color: "#555", fontSize: 11, margin: 0 }}>verba anúncios/mês</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* O que está incluso */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "32px", marginBottom: 24 }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>O que está incluso no plano</h2>
          <p style={{ color: "#555", fontSize: 13, margin: "0 0 24px" }}>Tudo que a F5 Agência entrega para sua clínica crescer</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(cfg?.services ?? []).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                <p style={{ color: "#ccc", fontSize: 13, margin: 0, lineHeight: 1.4 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investimento detalhado */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e1e" }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>Resumo do Investimento</h2>
          </div>
          <div style={{ padding: "24px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#1a1a1a", borderRadius: 12, border: "1px solid #222" }}>
                <div>
                  <p style={{ color: "#ddd", fontWeight: 600, fontSize: 14, margin: 0 }}>Implementação</p>
                  <p style={{ color: "#555", fontSize: 12, margin: 0 }}>Pagamento único na contratação</p>
                </div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0 }}>R$ {priceImpl.toLocaleString("pt-BR")}</p>
              </div>
              {proposal.discountApplied && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10 }}>
                  <span style={{ color: "#34d399", fontSize: 14 }}>🎁</span>
                  <p style={{ color: "#34d399", fontSize: 13, margin: 0 }}>Desconto de R$ 500 aplicado na reunião</p>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "rgba(139,92,246,0.08)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)" }}>
                <div>
                  <p style={{ color: "#ddd", fontWeight: 600, fontSize: 14, margin: 0 }}>Mensalidade</p>
                  <p style={{ color: "#555", fontSize: 12, margin: 0 }}>A partir do 2º mês</p>
                </div>
                <p style={{ color: "#a78bfa", fontWeight: 800, fontSize: 18, margin: 0 }}>R$ {priceMonthly.toLocaleString("pt-BR")}<span style={{ fontSize: 13, fontWeight: 500 }}>/mês</span></p>
              </div>
              {adBudget && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#1a1a1a", borderRadius: 12, border: "1px dashed #333" }}>
                  <div>
                    <p style={{ color: "#ddd", fontWeight: 600, fontSize: 14, margin: 0 }}>Verba de Anúncios</p>
                    <p style={{ color: "#555", fontSize: 12, margin: 0 }}>Pago diretamente às plataformas (Meta/Google) · Não incluso na mensalidade</p>
                  </div>
                  <p style={{ color: "#888", fontWeight: 700, fontSize: 16, margin: 0 }}>R$ {adBudget.toLocaleString("pt-BR")}<span style={{ fontSize: 12 }}>/mês</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cronograma */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "32px", marginBottom: 24 }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Cronograma de Implementação</h2>
          <p style={{ color: "#555", fontSize: 13, margin: "0 0 24px" }}>O que acontece após a contratação</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { day: "Dia 1–2", title: "Kickoff e Onboarding", desc: "Reunião de apresentação, coleta de acessos (Meta Business, Google Ads, GMB) e briefing completo." },
              { day: "Dia 3–7", title: "Configuração Técnica", desc: "Instalação de pixels, GA4, GTM. Criação da landing page e otimização do perfil no Google." },
              { day: "Dia 7–14", title: "Lançamento das Campanhas", desc: "Criação e ativação das campanhas no Meta Ads e Google Ads com os primeiros criativos." },
              { day: "30 dias", title: "Reunião de Resultados", desc: "Apresentação dos primeiros resultados, otimizações realizadas e planejamento do próximo ciclo." },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < 3 ? 24 : 0, marginBottom: i < 3 ? 0 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#a78bfa", fontWeight: 800, fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {i < 3 && <div style={{ width: 1, flex: 1, background: "#222", margin: "8px 0" }} />}
                </div>
                <div style={{ paddingTop: 6, paddingBottom: i < 3 ? 16 : 0 }}>
                  <p style={{ color: "#7c3aed", fontSize: 11, fontWeight: 700, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{step.day}</p>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>{step.title}</p>
                  <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        {proposal.notes && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "32px", marginBottom: 24 }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Observações</h2>
            <p style={{ color: "#888", fontSize: 14, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{proposal.notes}</p>
          </div>
        )}

        {/* Validade */}
        {proposal.expiresAt && (
          <div style={{ background: isExpired ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`, borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>{isExpired ? "⚠️" : "✅"}</span>
            <p style={{ color: isExpired ? "#f87171" : "#34d399", fontSize: 14, margin: 0 }}>
              {isExpired
                ? `Esta proposta expirou em ${new Date(proposal.expiresAt).toLocaleDateString("pt-BR")}.`
                : `Proposta válida até ${new Date(proposal.expiresAt).toLocaleDateString("pt-BR")}.`}
            </p>
          </div>
        )}

        {/* Status / CTA */}
        {isAccepted ? (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <p style={{ color: "#34d399", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Proposta Aceita!</p>
            <p style={{ color: "#555", fontSize: 14, margin: 0 }}>Entraremos em contato em breve para dar início ao onboarding.</p>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(91,33,182,0.08) 100%)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "40px", textAlign: "center" }}>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Pronto para começar?</h2>
            <p style={{ color: "#777", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
              Entre em contato com a F5 Agência para formalizar a contratação e dar o primeiro passo.
            </p>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20contratar%20o%20plano%20da%20F5%20Ag%C3%AAncia."
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 14, padding: "14px 32px", fontWeight: 700, fontSize: 16 }}
            >
              <span>💬</span> Falar com a F5 Agência
            </a>
            <p style={{ color: "#444", fontSize: 12, marginTop: 16, marginBottom: 0 }}>
              Resposta em até 15 minutos durante horário comercial
            </p>
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#333", fontSize: 12, margin: 0 }}>
          F5 Agência · Proposta gerada em {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </footer>
    </div>
  );
}
