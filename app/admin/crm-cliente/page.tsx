import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { KanbanCliente } from "./KanbanCliente";

export const metadata = { title: "CRM Clientes | Gestão Interna" };

export default async function CRMClientePage() {
  const leads = await prisma.patientLead.findMany({
    include: {
      client: { select: { id: true, name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeCount = leads.filter(l => l.status !== "perdido").length;

  return (
    <>
      <Topbar title="CRM · Clientes" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{activeCount} leads no pipeline</span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
              Tráfego Pago · Doutoras
            </span>
          </div>
          <Link
            href="/admin/crm-cliente/new"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-sm font-medium text-white transition-colors"
          >
            + Novo Lead
          </Link>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <KanbanCliente leads={leads} />
        </div>
      </main>
    </>
  );
}
