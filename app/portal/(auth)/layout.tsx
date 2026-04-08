import { redirect } from "next/navigation";
import { getSession, isClientRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { PortalSidebar } from "@/components/layout/PortalSidebar";

export default async function PortalAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isClientRole(session.role)) {
    redirect("/portal/login");
  }

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userName={session.name} logoutAction={logoutAction} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#111111]">
        {children}
      </div>
    </div>
  );
}
