import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const NeuInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl bg-[#E0E5EC] px-5 py-3.5 text-[#3D4852] placeholder:text-[#A0AEC0]",
        "neu-inset focus:neu-inset-deep focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC]",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
NeuInput.displayName = "NeuInput";

export const NeuTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl bg-[#E0E5EC] px-5 py-3.5 text-[#3D4852] placeholder:text-[#A0AEC0] resize-none",
        "neu-inset focus:neu-inset-deep focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC]",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
NeuTextarea.displayName = "NeuTextarea";
