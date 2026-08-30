"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar, NeuStatCard } from "@/components/admin/AdminSidebar";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import { MessageSquare, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import type { AdminStats } from "@/types";

export default function AnalyticsPage() {
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
      adminApi.getStats().then((d) => { setStats(d as unknown as AdminStats); setLoading(false); });
    }
  }, [user]);

  const totalFeedback = (stats?.positiveFeedback ?? 0) + (stats?.negativeFeedback ?? 0);
  const positiveRate = totalFeedback > 0 ? Math.round(((stats?.positiveFeedback ?? 0) / totalFeedback) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <button className="lg:hidden p-2 rounded-xl neu-small" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-2xl font-bold text-[#3D4852]">Analytics</h1>
        </div>

        {loading ? <NeuLoading /> : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <NeuStatCard label="Total Questions" value={stats?.totalQuestions ?? 0} icon={MessageSquare} />
              <NeuStatCard label="Positive Feedback" value={`${positiveRate}%`} icon={ThumbsUp} accent />
              <NeuStatCard label="Negative Feedback" value={stats?.negativeFeedback ?? 0} icon={ThumbsDown} />
              <NeuStatCard label="Documents Indexed" value={stats?.indexedDocuments ?? 0} icon={FileText} />
            </div>
            <NeuCard>
              <h2 className="font-display font-semibold text-[#3D4852] mb-4">System Overview</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl neu-inset-small p-4">
                  <p className="text-[#6B7280]">Total Conversations</p>
                  <p className="font-display text-xl font-bold text-[#3D4852]">{stats?.totalConversations ?? 0}</p>
                </div>
                <div className="rounded-2xl neu-inset-small p-4">
                  <p className="text-[#6B7280]">Total Chunks</p>
                  <p className="font-display text-xl font-bold text-[#3D4852]">{stats?.totalChunks ?? 0}</p>
                </div>
                <div className="rounded-2xl neu-inset-small p-4">
                  <p className="text-[#6B7280]">Failed Documents</p>
                  <p className="font-display text-xl font-bold text-[#3D4852]">{stats?.failedDocuments ?? 0}</p>
                </div>
                <div className="rounded-2xl neu-inset-small p-4">
                  <p className="text-[#6B7280]">Registered Users</p>
                  <p className="font-display text-xl font-bold text-[#3D4852]">{stats?.totalUsers ?? 0}</p>
                </div>
              </div>
            </NeuCard>
          </>
        )}
      </main>
    </div>
  );
}
