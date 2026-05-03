"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User, Phone, Lock, AlertCircle, Chrome, Facebook,
  Briefcase, Mail, Upload, FileText, Clock, CheckCircle2, Shield,
  Camera, CreditCard, Banknote
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { LogoMark } from "@/components/ui/Logo";
import { SITE_CONFIG } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"CLIENT" | "EXPERT">("CLIENT");

  // Expert-only fields
  const [specialty, setSpecialty] = useState<"ENGINEER" | "LAWYER">("ENGINEER");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [nationalIdImage, setNationalIdImage] = useState("");
  const [nationalIdPreview, setNationalIdPreview] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [syndicateCardImage, setSyndicateCardImage] = useState("");
  const [syndicateCardPreview, setSyndicateCardPreview] = useState("");
  const [serviceRate, setServiceRate] = useState("");
  const [uploading, setUploading] = useState(false);

  // State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const syndicateInputRef = useRef<HTMLInputElement>(null);

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
        setError(data.error || "فشل رفع الصورة");
        setPreview("");
      }
    } catch {
      setError("فشل رفع الصورة");
      setPreview("");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validations
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
    }

    if (userType === "EXPERT" && !nationalIdImage) {
      setError("يرجى رفع صورة البطاقة الشخصية");
      setLoading(false);
      return;
    }

    if (userType === "EXPERT" && !syndicateCardImage) {
      setError("يرجى رفع صورة كارت النقابة");
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = {
        name,
        phone,
        password,
        confirmPassword,
        email: email || undefined,
        userType,
      };

      if (userType === "EXPERT") {
        body.specialty = specialty;
        body.bio = bio || undefined;
        body.experienceYears = experienceYears ? parseInt(experienceYears) : undefined;
        body.nationalIdImage = nationalIdImage;
        body.profileImage = profileImage || undefined;
        body.syndicateCardImage = syndicateCardImage;
        body.serviceRate = serviceRate ? parseFloat(serviceRate) : undefined;
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
        setError(data.error || "فشل التسجيل");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="hero-glow opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-[40px] text-center max-w-md relative z-10"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold outfit mb-4">تم التسجيل بنجاح!</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">{successMessage}</p>
          {userType === "EXPERT" ? (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-sm text-amber-200">
                <Shield className="w-5 h-5 text-amber-500 inline ml-2" />
                سيتم مراجعة بياناتك وصورة البطاقة من قبل الإدارة. ستتمكن من تسجيل الدخول بعد الاعتماد.
              </div>
              <button
                onClick={() => router.push("/")}
                className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full"
              >
                العودة للرئيسية
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {email && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-sm text-blue-200">
                  <Mail className="w-5 h-5 text-blue-400 inline ml-2" />
                  تم إرسال رابط تفعيل لبريدك الإلكتروني. يرجى التحقق من صندوق الوارد.
                </div>
              )}
              <button
                onClick={() => router.push("/login")}
                className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold w-full"
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
      <div className="hero-glow opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card p-10 rounded-[40px] relative z-10 border-white/5 my-12"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-fit">
            <LogoMark size={64} />
          </div>
          <h1 className="text-3xl font-bold outfit mb-2">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground text-sm font-medium">ابدأ رحلتك لتأمين استثمارك العقاري</p>
        </div>

        {/* User type toggle */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setUserType("CLIENT")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${userType === "CLIENT" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
          >
            تسجيل كعميل
          </button>
          <button
            type="button"
            onClick={() => setUserType("EXPERT")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${userType === "EXPERT" ? "bg-amber-500 text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
          >
            تسجيل كخبير
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500/80 mr-2">الاسم بالكامل *</label>
            <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
              <User className="w-5 h-5 text-muted-foreground ml-3" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="محمد علي" className="bg-transparent border-none outline-none text-sm w-full font-medium" required />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500/80 mr-2">رقم الهاتف *</label>
            <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
              <Phone className="w-5 h-5 text-muted-foreground ml-3" />
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="bg-transparent border-none outline-none text-sm w-full font-medium" required />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500/80 mr-2">
              البريد الإلكتروني {userType === "CLIENT" ? "(لتفعيل الحساب)" : "*"}
            </label>
            <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
              <Mail className="w-5 h-5 text-muted-foreground ml-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                required={userType === "EXPERT"}
              />
            </div>
          </div>

          {/* Expert-only fields */}
          <AnimatePresence>
            {userType === "EXPERT" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">التخصص *</label>
                  <Dropdown
                    value={specialty}
                    onChange={(v) => setSpecialty(v as "ENGINEER" | "LAWYER")}
                    options={[
                      { value: "ENGINEER", label: "مهندس استشاري" },
                      { value: "LAWYER", label: "محامي عقاري" },
                    ]}
                    icon={<Briefcase className="w-5 h-5 text-muted-foreground" />}
                  />
                </div>

                {/* Profile Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">صورة شخصية</label>
                  <div
                    onClick={() => profileInputRef.current?.click()}
                    className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${
                      profileImage ? "border-green-500/30" : "border-white/10"
                    } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "profile-images", setProfileImage, setProfileImagePreview);
                      }}
                      className="hidden"
                    />
                    {profileImagePreview ? (
                      <div className="p-4 flex flex-col items-center">
                        <div className="relative">
                          <img src={profileImagePreview} alt="صورة شخصية" className="w-24 h-24 object-cover rounded-full border-2 border-amber-500/30" />
                          <div className="absolute -bottom-1 -left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">اضغط لتغيير الصورة</p>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Camera className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-sm font-bold mb-1">رفع صورة شخصية</p>
                        <p className="text-xs text-muted-foreground">ستظهر للعملاء عند اختيار الخبير</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Years */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">سنوات الخبرة</label>
                  <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                    <Clock className="w-5 h-5 text-muted-foreground ml-3" />
                    <input type="number" min="0" max="60" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="مثال: 10" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                  </div>
                </div>

                {/* Service Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">سعر الخدمة (ج.م)</label>
                  <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                    <Banknote className="w-5 h-5 text-muted-foreground ml-3" />
                    <input type="number" min="0" value={serviceRate} onChange={(e) => setServiceRate(e.target.value)} placeholder="مثال: 500" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">نبذة عنك ومؤهلاتك</label>
                  <div className="glass flex items-start px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                    <FileText className="w-5 h-5 text-muted-foreground ml-3 mt-0.5" />
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="اكتب نبذة مختصرة عن خبرتك ومؤهلاتك..." className="bg-transparent border-none outline-none text-sm w-full font-medium resize-none h-20" />
                  </div>
                </div>

                {/* Syndicate Card Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">صورة كارت النقابة *</label>
                  <div
                    onClick={() => syndicateInputRef.current?.click()}
                    className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${
                      syndicateCardImage ? "border-green-500/30" : "border-white/10"
                    } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      ref={syndicateInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "syndicate-cards", setSyndicateCardImage, setSyndicateCardPreview);
                      }}
                      className="hidden"
                    />
                    {syndicateCardPreview ? (
                      <div className="p-4">
                        <div className="relative">
                          <img src={syndicateCardPreview} alt="كارت النقابة" className="w-full h-40 object-cover rounded-xl" />
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم الرفع
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">اضغط لتغيير الصورة</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-7 h-7 text-amber-400" />
                        </div>
                        <p className="text-sm font-bold mb-1">اضغط لرفع صورة كارت النقابة</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG أو WEBP — الحد الأقصى 5 ميجا</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* National ID Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-500/80 mr-2">صورة البطاقة الشخصية (الرقم القومي) *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer hover:bg-white/5 ${
                      nationalIdImage ? "border-green-500/30" : "border-white/10"
                    } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, "national-ids", setNationalIdImage, setNationalIdPreview);
                      }}
                      className="hidden"
                    />
                    {nationalIdPreview ? (
                      <div className="p-4">
                        <div className="relative">
                          <img src={nationalIdPreview} alt="صورة البطاقة" className="w-full h-40 object-cover rounded-xl" />
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم الرفع
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">اضغط لتغيير الصورة</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-7 h-7 text-amber-400" />
                        </div>
                        <p className="text-sm font-bold mb-1">اضغط لرفع صورة البطاقة</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG أو WEBP — الحد الأقصى 5 ميجا</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-500/40 mr-2">
                    هذه الصورة مطلوبة لتأكيد هويتك وسيتم مراجعتها من قبل الإدارة. لن يتم مشاركتها مع أي طرف.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500/80 mr-2">كلمة المرور *</label>
            <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
              <Lock className="w-5 h-5 text-muted-foreground ml-3" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" className="bg-transparent border-none outline-none text-sm w-full font-medium" required minLength={6} />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500/80 mr-2">تأكيد كلمة المرور *</label>
            <div className={`glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 transition-all border ${
              confirmPassword && password !== confirmPassword
                ? "ring-red-500/50 border-red-500/20"
                : "ring-amber-500/50 border-white/5"
            }`}>
              <Lock className="w-5 h-5 text-muted-foreground ml-3" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="أعد كتابة كلمة المرور" className="bg-transparent border-none outline-none text-sm w-full font-medium" required />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-red-400 mr-2">كلمتا المرور غير متطابقتين</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading || (confirmPassword.length > 0 && password !== confirmPassword)}
            className="w-full gold-gradient text-black py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 disabled:opacity-70 mt-2"
          >
            {loading ? "جاري إنشاء الحساب..." : userType === "EXPERT" ? "تقديم طلب التسجيل" : "إنشاء حساب"}
          </button>

          {/* Social login - clients only */}
          {userType === "CLIENT" && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">أو التسجيل بواسطة</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 glass px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                  <Chrome className="w-5 h-5" />
                  <span className="text-sm font-bold">Google</span>
                </button>
                <button type="button" onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })} className="flex items-center justify-center gap-2 glass px-4 py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                  <Facebook className="w-5 h-5" />
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
