"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Star, Clock, Briefcase, User, CheckCircle2,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { PACKAGES, calculateTotalPrice } from "@/lib/config";
import { SPECIALTY_LABELS } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface Expert {
  id: string;
  name: string;
  profileImage: string | null;
  specialty: string;
  bio: string | null;
  experienceYears: number | null;
  serviceRate: number | null;
  avgRating: number | null;
  totalRatings: number;
  completedRequests: number;
}

function ExpertCard({
  expert,
  selected,
  onSelect,
}: {
  expert: Expert;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card p-6 rounded-2xl flex flex-col transition-all ${
        selected ? "border-amber-500/50 ring-2 ring-amber-500/20" : "border-white/5"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        {expert.profileImage ? (
          <img
            src={expert.profileImage}
            alt={expert.name || ""}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30"
          />
        ) : (
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center text-black text-xl font-bold">
            {expert.name?.charAt(0) || "خ"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{expert.name}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            expert.specialty === "ENGINEER"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-purple-500/10 text-purple-400"
          }`}>
            {SPECIALTY_LABELS[expert.specialty as keyof typeof SPECIALTY_LABELS] || expert.specialty}
          </span>
        </div>
        {selected && (
          <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <Star className={`w-4 h-4 ${expert.avgRating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
          <span className="text-sm font-bold">{expert.avgRating ?? "—"}</span>
          <span className="text-xs text-muted-foreground">({expert.totalRatings} {t("experts.rating")})</span>
        </div>
        {expert.completedRequests > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            {expert.completedRequests} {t("experts.completedRequest")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        {expert.experienceYears != null && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {expert.experienceYears} {t("experts.yearsExperience")}
          </div>
        )}
        {expert.serviceRate != null && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-bold">{calculateTotalPrice(expert.serviceRate).toLocaleString()} {t("common.currency")}</span>
          </div>
        )}
      </div>

      {expert.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
          {expert.bio}
        </p>
      )}
      {!expert.bio && <div className="flex-1" />}

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg mt-auto ${
          selected
            ? "bg-white/10 text-amber-400 border border-amber-500/30"
            : "gold-gradient text-black hover:brightness-110 active:scale-[0.98] shadow-amber-500/10"
        }`}
      >
        {selected ? t("experts.selected") : t("experts.selectThis")}
      </button>
    </motion.div>
  );
}

function ExpertsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const packageName = searchParams.get("package") || "FULL";
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  // For FULL package: select one engineer + one lawyer
  const isFull = packageName === "FULL";
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
  const [selectedLawyerId, setSelectedLawyerId] = useState<string | null>(null);
  // For single-select packages (unused state setter kept for consistency)
  const [selectedExpertId] = useState<string | null>(null);

  const pkg = PACKAGES[packageName as keyof typeof PACKAGES];

  useEffect(() => {
    fetch(`/api/experts?package=${packageName}`)
      .then((r) => r.json())
      .then((data) => {
        setExperts(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [packageName]);

  const engineers = experts.filter((e) => e.specialty === "ENGINEER");
  const lawyers = experts.filter((e) => e.specialty === "LAWYER");

  const handleProceed = () => {
    const params = new URLSearchParams({ package: packageName });
    if (isFull) {
      if (selectedEngineerId) params.set("engineerId", selectedEngineerId);
      if (selectedLawyerId) params.set("lawyerId", selectedLawyerId);
    } else {
      if (selectedExpertId) params.set("expertId", selectedExpertId);
    }
    router.push(`/checkout?${params.toString()}`);
  };

  const handleSingleSelect = (expertId: string) => {
    router.push(`/checkout?package=${packageName}&expertId=${expertId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans">
      <div className="hero-glow opacity-30" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-6 md:pb-8 relative z-10">
        <button
          onClick={() => router.push("/#pricing")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4" />
          {t("nav.backToPackages")}
        </button>

        <div className="flex items-center gap-4 mb-4">
          <LogoMark size={40} />
          {pkg && (
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
              {pkg.nameAr}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2">
          {isFull ? t("experts.chooseEngineerAndLawyer") : t("experts.chooseExpert")}
        </h1>
        <p className="text-muted-foreground">
          {isFull
            ? t("experts.fullPackageDesc")
            : t("experts.browseExperts")}
        </p>
      </div>

      {/* Experts Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-28 md:pb-20 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-white/10 rounded mb-4" />
                <div className="h-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("experts.noExperts")}</h3>
            <p className="text-muted-foreground text-sm">{t("experts.tryLater")}</p>
          </div>
        ) : isFull ? (
          /* FULL package: two sections - engineers and lawyers */
          <div className="space-y-12">
            {/* Engineers Section */}
            <div>
              <h2 className="text-xl font-bold outfit mb-1 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full" />
                {t("experts.chooseEngineer")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{t("experts.engineerDesc")}</p>
              {engineers.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl text-muted-foreground text-sm">
                  {t("experts.noEngineers")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {engineers.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      selected={selectedEngineerId === expert.id}
                      onSelect={() =>
                        setSelectedEngineerId((prev) => (prev === expert.id ? null : expert.id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Lawyers Section */}
            <div>
              <h2 className="text-xl font-bold outfit mb-1 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full" />
                {t("experts.chooseLawyer")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{t("experts.lawyerDesc")}</p>
              {lawyers.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl text-muted-foreground text-sm">
                  {t("experts.noLawyers")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lawyers.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      selected={selectedLawyerId === expert.id}
                      onSelect={() =>
                        setSelectedLawyerId((prev) => (prev === expert.id ? null : expert.id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Proceed button (sticky bottom) */}
            <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-6 z-20 p-3 md:p-0">
              <div className="max-w-lg mx-auto glass-card p-3 md:p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 md:gap-4">
                <div className="flex-1 text-sm">
                  <div className="flex items-center gap-3">
                    {selectedEngineerId && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg">
                        {t("experts.engineerCheck")}
                      </span>
                    )}
                    {selectedLawyerId && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-lg">
                        {t("experts.lawyerCheck")}
                      </span>
                    )}
                    {!selectedEngineerId && !selectedLawyerId && (
                      <span className="text-muted-foreground text-xs">{t("experts.selectAtLeastOne")}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleProceed}
                  className="gold-gradient text-black px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {t("experts.proceedBooking")}
                </button>
              </div>
            </div>

            {/* Skip option */}
            <div className="text-center">
              <button
                onClick={() => router.push(`/checkout?package=${packageName}`)}
                className="text-sm text-muted-foreground hover:text-amber-400 transition-colors underline underline-offset-4"
              >
                {t("experts.skipSelection")}
              </button>
            </div>
          </div>
        ) : (
          /* Single select for TECHNICAL / LEGAL */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  selected={false}
                  onSelect={() => handleSingleSelect(expert.id)}
                />
              ))}
            </div>

            {/* Skip selection option */}
            {/* {experts.length > 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => router.push(`/checkout?package=${packageName}`)}
                  className="text-sm text-muted-foreground hover:text-amber-400 transition-colors underline underline-offset-4"
                >
                  متابعة بدون اختيار خبير — سيتم تعيين خبير من الإدارة
                </button>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
}

export default function ExpertsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
      </div>
    }>
      <ExpertsContent />
    </Suspense>
  );
}
