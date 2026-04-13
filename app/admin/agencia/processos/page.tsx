import { Topbar } from "@/components/layout/Topbar";
import { ProcessosClient } from "./ProcessosClient";

export const metadata = { title: "Agência · Processos | Gestão Interna" };

export default function ProcessosPage() {
  return (
    <>
      <Topbar title="Agência · Processos" />
      <main className="flex-1 overflow-auto p-6">
        <ProcessosClient />
      </main>
    </>
  );
}
