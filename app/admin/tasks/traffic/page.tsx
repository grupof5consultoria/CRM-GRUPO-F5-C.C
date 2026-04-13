import { Topbar } from "@/components/layout/Topbar";
import { getClients } from "@/services/clients";
import { prisma } from "@/lib/prisma";
import { TrafficClientCard } from "./TrafficClientCard";
import Link from "next/link";

export const metadata = { title: "Tráfego Pago | Tarefas" };

export default async function TrafficPage() {
  const clients = await getClients({ status: "active" });
  const clientIds = clients.map(c => c.id);

  const [settings, tasks, optimizations, audiences, instagram] = await Promise.all([
    prisma.trafficSettings.findMany({ where: { clientId: { in: clientIds } } }),
    prisma.trafficTask.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    }),
    prisma.campaignOptimization.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { date: "desc" },
    }),
    prisma.audienceUpdate.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: [{ audienceType: "asc" }, { windowDays: "asc" }],
    }),
    prisma.instagramTracking.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { weekReference: "desc" },
    }),
  ]);

  const settingsMap     = new Map(settings.map(s => [s.clientId, s]));
  const tasksMap        = new Map<string, typeof tasks>();
  const optsMap         = new Map<string, typeof optimizations>();
  const audiencesMap    = new Map<string, typeof audiences>();
  const instagramMap    = new Map<string, typeof instagram>();

  for (const t of tasks) {
    if (!tasksMap.has(t.clientId)) tasksMap.set(t.clientId, []);
    tasksMap.get(t.clientId)!.push(t);
  }
  for (const o of optimizations) {
    if (!optsMap.has(o.clientId)) optsMap.set(o.clientId, []);
    optsMap.get(o.clientId)!.push(o);
  }
  for (const a of audiences) {
    if (!audiencesMap.has(a.clientId)) audiencesMap.set(a.clientId, []);
    audiencesMap.get(a.clientId)!.push(a);
  }
  for (const i of instagram) {
    if (!instagramMap.has(i.clientId)) instagramMap.set(i.clientId, []);
    instagramMap.get(i.clientId)!.push(i);
  }

  const configured   = clients.filter(c => settingsMap.has(c.id));
  const unconfigured = clients.filter(c => !settingsMap.has(c.id));

  return (
    <>
      <Topbar title="Tráfego Pago" />
      <main className="flex-1 p-6 space-y-4">

        {configured.map(client => {
          const cfg = settingsMap.get(client.id)!;
          return (
            <TrafficClientCard
              key={client.id}
              client={{ id: client.id, name: client.name }}
              platforms={cfg.platforms}
              settings={{
                platforms: cfg.platforms,
                caMeta: cfg.caMeta,
                caGoogle: cfg.caGoogle,
                dailyBudget: cfg.dailyBudget != null ? Number(cfg.dailyBudget) : null,
                monthlyBudget: cfg.monthlyBudget != null ? Number(cfg.monthlyBudget) : null,
                driveLink: cfg.driveLink,
              }}
              tasks={tasksMap.get(client.id) ?? []}
              optimizations={optsMap.get(client.id) ?? []}
              audiences={(audiencesMap.get(client.id) ?? []).map(a => ({ ...a, lastUpdated: a.lastUpdated ?? null }))}
              instagram={instagramMap.get(client.id) ?? []}
            />
          );
        })}

        {unconfigured.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400 list-none flex items-center gap-1.5 py-1">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {unconfigured.length} cliente{unconfigured.length > 1 ? "s" : ""} sem tráfego configurado
            </summary>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unconfigured.map(client => (
                <Link
                  key={client.id}
                  href={`/admin/tasks/traffic/${client.id}`}
                  className="bg-[#1a1a1a] border border-[#262626] hover:border-[#444] rounded-xl px-4 py-3 flex items-center justify-between gap-3 transition-all group"
                >
                  <p className="text-sm text-gray-500 group-hover:text-gray-300 truncate">{client.name}</p>
                  <span className="text-xs text-gray-700 flex-shrink-0">Configurar →</span>
                </Link>
              ))}
            </div>
          </details>
        )}

      </main>
    </>
  );
}
