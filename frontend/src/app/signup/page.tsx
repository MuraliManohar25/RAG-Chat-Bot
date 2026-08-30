"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { useAuth } from "@/lib/auth/context";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name, "student");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC] px-4">
      <NeuCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-xl font-bold text-[#3D4852]">College AI</Link>
          <h1 className="font-display text-2xl font-bold text-[#3D4852] mt-6">Create account</h1>
          <p className="text-sm text-[#6B7280] mt-2">Join your college AI assistant</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-[#38B2AC] font-medium">Account created! Check your email to verify, then sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#3D4852] mb-2">Full Name</label>
              <NeuInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#3D4852] mb-2">Email</label>
              <NeuInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3D4852] mb-2">Password</label>
              <NeuInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
            <NeuButton type="submit" loading={loading} className="w-full">Create Account</NeuButton>
          </form>
        )}

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#6C63FF] font-medium hover:underline">Sign in</Link>
        </p>
      </NeuCard>
    </div>
  );
}
