import { Topbar } from "@/components/layout/Topbar";
import { getInternalUsersForSelect } from "@/services/clients";
import { NewClientForm } from "./NewClientForm";
import Link from "next/link";

export const metadata = { title: "Novo Cliente | Gestão Interna" };

export default async function NewClientPage() {
  const users = await getInternalUsersForSelect();
  return (
    <>
      <Topbar title="Novo Cliente" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/clients" className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <NewClientForm users={users} />
        </div>
      </main>
    </>
  );
}
