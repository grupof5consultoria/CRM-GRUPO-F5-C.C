import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";
import { StrategiesClient } from "./StrategiesClient";

export default async function EstrategiasPage() {
  await requireInternalAuth();

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Topbar title="Estratégias" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen">
        <StrategiesClient clients={clients} />
      </main>
    </>
  );
}
