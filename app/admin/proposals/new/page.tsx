import { Topbar } from "@/components/layout/Topbar";
import { NewProposalForm } from "./NewProposalForm";
import Link from "next/link";

export const metadata = { title: "Nova Proposta | Gestão Interna" };

export default function NewProposalPage() {
  return (
    <>
      <Topbar title="Nova Proposta" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/proposals" className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <NewProposalForm />
        </div>
      </main>
    </>
  );
}
