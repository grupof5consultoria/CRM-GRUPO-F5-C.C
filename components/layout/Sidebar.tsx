"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { logoutAction } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";

const DEFAULT_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "CRM",
    href: "/admin/crm",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Clientes",
    href: "/admin/clients",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: "Propostas",
    href: "/admin/proposals",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Contratos",
    href: "/admin/contracts",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Financeiro",
    href: "/admin/billing",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Tarefas",
    href: "/admin/tasks",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Catálogo",
    href: "/admin/catalog",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Métricas",
    href: "/admin/metrics",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState(DEFAULT_NAV_ITEMS);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<EventTarget | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    const savedOrder = localStorage.getItem("sidebar-order");
    if (savedOrder) {
      try {
        const order: string[] = JSON.parse(savedOrder);
        const reordered = order
          .map((href) => DEFAULT_NAV_ITEMS.find((i) => i.href === href))
          .filter(Boolean) as typeof DEFAULT_NAV_ITEMS;
        // include any new items not in saved order
        const missing = DEFAULT_NAV_ITEMS.filter((i) => !order.includes(i.href));
        setItems([...reordered, ...missing]);
      } catch {}
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragNode.current = e.target;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // transparent drag image
    const ghost = document.createElement("div");
    ghost.style.opacity = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== overIndex) setOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, moved);
    setItems(newItems);
    localStorage.setItem("sidebar-order", JSON.stringify(newItems.map((i) => i.href)));
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <aside
      className={clsx(
        "flex flex-col min-h-screen bg-[#171717] border-r border-[#262626] transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + toggle */}
      <div className={clsx("flex items-center border-b border-[#262626] h-[57px]", collapsed ? "justify-center px-0" : "px-4 gap-3")}>
        {!collapsed && (
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M14 2L5 13.5H11.5L10 22L19 10.5H12.5L14 2Z" fill="white" fillOpacity="0.95" />
              <path d="M13 5L7.5 13H12L11 19L17 11H13L13 5Z" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">Grupo F5</p>
            <p className="text-gray-600 text-xs truncate">Gestão Interna</p>
          </div>
        )}

        <button
          onClick={toggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-[#222222] transition-all flex-shrink-0"
          title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <svg className={clsx("w-4 h-4 transition-transform duration-300", collapsed ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className={clsx("flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden", collapsed ? "px-2" : "px-3")}>
        {items.map((item, index) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;

          const wrapperClass = clsx(
            "relative group/item transition-all duration-150",
            isDragging && "opacity-40",
            isOver && dragIndex !== null && (
              dragIndex > index
                ? "before:absolute before:-top-0.5 before:left-2 before:right-2 before:h-0.5 before:bg-violet-500 before:rounded-full"
                : "after:absolute after:-bottom-0.5 after:left-2 after:right-2 after:h-0.5 after:bg-violet-500 after:rounded-full"
            )
          );

          const dragHandle = !collapsed && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-20 text-gray-600 hover:text-gray-400"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              </svg>
            </span>
          );

          return (
            <div
              key={item.href}
              className={wrapperClass}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {active ? (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={clsx(
                    "relative flex items-center rounded-xl text-sm font-medium overflow-hidden transition-all duration-150",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5 pr-7"
                  )}
                  style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)" }} />
                  <span className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
                  <span className="relative z-10 text-white">{item.icon}</span>
                  {!collapsed && <span className="relative z-10 text-white truncate">{item.label}</span>}
                  {!collapsed && <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
                </Link>
              ) : (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={clsx(
                    "flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-[#222222] hover:text-gray-300 transition-all duration-150",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5 pr-7"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}
              {dragHandle}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={clsx("py-4 border-t border-[#262626]", collapsed ? "px-2" : "px-3")}>
        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? "Sair" : undefined}
            className={clsx(
              "flex items-center rounded-xl text-sm font-medium text-gray-600 hover:bg-[#222222] hover:text-gray-300 transition-all duration-150",
              collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5 w-full"
            )}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
