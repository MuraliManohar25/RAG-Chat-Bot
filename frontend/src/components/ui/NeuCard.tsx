import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface NeuCardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  hover?: boolean;
}

export function NeuCard({ className, inset, hover, children, ...props }: NeuCardProps) {
  return (
    <div
      className={cn(
        "rounded-[32px] bg-[#E0E5EC] p-6 md:p-8",
        inset ? "neu-inset" : "neu",
        hover && "neu-hover transition-all duration-300 ease-out cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
