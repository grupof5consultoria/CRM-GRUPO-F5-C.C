"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "task" | "charge";
  title: string;
  subtitle: string;
  href: string;
  date: string;
}

interface NotificationBellProps {
  notifications: Notification[];
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <p className="text-sm font-semibold text-white">Notificações</p>
            {count > 0 && (
              <span className="text-xs text-red-400 font-medium">{count} pendente{count > 1 ? "s" : ""}</span>
            )}
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-8 h-8 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">Tudo em dia!</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-[#1e1e1e]">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#222222] transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === "task" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                    {n.type === "task" ? (
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{n.title}</p>
                    <p className="text-xs text-gray-600 truncate">{n.subtitle}</p>
                    <p className="text-xs text-red-400 mt-0.5">{n.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {count > 0 && (
            <div className="px-4 py-3 border-t border-[#262626] flex gap-2">
              <Link href="/admin/tasks" onClick={() => setOpen(false)} className="flex-1 text-xs text-center text-violet-400 hover:text-violet-300 transition-colors">
                Ver tarefas
              </Link>
              <span className="text-[#262626]">|</span>
              <Link href="/admin/billing" onClick={() => setOpen(false)} className="flex-1 text-xs text-center text-violet-400 hover:text-violet-300 transition-colors">
                Ver cobranças
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
