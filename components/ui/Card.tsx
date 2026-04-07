import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx("px-6 py-4 border-b border-gray-100", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={clsx("text-base font-semibold text-gray-900", className)}>
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
  default: "text-blue-600",
  warning: "text-yellow-600",
  danger: "text-red-600",
  success: "text-green-600",
};

export function StatCard({ title, value, description, icon, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        {icon && (
          <div className={clsx("flex-shrink-0 text-2xl", statVariants[variant])}>
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={clsx("text-2xl font-bold", statVariants[variant])}>{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
