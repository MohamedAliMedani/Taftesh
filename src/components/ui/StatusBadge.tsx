"use client";

import { useT } from "@/lib/i18n";
import type { RequestStatus, PaymentStatus } from "@/lib/types";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  ASSIGNED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/20",
  PAID: "bg-green-500/15 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/20",
  CASH: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  DRAFT: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  SUBMITTED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  APPROVED: "bg-green-500/15 text-green-400 border-green-500/20",
};

const statusKeys: Record<string, string> = {
  PENDING: "status.pending",
  ASSIGNED: "status.assigned",
  IN_PROGRESS: "status.inProgress",
  COMPLETED: "status.completed",
  CANCELLED: "status.cancelled",
};

const paymentStatusKeys: Record<string, string> = {
  PENDING: "paymentStatus.pending",
  PAID: "paymentStatus.paid",
  FAILED: "paymentStatus.failed",
  CASH: "paymentStatus.cash",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const t = useT();
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusColors[status] || statusColors.PENDING}`}>
      {t(statusKeys[status] || status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useT();
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusColors[status] || statusColors.PENDING}`}>
      {t(paymentStatusKeys[status] || status)}
    </span>
  );
}
