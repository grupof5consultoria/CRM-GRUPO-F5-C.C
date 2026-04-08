import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    const base =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
      primary:   "text-white shadow-lg shadow-violet-900/30 hover:scale-[1.02] hover:shadow-violet-900/50 focus:ring-violet-500 focus:ring-offset-[#111111]",
      secondary: "bg-[#1a1a1a] text-gray-300 border border-[#333333] hover:bg-[#222222] hover:text-white focus:ring-violet-500 focus:ring-offset-[#111111]",
      danger:    "text-white shadow-lg shadow-red-900/30 hover:scale-[1.02] focus:ring-red-500 focus:ring-offset-[#111111]",
      ghost:     "text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-200 shadow-none focus:ring-violet-500 focus:ring-offset-[#111111]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const primaryBg  = "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)";
    const dangerBg   = "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], sizes[size], className)}
        style={variant === "primary" ? { background: primaryBg } : variant === "danger" ? { background: dangerBg } : undefined}
        {...props}
      >
        {/* Shine overlay apenas em primary e danger */}
        {(variant === "primary" || variant === "danger") && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)" }}
          />
        )}
        {/* Linha brilhante no topo */}
        {(variant === "primary" || variant === "danger") && (
          <span
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
