import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "./AttendanceClient";

export const metadata = { title: "Atendimentos | Portal do Cliente" };

function generatePeriods(count = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export default async function PortalAtendimentosPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const periods = generatePeriods(6);

  const [services, attendances] = await Promise.all([
    prisma.clientService.findMany({
      where: { clientId: session.clientId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attendance.findMany({
      where: { clientId: session.clientId },
      include: { service: { select: { name: true } } },
      orderBy: { contactDate: "desc" },
      take: 100,
    }),
  ]);

  return (
    <main className="flex-1 p-5 bg-[#111111] min-h-screen max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Atendimentos</h1>
        <p className="text-sm text-gray-500 mt-1">Registre cada paciente que entrou em contato</p>
      </div>

      <AttendanceClient
        services={services}
        attendances={attendances}
        currentPeriod={periods[0]}
        periods={periods}
      />
    </main>
  );
}
