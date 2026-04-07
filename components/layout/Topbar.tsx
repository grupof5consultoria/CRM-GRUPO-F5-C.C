import { getSession } from "@/lib/auth";

export async function Topbar({ title }: { title?: string }) {
  const session = await getSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{session?.name}</p>
          <p className="text-xs text-gray-500">{session?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
          {session?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
