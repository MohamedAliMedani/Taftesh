"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Package, FileText, User,
  CheckCircle2, AlertCircle, ArrowRight, Star, Download, Shield, Scale, Banknote
} from "lucide-react";
import { RequestStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { StarRating } from "@/components/ui/StarRating";
import { PACKAGE_LABELS, STATUS_LABELS, CASE_TYPES, CASE_TYPE_LABELS, CONTINUATION_STATUS_LABELS } from "@/lib/types";
import type { RequestStatus, PaymentStatus, PackageName, ContinuationStatus } from "@/lib/types";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";
import Dropdown from "@/components/ui/Dropdown";

export default function UserRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Rating
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Continuation
  const [continuations, setContinuations] = useState<any[]>([]);
  const [showContinuationForm, setShowContinuationForm] = useState(false);
  const [contDetails, setContDetails] = useState("");
  const [contCaseType, setContCaseType] = useState("");
  const [submittingCont, setSubmittingCont] = useState(false);
  const [acceptingCont, setAcceptingCont] = useState(false);
  const [contLawyerId, setContLawyerId] = useState("");
  const [availableLawyers, setAvailableLawyers] = useState<{id: string; name: string; profileImage: string | null}[]>([]);

  const fetchRequest = () => {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoading(false); return; }
        setRequest(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchContinuations = () => {
    fetch(`/api/requests/${id}/continuation`)
      .then((r) => r.json())
      .then((data) => setContinuations(data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
    if (authStatus === "authenticated") {
      fetchRequest();
      fetchContinuations();
    }
  }, [authStatus, id]);

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingScore === 0) return;
    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/requests/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: ratingScore, comment: ratingComment || undefined }),
      });
      if (res.ok) {
        setMessage({ text: "شكراً لتقييمك!", type: "success" });
        setShowRating(false);
        fetchRequest();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "فشل إرسال التقييم", type: "error" });
      }
    } catch {
      setMessage({ text: "حدث خطأ", type: "error" });
    }
    setSubmittingRating(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (authStatus === "loading" || loading) return <FullPageLoader />;
  if (!session) return null;

  if (!request) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6">
        <div className="glass-card p-16 text-center rounded-3xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">الطلب غير موجود</p>
          <button onClick={() => router.push("/dashboard")} className="text-amber-400 font-bold">العودة للطلبات</button>
        </div>
      </div>
    );
  }

  const hasRated = request.ratings?.some((r: any) => r.raterId === (session.user as any)?.id);
  const canRate = request.status === "COMPLETED" && request.providerId && !hasRated;

  // Progress steps
  const steps = [
    { key: "PENDING", label: "قيد الانتظار" },
    { key: "ASSIGNED", label: "تم التعيين" },
    { key: "IN_PROGRESS", label: "جاري التنفيذ" },
    { key: "COMPLETED", label: "مكتمل" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === request.status);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 lg:p-12">
      <div className="hero-glow opacity-20" />
      <div className="max-w-4xl mx-auto relative z-10 space-y-4 md:space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للطلبات
        </button>

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

        {/* Header */}
        <div className="glass-card p-6 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                request.packageName === "FULL" ? "gold-gradient" : "bg-amber-500/10"
              }`}>
                <Package className={`w-6 h-6 ${request.packageName === "FULL" ? "text-black" : "text-amber-500"}`} />
              </div>
              <div>
                <div className="font-bold text-xl">{PACKAGE_LABELS[request.packageName as PackageName]}</div>
                <div className="text-xs text-muted-foreground font-mono">#{request.id.slice(-6).toUpperCase()}</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-amber-400">{request.packagePrice?.toLocaleString()} ج.م</div>
              <PaymentStatusBadge status={request.paymentStatus as PaymentStatus} />
            </div>
          </div>

          {/* Progress tracker */}
          {request.status !== "CANCELLED" && (
            <div className="flex items-center gap-2 mb-6">
              {steps.map((step, i) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStepIndex
                        ? "gold-gradient text-black"
                        : "bg-white/5 text-muted-foreground"
                    }`}>
                      {i <= currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] ${i <= currentStepIndex ? "text-amber-400" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded ${i < currentStepIndex ? "bg-amber-500" : "bg-white/10"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">عنوان العقار</div>
                <div className="text-sm font-medium">{request.property?.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">تاريخ الطلب</div>
                <div className="text-sm">{new Date(request.createdAt).toLocaleDateString("ar-EG", { dateStyle: "long" })}</div>
              </div>
            </div>
            {request.scheduledDate && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">موعد الفحص</div>
                  <div className="text-sm font-bold">
                    {new Date(request.scheduledDate).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            )}
            {request.provider && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">الخبير المعين</div>
                  <div className="text-sm font-bold">{request.provider.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.provider.specialty === "ENGINEER" ? "مهندس" : "محامي"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {request.notes && (
            <div className="pt-4 border-t border-white/5 mt-4">
              <div className="text-xs text-muted-foreground mb-1">ملاحظاتك</div>
              <div className="text-sm bg-white/5 p-3 rounded-xl">{request.notes}</div>
            </div>
          )}
        </div>

        {/* Reports */}
        {request.reports?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              تقارير الفحص
            </h2>
            {request.reports.map((report: any) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl border-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-lg">{report.title}</span>
                    <span className="px-2.5 py-0.5 bg-white/5 rounded-lg text-[10px] font-bold">
                      {report.type === "LEGAL" ? "قانوني" : "فني"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                {report.summary && (
                  <div className="bg-white/5 p-4 rounded-xl mb-3 text-sm leading-relaxed">
                    <div className="text-xs text-amber-500/60 mb-1 font-bold">الملخص</div>
                    {report.summary}
                  </div>
                )}
                {report.content && (
                  <div className="bg-white/5 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                    <div className="text-xs text-amber-500/60 mb-1 font-bold">التفاصيل</div>
                    {report.content}
                  </div>
                )}
                {report.pdfUrl && (
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    تحميل PDF
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Rating */}
        {canRate && (
          <div className="glass-card p-6 rounded-2xl border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="font-bold">قيّم تجربتك</div>
                  <div className="text-xs text-muted-foreground">ساعدنا في تحسين الخدمة بتقييم الخبير</div>
                </div>
              </div>
              <button
                onClick={() => setShowRating(true)}
                className="gold-gradient text-black px-5 py-2 rounded-xl text-sm font-bold"
              >
                تقييم الآن
              </button>
            </div>
          </div>
        )}

        {/* Existing rating */}
        {hasRated && (
          <div className="glass-card p-5 rounded-2xl border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="font-bold">تقييمك</span>
            </div>
            {request.ratings.filter((r: any) => r.raterId === (session?.user as any)?.id).map((r: any) => (
              <div key={r.id}>
                <StarRating value={r.score} readonly />
                {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Lawyer Continuation Section */}
        {request.status === "COMPLETED" &&
          (request.packageName === "LEGAL" || request.packageName === "FULL") && (
          <div className="space-y-4">
            {continuations.length === 0 && !showContinuationForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 rounded-2xl border-purple-500/20 bg-purple-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="font-bold">هل تحتاج متابعة قانونية؟</div>
                      <div className="text-xs text-muted-foreground">يمكنك طلب متابعة مع محامي لاتخاذ إجراءات قانونية</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowContinuationForm(true);
                      fetch("/api/experts?package=LEGAL")
                        .then((r) => r.json())
                        .then((data) => setAvailableLawyers(data.data || []))
                        .catch(() => {});
                    }}
                    className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition-colors"
                  >
                    طلب متابعة
                  </button>
                </div>
              </motion.div>
            )}

            {showContinuationForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl border-white/5"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-400" />
                  طلب متابعة قانونية
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/80">نوع القضية *</label>
                    <Dropdown
                      value={contCaseType}
                      onChange={setContCaseType}
                      placeholder="اختر نوع القضية"
                      options={CASE_TYPES.map((ct) => ({ value: ct.value, label: ct.label }))}
                    />
                  </div>
                  {availableLawyers.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-500/80">اختر محامي (اختياري)</label>
                      <Dropdown
                        value={contLawyerId}
                        onChange={setContLawyerId}
                        placeholder="سيتم تعيين محامي من الإدارة"
                        allowClear
                        options={availableLawyers.map((l) => ({
                          value: l.id,
                          label: l.name,
                        }))}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/80">تفاصيل الطلب *</label>
                    <textarea
                      value={contDetails}
                      onChange={(e) => setContDetails(e.target.value)}
                      placeholder="اكتب تفاصيل ما تحتاجه من إجراءات قانونية..."
                      className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm resize-none h-28"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!contCaseType || contDetails.length < 10) return;
                        setSubmittingCont(true);
                        try {
                          const res = await fetch(`/api/requests/${id}/continuation`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ details: contDetails, caseType: contCaseType, lawyerId: contLawyerId || undefined }),
                          });
                          if (res.ok) {
                            setMessage({ text: "تم إرسال طلب المتابعة بنجاح", type: "success" });
                            setShowContinuationForm(false);
                            setContDetails("");
                            setContCaseType("");
                            fetchContinuations();
                          } else {
                            const data = await res.json();
                            setMessage({ text: data.error || "فشل إرسال الطلب", type: "error" });
                          }
                        } catch {
                          setMessage({ text: "حدث خطأ", type: "error" });
                        }
                        setSubmittingCont(false);
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      }}
                      disabled={!contCaseType || contDetails.length < 10 || submittingCont}
                      className="flex-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-purple-500/30 transition-colors"
                    >
                      {submittingCont ? "جاري الإرسال..." : "إرسال الطلب"}
                    </button>
                    <button
                      onClick={() => setShowContinuationForm(false)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {continuations.map((cont: any) => (
              <motion.div
                key={cont.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 rounded-2xl border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <span className="font-bold">متابعة قانونية</span>
                    <span className="text-xs text-muted-foreground">
                      {CASE_TYPE_LABELS[cont.caseType] || cont.caseType}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    cont.status === "PENDING" ? "bg-amber-500/10 text-amber-400" :
                    cont.status === "PRICED" ? "bg-blue-500/10 text-blue-400" :
                    cont.status === "ACCEPTED" ? "bg-green-500/10 text-green-400" :
                    cont.status === "IN_PROGRESS" ? "bg-purple-500/10 text-purple-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {CONTINUATION_STATUS_LABELS[cont.status as ContinuationStatus] || cont.status}
                  </span>
                </div>

                <div className="bg-white/5 p-3 rounded-xl text-sm mb-4">{cont.details}</div>

                {cont.status === "PRICED" && cont.cost != null && (
                  <div className="flex items-center justify-between bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm font-bold">تكلفة المتابعة</div>
                        <div className="text-xl font-bold text-blue-400">{cont.cost.toLocaleString()} ج.م</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setAcceptingCont(true);
                        try {
                          const res = await fetch(`/api/requests/${id}/continuation/accept`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ continuationId: cont.id }),
                          });
                          if (res.ok) {
                            setMessage({ text: "تم قبول طلب المتابعة", type: "success" });
                            fetchContinuations();
                          } else {
                            const data = await res.json();
                            setMessage({ text: data.error || "فشل القبول", type: "error" });
                          }
                        } catch {
                          setMessage({ text: "حدث خطأ", type: "error" });
                        }
                        setAcceptingCont(false);
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      }}
                      disabled={acceptingCont}
                      className="gold-gradient text-black px-6 py-2 rounded-xl font-bold disabled:opacity-50"
                    >
                      {acceptingCont ? "جاري القبول..." : "قبول"}
                    </button>
                  </div>
                )}

                {cont.status === "PENDING" && (
                  <div className="text-sm text-amber-400/70 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    طلبك قيد المراجعة من الإدارة — سيتم تحديد التكلفة قريباً
                  </div>
                )}

                {cont.status === "ACCEPTED" && (
                  <div className="text-sm text-green-400/70 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    تم قبول الطلب — سيتم بدء العمل قريباً
                  </div>
                )}

                {cont.status === "IN_PROGRESS" && (
                  <div className="text-sm text-purple-400/70 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    المحامي يعمل على قضيتك
                  </div>
                )}

                {cont.status === "COMPLETED" && (
                  <div className="text-sm text-emerald-400/70 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الانتهاء من المتابعة القانونية بنجاح
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {showRating && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRating(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 rounded-3xl w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold outfit mb-6 text-center">قيّم الخبير</h2>

              <form onSubmit={handleRate} className="space-y-6">
                <div className="flex justify-center">
                  <StarRating value={ratingScore} onChange={setRatingScore} size={32} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-500/80">تعليق (اختياري)</label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="شاركنا تجربتك..."
                    className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm resize-none h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={ratingScore === 0 || submittingRating}
                    className="flex-1 gold-gradient text-black py-3 rounded-xl font-bold disabled:opacity-50"
                  >
                    {submittingRating ? "جاري الإرسال..." : "إرسال التقييم"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRating(false)}
                    className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
