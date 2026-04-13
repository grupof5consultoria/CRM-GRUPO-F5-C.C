import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import { NewProposalForm } from "./NewProposalForm";

export default async function NewProposalPage() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Topbar title="Nova Proposta Comercial" backHref="/admin/agencia/propostas" backLabel="Propostas" />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold">Nova Proposta Comercial</h2>
            <p className="text-gray-500 text-sm mt-1">Gere uma proposta personalizada para a clínica odontológica.</p>
          </div>
          <NewProposalForm clients={clients} />
        </div>
      </main>
    </>
  );
}
