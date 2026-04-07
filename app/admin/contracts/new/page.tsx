import { Topbar } from "@/components/layout/Topbar";
import { getClientsForSelect, getAcceptedProposalsWithoutContract } from "@/services/contracts";
import { NewContractForm } from "./NewContractForm";
import Link from "next/link";

export const metadata = { title: "Novo Contrato | Gestão Interna" };

export default async function NewContractPage() {
  const [clients, proposals] = await Promise.all([
    getClientsForSelect(),
    getAcceptedProposalsWithoutContract(),
  ]);

  return (
    <>
      <Topbar title="Novo Contrato" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/contracts" className="text-sm text-blue-600 hover:underline">
            ← Voltar
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <NewContractForm clients={clients} proposals={proposals} />
        </div>
      </main>
    </>
  );
}
