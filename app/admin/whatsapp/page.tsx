import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WhatsAppManager } from "./WhatsAppManager";

export default async function WhatsAppPage() {
  await requireInternalAuth();

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      whatsappAccounts: {
        select: {
          id: true,
          phoneNumber: true,
          phoneNumberId: true,
          displayName: true,
          status: true,
          verifiedAt: true,
          wabaId: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">WhatsApp Business</h1>
            </div>
            <p className="text-sm text-gray-500">Conecte os números das clientes para rastrear conversas</p>
          </div>
        </div>

        {/* Setup guide */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-gray-300 mb-3">Como conectar</p>
          <ol className="space-y-2">
            {[
              "Acesse developers.facebook.com e crie um app do tipo \"Business\"",
              "No app, adicione o produto \"WhatsApp\" e configure um WhatsApp Business Account (WABA)",
              "Adicione o número da doutora em \"Phone numbers\" — ela receberá um SMS ou ligação com código",
              "Copie o Phone Number ID e gere um token de sistema permanente",
              "Cole as informações abaixo para conectar",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-gray-500">
                <span className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
            <p className="text-xs text-emerald-400 font-semibold mb-1">Webhook URL (configure no Meta)</p>
            <code className="text-xs text-gray-400 break-all">
              {process.env.NEXT_PUBLIC_APP_URL ?? "https://seu-dominio.com"}/api/webhooks/whatsapp
            </code>
            <p className="text-xs text-gray-600 mt-1">Token de verificação: <span className="text-gray-400 font-mono">grupof5-whatsapp-verify</span></p>
          </div>
        </div>

        <WhatsAppManager clients={clients} />
      </div>
    </div>
  );
}
