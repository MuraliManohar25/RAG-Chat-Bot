import { FileText } from "lucide-react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuIconWell } from "@/components/ui/NeuIconWell";
import { relevanceLabel } from "@/lib/utils";
import type { Source } from "@/types";

export function NeuSourceCard({ source }: { source: Source }) {
  return (
    <NeuCard className="p-4 neu-small">
      <div className="flex items-start gap-3">
        <NeuIconWell deep size="sm">
          <FileText className="h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
        </NeuIconWell>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[#3D4852] truncate">{source.documentTitle}</p>
          {source.pageNumber && (
            <p className="text-xs text-[#6B7280] mt-0.5">Page {source.pageNumber}</p>
          )}
          {source.relevanceScore !== undefined && (
            <p className="text-xs text-[#6B7280] mt-1">
              Relevance: {relevanceLabel(source.relevanceScore)}
            </p>
          )}
        </div>
      </div>
    </NeuCard>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Sources ({sources.length})</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((source, i) => (
          <NeuSourceCard key={`${source.chunkId}-${i}`} source={source} />
        ))}
      </div>
    </div>
  );
}
