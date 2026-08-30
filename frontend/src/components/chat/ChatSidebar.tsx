"use client";

import {
  BookOpen,
  GraduationCap,
  DollarSign,
  ClipboardList,
  Plus,
  Settings,
  User,
  LogOut,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

const suggestions = [
  { icon: GraduationCap, label: "Admissions", description: "Requirements & process", query: "What documents are required for admission?" },
  { icon: BookOpen, label: "Courses", description: "Departments & curriculum", query: "What courses are offered by the CSE department?" },
  { icon: DollarSign, label: "Fees", description: "Tuition & hostel fees", query: "What are the hostel fees?" },
  { icon: ClipboardList, label: "Examinations", description: "Rules & schedules", query: "What is the minimum attendance requirement?" },
];

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onLogout,
  mobileOpen,
  onMobileClose,
}: ChatSidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-lg font-bold text-gray-900">
          UniMate
        </Link>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Button onClick={onNewChat} className="w-full mb-6">
        <Plus className="h-4 w-4" /> New Conversation
      </Button>

      <div className="flex-1 overflow-y-auto">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Recent</p>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { onSelect(conv.id); onMobileClose?.(); }}
              className={cn(
                "w-full text-left rounded-lg px-4 py-3 text-sm transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                activeId === conv.id ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 transition-all",
            pathname === "/profile" && "bg-gray-100",
            "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          )}
        >
          <User className="h-4 w-4" /> Profile
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col bg-gray-100 border border-gray-200 rounded-lg m-4 mr-0">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-lg">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function ChatWelcome({ onSuggestion }: { onSuggestion: (query: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 text-4xl">👋</div>
      <h2 className="text-2xl font-bold text-gray-900">How can I help you?</h2>
      <p className="mt-2 text-sm text-gray-600 max-w-md">
        Ask me anything about your college knowledge base.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {suggestions.map(({ icon: Icon, label, description, query }) => (
          <button
            key={label}
            onClick={() => onSuggestion(query)}
            className="rounded-lg bg-white border border-gray-200 p-5 text-left hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="mt-1 text-xs text-gray-600">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export { suggestions };
