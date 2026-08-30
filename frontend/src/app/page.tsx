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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            UniMate
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" className="!px-5 !py-2.5">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="!px-5 !py-2.5">Start Chatting</Button>
            </Link>
          </div>
          <button
            className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden mx-4 mb-4 rounded-lg bg-gray-50 border border-gray-200 p-6 space-y-4">
            <a href="#features" className="block text-sm text-gray-600" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-600" onClick={() => setMobileOpen(false)}>How it Works</a>
            <Link href="/login"><Button variant="secondary" className="w-full">Login</Button></Link>
            <Link href="/signup"><Button className="w-full">Start Chatting</Button></Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              UniMate Assistant
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Ask questions about your college, courses, fees, exams, hostel and more.
              Get grounded answers from official documents.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button className="text-base px-8 py-4">Start Chatting</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600">
                  <Icon className="h-3.5 w-3.5 text-blue-600" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* RAG Visual */}
          <div className="relative flex justify-center">
            <div className="space-y-4 w-full max-w-sm">
              <Card className="text-center p-6">
                <p className="font-bold text-gray-900">COLLEGE KNOWLEDGE</p>
              </Card>
              <div className="flex justify-center">
                <ArrowDown className="h-6 w-6 text-blue-600" />
              </div>
              <Card className="text-center p-6 bg-gray-50">
                <div className="mx-auto mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Semantic Search</p>
              </Card>
              <div className="flex justify-center">
                <ArrowDown className="h-6 w-6 text-blue-600" />
              </div>
              <Card className="text-center p-6">
                <p className="font-bold text-blue-600">AI ANSWER</p>
                <p className="text-xs text-gray-600 mt-1">With sources</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} hover className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
          {["Documents", "Semantic Search", "AI Answer"].map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <Card className="px-8 py-6 text-center min-w-[160px]">
                <p className="font-semibold text-gray-900">{step}</p>
              </Card>
              {i < 2 && <ArrowDown className="h-5 w-5 text-blue-600 md:rotate-[-90deg]" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Have a question?</h2>
          <p className="mt-2 text-gray-600">Start chatting with your UniMate assistant today.</p>
          <div className="mt-6">
            <Link href="/signup">
              <Button className="px-8">Ask UniMate</Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="text-center py-8 text-sm text-gray-600">
        <p>UniMate Assistant — Grounded answers from official documents</p>
      </footer>
    </div>
  );
}
