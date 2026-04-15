import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { getLandingPageProject } from "@/services/landingPage";
import { LandingPagePanel } from "../LandingPagePanel";
import { LandingGenerator } from "../LandingGenerator";
import { getClients } from "@/services/clients";
import Link from "next/link";

export const metadata = { title: "Landing Page | Tarefas" };

export default async function LandingClientPage({
  params,
  searchParams,
}: {
  params: { clientId: string };
  searchParams: Promise<{ tab?: string }>;
}) {
  const { clientId } = await params;
  const sp = await searchParams;
  const tab = sp.tab === "gerador" ? "gerador" : "fases";

  const [clients, project] = await Promise.all([
    getClients({ status: "active" }),
    getLandingPageProject(clientId),
  ]);

  const client = clients.find(c => c.id === clientId);
  if (!client || !project) notFound();

  return (
    <>
      <Topbar title={`Landing Page — ${client.name}`} />
      <main className="flex-1 p-6 max-w-4xl">

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-[#111] border border-[#262626] rounded-xl p-1 w-fit">
          <Link
            href={`/admin/tasks/landing/${clientId}?tab=fases`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "fases"
                ? "bg-violet-600 text-white shadow"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Fases do Projeto
          </Link>
          <Link
            href={`/admin/tasks/landing/${clientId}?tab=gerador`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === "gerador"
                ? "bg-violet-600 text-white shadow"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Gerador de Landing Page
            {project.generatorStatus === "draft" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-0.5">
                Rascunho
              </span>
            )}
          </Link>
        </div>

        {tab === "fases" && <LandingPagePanel project={project} />}
        {tab === "gerador" && <LandingGenerator project={project} />}

      </main>
    </>
  );
}
