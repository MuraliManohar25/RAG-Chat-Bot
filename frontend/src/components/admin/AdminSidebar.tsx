"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Search,
  Users,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: Search },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ onLogout, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-display text-lg font-bold text-[#3D4852]">College AI</p>
          <p className="text-xs text-[#6B7280]">Admin Panel</p>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-2 rounded-xl neu-small" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]",
                active ? "neu-inset text-[#3D4852] font-medium" : "text-[#6B7280] hover:neu-inset-small"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#6B7280] hover:neu-inset-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col bg-[#E0E5EC] neu-inset-deep rounded-[32px] m-4 mr-0">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#E0E5EC] shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function NeuStatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[32px] bg-[#E0E5EC] p-6 neu">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full neu-inset-deep">
          <Icon className={cn("h-5 w-5", accent ? "text-[#38B2AC]" : "text-[#6C63FF]")} />
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">{label}</p>
          <p className="font-display text-2xl font-bold text-[#3D4852]">{value}</p>
        </div>
      </div>
    </div>
  );
}
