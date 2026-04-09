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
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Conexões</h1>
          <p className="text-sm text-gray-500">Gerencie as integrações de cada cliente em um só lugar</p>
        </div>

        <ConnectionsManager clients={clients} />
      </div>
    </div>
  );
}
