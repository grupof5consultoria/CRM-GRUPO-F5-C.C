import { Topbar } from "@/components/layout/Topbar";
import { getWikiPages } from "@/services/agencia";
import { ServicosClient } from "./ServicosClient";

export const metadata = { title: "Agência · Serviços | Gestão Interna" };

export default async function ServicosPage() {
  const [trafegoPages, landingPages, automacaoPages] = await Promise.all([
    getWikiPages("trafego"),
    getWikiPages("landing"),
    getWikiPages("automacao"),
  ]);

  return (
    <>
      <Topbar title="Agência · Serviços" />
      <main className="flex-1 overflow-auto p-6">
        <ServicosClient
          trafegoPages={trafegoPages}
          landingPages={landingPages}
          automacaoPages={automacaoPages}
        />
      </main>
    </>
  );
}
