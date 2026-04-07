import { clsx } from "clsx";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={clsx("hover:bg-gray-50 transition-colors", className)}>{children}</tr>;
}

export function TableTh({ children, className }: TableProps) {
  return (
    <th className={clsx("px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableTd({ children, className }: TableProps) {
  return (
    <td className={clsx("px-4 py-3 text-gray-700", className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ cols, message = "Nenhum registro encontrado." }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-gray-400">
        {message}
      </td>
    </tr>
  );
}
