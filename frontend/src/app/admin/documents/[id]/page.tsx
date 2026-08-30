"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { StatusBadge } from "@/components/ui/NeuBadge";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { Document } from "@/types";

export default function DocumentDetailPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<Array<{ id: string; chunkIndex: number; content: string; pageNumber?: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDocument(id), adminApi.getDocumentChunks(id)])
      .then(([d, c]) => { setDoc(d as Document); setChunks(c as typeof chunks); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC]"><NeuLoading /></div>;
  if (!doc) return <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC]"><p>Document not found</p></div>;

  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} />
      <main className="flex-1 p-4 lg:p-8">
        <Link href="/admin/documents" className="text-sm text-[#6C63FF] hover:underline mb-6 inline-block">&larr; Back</Link>
        <h1 className="font-display text-2xl font-bold text-[#3D4852] mb-2">{doc.title}</h1>
        <StatusBadge status={doc.status} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-8">
          {[
            ["Version", doc.version || "—"],
            ["Pages", doc.pageCount ?? "—"],
            ["Chunks", doc.chunkCount ?? 0],
            ["Department", doc.department || "All"],
            ["File Size", doc.fileSize ? formatFileSize(doc.fileSize) : "—"],
            ["Uploaded", formatDate(doc.createdAt)],
          ].map(([label, value]) => (
            <NeuCard key={label as string} className="!p-4">
              <p className="text-xs text-[#6B7280]">{label as string}</p>
              <p className="font-display font-bold text-[#3D4852] mt-1">{value}</p>
            </NeuCard>
          ))}
        </div>

        {doc.errorMessage && (
          <NeuCard className="mb-6 !p-4">
            <p className="text-sm text-red-500">{doc.errorMessage}</p>
          </NeuCard>
        )}

        <NeuCard>
          <h2 className="font-display font-semibold text-[#3D4852] mb-4">Sample Chunks</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chunks.map((chunk) => (
              <div key={chunk.id} className="rounded-2xl neu-inset-small p-4">
                <p className="text-xs text-[#6B7280] mb-1">Chunk {chunk.chunkIndex} · Page {chunk.pageNumber ?? "—"}</p>
                <p className="text-sm text-[#3D4852]">{chunk.content}</p>
              </div>
            ))}
            {chunks.length === 0 && <p className="text-sm text-[#6B7280]">No chunks available.</p>}
          </div>
        </NeuCard>
      </main>
    </div>
  );
}
