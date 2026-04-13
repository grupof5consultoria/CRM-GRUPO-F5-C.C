import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { getClientById } from "@/services/clients";
import { getTrafficSettings, getTrafficTasks, getCampaignOptimizations, getAudienceUpdates, getInstagramTracking } from "@/services/traffic";
import { TrafficPanel } from "@/app/admin/clients/[id]/TrafficPanel";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientTrafficPage({ params }: PageProps) {
  const { clientId } = await params;

  const [client, settings, tasks, optimizations, audiences, instagram] = await Promise.all([
    getClientById(clientId),
    getTrafficSettings(clientId),
    getTrafficTasks(clientId),
    getCampaignOptimizations(clientId),
    getAudienceUpdates(clientId),
    getInstagramTracking(clientId),
  ]);

  if (!client) notFound();

  return (
    <>
      <Topbar
        title={client.name}
        backHref="/admin/tasks/traffic"
        backLabel="Tráfego Pago"
      />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <TrafficPanel
            clientId={clientId}
            settings={settings ? {
              ...settings,
              dailyBudget: settings.dailyBudget != null ? Number(settings.dailyBudget) : null,
              monthlyBudget: settings.monthlyBudget != null ? Number(settings.monthlyBudget) : null,
            } : null}
            tasks={tasks}
            optimizations={optimizations}
            audiences={audiences.map(a => ({ ...a, lastUpdated: a.lastUpdated ?? null }))}
            instagram={instagram}
          />
        </div>
      </main>
    </>
  );
}
