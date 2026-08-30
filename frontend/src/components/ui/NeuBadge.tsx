import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "processing";

const variants: Record<BadgeVariant, string> = {
  default: "text-[#3D4852]",
  success: "text-[#38B2AC]",
  warning: "text-[#6C63FF]",
  error: "text-red-500",
  processing: "text-[#6C63FF]",
};

export function NeuBadge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium neu-small",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    ready: { label: "Ready", variant: "success" },
    processing: { label: "Processing", variant: "processing" },
    failed: { label: "Failed", variant: "error" },
    archived: { label: "Archived", variant: "default" },
  };
  const { label, variant } = config[status] || { label: status, variant: "default" as BadgeVariant };
  return (
    <NeuBadge variant={variant}>
      <span className={cn("h-2 w-2 rounded-full", variant === "success" ? "bg-[#38B2AC]" : variant === "error" ? "bg-red-500" : "bg-[#6C63FF]")} />
      {label}
    </NeuBadge>
  );
}
