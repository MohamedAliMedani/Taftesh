// ──────────────────────────────────────────────
// Session & Auth Types
// ──────────────────────────────────────────────

export type UserRole = "CLIENT" | "EXPERT" | "ADMIN";
export type Specialty = "ENGINEER" | "LAWYER";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  specialty?: Specialty | null;
  verified?: boolean;
}

// ──────────────────────────────────────────────
// Request & Service Types
// ──────────────────────────────────────────────

export type PaymentMethod = "ONLINE" | "CASH";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CASH";
export type RequestStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED";
export type NotificationType = "INFO" | "REQUEST_UPDATE" | "ASSIGNMENT" | "REPORT" | "PAYMENT";

// Re-export from config so existing imports still work
export { PACKAGES, PACKAGE_LABELS } from "./config";
export type { PackageName } from "./config";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "قيد الانتظار",
  ASSIGNED: "تم التعيين",
  IN_PROGRESS: "جاري التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "معلق",
  PAID: "تم الدفع",
  FAILED: "فشل الدفع",
  CASH: "دفع نقدي",
};

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  ENGINEER: "مهندس",
  LAWYER: "محامي",
};

// ──────────────────────────────────────────────
// API Response Types
// ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  recentRequests: number;
}
