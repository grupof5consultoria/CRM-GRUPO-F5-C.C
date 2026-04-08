import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

interface TopbarProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export async function Topbar({ title, backHref, backLabel }: TopbarProps) {
  const session = await getSession();

  // Fetch fresh user data (includes avatarUrl)
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { avatarUrl: true },
      })
    : null;

  const now = new Date();

  const [overdueTasks, overdueCharges] = await Promise.all([
    prisma.task.findMany({
      where: { dueDate: { lt: now }, status: { notIn: ["done", "cancelled"] } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.charge.findMany({
      where: { dueDate: { lt: now }, status: "pending" },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const notifications = [
    ...overdueTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: t.title,
      subtitle: t.client?.name ?? "Sem cliente",
      href: `/admin/tasks/${t.id}`,
      date: `Prazo: ${new Date(t.dueDate!).toLocaleDateString("pt-BR")}`,
    })),
    ...overdueCharges.map((c) => ({
      id: `charge-${c.id}`,
      type: "charge" as const,
      title: c.description,
      subtitle: c.client.name,
      href: `/admin/billing`,
      date: `Venceu: ${new Date(c.dueDate).toLocaleDateString("pt-BR")}`,
    })),
  ];

  return (
    <header className="bg-[#171717] border-b border-[#262626] px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <>
            <a href={backHref} className="text-gray-600 hover:text-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <span className="text-[#262626]">/</span>
            <span className="text-xs text-gray-600">{backLabel}</span>
            <span className="text-[#262626]">/</span>
          </>
        )}
        {title && (
          <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />
        {session && (
          <ProfileMenu
            name={session.name}
            email={session.email}
            avatarUrl={user?.avatarUrl}
          />
        )}
      </div>
    </header>
  );
}
