interface SignatureBlockProps {
  nomeContratante: string;
  cpfContratante: string;
  signedByName?: string | null;
  signedByCpf?: string | null;
  signedAt?: Date | null;
}

export function SignatureBlock({
  nomeContratante,
  cpfContratante,
  signedByName,
  signedByCpf,
  signedAt,
}: SignatureBlockProps) {
  const isSigned = !!signedAt;

  return (
    <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
      <div className="grid grid-cols-2 gap-6">
        {/* CONTRATADA */}
        <div className="space-y-3">
          <div className="h-px bg-gray-600" />
          <div>
            <p className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-1">CONTRATADA</p>
            <p className="text-sm text-gray-300 font-semibold">GRUPO F5 – CONSULTORIA DE MARKETING EMPRESARIAL</p>
            <p className="text-xs text-gray-500 mt-0.5">CNPJ: 44.106.618/0001-06</p>
          </div>
        </div>

        {/* CONTRATANTE */}
        <div className="space-y-3">
          {isSigned ? (
            <>
              <div className="h-px bg-emerald-500/60" />
              <div>
                <p className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">CONTRATANTE — ASSINADO</p>
                <p className="text-sm text-white font-semibold">{signedByName ?? nomeContratante}</p>
                <p className="text-xs text-gray-500 mt-0.5">CPF: {signedByCpf ?? cpfContratante}</p>
                {signedAt && (
                  <p className="text-xs text-emerald-400/70 mt-1">
                    {new Date(signedAt).toLocaleString("pt-BR", {
                      day: "2-digit", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="h-px bg-gray-600 border-dashed" />
              <div>
                <p className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-1">CONTRATANTE</p>
                <p className="text-sm text-gray-300 font-semibold">{nomeContratante}</p>
                <p className="text-xs text-gray-500 mt-0.5">CPF: {cpfContratante}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-700 text-center mt-6">
        São Paulo/SP — Assinatura digital com validade jurídica conforme Lei nº 14.063/2020
      </p>
    </div>
  );
}
