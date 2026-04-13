import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import { NewPatientLeadForm } from "./NewPatientLeadForm";

export const metadata = { title: "Novo Lead · CRM Clientes | Gestão Interna" };

export default async function NewPatientLeadPage() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    where: { status: "active" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Topbar title="Novo Lead · CRM Clientes" />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold">Cadastrar Lead de Paciente</h2>
            <p className="text-gray-500 text-sm mt-1">
              Registre um lead captado via tráfego pago para acompanhar no funil da doutora.
            </p>
          </div>
          <NewPatientLeadForm clients={clients} />
        </div>
      </main>
    </>
  );
}
