import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  hover?: boolean;
}

export function Card({ className, inset, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-6 md:p-8",
        "border border-gray-200 shadow-sm",
        hover && "hover:shadow-md transition-shadow duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
