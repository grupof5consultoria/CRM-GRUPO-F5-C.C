import { Topbar } from "@/components/layout/Topbar";
import { NewLeadForm } from "./NewLeadForm";
import Link from "next/link";

export const metadata = { title: "Novo Lead | Gestão Interna" };

export default function NewLeadPage() {
  return (
    <>
      <Topbar title="Novo Lead" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/crm" className="text-sm text-blue-600 hover:underline">← Voltar ao CRM</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <NewLeadForm />
        </div>
      </main>
    </>
  );
}
