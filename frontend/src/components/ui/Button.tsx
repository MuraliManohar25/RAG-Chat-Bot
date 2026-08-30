import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "icon" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
  icon: "bg-gray-100 text-gray-900 hover:bg-gray-200 p-3 min-w-[44px] min-h-[44px]",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "border border-transparent",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
          <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-100" />
          <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-200" />
        </span>
      ) : children}
    </button>
  )
);
Button.displayName = "Button";
