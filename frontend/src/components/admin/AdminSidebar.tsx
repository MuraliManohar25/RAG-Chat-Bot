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
          <p className="text-lg font-bold text-gray-900">UniMate</p>
          <p className="text-xs text-gray-600">Admin Panel</p>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200" aria-label="Close menu">
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
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"
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
        className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col bg-gray-100 border border-gray-200 rounded-lg m-4 mr-0">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg">
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
    <div className="rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Icon className={cn("h-5 w-5", accent ? "text-green-600" : "text-blue-600")} />
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
