import { NextRequest, NextResponse } from "next/server";
import { getContractByDistratoToken } from "@/services/contracts";
import { renderDistrato, DistratoVars } from "@/lib/contractTemplate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const contract = await getContractByDistratoToken(token);
  if (!contract || !contract.nomeContratante) {
    return new NextResponse("Distrato não encontrado", { status: 404 });
  }

  const signedDate = contract.signedAt ?? contract.createdAt;
  const now = new Date();

  const mesesDecorridos = Math.max(0, Math.round(
    (now.getTime() - signedDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ));
  const mesesTotal = contract.meses ?? 3;
  const mesesRestantes = Math.max(0, mesesTotal - mesesDecorridos);
  const valorMensal = Number(contract.value ?? 0);
  const valorMulta = valorMensal * mesesRestantes * 0.3;

  const vars: DistratoVars = {
    nomeContratante: contract.nomeContratante,
    cpfContratante: contract.cpfContratante ?? "",
    plano: contract.plano ?? "START",
    valorMensal,
    mesesTotal,
    mesesDecorridos,
    mesesRestantes,
    valorMulta,
    dataAssinatura: signedDate.toLocaleDateString("pt-BR"),
    dataDistrato: now.toLocaleDateString("pt-BR"),
  };

  const distratoText = renderDistrato(vars);
  const isSigned = !!contract.distratoSignedAt;

  const signedDateStr = contract.distratoSignedAt
    ? new Date(contract.distratoSignedAt).toLocaleString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Distrato — ${contract.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; background: #f4f4f4; }
    .page { max-width: 210mm; margin: 0 auto; background: white; padding: 25mm 20mm; min-height: 297mm; box-shadow: 0 2px 16px rgba(0,0,0,0.12); }
    .header { text-align: center; margin-bottom: 32pt; border-bottom: 2px solid #7f1d1d; padding-bottom: 16pt; }
    .header-logo { font-size: 10pt; font-weight: bold; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6pt; }
    .header-title { font-size: 15pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #7f1d1d; }
    .contract-body { white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.75; text-align: justify; }
    .signature-section { margin-top: 48pt; padding-top: 20pt; border-top: 1px solid #aaa; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48pt; margin-top: 20pt; }
    .sig-line { border-top: 1.5px solid #333; margin-bottom: 8pt; }
    .sig-line-green { border-top: 1.5px solid #16a34a; margin-bottom: 8pt; }
    .sig-label { font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 5pt; }
    .sig-name { font-size: 11pt; font-weight: bold; }
    .sig-detail { font-size: 10pt; color: #444; margin-top: 3pt; }
    .sig-date { font-size: 9pt; color: #555; margin-top: 4pt; font-style: italic; }
    .signed-badge { display: inline-block; font-size: 8pt; color: #166534; background: #dcfce7; border: 1px solid #86efac; padding: 2pt 6pt; border-radius: 3pt; margin-bottom: 5pt; }
    .status-banner { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 4pt; padding: 10pt 14pt; margin-bottom: 24pt; font-size: 10pt; color: #991b1b; line-height: 1.5; }
    .status-banner-signed { background: #f0fdf4; border: 1px solid #86efac; border-radius: 4pt; padding: 10pt 14pt; margin-bottom: 24pt; font-size: 10pt; color: #166534; line-height: 1.5; }
    .footer { margin-top: 32pt; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 10pt; }
    .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #7f1d1d; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
    .print-bar-title { color: #fca5a5; font-family: sans-serif; font-size: 13px; font-weight: 600; }
    .print-btn { background: #dc2626; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-family: sans-serif; cursor: pointer; font-weight: 600; }
    .back-btn { background: rgba(255,255,255,0.1); color: #fca5a5; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 8px; font-size: 13px; font-family: sans-serif; cursor: pointer; }
    body { padding-top: 52px; }
    @media print { body { background: white; padding-top: 0; } .print-bar { display: none; } .page { box-shadow: none; margin: 0; padding: 15mm; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="back-btn" onclick="window.close()">← Fechar</button>
    <span class="print-bar-title">Grupo F5 — Distrato</span>
    <button class="print-btn" onclick="window.print()">⬇ Baixar / Imprimir PDF</button>
  </div>
  <div class="page">
    <div class="header">
      <div class="header-logo">Grupo F5 – Consultoria de Marketing Empresarial</div>
      <div class="header-title">Termo de Distrato — Rescisão Contratual</div>
    </div>
    ${isSigned
      ? `<div class="status-banner-signed">✓ <strong>Distrato assinado digitalmente</strong><br>Por: <strong>${contract.distratoSignedByName}</strong> (CPF: ${contract.distratoSignedByCpf})<br>Data/Hora: ${signedDateStr}</div>`
      : `<div class="status-banner">⚠ <strong>Aguardando assinatura do CONTRATANTE</strong></div>`
    }
    <pre class="contract-body">${distratoText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
    <div class="signature-section">
      <div class="signature-grid">
        <div>
          <div class="sig-line"></div>
          <div class="sig-label">Contratada</div>
          <div class="sig-name">GRUPO F5 – CONSULTORIA DE<br>MARKETING EMPRESARIAL</div>
          <div class="sig-detail">CNPJ: 44.106.618/0001-06</div>
        </div>
        <div>
          <div class="${isSigned ? "sig-line-green" : "sig-line"}"></div>
          ${isSigned ? `<div class="signed-badge">✓ Assinado Digitalmente</div>` : ""}
          <div class="sig-label">Contratante</div>
          <div class="sig-name">${isSigned ? contract.distratoSignedByName : vars.nomeContratante}</div>
          <div class="sig-detail">CPF: ${isSigned ? contract.distratoSignedByCpf : vars.cpfContratante}</div>
          ${isSigned ? `<div class="sig-date">${signedDateStr}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="footer">Foro da Comarca de São Paulo/SP &nbsp;|&nbsp; Assinatura digital com validade jurídica conforme Lei nº 14.063/2020</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
