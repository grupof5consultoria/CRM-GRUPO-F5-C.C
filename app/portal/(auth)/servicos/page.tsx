import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServicesClient } from "./ServicesClient";

export const metadata = { title: "Meus Serviços | Portal do Cliente" };

export default async function PortalServicosPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const services = await prisma.clientService.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex-1 p-4 bg-[#111111] min-h-screen w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Meus Serviços</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastre os serviços que você oferece para usar nos atendimentos</p>
      </div>
      <ServicesClient services={services} />
    </main>
  );
}
