"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuIconWell } from "@/components/ui/NeuIconWell";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC]">
        <NeuLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0E5EC] px-4 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/chat" className="text-sm text-[#6C63FF] hover:underline mb-6 inline-block">&larr; Back to Chat</Link>
        <NeuCard className="text-center">
          <NeuIconWell deep size="lg" className="mx-auto mb-4">
            <User className="h-7 w-7 text-[#6C63FF]" />
          </NeuIconWell>
          <h1 className="font-display text-2xl font-bold text-[#3D4852]">{user?.name || "Student"}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{user?.email}</p>
          <div className="mt-4 inline-flex rounded-full neu-small px-4 py-1.5 text-xs font-medium text-[#3D4852] capitalize">
            Role: {user?.role}
          </div>
          <div className="mt-8">
            <NeuButton variant="secondary" onClick={() => { signOut(); router.push("/"); }} className="w-full">
              <LogOut className="h-4 w-4" /> Logout
            </NeuButton>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
