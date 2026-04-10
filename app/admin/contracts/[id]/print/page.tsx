import { notFound } from "next/navigation";
import { getContractById } from "@/services/contracts";
import { renderContract, ContractVars, DEFAULT_SERVICES } from "@/lib/contractTemplate";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractPrintPage({ params }: PageProps) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  const hasVars = contract.nomeContratante && contract.cpfContratante && contract.meses;
  if (!hasVars) notFound();

  const vars: ContractVars = {
    plano: contract.plano ?? "START",
    nomeContratante: contract.nomeContratante!,
    enderecoContratante: contract.enderecoContratante ?? "",
    cidadeEstadoCep: contract.cidadeEstadoCep ?? "",
    cpfContratante: contract.cpfContratante!,
    meses: contract.meses!,
    valorMensal: Number(contract.value ?? 0),
    valorMensalExtenso: contract.valorMensalExtenso ?? "",
    diaVencimento: contract.diaVencimento ?? 10,
    publicoAlvo: contract.publicoAlvo ?? "",
    servicos: contract.servicos.length > 0 ? contract.servicos : DEFAULT_SERVICES,
  };

  const contractText = renderContract(vars);
  const isSigned = !!contract.signedAt;

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{contract.title}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; background: white; }
          .page { max-width: 210mm; margin: 0 auto; padding: 25mm 20mm; }
          .header { text-align: center; margin-bottom: 32pt; }
          .header-logo { font-size: 10pt; font-weight: bold; color: #444; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6pt; }
          .header-title { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .contract-body { white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.7; }
          .signature-section { margin-top: 40pt; padding-top: 20pt; border-top: 1px solid #999; }
          .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40pt; margin-top: 16pt; }
          .signature-col { }
          .signature-line { border-top: 1px solid #333; margin-bottom: 8pt; }
          .signature-label { font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 4pt; }
          .signature-name { font-size: 11pt; font-weight: bold; }
          .signature-detail { font-size: 10pt; color: #444; margin-top: 2pt; }
          .signature-date { font-size: 9pt; color: #666; margin-top: 4pt; font-style: italic; }
          .signed-badge { display: inline-block; font-size: 8pt; color: #166534; background: #dcfce7; padding: 2pt 6pt; border-radius: 3pt; margin-bottom: 4pt; }
          .footer { margin-top: 24pt; text-align: center; font-size: 8pt; color: #888; }
          .status-banner { background: #f0fdf4; border: 1px solid #86efac; border-radius: 4pt; padding: 8pt 12pt; margin-bottom: 20pt; font-size: 9pt; color: #166534; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page { padding: 15mm 15mm; }
          }
          .print-btn {
            position: fixed; top: 16px; right: 16px;
            background: #4f46e5; color: white; border: none;
            padding: 10px 20px; border-radius: 8px; font-size: 14px;
            font-family: sans-serif; cursor: pointer; font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex; align-items: center; gap: 8px;
          }
          .print-btn:hover { background: #4338ca; }
        `}</style>
      </head>
      <body>
        <button className="print-btn no-print" onClick={() => window.print()}>
          ⬇ Baixar / Imprimir PDF
        </button>

        <div className="page">
          <div className="header">
            <div className="header-logo">Grupo F5 – Consultoria de Marketing Empresarial</div>
            <div className="header-title">Contrato de Prestação de Serviços</div>
          </div>

          {isSigned && (
            <div className="status-banner">
              ✓ Contrato assinado digitalmente por <strong>{contract.signedByName}</strong> (CPF: {contract.signedByCpf}) em{" "}
              {new Date(contract.signedAt!).toLocaleString("pt-BR")} — IP: {contract.signedIp}
            </div>
          )}

          <pre className="contract-body">{contractText}</pre>

          <div className="signature-section">
            <div className="signature-grid">
              <div className="signature-col">
                <div className="signature-line" />
                <div className="signature-label">Contratada</div>
                <div className="signature-name">GRUPO F5 – CONSULTORIA DE<br />MARKETING EMPRESARIAL</div>
                <div className="signature-detail">CNPJ: 44.106.618/0001-06</div>
              </div>
              <div className="signature-col">
                <div className="signature-line" style={{ borderColor: isSigned ? "#16a34a" : "#333" }} />
                {isSigned && <div className="signed-badge">✓ Assinado Digitalmente</div>}
                <div className="signature-label">Contratante</div>
                <div className="signature-name">{isSigned ? contract.signedByName : contract.nomeContratante}</div>
                <div className="signature-detail">CPF: {isSigned ? contract.signedByCpf : contract.cpfContratante}</div>
                {isSigned && (
                  <div className="signature-date">
                    {new Date(contract.signedAt!).toLocaleString("pt-BR", {
                      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="footer">
            Foro da Comarca de São Paulo/SP — Assinatura digital com validade jurídica conforme Lei nº 14.063/2020
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          // Auto-focus for keyboard print shortcut
          document.querySelector('.print-btn')?.addEventListener('click', () => window.print());
        `}} />
      </body>
    </html>
  );
}
