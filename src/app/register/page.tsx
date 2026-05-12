"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User, Phone, Lock, AlertCircle, Chrome, Facebook,
  Mail, Upload, FileText, CheckCircle2, Shield,
  Camera, CreditCard, ArrowRight, ArrowLeft
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { SITE_CONFIG, ENGINEER_TERMS, LAWYER_TERMS, type TermDefinition } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useT } from "@/lib/i18n";

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return <p className="text-[11px] text-red-400 mr-2 mt-1">{message}</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useT();

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"CLIENT" | "ENGINEER" | "LAWYER">("CLIENT");
  const [step, setStep] = useState<1 | 2>(1);

  const isExpert = userType === "ENGINEER" || userType === "LAWYER";
  const { lang } = useLanguage();
  const [bio, setBio] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<Record<string, { experienceYears: string; price: string }>>({});
  const [nationalIdImage, setNationalIdImage] = useState("");
  const [nationalIdPreview, setNationalIdPreview] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [syndicateCardImage, setSyndicateCardImage] = useState("");
  const [syndicateCardPreview, setSyndicateCardPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const availableTerms = userType === "ENGINEER" ? ENGINEER_TERMS : userType === "LAWYER" ? LAWYER_TERMS : [];

  const toggleTerm = (key: string) => {
    setSelectedTerms((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { experienceYears: "", price: "" } };
    });
  };

  const updateTerm = (key: string, field: "experienceYears" | "price", value: string) => {
    setSelectedTerms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // Touched state for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const syndicateInputRef = useRef<HTMLInputElement>(null);

  // Validation helpers
  const phoneRegex = /^01[0-9]{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errorsStep1 = {
    name: !name.trim() ? t("validation.nameRequired") : name.trim().length < 2 ? t("validation.nameMin") : "",
    phone: !phone.trim() ? t("validation.phoneRequired") : !phoneRegex.test(phone) ? t("validation.phoneFormat") : "",
    email: isExpert && !email.trim() ? t("validation.emailRequired") : email && !emailRegex.test(email) ? t("validation.emailFormat") : "",
    password: !password ? t("validation.passwordRequired") : password.length < 6 ? t("validation.passwordMin") : "",
    confirmPassword: !confirmPassword ? t("validation.confirmRequired") : password !== confirmPassword ? t("validation.passwordMismatch") : "",
  };

  const errorsStep2 = {
    terms: isExpert && Object.keys(selectedTerms).length === 0 ? t("validation.termsRequired") :
           isExpert && Object.values(selectedTerms).some(v => !v.price || parseFloat(v.price) <= 0) ? t("validation.termsPriceRequired") : "",
    syndicateCard: isExpert && !syndicateCardImage ? t("validation.syndicateCardRequired") : "",
    nationalId: isExpert && !nationalIdImage ? t("validation.nationalIdRequired") : "",
  };

  const hasErrorsStep1 = Object.values(errorsStep1).some((e) => e !== "");
  const hasErrorsStep2 = Object.values(errorsStep2).some((e) => e !== "");
  
  // Combine for render helpers
  const errors = { ...errorsStep1, ...errorsStep2 };

  const handleUpload = async (
    file: File,
    folder: string,
    setUrl: (url: string) => void,
    setPreview: (preview: string) => void,
  ) => {
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        setUrl(data.url);
      } else {
        setError(data.error || t("register.uploadFailed"));
        setPreview("");
      }
    } catch {
      setError(t("register.uploadFailed"));
      setPreview("");
    }
    setUploading(false);
  };

  const handleNext = () => {
    setTouched({ name: true, phone: true, email: true, password: true, confirmPassword: true });
    if (hasErrorsStep1) {
      setError(t("register.fixErrors"));
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isExpert && step === 1) {
      handleNext();
      return;
    }

    if (isExpert && step === 2) {
      setTouched((prev) => ({ ...prev, terms: true, syndicateCard: true, nationalId: true }));
      if (hasErrorsStep2) {
        setError(t("register.fixErrors"));
        return;
      }
    } else {
      setTouched({ name: true, phone: true, email: true, password: true, confirmPassword: true });
      if (hasErrorsStep1) {
        setError(t("register.fixErrors"));
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        name,
        phone,
        password,
        confirmPassword,
        email: email || undefined,
        userType: isExpert ? "EXPERT" : "CLIENT",
      };

      if (isExpert) {
        body.specialty = userType;
        body.bio = bio || undefined;
        body.nationalIdImage = nationalIdImage;
        body.profileImage = profileImage || undefined;
        body.syndicateCardImage = syndicateCardImage;
        body.terms = Object.entries(selectedTerms).map(([termKey, data]) => ({
          termKey,
          experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
          price: parseFloat(data.price) || 0,
        }));
        // Backward compat
        const prices = Object.values(selectedTerms).map(v => parseFloat(v.price) || 0).filter(p => p > 0);
        body.serviceRate = prices.length > 0 ? Math.min(...prices) : undefined;
        const expYears = Object.values(selectedTerms).map(v => parseInt(v.experienceYears) || 0);
        body.experienceYears = expYears.length > 0 ? Math.max(...expYears) : undefined;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setSuccessMessage(data.message);
      } else {
        setError(data.error || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#0a0a0b]">
        <div className="hero-glow opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 md:p-12 rounded-3xl md:rounded-[40px] text-center w-full max-w-md relative z-10"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold outfit mb-4">{t("register.success")}</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm md:text-base">{successMessage}</p>
          {isExpert ? (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-sm text-amber-200">
                <Shield className="w-5 h-5 text-amber-500 inline ml-2" />
                {t("register.expertReview")}
              </div>
              <button onClick={() => router.push("/")} className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full">
                {t("nav.backToHome")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {email && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-sm text-blue-200">
                  <Mail className="w-5 h-5 text-blue-400 inline ml-2" />
                  {t("register.emailSent")}
                </div>
              )}
              <button onClick={() => router.push("/login")} className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full">
                {t("nav.login")}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#0a0a0b]">
      <div className="hero-glow opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card p-6 md:p-10 rounded-3xl md:rounded-[40px] relative z-10 border-white/5 my-4 md:my-12"
      >
        {step === 2 && isExpert && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-6 flex items-center text-sm font-bold text-muted-foreground hover:text-white transition-colors gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {t("register.backToStep1")}
          </button>
        )}

        <div className="text-center mb-6 md:mb-8">
          <div className="mx-auto mb-4 md:mb-6 w-fit">
            <LogoMark size={56} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold outfit mb-2">
            {step === 1 ? t("register.title") : t("register.selectServices")}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            {step === 1 ? t("register.subtitle") : t("register.subtitle")}
          </p>
        </div>

        {/* User type toggle (Only in Step 1) */}
        {step === 1 && (
          <div className="flex bg-white/5 p-1 rounded-2xl mb-6 md:mb-8 gap-1">
            <button
              type="button"
              onClick={() => { setUserType("CLIENT"); setStep(1); }}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${userType === "CLIENT" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
            >
              {t("register.client")}
            </button>
            <button
              type="button"
              onClick={() => { setUserType("ENGINEER"); setStep(1); }}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${userType === "ENGINEER" ? "bg-blue-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
            >
              {t("register.engineer")}
            </button>
            <button
              type="button"
              onClick={() => { setUserType("LAWYER"); setStep(1); }}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${userType === "LAWYER" ? "bg-purple-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
            >
              {t("register.lawyer")}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.fullName")} {t("common.required")}</label>
                <div className={`glass flex items-center px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.name && errors.name ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                  <User className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => touch("name")} placeholder={t("register.fullNamePlaceholder")} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                </div>
                <FieldError show={!!touched.name && !!errors.name} message={errors.name} />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.phone")} {t("common.required")}</label>
                <div className={`glass flex items-center px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.phone && errors.phone ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                  <Phone className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => touch("phone")} placeholder="01xxxxxxxxx" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                </div>
                <FieldError show={!!touched.phone && !!errors.phone} message={errors.phone} />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">
                  {t("register.email")} {userType === "CLIENT" ? t("register.emailOptional") : t("common.required")}
                </label>
                <div className={`glass flex items-center px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.email && errors.email ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                  <Mail className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => touch("email")} placeholder="example@mail.com" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                </div>
                <FieldError show={!!touched.email && !!errors.email} message={errors.email} />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.password")} {t("common.required")}</label>
                <div className={`glass flex items-center px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.password && errors.password ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                  <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => touch("password")} placeholder={t("register.passwordPlaceholder")} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                </div>
                <FieldError show={!!touched.password && !!errors.password} message={errors.password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.confirmPassword")} {t("common.required")}</label>
                <div className={`glass flex items-center px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${touched.confirmPassword && errors.confirmPassword ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                  <Lock className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => touch("confirmPassword")} placeholder={t("register.confirmPasswordPlaceholder")} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                </div>
                <FieldError show={!!touched.confirmPassword && !!errors.confirmPassword} message={errors.confirmPassword} />
              </div>
            </motion.div>
          )}

          {/* STEP 2: Expert-only fields */}
          {step === 2 && isExpert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Profile Image */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.profileImage")}</label>
                <div
                  onClick={() => profileInputRef.current?.click()}
                  className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${profileImage ? "border-green-500/30" : "border-white/10"} ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "profile-images", setProfileImage, setProfileImagePreview); }} className="hidden" />
                  {profileImagePreview ? (
                    <div className="p-4 flex flex-col items-center">
                      <div className="relative">
                        <img src={profileImagePreview} alt={t("register.profileImage")} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-2 border-amber-500/30" />
                        <div className="absolute -bottom-1 -left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t("register.done")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{t("register.changeImage")}</p>
                    </div>
                  ) : (
                    <div className="p-4 md:p-6 text-center">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Camera className="w-6 h-6 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold mb-1">{t("register.uploadProfileImage")}</p>
                      <p className="text-xs text-muted-foreground">{t("register.profileImageDesc")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.bio")}</label>
                <div className="glass flex items-start px-4 py-3 md:py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                  <FileText className="w-5 h-5 text-muted-foreground ml-3 mt-0.5 flex-shrink-0" />
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("register.bioPlaceholder")} className="bg-transparent border-none outline-none text-sm w-full font-medium resize-none h-20" />
                </div>
              </div>

              {/* Terms / Services Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.selectServices")} {t("common.required")}</label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {availableTerms.map((term) => {
                    const isSelected = !!selectedTerms[term.key];
                    const termData = selectedTerms[term.key];
                    return (
                      <div key={term.key} className={`glass rounded-xl border transition-all ${isSelected ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"}`}>
                        <button
                          type="button"
                          onClick={() => toggleTerm(term.key)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-amber-500 border-amber-500" : "border-white/20"}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                          </div>
                          <span className={`font-medium text-start ${isSelected ? "text-amber-400" : ""}`}>
                            {lang === "en" ? term.nameEn : term.nameAr}
                          </span>
                        </button>
                        {isSelected && (
                          <div className="px-4 pb-3 flex gap-3">
                            <div className="flex-1">
                              <label className="text-[10px] text-muted-foreground">{t("register.experienceYears")}</label>
                              <input
                                type="number" min="0" max="60"
                                value={termData?.experienceYears || ""}
                                onChange={(e) => updateTerm(term.key, "experienceYears", e.target.value)}
                                placeholder="0"
                                className="w-full glass px-3 py-2 rounded-lg text-sm bg-transparent border border-white/10 outline-none focus:ring-1 ring-amber-500/50"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-muted-foreground">{t("register.serviceRate")} {t("common.required")}</label>
                              <input
                                type="number" min="1"
                                value={termData?.price || ""}
                                onChange={(e) => updateTerm(term.key, "price", e.target.value)}
                                placeholder="500"
                                className="w-full glass px-3 py-2 rounded-lg text-sm bg-transparent border border-white/10 outline-none focus:ring-1 ring-amber-500/50"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <FieldError show={!!touched.terms && !!errors.terms} message={errors.terms} />
              </div>

              {/* Syndicate Card Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.syndicateCard")} {t("common.required")}</label>
                <div
                  onClick={() => { syndicateInputRef.current?.click(); touch("syndicateCard"); }}
                  className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${syndicateCardImage ? "border-green-500/30" : touched.syndicateCard && errors.syndicateCard ? "border-red-500/30" : "border-white/10"} ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input ref={syndicateInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "syndicate-cards", setSyndicateCardImage, setSyndicateCardPreview); }} className="hidden" />
                  {syndicateCardPreview ? (
                    <div className="p-4">
                      <div className="relative">
                        <img src={syndicateCardPreview} alt={t("register.syndicateCard")} className="w-full h-32 md:h-40 object-cover rounded-xl" />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t("register.uploaded")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">{t("register.changeImage")}</p>
                    </div>
                  ) : (
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold mb-1">{t("register.uploadSyndicateCard")}</p>
                      <p className="text-xs text-muted-foreground">{t("register.fileTypes")}</p>
                    </div>
                  )}
                </div>
                <FieldError show={!!touched.syndicateCard && !!errors.syndicateCard} message={errors.syndicateCard} />
              </div>

              {/* National ID Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500/80 mr-2">{t("register.nationalId")} {t("common.required")}</label>
                <div
                  onClick={() => { fileInputRef.current?.click(); touch("nationalId"); }}
                  className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${nationalIdImage ? "border-green-500/30" : touched.nationalId && errors.nationalId ? "border-red-500/30" : "border-white/10"} ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "national-ids", setNationalIdImage, setNationalIdPreview); }} className="hidden" />
                  {nationalIdPreview ? (
                    <div className="p-4">
                      <div className="relative">
                        <img src={nationalIdPreview} alt={t("register.nationalId")} className="w-full h-32 md:h-40 object-cover rounded-xl" />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t("register.uploaded")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">{t("register.changeImage")}</p>
                    </div>
                  ) : (
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold mb-1">{t("register.uploadNationalId")}</p>
                      <p className="text-xs text-muted-foreground">{t("register.fileTypes")}</p>
                    </div>
                  )}
                </div>
                <FieldError show={!!touched.nationalId && !!errors.nationalId} message={errors.nationalId} />
                <p className="text-[10px] text-amber-500/40 mr-2">
                  {t("register.nationalIdNote")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Error */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full gold-gradient text-black py-3.5 md:py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 disabled:opacity-70 mt-4 flex justify-center items-center gap-2"
          >
            {loading
              ? t("register.creating")
              : (isExpert && step === 1)
                ? <>{t("register.nextStep")} <ArrowLeft className="w-4 h-4" /></>
                : isExpert
                  ? t("register.submitExpert")
                  : t("register.submitClient")}
          </button>

          {/* Social login - clients only (Only on Step 1) */}
          {userType === "CLIENT" && step === 1 && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">{t("register.orRegisterVia")}</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 glass px-3 md:px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                  <Chrome className="w-5 h-5" />
                  <span className="text-xs md:text-sm font-bold">Google</span>
                </button>
                <button type="button" onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 glass px-3 md:px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                  <Facebook className="w-5 h-5" />
                  <span className="text-xs md:text-sm font-bold">Facebook</span>
                </button>
              </div>
            </>
          )}
        </form>

        {step === 1 && (
          <div className="mt-6 md:mt-8 text-center text-sm">
            <span className="text-muted-foreground">{t("register.hasAccount")} </span>
            <a href="/login" className="text-amber-400 font-bold hover:underline">{t("nav.login")}</a>
            <div className="mt-4">
              <a href="/" className="text-xs text-muted-foreground hover:text-amber-400 transition-colors">{t("nav.backToHome")}</a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
