"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Plus, Search, Trash2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, authLoading, router]);

  const loadDocs = () => {
    adminApi.getDocuments(search ? { search } : undefined)
      .then((data) => setDocuments(data as Document[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.role === "admin") loadDocs(); }, [user, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document from the knowledge base?")) return;
    await adminApi.deleteDocument(id);
    loadDocs();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          </div>
          <Link href="/admin/documents/upload">
            <Button><Plus className="h-4 w-4" /> Upload Document</Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input className="pl-11" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="animate-pulse text-gray-400">Loading...</div> : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="!p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/documents/${doc.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {doc.title}
                  </Link>
                  <p className="text-xs text-gray-600 mt-0.5">{doc.filename} · v{doc.version || "—"} · {doc.chunkCount ?? 0} chunks</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">{doc.status}</span>
                  <Button variant="icon" onClick={() => handleDelete(doc.id)} aria-label="Delete document">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
            {documents.length === 0 && <p className="text-center text-[#6B7280] py-12">No documents found.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
