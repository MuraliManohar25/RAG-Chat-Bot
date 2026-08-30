import { cn } from "@/lib/utils";

export function NeuSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-[#d1d9e6] neu-inset-small", className)} />;
}

export function NeuLoading({ label = "Thinking..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl neu-inset-small px-4 py-3">
      <div className="flex gap-1">
        <span className="neu-loading-dot h-2.5 w-2.5 rounded-full bg-[#6C63FF]" />
        <span className="neu-loading-dot h-2.5 w-2.5 rounded-full bg-[#6C63FF]" />
        <span className="neu-loading-dot h-2.5 w-2.5 rounded-full bg-[#6C63FF]" />
      </div>
      <span className="text-sm text-[#6B7280]">{label}</span>
    </div>
  );
}

export function NeuEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 h-20 w-20 rounded-full neu-inset-deep flex items-center justify-center">
        <span className="text-3xl">📋</span>
      </div>
      <h3 className="font-display text-xl font-bold text-[#3D4852]">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-[#6B7280]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
