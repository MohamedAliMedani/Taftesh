"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ClipboardList, MapPin, Clock, Calendar, Package,
  ArrowLeft, AlertCircle, CheckCircle2, Shield
} from "lucide-react";
import { RequestStatusBadge } from "@/components/ui/StatusBadge";
import { PACKAGE_LABELS } from "@/lib/types";
import type { RequestStatus, PackageName } from "@/lib/types";

export default function ProviderDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provider/requests")
      .then((r) => r.json())
      .then((data) => { setRequests(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const user = session?.user as any;

  const pending = requests.filter((r) => r.status === "ASSIGNED");
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS");
  const completed = requests.filter((r) => r.status === "COMPLETED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold outfit">أهلاً، {session?.user?.name}</h1>
        <p className="text-muted-foreground mt-1">طلباتي</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border-white/5">
          <div className="text-3xl font-bold text-blue-400">{pending.length}</div>
          <div className="text-sm text-muted-foreground">بانتظار البدء</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border-white/5">
          <div className="text-3xl font-bold text-purple-400">{inProgress.length}</div>
          <div className="text-sm text-muted-foreground">جاري التنفيذ</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border-white/5">
          <div className="text-3xl font-bold text-green-400">{completed.length}</div>
          <div className="text-sm text-muted-foreground">مكتمل</div>
        </div>
      </div>

      {!user?.verified && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-sm text-amber-200">
          <Shield className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-bold mb-1">حسابك قيد المراجعة</p>
            <p className="opacity-80">يجب اعتماد حسابك من قبل الإدارة قبل أن يتم تعيين طلبات لك.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border-white/5">
          <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">لا توجد طلبات معينة</h3>
          <p className="text-muted-foreground">سيتم إشعارك عند تعيين طلب جديد لك.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => router.push(`/provider/requests/${req.id}`)}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4 items-start flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    req.packageName === "FULL" ? "gold-gradient" : "bg-white/5 border border-white/10"
                  }`}>
                    <Package className={`w-7 h-7 ${req.packageName === "FULL" ? "text-black" : "text-amber-500"}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        {PACKAGE_LABELS[req.packageName as PackageName] || req.packageName}
                      </span>
                      <RequestStatusBadge status={req.status as RequestStatus} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {req.property?.location || "العنوان غير متوفر"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">#{req.id.slice(-6).toUpperCase()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-muted-foreground">التاريخ</div>
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                  {req.scheduledDate && (
                    <div className="flex flex-col items-end bg-white/5 px-3 py-2 rounded-xl">
                      <div className="text-[10px] text-amber-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> موعد الفحص
                      </div>
                      <div className="text-sm font-bold">
                        {new Date(req.scheduledDate).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>
                  )}
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
