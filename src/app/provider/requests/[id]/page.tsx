"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Package, FileText, Upload,
  Play, CheckCircle2, AlertCircle, ArrowRight, User
} from "lucide-react";
import { RequestStatusBadge } from "@/components/ui/StatusBadge";
import { PACKAGE_LABELS } from "@/lib/types";
import type { RequestStatus, PackageName } from "@/lib/types";

export default function ProviderRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<"LEGAL" | "TECHNICAL">("TECHNICAL");
  const [reportTitle, setReportTitle] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchRequest = () => {
    fetch(`/api/provider/requests/${id}`)
      .then((r) => r.json())
      .then((data) => { setRequest(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/provider/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage({ text: newStatus === "IN_PROGRESS" ? "تم بدء العمل على الطلب" : "تم إكمال الطلب بنجاح", type: "success" });
        fetchRequest();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "فشل التحديث", type: "error" });
      }
    } catch {
      setMessage({ text: "حدث خطأ", type: "error" });
    }
    setUpdating(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/provider/requests/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          title: reportTitle,
          summary: reportSummary,
          content: reportContent,
        }),
      });
      if (res.ok) {
        setMessage({ text: "تم رفع التقرير بنجاح", type: "success" });
        setShowReportForm(false);
        setReportTitle("");
        setReportSummary("");
        setReportContent("");
        fetchRequest();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "فشل رفع التقرير", type: "error" });
      }
    } catch {
      setMessage({ text: "حدث خطأ", type: "error" });
    }
    setSubmittingReport(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card h-48 animate-pulse rounded-2xl" />
        <div className="glass-card h-64 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="glass-card p-16 text-center rounded-3xl">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-muted-foreground">الطلب غير موجود أو ليس لديك صلاحية الوصول</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push("/provider")} className="text-muted-foreground hover:text-white">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold outfit">تفاصيل الطلب</h1>
        <span className="text-sm text-muted-foreground font-mono">#{request.id.slice(-6).toUpperCase()}</span>
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

      {/* Request Info Card */}
      <div className="glass-card p-6 rounded-2xl border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              request.packageName === "FULL" ? "gold-gradient" : "bg-amber-500/10"
            }`}>
              <Package className={`w-6 h-6 ${request.packageName === "FULL" ? "text-black" : "text-amber-500"}`} />
            </div>
            <div>
              <div className="font-bold text-lg">{PACKAGE_LABELS[request.packageName as PackageName]}</div>
              <div className="text-xs text-muted-foreground">
                {request.packagePrice?.toLocaleString()} ج.م
              </div>
            </div>
          </div>
          <RequestStatusBadge status={request.status as RequestStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">عنوان العقار</div>
              <div className="text-sm font-medium">{request.property?.location}</div>
              {request.property?.area && <div className="text-xs text-muted-foreground">{request.property.area}</div>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">العميل</div>
              <div className="text-sm font-medium">{request.user?.name || "عميل"}</div>
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
        </div>

        {request.notes && (
          <div className="pt-4 border-t border-white/5">
            <div className="text-xs text-muted-foreground mb-1">ملاحظات العميل</div>
            <div className="text-sm bg-white/5 p-3 rounded-xl">{request.notes}</div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {request.status === "ASSIGNED" && (
          <button
            onClick={() => handleStatusUpdate("IN_PROGRESS")}
            disabled={updating}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 text-purple-400 rounded-xl font-bold hover:bg-purple-500/20 transition-colors border border-purple-500/20 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            {updating ? "جاري التحديث..." : "بدء العمل"}
          </button>
        )}
        {request.status === "IN_PROGRESS" && (
          <>
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold hover:bg-blue-500/20 transition-colors border border-blue-500/20"
            >
              <Upload className="w-5 h-5" />
              رفع تقرير
            </button>
            <button
              onClick={() => handleStatusUpdate("COMPLETED")}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-3 gold-gradient text-black rounded-xl font-bold disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {updating ? "جاري التحديث..." : "إنهاء الطلب"}
            </button>
          </>
        )}
      </div>

      {/* Reports */}
      {request.reports?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold outfit flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            التقارير المرفوعة
          </h2>
          {request.reports.map((report: any) => (
            <div key={report.id} className="glass-card p-5 rounded-2xl border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">{report.title}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded-lg text-[10px] font-bold">
                    {report.type === "LEGAL" ? "قانوني" : "فني"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
              {report.summary && <p className="text-sm text-muted-foreground">{report.summary}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowReportForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" />
              رفع تقرير جديد
            </h2>

            <form onSubmit={handleSubmitReport} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">نوع التقرير</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-white text-sm [&>option]:text-black"
                >
                  <option value="TECHNICAL">تقرير فني / هندسي</option>
                  <option value="LEGAL">تقرير قانوني</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">عنوان التقرير</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="مثال: تقرير الفحص الهندسي - شقة مدينة نصر"
                  className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">ملخص التقرير</label>
                <textarea
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder="ملخص سريع للنتائج الرئيسية..."
                  className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm resize-none h-24"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">تفاصيل التقرير الكاملة</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="التفاصيل الكاملة للفحص، النتائج، التوصيات..."
                  className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm resize-none h-48"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 gold-gradient text-black py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {submittingReport ? "جاري الرفع..." : "رفع التقرير"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
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
  );
}
