"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const phone = searchParams.get("phone");
  const t = useT();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (f: string) => setTouched((p) => ({ ...p, [f]: true }));

  const errors = {
    password: !password ? t("validation.passwordRequired") : password.length < 6 ? t("validation.passwordMin") : "",
    confirm: !confirmPassword ? t("validation.confirmRequired") : password !== confirmPassword ? t("validation.passwordMismatch") : "",
  };

  if (!token || !phone) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b]">
        <div className="glass-card p-10 rounded-3xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t("resetPassword.invalidLink")}</p>
          <a href="/login" className="text-amber-400 font-bold">{t("forgotPassword.backToLogin")}</a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (errors.password || errors.confirm) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token, password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#0a0a0b]">
      <div className="hero-glow opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-6 md:p-10 rounded-3xl md:rounded-[40px] relative z-10 border-white/5"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-fit"><LogoMark size={56} /></div>
          <h1 className="text-2xl md:text-3xl font-bold outfit mb-2">{t("resetPassword.title")}</h1>
          <p className="text-muted-foreground text-xs md:text-sm">{t("resetPassword.subtitle")}</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg font-bold">{t("resetPassword.success")}</p>
            <button
              onClick={() => router.push("/login")}
              className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full"
            >
              {t("login.submit")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-500/80 mr-2">{t("resetPassword.newPassword")}</label>
              <div className={`glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.password && errors.password ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => touch("password")} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
              </div>
              {touched.password && errors.password && <p className="text-[11px] text-red-400 mr-2">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-500/80 mr-2">{t("resetPassword.confirm")}</label>
              <div className={`glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.confirm && errors.confirm ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => touch("confirm")} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
              </div>
              {touched.confirm && errors.confirm && <p className="text-[11px] text-red-400 mr-2">{errors.confirm}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-black py-3.5 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 disabled:opacity-70"
            >
              {loading ? t("resetPassword.submitting") : t("resetPassword.submit")}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-amber-500">...</div>}>
      <ResetContent />
    </Suspense>
  );
}
