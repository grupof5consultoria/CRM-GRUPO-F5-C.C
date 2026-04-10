import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { getContractById } from "@/services/contracts";
import { renderContract, ContractVars, DEFAULT_SERVICES } from "@/lib/contractTemplate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireInternalAuth();
  const { id } = await params;

  const contract = await getContractById(id);
  if (!contract || !contract.nomeContratante) {
    return new NextResponse("Contrato não encontrado", { status: 404 });
  }

  const vars: ContractVars = {
    plano: contract.plano ?? "START",
    nomeContratante: contract.nomeContratante,
    enderecoContratante: contract.enderecoContratante ?? "",
    cidadeEstadoCep: contract.cidadeEstadoCep ?? "",
    cpfContratante: contract.cpfContratante ?? "",
    meses: contract.meses ?? 3,
    valorMensal: Number(contract.value ?? 0),
    valorMensalExtenso: contract.valorMensalExtenso ?? "",
    diaVencimento: contract.diaVencimento ?? 10,
    publicoAlvo: contract.publicoAlvo ?? "",
    servicos: contract.servicos.length > 0 ? contract.servicos : DEFAULT_SERVICES,
  };

  const contractText = renderContract(vars);
  const isSigned = !!contract.signedAt;

  const html = buildHtml({
    title: contract.title,
    contractText,
    isSigned,
    signedByName: contract.signedByName,
    signedByCpf: contract.signedByCpf,
    signedAt: contract.signedAt,
    signedIp: contract.signedIp,
    nomeContratante: vars.nomeContratante,
    cpfContratante: vars.cpfContratante,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

interface HtmlParams {
  title: string;
  contractText: string;
  isSigned: boolean;
  signedByName?: string | null;
  signedByCpf?: string | null;
  signedAt?: Date | null;
  signedIp?: string | null;
  nomeContratante: string;
  cpfContratante: string;
}

function buildHtml(p: HtmlParams): string {
  const signedDateStr = p.signedAt
    ? new Date(p.signedAt).toLocaleString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; background: #f4f4f4; }
    .page { max-width: 210mm; margin: 0 auto; background: white; padding: 25mm 20mm; min-height: 297mm; box-shadow: 0 2px 16px rgba(0,0,0,0.12); }
    .header { text-align: center; margin-bottom: 32pt; border-bottom: 2px solid #1a1a1a; padding-bottom: 16pt; }
    .header-logo { font-size: 10pt; font-weight: bold; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6pt; }
    .header-title { font-size: 15pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
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
    .status-banner { background: #f0fdf4; border: 1px solid #86efac; border-radius: 4pt; padding: 10pt 14pt; margin-bottom: 24pt; font-size: 10pt; color: #166534; line-height: 1.5; }
    .footer { margin-top: 32pt; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 10pt; }
    .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1e1b4b; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .print-bar-title { color: #c4b5fd; font-family: sans-serif; font-size: 13px; font-weight: 600; }
    .print-btn { background: #7c3aed; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-family: sans-serif; cursor: pointer; font-weight: 600; }
    .print-btn:hover { background: #6d28d9; }
    .back-btn { background: rgba(255,255,255,0.1); color: #c4b5fd; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 8px; font-size: 13px; font-family: sans-serif; cursor: pointer; }
    .back-btn:hover { background: rgba(255,255,255,0.15); }
    body { padding-top: 52px; }
    @media print {
      body { background: white; padding-top: 0; }
      .print-bar { display: none; }
      .page { box-shadow: none; margin: 0; padding: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="back-btn" onclick="window.close()">← Fechar</button>
    <span class="print-bar-title">Grupo F5 — ${p.title}</span>
    <button class="print-btn" onclick="window.print()">⬇ Baixar / Imprimir PDF</button>
  </div>

  <div class="page">
    <div class="header">
      <div class="header-logo">Grupo F5 – Consultoria de Marketing Empresarial</div>
      <div class="header-title">Contrato de Prestação de Serviços</div>
    </div>

    ${p.isSigned ? `
    <div class="status-banner">
      ✓ <strong>Contrato assinado digitalmente</strong><br>
      Assinado por: <strong>${p.signedByName}</strong> (CPF: ${p.signedByCpf})<br>
      Data/Hora: ${signedDateStr}${p.signedIp ? ` — IP: ${p.signedIp}` : ""}
    </div>` : ""}

    <pre class="contract-body">${p.contractText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>

    <div class="signature-section">
      <div class="signature-grid">
        <div>
          <div class="sig-line"></div>
          <div class="sig-label">Contratada</div>
          <div class="sig-name">GRUPO F5 – CONSULTORIA DE<br>MARKETING EMPRESARIAL</div>
          <div class="sig-detail">CNPJ: 44.106.618/0001-06</div>
        </div>
        <div>
          <div class="${p.isSigned ? "sig-line-green" : "sig-line"}"></div>
          ${p.isSigned ? `<div class="signed-badge">✓ Assinado Digitalmente</div>` : ""}
          <div class="sig-label">Contratante</div>
          <div class="sig-name">${p.isSigned ? p.signedByName : p.nomeContratante}</div>
          <div class="sig-detail">CPF: ${p.isSigned ? p.signedByCpf : p.cpfContratante}</div>
          ${p.isSigned ? `<div class="sig-date">${signedDateStr}</div>` : ""}
        </div>
      </div>
    </div>

    <div class="footer">
      Foro da Comarca de São Paulo/SP &nbsp;|&nbsp; Assinatura digital com validade jurídica conforme Lei nº 14.063/2020
    </div>
  </div>
</body>
</html>`;
}
