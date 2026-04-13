import { Topbar } from "@/components/layout/Topbar";
import { getMeetings } from "@/services/agencia";
import { RotinasClient } from "./RotinasClient";

export const metadata = { title: "Agência · Rotinas | Gestão Interna" };

export default async function RotinasPage() {
  const meetings = await getMeetings();

  return (
    <>
      <Topbar title="Agência · Rotinas e Reuniões" />
      <main className="flex-1 overflow-auto p-6">
        <RotinasClient meetings={meetings} />
      </main>
    </>
  );
}
