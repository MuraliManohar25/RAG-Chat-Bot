import { FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { relevanceLabel } from "@/lib/utils";
import type { Source } from "@/types";

export function NeuSourceCard({ source }: { source: Source }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 shrink-0">
          <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{source.documentTitle}</p>
          {source.pageNumber && (
            <p className="text-xs text-gray-600 mt-0.5">Page {source.pageNumber}</p>
          )}
          {source.relevanceScore !== undefined && (
            <p className="text-xs text-gray-600 mt-1">
              Relevance: {relevanceLabel(source.relevanceScore)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sources ({sources.length})</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((source, i) => (
          <NeuSourceCard key={`${source.chunkId}-${i}`} source={source} />
        ))}
      </div>
    </div>
  );
}
