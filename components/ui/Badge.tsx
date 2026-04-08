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
  default: "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
  success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  danger:  "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  info:    "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
  gray:    "bg-white/5 text-gray-400 ring-1 ring-white/10",
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
