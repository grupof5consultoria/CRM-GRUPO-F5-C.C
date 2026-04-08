import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("bg-[#1a1a1a] rounded-2xl border border-[#262626] shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx("px-6 py-4 border-b border-[#262626]", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={clsx("text-sm font-semibold text-white uppercase tracking-wider", className)}>
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

export function StatCard({ title, value, description, icon, variant = "default" }: StatCardProps) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden shadow-lg shadow-violet-900/20"
      style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs text-violet-200/70 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {description && <p className="text-xs text-violet-200/60 mt-1">{description}</p>}
        </div>
        {icon && <div className="p-2 rounded-xl bg-white/10 text-white">{icon}</div>}
      </div>
    </div>
  );
}
