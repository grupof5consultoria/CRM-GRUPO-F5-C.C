import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx("px-6 py-4 border-b border-gray-100 dark:border-gray-700", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={clsx("text-base font-bold text-gray-900 dark:text-white tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={clsx("px-6 py-4", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
}

const statVariants = {
  default: {
    bg: "from-indigo-500 to-violet-600",
    iconBg: "bg-white/20",
    text: "text-white",
    sub: "text-indigo-100",
  },
  warning: {
    bg: "from-amber-500 to-orange-500",
    iconBg: "bg-white/20",
    text: "text-white",
    sub: "text-amber-100",
  },
  danger: {
    bg: "from-red-500 to-rose-600",
    iconBg: "bg-white/20",
    text: "text-white",
    sub: "text-red-100",
  },
  success: {
    bg: "from-emerald-500 to-teal-600",
    iconBg: "bg-white/20",
    text: "text-white",
    sub: "text-emerald-100",
  },
};

export function StatCard({ title, value, description, icon, variant = "default" }: StatCardProps) {
  const v = statVariants[variant];
  return (
    <div className={clsx("rounded-2xl bg-gradient-to-br p-5 shadow-md", v.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={clsx("text-sm font-medium", v.sub)}>{title}</p>
          <p className={clsx("text-3xl font-bold mt-1", v.text)}>{value}</p>
          {description && (
            <p className={clsx("text-xs mt-1", v.sub)}>{description}</p>
          )}
        </div>
        {icon && (
          <div className={clsx("p-2.5 rounded-xl", v.iconBg)}>
            <span className={clsx("text-2xl", v.text)}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
