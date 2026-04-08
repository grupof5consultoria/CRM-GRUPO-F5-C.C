import { getSession } from "@/lib/auth";

interface TopbarProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export async function Topbar({ title, backHref, backLabel }: TopbarProps) {
  const session = await getSession();

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
