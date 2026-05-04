"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Scale, User, MapPin, Clock, Banknote, CheckCircle2, AlertCircle, Filter
} from "lucide-react";
import { CASE_TYPE_LABELS, CONTINUATION_STATUS_LABELS } from "@/lib/types";
import type { ContinuationStatus } from "@/lib/types";
import Dropdown from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n";

export default function AdminContinuationsPage() {
  const t = useT();
  const [continuations, setContinuations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Cost modal
  const [costModal, setCostModal] = useState<any>(null);
  const [costValue, setCostValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/continuations?${params}`)
      .then((r) => r.json())
      .then((data) => { setContinuations(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSetCost = async () => {
    if (!costModal || !costValue) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/continuations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ continuationId: costModal.id, cost: parseFloat(costValue) }),
      });
      if (res.ok) {
        setMessage({ text: t("admin.continuations.costSent"), type: "success" });
        setCostModal(null);
        setCostValue("");
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || t("common.error"), type: "error" });
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleStatusUpdate = async (continuationId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/continuations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ continuationId, status }),
      });
      if (res.ok) {
        setMessage({ text: t("admin.users.updated"), type: "success" });
        fetchData();
      }
    } catch {
      setMessage({ text: t("common.error"), type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold outfit">{t("admin.continuations.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.continuations.subtitle")}</p>
        </div>
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder={t("admin.continuations.allStatuses")}
          icon={<Filter className="w-4 h-4 text-muted-foreground" />}
          allowClear
          options={[
            { value: "PENDING", label: t("admin.continuations.awaitingPricing") },
            { value: "PRICED", label: t("admin.continuations.costDetermined") },
            { value: "ACCEPTED", label: t("admin.continuations.accepted") },
            { value: "IN_PROGRESS", label: t("admin.continuations.inProgress") },
            { value: "COMPLETED", label: t("admin.continuations.completed") },
          ]}
          className="min-w-[200px]"
        />
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

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : continuations.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl">
          <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">{t("admin.continuations.noRequests")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {continuations.map((cont, i) => (
            <motion.div
              key={cont.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-6 rounded-2xl border-white/5"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold">{cont.request?.user?.name || t("admin.users.client")}</span>
                      <span className="text-xs text-muted-foreground font-mono">#{cont.requestId.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{cont.request?.property?.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(cont.createdAt).toLocaleDateString("ar-EG", { dateStyle: "medium" })}
                      {cont.request?.user?.phone && <span className="mr-2">| {cont.request.user.phone}</span>}
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-purple-400 font-bold">{CASE_TYPE_LABELS[cont.caseType] || cont.caseType}</span>
                    </div>
                    <div className="text-sm bg-white/5 p-3 rounded-xl mt-2">{cont.details}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{t("admin.continuations.status")}</span>
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

                  {cont.cost != null && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{t("admin.continuations.cost")}</span>
                      <span className="text-amber-400 font-bold text-sm">{cont.cost.toLocaleString()} {t("common.currency")}</span>
                    </div>
                  )}

                  {(cont.lawyer || cont.request?.provider) && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{cont.lawyer ? t("admin.continuations.selectedLawyer") : t("admin.continuations.lawyer")}</span>
                      <span className="text-xs font-bold text-emerald-400">{cont.lawyer?.name || cont.request?.provider?.name}</span>
                    </div>
                  )}

                  {/* Actions */}
                  {cont.status === "PENDING" && (
                    <button
                      onClick={() => setCostModal(cont)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                    >
                      <Banknote className="w-4 h-4" />
                      {t("admin.continuations.setCost")}
                    </button>
                  )}

                  {cont.status === "ACCEPTED" && (
                    <button
                      onClick={() => handleStatusUpdate(cont.id, "IN_PROGRESS")}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                    >
                      {t("admin.continuations.startExecution")}
                    </button>
                  )}

                  {cont.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleStatusUpdate(cont.id, "COMPLETED")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-colors border border-green-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t("admin.continuations.complete")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cost Modal */}
      {costModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setCostModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold outfit mb-2">{t("admin.continuations.setCostTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {costModal.request?.user?.name} — {CASE_TYPE_LABELS[costModal.caseType] || costModal.caseType}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500/80">{t("admin.continuations.costLabel")} {t("common.required")}</label>
                <div className="glass flex items-center px-4 py-3.5 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                  <Banknote className="w-5 h-5 text-amber-500 ml-3" />
                  <input
                    type="number"
                    min="1"
                    value={costValue}
                    onChange={(e) => setCostValue(e.target.value)}
                    placeholder={t("admin.continuations.costPlaceholder")}
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSetCost}
                  disabled={!costValue || parseFloat(costValue) <= 0 || saving}
                  className="flex-1 gold-gradient text-black py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {saving ? t("profile.saving") : t("admin.continuations.sendCost")}
                </button>
                <button
                  onClick={() => setCostModal(null)}
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
