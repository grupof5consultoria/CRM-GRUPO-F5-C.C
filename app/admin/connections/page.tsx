import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionsManager } from "./ConnectionsManager";

export default async function ConnectionsPage() {
  await requireInternalAuth();

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      metaAdAccountId: true,
      metaAccessToken: true,
      googleAdsCustomerId: true,
      googleRefreshToken: true,
      whatsappAccounts: {
        select: {
          id: true,
          phoneNumber: true,
          phoneNumberId: true,
          displayName: true,
          status: true,
          verifiedAt: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600/30 to-violet-900/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Conexões</h1>
            <p className="text-sm text-gray-500">Gerencie as integrações de cada cliente em um só lugar</p>
          </div>
        </div>

        <ConnectionsManager clients={clients} />
      </div>
    </div>
  );
}
