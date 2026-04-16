import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { TrackingPanel } from "../clients/[id]/TrackingPanel";

export default async function CampaignsPage() {
  await requireInternalAuth();

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      trackingCampaigns: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          message: true,
          landingPageUrl: true,
          createdAt: true,
          _count: { select: { clicks: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Topbar title="Rastreamento de Leads" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-[#0d0d0d] to-[#0d0d0d] p-6">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Rastreamento de Leads</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Crie campanhas e gere URLs únicas por plataforma. Capture cidade, dispositivo e origem de cada lead automaticamente.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative flex items-center gap-6 mt-5 pt-5 border-t border-white/5">
              {[
                { label: "Plataformas rastreadas", value: "4", icon: "📡" },
                { label: "Captura automática de cidade", value: "✓", icon: "📍" },
                { label: "Detecção de dispositivo", value: "✓", icon: "📱" },
                { label: "Lead Frio + Remarketing", value: "✓", icon: "🎯" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-sm font-bold text-violet-300">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TrackingPanel clients={clients} />

        </div>
      </main>
    </>
  );
}
