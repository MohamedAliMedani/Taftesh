"use client";

import { STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/types";
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

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusColors[status] || statusColors.PENDING}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusColors[status] || statusColors.PENDING}`}>
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
