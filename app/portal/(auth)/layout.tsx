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
      {/* pt-14 = top header height on mobile; pb-16 = bottom nav height on mobile */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#111111] pt-14 pb-16 md:pt-0 md:pb-0">
        {children}
      </div>
    </div>
  );
}
