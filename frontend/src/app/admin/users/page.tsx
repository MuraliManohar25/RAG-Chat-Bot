"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      adminApi.getUsers().then((d) => { setUsers(d as UserRow[]); setLoading(false); });
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <button className="lg:hidden p-2 rounded-xl neu-small" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-2xl font-bold text-[#3D4852]">Users</h1>
        </div>

        {loading ? <NeuLoading /> : (
          <div className="space-y-3">
            {users.map((u) => (
              <NeuCard key={u.id} className="!p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3D4852]">{u.name || u.email}</p>
                  <p className="text-xs text-[#6B7280]">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full neu-small px-3 py-1 text-xs capitalize">{u.role}</span>
                  <p className="text-xs text-[#6B7280] mt-1">{formatDate(u.createdAt)}</p>
                </div>
              </NeuCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
