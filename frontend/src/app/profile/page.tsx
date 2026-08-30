"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/chat" className="text-sm text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Chat</Link>
        <Card className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
            <User className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Student"}</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          <div className="mt-4 inline-flex rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 capitalize">
            Role: {user?.role}
          </div>
          <div className="mt-8">
            <Button variant="secondary" onClick={() => { signOut(); router.push("/"); }} className="w-full">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
