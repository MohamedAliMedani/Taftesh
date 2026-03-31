"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Clock, MapPin, Package, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UserDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isExpert = (session?.user as any)?.role === "EXPERT";

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
                .then((data) => {
                    setRequests(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setError("عذراً، فشل تحميل البيانات.");
                    setLoading(false);
                });
        }
    }, [status, router]);

    const isRecent = (date: string) => {
        const createdDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 35;
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
            </div>
        );
    }

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
                            <p className="text-muted-foreground">{isExpert ? "إليك قائمة بالطلبات المتاحة في تخصصك" : "تتبع طلبات الفحص والتوثيق الخاصة بك"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="glass px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
                    >
                        العودة للرئيسية <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                    </button>
                </header>

                <section className="space-y-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold outfit flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            {isExpert ? "الطلبات المتاحة حديثاً" : "تاريخ المعاملات (آخر 35 يوم)"}
                        </h2>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-sm text-amber-200">
                        <Shield className="w-5 h-5 flex-shrink-0 text-amber-500" />
                        <div>
                            <p className="font-bold mb-1">خصوصية التواصل</p>
                            <p className="opacity-80">
                                {isExpert
                                    ? "بموجب سياسة المنصة، يتم التنسيق مع العميل حصرياً من خلال فريق تفتيش. لضمان الأمان، لا يتم مشاركة أرقام الهواتف."
                                    : "سيقوم فريق تفتيش بالتنسيق بينك وبين الخبير لتحديد موعد الزيارة. لن يتم مشاركة رقم هاتفك مع الخبير لضمان خصوصيتك وأمانك."}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass-card h-32 animate-pulse rounded-3xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="glass-card p-12 text-center border-red-500/20">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-400 font-bold">{error}</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="glass-card p-20 text-center rounded-[40px] border-white/5">
                            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-bold mb-2">لا توجد طلبات بعد</h3>
                            <p className="text-muted-foreground mb-8">
                                {isExpert ? "لا توجد طلبات متاحة للفحص حالياً." : "ابدأ أول طلب فحص لعقارك الآن لتأمين استثمارك."}
                            </p>
                            {!isExpert && (
                                <button
                                    onClick={() => router.push("/")}
                                    className="gold-gradient text-black px-10 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
                                >
                                    احجز فحصك الأول
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((req, i) => {
                                const recent = isRecent(req.createdAt);
                                return (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`glass-card p-6 md:p-8 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${!recent && !isExpert ? "opacity-60" : ""}`}
                                    >
                                        {!recent && !isExpert && <div className="absolute top-0 right-0 w-full h-full bg-black/20 pointer-events-none" />}

                                        <div className="flex gap-6 items-center flex-1">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${req.packageName === "FULL" ? "gold-gradient" : "bg-white/5 border border-white/10"}`}>
                                                <Package className={`w-8 h-8 ${req.packageName === "FULL" ? "text-black" : "text-amber-500"}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-xl">{req.packageName === "FULL" ? "باقة الأمان الشامل" : req.packageName === "LEGAL" ? "المراجعة القانونية" : "الفحص الهندسي"}</span>
                                                    {recent && !isExpert && (
                                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20">جديد</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {req.property?.location || "العنوان غير متوفر"}
                                                </div>
                                                <div className="text-xs text-amber-500/80 font-mono">#{req.id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 items-center w-full md:w-auto border-t md:border-none border-white/5 pt-4 md:pt-0">
                                            {!isExpert && (
                                                <div className="flex flex-col items-start md:items-end">
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">السعر المدفوع</div>
                                                    <div className="text-amber-400 font-bold text-lg">{req.packagePrice ? req.packagePrice.toLocaleString() : "---"} ج.م</div>
                                                </div>
                                            )}

                                            <div className="flex flex-col items-start md:items-end">
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">حالة الدفع</div>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${req.paymentStatus === "PAID" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}
                                                >
                                                    {req.paymentStatus === "PAID" ? "تم الدفع" : "معلق"}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start md:items-end">
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">التاريخ</div>
                                                <div className="text-sm font-medium">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</div>
                                            </div>

                                            {req.scheduledDate && (
                                                <div className="flex flex-col items-start md:items-end bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                    <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> الموعد التقديري
                                                    </div>
                                                    <div className="text-sm font-bold">{new Date(req.scheduledDate).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</div>
                                                </div>
                                            )}

                                            {isExpert && (
                                                <button className="gold-gradient text-black px-6 py-2 rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform ml-auto">
                                                    مراجعة الطلب
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {!loading && requests.length > 0 && !isExpert && (
                    <p className="text-center text-xs text-muted-foreground mt-12 opacity-50">
                        يتم عرض المعاملات بحد أقصى للسنوات السابقة، ويتم تمييز آخر 35 يوماً.
                    </p>
                )}
            </div>
        </div>
    );
}
