import { Topbar } from "@/components/layout/Topbar";
import { getClientsForSelect } from "@/services/contracts";
import { NewContractForm } from "./NewContractForm";
import Link from "next/link";

export const metadata = { title: "Novo Contrato | Gestão Interna" };

export default async function NewContractPage() {
  const clients = await getClientsForSelect();

  return (
    <>
      <Topbar title="Novo Contrato" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <Link href="/admin/contracts" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Voltar aos Contratos
          </Link>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6">
          <NewContractForm clients={clients} />
        </div>
      </main>
    </>
  );
}
