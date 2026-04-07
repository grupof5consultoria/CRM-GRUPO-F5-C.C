import { redirect } from "next/navigation";
import { getSession, isInternalRole } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isInternalRole(session.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 transition-colors">
        {children}
      </div>
    </div>
  );
}
