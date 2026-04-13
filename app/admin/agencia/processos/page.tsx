import { Topbar } from "@/components/layout/Topbar";
import { getProcesses } from "@/services/agencia";
import { ProcessosClient } from "./ProcessosClient";

export const metadata = { title: "Agência · Processos | Gestão Interna" };

export default async function ProcessosPage() {
  const processes = await getProcesses();

  return (
    <>
      <Topbar title="Agência · Processos" />
      <main className="flex-1 overflow-auto p-6">
        <ProcessosClient processes={processes} />
      </main>
    </>
  );
}
