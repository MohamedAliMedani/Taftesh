"use client";

import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Phone, AlertCircle, Chrome, Facebook } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { SITE_CONFIG } from "@/lib/config";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { update } = useSession();

  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const phoneRegex = /^01[0-9]{9}$/;
  const errors = {
    phone: !phone.trim() ? "رقم الهاتف مطلوب" : !phoneRegex.test(phone) ? "رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم" : "",
    password: !password ? "كلمة المرور مطلوبة" : password.length < 6 ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, password: true });
    setError("");

    if (errors.phone || errors.password) {
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("رقم الهاتف أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      const session = await update();
      const role = (session?.user as any)?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "EXPERT") {
        router.push("/provider");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#0a0a0b]">
      <div className="hero-glow opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-6 md:p-10 rounded-3xl md:rounded-[40px] relative z-10 border-white/5"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="mx-auto mb-4 md:mb-6 w-fit">
            <LogoMark size={56} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold outfit mb-2">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">مرحباً بك مجدداً في {SITE_CONFIG.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80 mr-2">رقم الهاتف</label>
            <div className={`glass flex items-center px-4 py-3.5 md:py-4 rounded-2xl focus-within:ring-2 transition-all border ${touched.phone && errors.phone ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
              <Phone className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => touch("phone")}
                placeholder="01000000000"
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-[11px] text-red-400 mr-2 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80 mr-2">كلمة المرور</label>
            <div className={`glass flex items-center px-4 py-3.5 md:py-4 rounded-2xl focus-within:ring-2 transition-all border ${touched.password && errors.password ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
              <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
            {touched.password && errors.password && (
              <p className="text-[11px] text-red-400 mr-2 mt-1">{errors.password}</p>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 md:p-4 rounded-2xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-black py-3.5 md:py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 disabled:opacity-70"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">أو الدخول بواسطة</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 glass px-3 md:px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <Chrome className="w-5 h-5 text-current" />
              <span className="text-xs md:text-sm font-bold">Google</span>
            </button>
            <button
              type="button"
              onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 glass px-3 md:px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <Facebook className="w-5 h-5 text-current" />
              <span className="text-xs md:text-sm font-bold">Facebook</span>
            </button>
          </div>
        </form>

        <div className="mt-6 md:mt-8 text-center text-sm">
          <span className="text-muted-foreground">ليس لديك حساب؟ </span>
          <a href="/register" className="text-amber-400 font-bold hover:underline">إنشاء حساب جديد</a>
          <div className="mt-4">
            <a href="/" className="text-xs text-muted-foreground hover:text-amber-400 transition-colors">العودة للرئيسية</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
