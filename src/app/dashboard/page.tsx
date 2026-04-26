"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield, Clock, MapPin, Package, Calendar, ArrowRight,
  AlertCircle, CheckCircle2, ArrowLeft, Bell, LogOut, Home, FileText
} from "lucide-react";
import { RequestStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { PACKAGE_LABELS } from "@/lib/types";
import type { RequestStatus, PaymentStatus, PackageName } from "@/lib/types";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetch("/api/user/requests")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => { setRequests(data); setLoading(false); })
        .catch(() => { setError("عذراً، فشل تحميل البيانات."); setLoading(false); });
    }
  }, [status, router]);

  if (status === "loading") return <FullPageLoader />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-12">
      <div className="hero-glow opacity-30" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold outfit">أهلاً، {session.user?.name || "مستخدم"}</h1>
              <p className="text-muted-foreground">تتبع طلبات الفحص والتوثيق الخاصة بك</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="glass px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
            >
              <Home className="w-4 h-4" />
              الرئيسية
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="glass px-5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold outfit flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              طلباتي
            </h2>
            <button
              onClick={() => router.push("/#pricing")}
              className="gold-gradient text-black px-5 py-2 rounded-xl text-sm font-bold"
            >
              طلب جديد
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-sm text-amber-200">
            <Shield className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-bold mb-1">خصوصية التواصل</p>
              <p className="opacity-80">
                سيقوم فريق تفتيش بالتنسيق بينك وبين الخبير لتحديد موعد الزيارة. خصوصيتك محمية بالكامل.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center border-red-500/20 rounded-3xl">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 font-bold">{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card p-20 text-center rounded-[40px] border-white/5">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
              <h3 className="text-2xl font-bold mb-2">لا توجد طلبات بعد</h3>
              <p className="text-muted-foreground mb-8">ابدأ أول طلب فحص لعقارك الآن لتأمين استثمارك.</p>
              <button
                onClick={() => router.push("/")}
                className="gold-gradient text-black px-10 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
              >
                احجز فحصك الأول
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 rounded-2xl border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        req.packageName === "FULL" ? "gold-gradient" : "bg-white/5 border border-white/10"
                      }`}>
                        <Package className={`w-7 h-7 ${req.packageName === "FULL" ? "text-black" : "text-amber-500"}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-lg">
                            {PACKAGE_LABELS[req.packageName as PackageName] || req.packageName}
                          </span>
                          <RequestStatusBadge status={req.status as RequestStatus} />
                          {req.reports?.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold">
                              <FileText className="w-3 h-3" />
                              {req.reports.length} تقرير
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {req.property?.location || "العنوان غير متوفر"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">#{req.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-muted-foreground">السعر</div>
                        <div className="text-amber-400 font-bold">{req.packagePrice?.toLocaleString()} ج.م</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-muted-foreground">الدفع</div>
                        <PaymentStatusBadge status={req.paymentStatus as PaymentStatus} />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-muted-foreground">التاريخ</div>
                        <div className="text-sm">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</div>
                      </div>
                      {req.provider && (
                        <div className="flex flex-col items-end">
                          <div className="text-[10px] text-muted-foreground">الخبير</div>
                          <div className="text-xs font-bold text-emerald-400">{req.provider.name}</div>
                        </div>
                      )}
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
