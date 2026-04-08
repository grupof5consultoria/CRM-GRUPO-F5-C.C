import { getSession } from "@/lib/auth";

export async function Topbar({ title }: { title?: string }) {
  const session = await getSession();

  return (
    <header className="bg-[#0d0d14] border-b border-[#1e1e2e] px-6 py-3.5 flex items-center justify-between">
      <div>
        {title && (
          <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-300">{session?.name}</p>
          <p className="text-xs text-gray-600">{session?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {session?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
