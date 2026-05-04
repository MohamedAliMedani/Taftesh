"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";
import {
  LayoutDashboard, Users, UserCheck, ClipboardList,
  MessageSquare, LogOut, Menu, X, Bell, ChevronLeft
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/lib/i18n";
import LanguageToggle from "@/components/ui/LanguageToggle";

const navKeys = [
  { key: "admin.nav.dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "admin.nav.requests", href: "/admin/requests", icon: ClipboardList },
  { key: "admin.nav.users", href: "/admin/users", icon: Users },
  { key: "admin.nav.providers", href: "/admin/providers", icon: UserCheck },
  { key: "admin.nav.messages", href: "/admin/messages", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useT();

  if (status === "loading") return <FullPageLoader />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-[#0d0d0e] border-l border-white/5
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} />
              <div>
                <div className="font-bold outfit text-lg">{t("admin.nav.brandName")}</div>
                <div className="text-[10px] text-amber-500/60 font-bold">{t("admin.nav.panel")}</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navKeys.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {t(item.key)}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass p-3 rounded-xl mb-3">
            <div className="text-sm font-bold">{session.user?.name}</div>
            <div className="text-xs text-muted-foreground">{t("admin.nav.sysAdmin")}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("admin.nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <button onClick={() => router.back()} className="text-muted-foreground hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button
              onClick={() => router.push("/admin/notifications")}
              className="relative text-muted-foreground hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
