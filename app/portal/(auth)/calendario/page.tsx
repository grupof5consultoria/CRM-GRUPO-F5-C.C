import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./CalendarClient";

export const metadata = { title: "Calendário | Portal do Cliente" };

export default async function PortalCalendarioPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  // Fetch all attendances that have a scheduledAt date
  const appointments = await prisma.attendance.findMany({
    where: {
      clientId: session.clientId,
      scheduledAt: { not: null },
    },
    include: { service: { select: { name: true } } },
    orderBy: { scheduledAt: "asc" },
    take: 500,
  });

  return (
    <main className="flex-1 p-5 bg-[#111111] min-h-screen max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Calendário</h1>
        <p className="text-sm text-gray-500 mt-1">Visualize seus agendamentos por data</p>
      </div>

      <CalendarClient appointments={appointments} />
    </main>
  );
}
