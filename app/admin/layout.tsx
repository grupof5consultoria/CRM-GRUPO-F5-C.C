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
      <div className="flex-1 flex flex-col min-w-0 bg-[#111111] pt-14 pb-20 md:pt-0 md:pb-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
