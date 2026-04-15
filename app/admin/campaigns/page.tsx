import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { CampaignsManager } from "./CampaignsManager";
import { TrackingPanel } from "../clients/[id]/TrackingPanel";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  await requireInternalAuth();
  const { tab } = await searchParams;
  const activeTab = tab === "rastreamento" ? "rastreamento" : "whatsapp";

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      whatsappAccounts: {
        where: { status: "active" },
        select: { id: true, phoneNumber: true, displayName: true },
      },
      whatsappCampaigns: {
        include: {
          whatsAppAccount: { select: { phoneNumber: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      trackingCampaigns: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Topbar title="Campanhas" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1a1a1a] border border-[#262626] rounded-xl p-1 mb-6 w-fit">
            <a
              href="/admin/campaigns?tab=whatsapp"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "whatsapp"
                  ? "bg-[#262626] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              💬 Campanhas WhatsApp
            </a>
            <a
              href="/admin/campaigns?tab=rastreamento"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "rastreamento"
                  ? "bg-[#262626] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              📡 Links de Rastreamento
            </a>
          </div>

          {activeTab === "whatsapp" && <CampaignsManager clients={clients} />}

          {activeTab === "rastreamento" && (
            <TrackingPanel clients={clients} />
          )}

        </div>
      </main>
    </>
  );
}
