import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "icon" | "danger";

interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#6C63FF] text-white neu neu-pressable hover:bg-[#5a52e0]",
  secondary: "bg-[#E0E5EC] text-[#3D4852] neu neu-pressable",
  ghost: "bg-transparent text-[#3D4852] hover:neu-inset-small",
  icon: "bg-[#E0E5EC] text-[#3D4852] neu-small neu-pressable p-3 min-w-[44px] min-h-[44px]",
  danger: "bg-red-500 text-white neu neu-pressable hover:bg-red-600",
};

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex gap-1">
          <span className="neu-loading-dot h-2 w-2 rounded-full bg-current" />
          <span className="neu-loading-dot h-2 w-2 rounded-full bg-current" />
          <span className="neu-loading-dot h-2 w-2 rounded-full bg-current" />
        </span>
      ) : children}
    </button>
  )
);
NeuButton.displayName = "NeuButton";
