import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { getLandingPageProject } from "@/services/landingPage";
import { LandingPagePanel } from "../LandingPagePanel";
import { getClients } from "@/services/clients";

export const metadata = { title: "Landing Page | Tarefas" };

export default async function LandingClientPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;

  const [clients, project] = await Promise.all([
    getClients({ status: "active" }),
    getLandingPageProject(clientId),
  ]);

  const client = clients.find(c => c.id === clientId);
  if (!client || !project) notFound();

  return (
    <>
      <Topbar title={`Landing Page — ${client.name}`} />
      <main className="flex-1 p-6 max-w-3xl">
        <LandingPagePanel project={project} />
      </main>
    </>
  );
}
