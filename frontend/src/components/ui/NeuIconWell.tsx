import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NeuIconWellProps {
  children: ReactNode;
  className?: string;
  deep?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function NeuIconWell({ children, className, deep, size = "md" }: NeuIconWellProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[#E0E5EC]",
        deep ? "neu-inset-deep" : "neu-inset",
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
