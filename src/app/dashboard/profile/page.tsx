"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { useT } from "@/lib/i18n";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function ClientProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setName(data.name || "");
          setEmail(data.email || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    const body: Record<string, string> = {};
    if (name !== profile?.name) body.name = name;
    if (email !== (profile?.email || "")) body.email = email;
    if (newPassword) {
      if (newPassword !== confirmNew) {
        setMessage({ text: t("validation.passwordMismatch"), type: "error" });
        setSaving(false);
        return;
      }
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: t("profile.saved"), type: "success" });
        setProfile(data.data);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNew("");
      } else {
        setMessage({ text: data.error || t("common.error"), type: "error" });
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (status === "loading" || loading) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 lg:p-12">
      <div className="hero-glow opacity-20" />
      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowRight className="w-4 h-4" />
          {t("nav.backToRequests")}
        </button>

        <div className="flex items-center gap-4">
          <LogoMark size={48} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold outfit">{t("profile.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("profile.subtitle")}</p>
          </div>
        </div>

        {message.text && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}

        <div className="glass-card p-6 rounded-2xl border-white/5 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.name")}</label>
            <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 ring-amber-500/50">
              <User className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.email")}</label>
            <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 ring-amber-500/50">
              <Mail className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.phone")} <span className="text-muted-foreground font-normal">{t("profile.phoneReadonly")}</span></label>
            <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 opacity-60">
              <Phone className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="text" value={profile?.phone || ""} disabled className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="glass-card p-6 rounded-2xl border-white/5 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-amber-500" />{t("profile.changePassword")}</h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.currentPassword")}</label>
            <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 ring-amber-500/50">
              <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.newPassword")}</label>
            <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 ring-amber-500/50">
              <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-500/80">{t("profile.confirmNewPassword")}</label>
            <div className={`glass flex items-center px-4 py-3 rounded-xl border focus-within:ring-2 ${confirmNew && newPassword !== confirmNew ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
              <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              <input type="password" value={confirmNew} onChange={(e) => setConfirmNew(e.target.value)} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
            {confirmNew && newPassword !== confirmNew && <p className="text-[11px] text-red-400">{t("validation.passwordMismatch")}</p>}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gold-gradient text-black py-3.5 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {saving ? t("profile.saving") : t("profile.save")}
        </button>
      </div>
    </div>
  );
}
