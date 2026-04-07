import { getSession } from "@/lib/auth";

export async function Topbar({ title }: { title?: string }) {
  const session = await getSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
      <div>
        {title && (
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{session?.name}</p>
          <p className="text-xs text-gray-400">{session?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
          {session?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
