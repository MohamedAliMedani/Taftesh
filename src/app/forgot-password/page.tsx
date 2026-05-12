"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const router = useRouter();
  const t = useT();

  const phoneRegex = /^01[0-9]{9}$/;
  const phoneError = !phone.trim() ? t("validation.phoneRequired") : !phoneRegex.test(phone) ? t("validation.phoneFormat") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (phoneError) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
          <h1 className="text-2xl md:text-3xl font-bold outfit mb-2">{t("forgotPassword.title")}</h1>
          <p className="text-muted-foreground text-xs md:text-sm">{t("forgotPassword.subtitle")}</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">{t("forgotPassword.success")}</p>
            <button
              onClick={() => router.push("/login")}
              className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full"
            >
              {t("forgotPassword.backToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-500/80 mr-2">{t("forgotPassword.phone")}</label>
              <div className={`glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched && phoneError ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                <Phone className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="01xxxxxxxxx"
                  className="bg-transparent border-none outline-none text-sm w-full font-medium"
                />
              </div>
              {touched && phoneError && <p className="text-[11px] text-red-400 mr-2 mt-1">{phoneError}</p>}
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
              {loading ? t("forgotPassword.sending") : t("forgotPassword.send")}
            </button>

            <div className="text-center">
              <a href="/login" className="text-xs text-muted-foreground hover:text-amber-400 transition-colors">
                {t("forgotPassword.backToLogin")}
              </a>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
