"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { logoutAction } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";

// ─── Logos ───────────────────────────────────────────────────────────────────

const MetaLogo = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
  </svg>
);

const GoogleAdsLogo = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
  </svg>
);

// ─── Nav items ────────────────────────────────────────────────────────────────

type SubItem = { label: string; href: string; icon: React.ReactNode; color: string };
type NavItem = { label: string; href: string; icon: React.ReactNode; subItems?: SubItem[]; separator?: boolean };

const DEFAULT_NAV_ITEMS: NavItem[] = [
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
    subItems: [
      {
        label: "Agência",
        href: "/admin/crm",
        color: "text-violet-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        label: "Clientes",
        href: "/admin/crm-cliente",
        color: "text-pink-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
    ],
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
    label: "Financeiro",
    href: "/admin/billing",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subItems: [
      {
        label: "Cobranças",
        href: "/admin/billing",
        color: "text-emerald-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ),
      },
      {
        label: "Contratos",
        href: "/admin/contracts",
        color: "text-violet-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Tarefas",
    href: "/admin/tasks",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    subItems: [
      {
        label: "Tráfego Pago",
        href: "/admin/tasks/traffic",
        color: "text-sky-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
      },
      {
        label: "Landing Page",
        href: "/admin/tasks/landing",
        color: "text-emerald-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
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
    label: "Relatório",
    href: "/admin/reports",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    subItems: [
      {
        label: "Meta Ads",
        href: "/admin/metrics/meta",
        color: "text-blue-400",
        icon: <MetaLogo />,
      },
      {
        label: "Google Ads",
        href: "/admin/metrics/google",
        color: "text-red-400",
        icon: <GoogleAdsLogo />,
      },
    ],
  },
  {
    label: "Conexões",
    href: "/admin/connections",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    subItems: [
      {
        label: "Meta Ads",
        href: "/admin/connections?tab=meta",
        color: "text-blue-400",
        icon: <MetaLogo />,
      },
      {
        label: "Google Ads",
        href: "/admin/connections?tab=google",
        color: "text-red-400",
        icon: <GoogleAdsLogo />,
      },
      {
        label: "WhatsApp",
        href: "/admin/connections?tab=whatsapp",
        color: "text-emerald-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.522 5.831L.057 23.25a.75.75 0 00.918.899l5.51-1.442A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.497-5.241-1.369l-.369-.213-3.821.999 1.021-3.733-.231-.378A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: "Estratégias",
    href: "/admin/estrategias",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: "Rastreamento",
    href: "/admin/campaigns",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: "Agência",
    href: "/admin/agencia",
    separator: true,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    subItems: [
      {
        label: "Pessoas",
        href: "/admin/agencia/pessoas",
        color: "text-violet-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        label: "Processos",
        href: "/admin/agencia/processos",
        color: "text-blue-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        label: "Rotinas",
        href: "/admin/agencia/rotinas",
        color: "text-amber-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: "Serviços",
        href: "/admin/agencia/servicos",
        color: "text-emerald-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
      {
        label: "Propostas",
        href: "/admin/agencia/propostas",
        color: "text-pink-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: "Educacional",
        href: "/admin/agencia/educacional",
        color: "text-orange-400",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        ),
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState(DEFAULT_NAV_ITEMS);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<EventTarget | null>(null);

  const isMetricsActive = pathname.startsWith("/admin/metrics");

  function toggleMenu(href: string) {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  }

  function isMenuOpen(href: string) {
    return !!openMenus[href];
  }

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    const savedOrder = localStorage.getItem("sidebar-order");
    if (savedOrder) {
      try {
        const order: string[] = JSON.parse(savedOrder);
        // Se o número de itens mudou (novo item adicionado), descarta o cache
        if (order.length !== DEFAULT_NAV_ITEMS.length) {
          localStorage.removeItem("sidebar-order");
        } else {
          const reordered = order
            .map((href) => DEFAULT_NAV_ITEMS.find((i) => i.href === href))
            .filter(Boolean) as typeof DEFAULT_NAV_ITEMS;
          const missing = DEFAULT_NAV_ITEMS.filter((i) => !order.includes(i.href));
          setItems([...reordered, ...missing]);
        }
      } catch {
        localStorage.removeItem("sidebar-order");
      }
    }

    // Auto-open submenus if on a sub-page
    const autoOpen: Record<string, boolean> = {};
    for (const item of DEFAULT_NAV_ITEMS) {
      if (item.subItems?.some(s => pathname.startsWith(s.href))) {
        autoOpen[item.href] = true;
      }
    }
    if (Object.keys(autoOpen).length > 0) setOpenMenus(autoOpen);
  }, [pathname]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragNode.current = e.target;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
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
    <>
    {/* ── Mobile top header ────────────────────────────────────────────────── */}
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#171717] border-b border-[#262626] flex items-center px-4 gap-3">
      <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M14 2L5 13.5H11.5L10 22L19 10.5H12.5L14 2Z" fill="white" fillOpacity="0.95" />
        </svg>
      </div>
      <div>
        <p className="text-white font-bold text-sm">Grupo F5</p>
        <p className="text-gray-600 text-[10px]">Gestão Interna</p>
      </div>
    </header>

    {/* ── Desktop sidebar (hidden on mobile) ──────────────────────────────── */}
    <aside
      className={clsx(
        "hidden md:flex flex-col min-h-screen bg-[#171717] border-r border-[#262626] transition-all duration-300 ease-in-out",
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
          const active = !item.subItems && (pathname === item.href || pathname.startsWith(item.href + "/"));
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

          const separator = item.separator && !collapsed && (
            <div className="flex items-center gap-2 px-1 pt-3 pb-1">
              <div className="flex-1 h-px bg-[#262626]" />
              <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Agência</span>
              <div className="flex-1 h-px bg-[#262626]" />
            </div>
          );

          const dragHandle = !collapsed && !item.subItems && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-20 text-gray-600 hover:text-gray-400"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              </svg>
            </span>
          );

          // ── Item with submenu ───────────────────────────────────────────
          if (item.subItems) {
            const menuOpen = isMenuOpen(item.href);
            const isParentActive = pathname === item.href || item.subItems.some(s => pathname.startsWith(s.href));
            return (
              <div key={item.href}>
              {separator}
              <div className={wrapperClass}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <button
                  onClick={() => toggleMenu(item.href)}
                  title={collapsed ? item.label : undefined}
                  className={clsx(
                    "relative w-full flex items-center rounded-xl text-sm font-medium overflow-hidden transition-all duration-150",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                    isParentActive
                      ? "text-white"
                      : "text-gray-500 hover:bg-[#222222] hover:text-gray-300"
                  )}
                  style={isParentActive ? { background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" } : undefined}
                >
                  {isParentActive && (
                    <>
                      <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)" }} />
                      <span className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
                    </>
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="relative z-10 truncate flex-1 text-left">{item.label}</span>
                      <svg
                        className={clsx("relative z-10 w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200", menuOpen ? "rotate-90" : "")}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                {!collapsed && menuOpen && (
                  <div className="mt-0.5 ml-3 pl-3 border-l border-[#2e2e2e] space-y-0.5">
                    {item.subItems.map((sub) => {
                      const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={clsx(
                            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                            subActive ? "bg-[#222222] text-white" : "text-gray-500 hover:bg-[#1e1e1e] hover:text-gray-300"
                          )}
                        >
                          <span className={subActive ? sub.color : "text-gray-600"}>{sub.icon}</span>
                          <span className="truncate">{sub.label}</span>
                          {subActive && <span className={clsx("ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0", sub.color.replace("text-", "bg-"))} />}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {collapsed && menuOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.subItems.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          title={sub.label}
                          className={clsx(
                            "flex items-center justify-center w-10 h-8 mx-auto rounded-xl transition-all duration-150",
                            subActive ? "bg-[#262626]" : "hover:bg-[#1e1e1e]",
                            sub.color
                          )}
                        >
                          {sub.icon}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            );
          }

          // ── Regular item ────────────────────────────────────────────────
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

    {/* ── Mobile bottom nav ───────────────────────────────────────────────── */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171717] border-t border-[#262626] overflow-x-auto scrollbar-none">
      <div className="flex min-w-max">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 py-3 px-4 flex-shrink-0 transition-colors",
                active ? "text-violet-400" : "text-gray-600 hover:text-gray-400"
              )}
            >
              <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
