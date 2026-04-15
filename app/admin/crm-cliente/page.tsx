import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { KanbanCliente } from "./KanbanCliente";
import { CRMClienteFilters } from "./CRMClienteFilters";

export const metadata = { title: "CRM Clientes | Gestão Interna" };

interface SearchParams {
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function CRMClientePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { clientId, dateFrom, dateTo } = await searchParams;

  const [leads, clients] = await Promise.all([
    prisma.patientLead.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: new Date(dateFrom + "T00:00:00.000Z") } : {}),
                ...(dateTo   ? { lte: new Date(dateTo   + "T23:59:59.999Z") } : {}),
              },
            }
          : {}),
      },
      include: {
        client:   { select: { id: true, name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),

    prisma.client.findMany({
      where: { status: { in: ["active", "prospect"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const activeCount = leads.filter(l => l.status !== "perdido").length;

  return (
    <>
      <Topbar title="CRM · Clientes" />
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#1e1e1e]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{activeCount}</span>
              <span className="text-sm text-gray-500">leads no pipeline</span>
            </div>
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

        {/* Filters */}
        <div className="px-6 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <Suspense fallback={null}>
            <CRMClienteFilters clients={clients} />
          </Suspense>
        </div>

        {/* Kanban */}
        <div className="flex-1 overflow-auto p-6">
          <KanbanCliente leads={leads} />
        </div>
      </main>
    </>
  );
}
