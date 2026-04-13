import { Topbar } from "@/components/layout/Topbar";
import { getClients } from "@/services/clients";
import { getAllLandingProjects } from "@/services/landingPage";
import { LandingPageClientCard } from "./LandingPageClientCard";

export const metadata = { title: "Landing Page | Tarefas" };

export default async function LandingPage() {
  const [clients, projects] = await Promise.all([
    getClients({ status: "active" }),
    getAllLandingProjects(),
  ]);

  const projectMap = new Map(projects.map(p => [p.clientId, p]));

  const withProject    = clients.filter(c => projectMap.has(c.id));
  const withoutProject = clients.filter(c => !projectMap.has(c.id));

  return (
    <>
      <Topbar title="Landing Page" />
      <main className="flex-1 p-6 space-y-4">

        {withProject.map(client => (
          <LandingPageClientCard
            key={client.id}
            client={{ id: client.id, name: client.name }}
            project={projectMap.get(client.id)!}
          />
        ))}

        {withoutProject.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400 list-none flex items-center gap-1.5 py-1">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {withoutProject.length} cliente{withoutProject.length > 1 ? "s" : ""} sem projeto de landing page
            </summary>
            <div className="mt-2 space-y-2">
              {withoutProject.map(client => (
                <LandingPageClientCard
                  key={client.id}
                  client={{ id: client.id, name: client.name }}
                  project={null}
                />
              ))}
            </div>
          </details>
        )}

      </main>
    </>
  );
}
