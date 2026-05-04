"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, MapPin, User, Package, Clock, Search,
  ChevronDown, UserPlus, AlertCircle, CheckCircle2, Filter
} from "lucide-react";
import { RequestStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { PACKAGE_LABELS } from "@/lib/types";
import type { RequestStatus, PaymentStatus, PackageName } from "@/lib/types";
import Dropdown from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n";

export default function AdminRequestsPage() {
  const t = useT();
  const [requests, setRequests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [assignModalRequest, setAssignModalRequest] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchRequests = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/requests?${params}`)
      .then((r) => r.json())
      .then((data) => { setRequests(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
    fetch("/api/admin/providers")
      .then((r) => r.json())
      .then((data) => setProviders(data.data || []));
  }, [fetchRequests]);

  const handleAssign = async () => {
    if (!assignModalRequest || !selectedProvider) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: assignModalRequest.id,
          providerId: selectedProvider,
          adminNotes: adminNotes || undefined,
        }),
      });
      if (res.ok) {
        setMessage({ text: t("admin.requests.assignSuccess"), type: "success" });
        setAssignModalRequest(null);
        setSelectedProvider("");
        setAdminNotes("");
        fetchRequests();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || t("admin.requests.assignFailed"), type: "error" });
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setAssigning(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        setMessage({ text: t("admin.requests.statusUpdated"), type: "success" });
        fetchRequests();
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handlePaymentUpdate = async (requestId: string, paymentStatus: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, paymentStatus }),
      });
      if (res.ok) {
        setMessage({ text: t("admin.requests.paymentUpdated"), type: "success" });
        fetchRequests();
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const getMatchingProviders = (packageName: string) => {
    return providers.filter((p: any) => {
      if (packageName === "FULL") return true;
      if (packageName === "TECHNICAL") return p.specialty === "ENGINEER";
      if (packageName === "LEGAL") return p.specialty === "LAWYER";
      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold outfit">{t("admin.requests.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.requests.subtitle")}</p>
        </div>
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder={t("admin.requests.allStatuses")}
          icon={<Filter className="w-4 h-4 text-muted-foreground" />}
          allowClear
          options={[
            { value: "PENDING", label: t("admin.requests.pending") },
            { value: "ASSIGNED", label: t("admin.requests.assigned") },
            { value: "IN_PROGRESS", label: t("admin.requests.inProgress") },
            { value: "COMPLETED", label: t("admin.requests.completed") },
            { value: "CANCELLED", label: t("admin.requests.cancelled") },
          ]}
          className="min-w-[180px]"
        />
      </div>

      {/* Status message */}
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

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl">
          <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">{t("admin.requests.noRequests")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-6 rounded-2xl border-white/5"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Info */}
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold">{req.user?.name || t("admin.users.noName")}</span>
                      <span className="text-xs text-muted-foreground font-mono">#{req.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{req.property?.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString("ar-EG", { dateStyle: "medium" })}
                      {req.user?.phone && <span className="mr-2">| {req.user.phone}</span>}
                    </div>
                    {req.notes && (
                      <div className="text-xs text-amber-500/60 mt-1">{t("admin.requests.notes")} {req.notes}</div>
                    )}
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{t("admin.requests.package")}</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold">
                      {PACKAGE_LABELS[req.packageName as PackageName] || req.packageName}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{t("admin.requests.price")}</span>
                    <span className="text-amber-400 font-bold text-sm">{req.packagePrice?.toLocaleString()} {t("common.currency")}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{t("admin.requests.status")}</span>
                    <RequestStatusBadge status={req.status as RequestStatus} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{t("admin.requests.paymentStatus")}</span>
                    <PaymentStatusBadge status={req.paymentStatus as PaymentStatus} />
                  </div>

                  {/* Provider info or assign button */}
                  {req.provider ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{t("admin.requests.expert")}</span>
                      <span className="text-xs font-bold text-emerald-400">{req.provider.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssignModalRequest(req)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t("admin.requests.assignExpert")}
                    </button>
                  )}

                  {/* Status actions */}
                  <div className="relative group">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="absolute left-0 top-full mt-1 w-48 glass-card rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 border border-white/10">
                      {req.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => handlePaymentUpdate(req.id, "PAID")}
                          className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-white/5 text-green-400"
                        >
                          {t("admin.requests.confirmPayment")}
                        </button>
                      )}
                      {req.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleStatusUpdate(req.id, "CANCELLED")}
                          className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-white/5 text-red-400"
                        >
                          {t("admin.requests.cancelRequest")}
                        </button>
                      )}
                      {req.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusUpdate(req.id, "IN_PROGRESS")}
                          className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-white/5 text-purple-400"
                        >
                          {t("admin.requests.startExecution")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setAssignModalRequest(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl w-full max-w-lg border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold outfit mb-2">{t("admin.requests.assignTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              الطلب #{assignModalRequest.id.slice(-6).toUpperCase()} - {PACKAGE_LABELS[assignModalRequest.packageName as PackageName]}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">{t("admin.requests.chooseExpert")}</label>
                <Dropdown
                  value={selectedProvider}
                  onChange={setSelectedProvider}
                  placeholder={t("admin.requests.selectExpert")}
                  icon={<UserPlus className="w-4 h-4 text-amber-400" />}
                  options={getMatchingProviders(assignModalRequest.packageName).map((p: any) => ({
                    value: p.id,
                    label: `${p.name} (${p.specialty === "ENGINEER" ? t("common.engineer") : t("common.lawyer")})`,
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">{t("admin.requests.adminNotes")}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t("admin.requests.adminNotesPlaceholder")}
                  className="w-full glass p-3 rounded-xl border border-white/10 bg-transparent text-sm resize-none h-20"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAssign}
                  disabled={!selectedProvider || assigning}
                  className="flex-1 gold-gradient text-black py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {assigning ? t("admin.requests.assigning") : t("admin.requests.assignButton")}
                </button>
                <button
                  onClick={() => setAssignModalRequest(null)}
                  className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
