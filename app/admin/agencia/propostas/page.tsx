import { Topbar } from "@/components/layout/Topbar";
import { getProposals } from "@/services/agencia";
import Link from "next/link";
import { PropostasClient } from "./PropostasClient";

export const metadata = { title: "Agência · Propostas | Gestão Interna" };

export default async function PropostasPage() {
  const proposals = await getProposals();

  return (
    <>
      <Topbar title="Agência · Propostas Comerciais" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{proposals.length} proposta{proposals.length !== 1 ? "s" : ""}</p>
          <Link href="/admin/agencia/propostas/new" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-white text-sm font-medium transition-colors">
            + Nova Proposta
          </Link>
        </div>
        <PropostasClient proposals={proposals} />
      </main>
    </>
  );
}
