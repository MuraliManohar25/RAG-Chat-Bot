"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, FileText, Database, MessageSquare, Users, ThumbsUp } from "lucide-react";
import { AdminSidebar, NeuStatCard } from "@/components/admin/AdminSidebar";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { StatusBadge } from "@/components/ui/NeuBadge";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import type { AdminStats, Document } from "@/types";

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      adminApi.getStats().then((data) => {
        setStats(data as unknown as AdminStats);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC]"><NeuLoading /></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <div className="flex items-center gap-3 mb-8">
          <button className="lg:hidden p-2 rounded-xl neu-small" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#3D4852]">Dashboard</h1>
            <p className="text-sm text-[#6B7280]">Welcome back, {user?.name || "Admin"}. Manage the college knowledge base.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <NeuStatCard label="Documents" value={stats?.totalDocuments ?? 0} icon={FileText} />
          <NeuStatCard label="Indexed Chunks" value={stats?.totalChunks ?? 0} icon={Database} accent />
          <NeuStatCard label="Questions" value={stats?.totalQuestions ?? 0} icon={MessageSquare} />
          <NeuStatCard label="Users" value={stats?.totalUsers ?? 0} icon={Users} />
          <NeuStatCard label="Positive Feedback" value={stats?.positiveFeedback ?? 0} icon={ThumbsUp} accent />
          <NeuStatCard label="Conversations" value={stats?.totalConversations ?? 0} icon={MessageSquare} />
        </div>

        <NeuCard>
          <h2 className="font-display text-lg font-bold text-[#3D4852] mb-4">Recent Documents</h2>
          {(stats?.recentDocuments?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {(stats?.recentDocuments as Document[]).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-2xl neu-inset-small px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#3D4852]">{doc.title}</p>
                    <p className="text-xs text-[#6B7280]">{doc.filename}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">No documents uploaded yet.</p>
          )}
        </NeuCard>
      </main>
    </div>
  );
}
