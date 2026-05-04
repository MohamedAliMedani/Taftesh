"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import {
  Users, UserCheck, ClipboardList, DollarSign,
  Clock, CheckCircle2, TrendingUp, ArrowLeft, Scale
} from "lucide-react";
import type { AdminStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const t = useT();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: t("admin.totalUsers"), value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: t("admin.providers"), value: stats.totalProviders, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: t("admin.totalRequests"), value: stats.totalRequests, icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: t("admin.pendingRequests"), value: stats.pendingRequests, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
        { label: t("admin.completedRequests"), value: stats.completedRequests, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
        { label: t("admin.revenue"), value: stats.totalRevenue.toLocaleString(), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: t("admin.weeklyRequests"), value: stats.recentRequests, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold outfit">{t("admin.dashboard")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.overview")}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => router.push("/admin/requests")}
          className="glass-card p-6 rounded-2xl text-right hover:bg-white/5 transition-colors group"
        >
          <ClipboardList className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">{t("admin.manageRequests")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.manageRequestsDesc")}</p>
          <ArrowLeft className="w-5 h-5 text-amber-400 mt-4 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => router.push("/admin/providers")}
          className="glass-card p-6 rounded-2xl text-right hover:bg-white/5 transition-colors group"
        >
          <UserCheck className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">{t("admin.manageProviders")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.manageProvidersDesc")}</p>
          <ArrowLeft className="w-5 h-5 text-emerald-400 mt-4 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => router.push("/admin/users")}
          className="glass-card p-6 rounded-2xl text-right hover:bg-white/5 transition-colors group"
        >
          <Users className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">{t("admin.manageUsers")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.manageUsersDesc")}</p>
          <ArrowLeft className="w-5 h-5 text-blue-400 mt-4 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => router.push("/admin/continuations")}
          className="glass-card p-6 rounded-2xl text-right hover:bg-white/5 transition-colors group"
        >
          <Scale className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">{t("admin.legalFollowUps")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.legalFollowUpsDesc")}</p>
          <ArrowLeft className="w-5 h-5 text-purple-400 mt-4 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
