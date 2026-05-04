"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { UserCheck, Star, ClipboardList, Phone, Filter, CheckCircle2, Search, Banknote, CreditCard } from "lucide-react";
import { SPECIALTY_LABELS } from "@/lib/types";
import Dropdown from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n";

export default function AdminProvidersPage() {
  const t = useT();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const fetchProviders = useCallback(() => {
    const params = new URLSearchParams();
    if (specialtyFilter) params.set("specialty", specialtyFilter);
    if (verifiedFilter) params.set("verified", verifiedFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/providers?${params}`)
      .then((r) => r.json())
      .then((data) => { setProviders(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [specialtyFilter, verifiedFilter, search]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleVerify = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verified: true }),
      });
      if (res.ok) {
        setMessage(t("admin.providers.approved"));
        fetchProviders();
      }
    } catch {
      setMessage(t("common.error"));
    }
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold outfit">{t("admin.providers.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.providers.subtitle")}</p>
      </div>

      {message && (
        <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded-xl text-sm">{message}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 glass flex items-center px-4 rounded-xl border border-white/10">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder={t("admin.providers.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent w-full py-3 text-sm outline-none"
          />
        </div>
        <Dropdown
          value={specialtyFilter}
          onChange={setSpecialtyFilter}
          placeholder={t("admin.providers.allSpecialties")}
          allowClear
          options={[
            { value: "ENGINEER", label: t("admin.providers.engineers") },
            { value: "LAWYER", label: t("admin.providers.lawyers") },
          ]}
          className="min-w-[160px]"
        />
        <Dropdown
          value={verifiedFilter}
          onChange={setVerifiedFilter}
          placeholder={t("admin.providers.all")}
          allowClear
          options={[
            { value: "true", label: t("admin.providers.verifiedFilter") },
            { value: "false", label: t("admin.providers.notVerifiedFilter") },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-52 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl">
          <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">{t("admin.providers.noProviders")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl border-white/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {provider.profileImage ? (
                    <img src={provider.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      provider.specialty === "ENGINEER" ? "bg-blue-500/10" : "bg-purple-500/10"
                    }`}>
                      <UserCheck className={`w-6 h-6 ${
                        provider.specialty === "ENGINEER" ? "text-blue-400" : "text-purple-400"
                      }`} />
                    </div>
                  )}
                  <div>
                    <div className="font-bold">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {SPECIALTY_LABELS[provider.specialty as keyof typeof SPECIALTY_LABELS] || provider.specialty}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  provider.verified ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {provider.verified ? t("admin.users.verified") : t("admin.users.notVerified")}
                </span>
              </div>

              {provider.bio && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{provider.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
                {provider.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {provider.phone}
                  </div>
                )}
                {provider.experienceYears != null && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg">
                    {provider.experienceYears} {t("admin.providers.yearsExperience")}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-3">
                {provider.nationalIdImage && (
                  <a href={provider.nationalIdImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    <img src={provider.nationalIdImage} alt={t("admin.providers.idCard")} className="w-16 h-10 object-cover rounded-lg border border-white/10" />
                    <span>{t("admin.providers.idCard")}</span>
                  </a>
                )}
                {provider.syndicateCardImage && (
                  <a href={provider.syndicateCardImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    <img src={provider.syndicateCardImage} alt={t("admin.providers.syndicateCard")} className="w-16 h-10 object-cover rounded-lg border border-white/10" />
                    <span>{t("admin.providers.syndicateCard")}</span>
                  </a>
                )}
              </div>

              {provider.serviceRate != null && (
                <div className="flex items-center gap-1 text-xs text-amber-400 mb-3">
                  <Banknote className="w-3.5 h-3.5" />
                  {t("admin.providers.servicePrice")} {provider.serviceRate.toLocaleString()} {t("common.currency")}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold">{provider.avgRating?.toFixed(1) || "---"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{provider.completedRequests || 0} {t("admin.providers.completedRequests")}</span>
                  </div>
                </div>

                {!provider.verified && (
                  <button
                    onClick={() => handleVerify(provider.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("admin.providers.approve")}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
