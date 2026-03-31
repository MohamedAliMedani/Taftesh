"use client";

import React, { useEffect, useState } from "react";
import { Shield, Clock, MapPin, Package, User } from "lucide-react";
import { motion } from "framer-motion";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"REQUESTS" | "MESSAGES">("REQUESTS");
    const [messages, setMessages] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }

        if (status === "authenticated") {
            Promise.all([
                fetch("/api/requests").then(res => res.json()),
                fetch("/api/contact").then(res => res.json())
            ]).then(([requestsData, messagesData]) => {
                setRequests(Array.isArray(requestsData) ? requestsData : []);
                setMessages(Array.isArray(messagesData) ? messagesData : []);
                setLoading(false);
            });
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-amber-500">جاري التحقق...</div>;
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold outfit">لوحة التحكم</h1>
                            <p className="text-sm text-muted-foreground">إدارة المنصة والرسائل</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab("REQUESTS")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "REQUESTS" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                            >
                                الطلبات ({requests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("MESSAGES")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "MESSAGES" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                            >
                                الرسائل ({messages.length})
                            </button>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            تسجيل الخروج
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {activeTab === "REQUESTS" ? (
                            <>
                                {requests.map((req, i) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-white/5"
                                    >
                                        <div className="flex gap-6 items-center">
                                            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="font-bold text-lg">{req.user.name || "عميل بدون اسم"}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {req.property.location}
                                                </div>
                                                <div className="text-xs text-amber-500/80">{req.user.phone}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex flex-col items-end mr-4">
                                                <div className="text-xs text-muted-foreground">التكلفة المقدرة</div>
                                                <div className="text-amber-400 font-bold">{req.price ? req.price.toLocaleString() : "---"} ج.م</div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm">
                                                <Package className="w-4 h-4 text-amber-400" />
                                                {req.packageName}
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm">
                                                <Clock className="w-4 h-4 text-amber-400" />
                                                {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl text-xs font-bold ${req.status === "PENDING" ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"
                                                }`}>
                                                {req.status === "PENDING" ? "قيد الانتظار" : "مكتمل"}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {requests.length === 0 && (
                                    <div className="text-center py-20 glass-card rounded-3xl">
                                        <p className="text-muted-foreground">لا توجد طلبات حالياً.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 rounded-3xl border-white/5 space-y-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                    <User className="w-5 h-5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{msg.name}</div>
                                                    <div className="text-xs text-muted-foreground">{msg.email} | {msg.phone}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(msg.createdAt).toLocaleString("ar-EG")}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl text-sm leading-relaxed border border-white/5 italic">
                                            "{msg.message}"
                                        </div>
                                    </motion.div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center py-20 glass-card rounded-3xl">
                                        <p className="text-muted-foreground">لا توجد رسائل تواصل حالياً.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
