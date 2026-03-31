"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, User, Phone, Lock, AlertCircle, Chrome, Facebook, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState<"CLIENT" | "EXPERT">("CLIENT");
    const [specialty, setSpecialty] = useState<"ENGINEER" | "LAWYER">("ENGINEER");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const body = {
                name,
                phone,
                password,
                userType,
                ...(userType === "EXPERT" && { specialty }),
            };

            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await response.json();
                setError(data.error || "فشل التسجيل");
            }
        } catch (err) {
            setError("حدث خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
            <div className="hero-glow opacity-50" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-10 rounded-[40px] relative z-10 border-white/5 mt-12"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
                        <Shield className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold outfit mb-2">إنشاء حساب جديد</h1>
                    <p className="text-muted-foreground text-sm font-medium">ابدأ رحلتك لتأمين استثمارك العقاري</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
                    <button
                        type="button"
                        onClick={() => setUserType("CLIENT")}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${userType === "CLIENT" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                    >
                        تسجيل كعميل
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType("EXPERT")}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${userType === "EXPERT" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                    >
                        تسجيل كخبير
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-500/80 mr-2">الاسم بالكامل</label>
                        <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                            <User className="w-5 h-5 text-muted-foreground ml-3" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="محمد علي"
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-500/80 mr-2">رقم الهاتف</label>
                        <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                            <Phone className="w-5 h-5 text-muted-foreground ml-3" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01000000000"
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {userType === "EXPERT" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <label className="text-xs font-bold text-amber-500/80 mr-2">التخصص</label>
                                <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                                    <Briefcase className="w-5 h-5 text-muted-foreground ml-3" />
                                    <select
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value as any)}
                                        className="bg-transparent border-none outline-none text-sm w-full font-medium appearance-none text-white [&>option]:text-black"
                                    >
                                        <option value="ENGINEER">مهندس استشاري</option>
                                        <option value="LAWYER">محامي عقاري</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-500/80 mr-2">كلمة المرور</label>
                        <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                            <Lock className="w-5 h-5 text-muted-foreground ml-3" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gold-gradient text-black py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 disabled:opacity-70 mt-4"
                    >
                        {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                    </button>

                    {userType === "CLIENT" && (
                        <>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">أو التسجيل بواسطة</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                    className="flex items-center justify-center gap-2 glass px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <Chrome className="w-5 h-5 text-current" />
                                    <span className="text-sm font-bold">Google</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                                    className="flex items-center justify-center gap-2 glass px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <Facebook className="w-5 h-5 text-current" />
                                    <span className="text-sm font-bold">Facebook</span>
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
                    <a href="/login" className="text-amber-400 font-bold hover:underline">تسجيل الدخول</a>
                    <div className="mt-4">
                        <a href="/" className="text-xs text-muted-foreground hover:text-amber-400 transition-colors">العودة للرئيسية</a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
