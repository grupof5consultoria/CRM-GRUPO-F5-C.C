import { clsx } from "clsx";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-red-100 text-red-700 ring-1 ring-red-200",
  info: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
