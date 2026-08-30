"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  FileCheck,
  Zap,
  Shield,
  ArrowDown,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuIconWell } from "@/components/ui/NeuIconWell";

const features = [
  { icon: Search, title: "Smart Search", description: "Semantic search across all college documents" },
  { icon: FileCheck, title: "Official Sources", description: "Every answer backed by real document references" },
  { icon: Zap, title: "Instant Answers", description: "Get information about fees, courses, and policies fast" },
  { icon: Shield, title: "Secure Access", description: "Authenticated access to your college knowledge base" },
];

const categories = [
  { icon: GraduationCap, label: "Admissions" },
  { icon: BookOpen, label: "Courses" },
  { icon: DollarSign, label: "Fees" },
  { icon: ClipboardList, label: "Exams" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#E0E5EC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#E0E5EC]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold text-[#3D4852]">
            College AI
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#6B7280]">
            <a href="#features" className="hover:text-[#3D4852] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#3D4852] transition-colors">How it Works</a>
            <a href="#about" className="hover:text-[#3D4852] transition-colors">About</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <NeuButton variant="secondary" className="!px-5 !py-2.5">Login</NeuButton>
            </Link>
            <Link href="/signup">
              <NeuButton className="!px-5 !py-2.5">Start Chatting</NeuButton>
            </Link>
          </div>
          <button
            className="md:hidden p-2 rounded-xl neu-small"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden mx-4 mb-4 rounded-[32px] neu p-6 space-y-4">
            <a href="#features" className="block text-sm text-[#6B7280]" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-[#6B7280]" onClick={() => setMobileOpen(false)}>How it Works</a>
            <Link href="/login"><NeuButton variant="secondary" className="w-full">Login</NeuButton></Link>
            <Link href="/signup"><NeuButton className="w-full">Start Chatting</NeuButton></Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-[#3D4852]">
              College AI Assistant
            </h1>
            <p className="mt-6 text-lg text-[#6B7280] leading-relaxed">
              Ask questions about your college, courses, fees, exams, hostel and more.
              Get grounded answers from official documents.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <NeuButton className="text-base px-8 py-4">Start Chatting</NeuButton>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full neu-small px-4 py-2 text-xs text-[#6B7280]">
                  <Icon className="h-3.5 w-3.5 text-[#6C63FF]" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Neumorphic RAG Visual */}
          <div className="relative flex justify-center">
            <div className="neu-float space-y-4 w-full max-w-sm">
              <NeuCard className="text-center p-6">
                <p className="font-display font-bold text-[#3D4852]">COLLEGE KNOWLEDGE</p>
              </NeuCard>
              <div className="flex justify-center">
                <ArrowDown className="h-6 w-6 text-[#6C63FF]" />
              </div>
              <NeuCard inset className="text-center p-6">
                <NeuIconWell deep className="mx-auto mb-3">
                  <Search className="h-5 w-5 text-[#6C63FF]" />
                </NeuIconWell>
                <p className="text-sm font-medium text-[#6B7280]">Semantic Search</p>
              </NeuCard>
              <div className="flex justify-center">
                <ArrowDown className="h-6 w-6 text-[#6C63FF]" />
              </div>
              <NeuCard className="text-center p-6">
                <p className="font-display font-bold text-[#6C63FF]">AI ANSWER</p>
                <p className="text-xs text-[#6B7280] mt-1">With sources</p>
              </NeuCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-[#3D4852] mb-12">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <NeuCard key={title} hover className="text-center">
              <NeuIconWell deep className="mx-auto mb-4">
                <Icon className="h-5 w-5 text-[#6C63FF]" />
              </NeuIconWell>
              <h3 className="font-display font-semibold text-[#3D4852]">{title}</h3>
              <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
            </NeuCard>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-[#3D4852] mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
          {["Documents", "Semantic Search", "AI Answer"].map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <NeuCard className="px-8 py-6 text-center min-w-[160px]">
                <p className="font-display font-semibold text-[#3D4852]">{step}</p>
              </NeuCard>
              {i < 2 && <ArrowDown className="h-5 w-5 text-[#6C63FF] md:rotate-[-90deg]" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <NeuCard className="text-center py-12">
          <h2 className="font-display text-2xl font-bold text-[#3D4852]">Have a question?</h2>
          <p className="mt-2 text-[#6B7280]">Start chatting with your college AI assistant today.</p>
          <div className="mt-6">
            <Link href="/signup">
              <NeuButton className="px-8">Ask the College AI</NeuButton>
            </Link>
          </div>
        </NeuCard>
      </section>

      <footer className="text-center py-8 text-sm text-[#6B7280]">
        <p>College AI Assistant — Grounded answers from official documents</p>
      </footer>
    </div>
  );
}
