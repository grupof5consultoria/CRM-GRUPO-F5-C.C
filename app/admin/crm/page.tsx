import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { KanbanBoard } from "./KanbanBoard";

export const metadata = { title: "CRM | Gestão Interna" };

export default async function CRMPage() {
  const leads = await prisma.lead.findMany({
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    where: { status: { notIn: ["closed_won", "closed_lost", "churned"] } },
  });

  return (
    <>
      <Topbar title="CRM" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
          <p className="text-sm text-gray-500">{leads.filter(l => !["closed_won","closed_lost","churned"].includes(l.status)).length} leads no pipeline</p>
          <Link
            href="/admin/crm/new"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-medium text-white transition-colors"
          >
            + Novo Lead
          </Link>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <KanbanBoard leads={leads} />
        </div>
      </main>
    </>
  );
}
