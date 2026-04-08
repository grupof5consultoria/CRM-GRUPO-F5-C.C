import { clsx } from "clsx";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={clsx("overflow-x-auto rounded-2xl border border-[#262626] bg-[#1a1a1a] shadow-sm", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#111111] border-b border-[#262626]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[#1e1e1e]">{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={clsx("hover:bg-violet-500/5 transition-colors group", className)}>
      {children}
    </tr>
  );
}

export function TableTh({ children, className }: TableProps) {
  return (
    <th className={clsx("px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableTd({ children, className }: TableProps) {
  return (
    <td className={clsx("px-5 py-4 text-gray-300", className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ cols, message = "Nenhum registro encontrado." }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-16 text-center text-sm text-gray-600">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          {message}
        </div>
      </td>
    </tr>
  );
}
