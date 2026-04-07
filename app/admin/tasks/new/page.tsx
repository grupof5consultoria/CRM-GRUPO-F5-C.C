import { Topbar } from "@/components/layout/Topbar";
import { getInternalUsersForSelect } from "@/services/clients";
import { getClients } from "@/services/clients";
import { NewTaskForm } from "./NewTaskForm";
import Link from "next/link";

export const metadata = { title: "Nova Tarefa | Gestão Interna" };

export default async function NewTaskPage() {
  const [users, clients] = await Promise.all([
    getInternalUsersForSelect(),
    getClients({ status: "active" }),
  ]);

  return (
    <>
      <Topbar title="Nova Tarefa" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/tasks" className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <NewTaskForm users={users} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      </main>
    </>
  );
}
