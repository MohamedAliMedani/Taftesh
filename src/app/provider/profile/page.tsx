"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Briefcase, FileText, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { useT } from "@/lib/i18n";

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const t = useT();

  useEffect(() => {
    fetch("/api/provider/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, email }),
      });
      if (res.ok) {
        setMessage({ text: t("profile.saved"), type: "success" });
      } else {
        setMessage({ text: t("profile.saveFailed"), type: "error" });
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (loading) {
    return <div className="glass-card h-96 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold outfit">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle")}</p>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Stats */}
      <div className="glass-card p-6 rounded-2xl border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-xl">{profile?.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {profile?.specialty === "ENGINEER" ? t("profile.consultingEngineer") : t("profile.realEstateLawyer")}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-xl font-bold">{profile?.avgRating?.toFixed(1) || "---"}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t("profile.rating")}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            profile?.verified ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
          }`}>
            {profile?.verified ? t("profile.verified") : t("profile.notVerified")}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border-white/5 space-y-5">
        <h2 className="font-bold text-lg outfit">{t("profile.editInfo")}</h2>

        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/80">{t("profile.name")}</label>
          <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5">
            <User className="w-4 h-4 text-muted-foreground ml-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/80">{t("profile.email")}</label>
          <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5">
            <Mail className="w-4 h-4 text-muted-foreground ml-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/80">{t("profile.aboutYou")}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("profile.aboutPlaceholder")}
            className="w-full glass p-4 rounded-xl border border-white/5 bg-transparent text-sm resize-none h-28"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/80">{t("profile.phone")}</label>
          <div className="glass flex items-center px-4 py-3 rounded-xl border border-white/5 opacity-50">
            <Phone className="w-4 h-4 text-muted-foreground ml-3" />
            <span className="text-sm">{profile?.phone}</span>
            <span className="text-xs text-muted-foreground mr-auto">{t("profile.phoneReadonly")}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="gold-gradient text-black px-8 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {saving ? t("profile.saving") : t("profile.save")}
        </button>
      </form>
    </div>
  );
}
