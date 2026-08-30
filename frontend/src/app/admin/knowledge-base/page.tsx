"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import { relevanceLabel } from "@/lib/utils";
import type { RetrievalResult } from "@/types";

export default function KnowledgeBasePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, authLoading, router]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const data = await adminApi.debugRetrieval(query);
      setResults((data as { chunks: RetrievalResult[] }).chunks || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <button className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base Search</h1>
        </div>

        <div className="flex gap-3 mb-8">
          <Input
            placeholder="Test retrieval query (e.g. attendance requirement)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} loading={searching}>Search</Button>
        </div>

        {searching && <div className="animate-pulse text-gray-400">Retrieving chunks...</div>}

        {searched && !searching && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{results.length} chunks retrieved for &ldquo;{query}&rdquo;</p>
            {results.map((chunk, i) => (
              <Card key={i} className="!p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{chunk.documentTitle}</p>
                    <p className="text-xs text-gray-600">Page {chunk.pageNumber ?? "—"}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {relevanceLabel(chunk.relevanceScore)} ({chunk.relevanceScore.toFixed(2)})
                  </span>
                </div>
                <p className="text-sm text-gray-900 mt-2">&ldquo;{chunk.content}&rdquo;</p>
              </Card>
            ))}
            {results.length === 0 && (
              <Card className="text-center !py-8">
                <p className="text-gray-600">No relevant chunks found above the similarity threshold.</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
