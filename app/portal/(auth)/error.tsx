"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#111111] min-h-screen">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Algo deu errado</p>
        <p className="text-sm text-gray-500 mb-5">Tente novamente. Se o problema persistir, entre em contato com nossa equipe.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="relative px-5 py-2.5 rounded-xl text-white text-sm font-medium overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
          >
            <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
            Tentar novamente
          </button>
          <Link
            href="/portal/dashboard"
            className="px-5 py-2.5 rounded-xl text-gray-400 text-sm font-medium bg-[#1a1a1a] border border-[#262626] hover:text-white transition-colors"
          >
            Ir para início
          </Link>
        </div>
      </div>
    </div>
  );
}
