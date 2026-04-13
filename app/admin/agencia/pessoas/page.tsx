import { Topbar } from "@/components/layout/Topbar";
import { getTeamMembers } from "@/services/agencia";
import { PessoasClient } from "./PessoasClient";

export const metadata = { title: "Agência · Pessoas | Gestão Interna" };

export default async function AgenciaPessoasPage() {
  const members = await getTeamMembers();

  return (
    <>
      <Topbar title="Agência · Pessoas" />
      <main className="flex-1 overflow-auto p-6">
        <PessoasClient members={members} />
      </main>
    </>
  );
}
