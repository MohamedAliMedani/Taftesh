// ──────────────────────────────────────────────
// Centralized App Configuration
// All business data is here — no hardcoded values in components
// ──────────────────────────────────────────────

export const SITE_CONFIG = {
  name: "أمانك العقاري",
  nameShort: "أمانك",
  nameEn: "Amanak",
  tagline: "عقارك.. أمانك",
  description: "المنصة الأولى في مصر لفحص العقارات فنياً وقانونياً قبل الشراء.",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "01000000000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@taftesh.com",
  fallbackEmail: "client@taftesh.com",
};

// Platform fee percentage
export const PLATFORM_FEE_PERCENT = 0.25;

export function calculateTotalPrice(expertRate: number): number {
  return Math.ceil(expertRate * (1 + PLATFORM_FEE_PERCENT));
}

export type PackageName = "LEGAL" | "TECHNICAL" | "FULL";

export const PACKAGES: Record<
  PackageName,
  { name: PackageName; nameAr: string; desc: string; features: string[] }
> = {
  TECHNICAL: {
    name: "TECHNICAL",
    nameAr: "الفحص الهندسي",
    desc: "فحص شامل للمواسير، الكهرباء، المعمار",
    features: [
      "فحص السباكة والصرف",
      "معاينة التوصيلات الكهربائية",
      "كشف الرطوبة والشروخ",
      "تقرير هندسي PDF",
    ],
  },
  LEGAL: {
    name: "LEGAL",
    nameAr: "المراجعة القانونية",
    desc: "مراجعة عقود، تراخيص، وتاريخ الملكية",
    features: [
      "فحص تسلسل الملكية",
      "التأكد من تراخيص البناء",
      "مراجعة موقف الضرائب",
      "تقرير قانوني شامل",
    ],
  },
  FULL: {
    name: "FULL",
    nameAr: "الأمان الشامل",
    desc: "الخدمة الهندسية والقانونية معاً",
    features: [
      "كل مميزات الفحص الهندسي",
      "مراجعة كافة الأوراق القانونية",
      "التأكد من موقف التراخيص",
      "صياغة عقد البيع النهائي",
      "جلسة استشارية 15 دقيقة",
    ],
  },
};

export const PACKAGE_LABELS: Record<PackageName, string> = {
  TECHNICAL: PACKAGES.TECHNICAL.nameAr,
  LEGAL: PACKAGES.LEGAL.nameAr,
  FULL: PACKAGES.FULL.nameAr,
};

// i18n keys for package names/descriptions — use with t()
export const PACKAGE_NAME_KEYS: Record<PackageName, string> = {
  TECHNICAL: "pkg.technical.name",
  LEGAL: "pkg.legal.name",
  FULL: "pkg.full.name",
};

export const PACKAGE_DESC_KEYS: Record<PackageName, string> = {
  TECHNICAL: "pkg.technical.desc",
  LEGAL: "pkg.legal.desc",
  FULL: "pkg.full.desc",
};

export const PACKAGE_FEATURE_KEYS: Record<PackageName, string[]> = {
  TECHNICAL: ["pkg.technical.f1", "pkg.technical.f2", "pkg.technical.f3", "pkg.technical.f4"],
  LEGAL: ["pkg.legal.f1", "pkg.legal.f2", "pkg.legal.f3", "pkg.legal.f4"],
  FULL: ["pkg.full.f1", "pkg.full.f2", "pkg.full.f3", "pkg.full.f4", "pkg.full.f5"],
};

// ──────────────────────────────────────────────
// Inspection Terms (predefined checklist)
// ──────────────────────────────────────────────

export type TermKey =
  | "PLUMBING" | "ELECTRICAL" | "MOISTURE_CRACKS" | "ARCHITECTURE_FINISHING" | "INSULATION"
  | "STRUCTURAL_INSPECTION" | "ENGINEERING_DRAWINGS" | "TECHNICAL_REPORT" | "SITE_SUPERVISION" | "ESTIMATION_COST" | "VIOLATIONS_CHECK"
  | "OWNERSHIP_VERIFY" | "LICENSE_REVIEW" | "TAX_STATUS" | "SALES_CONTRACT" | "MORTGAGE_SEIZURE"
  | "LEGAL_STATUS" | "UTILITIES_REVIEW" | "SIGNATURE_AUTHENTICATION" | "PROPERTY_REGISTRATION" | "RENTAL_CONTRACTS";

export interface TermDefinition {
  key: TermKey;
  nameAr: string;
  nameEn: string;
  specialty: "ENGINEER" | "LAWYER";
}

export const INSPECTION_TERMS: TermDefinition[] = [
  { key: "PLUMBING", nameAr: "فحص السباكة والصرف", nameEn: "Plumbing & Drainage", specialty: "ENGINEER" },
  { key: "ELECTRICAL", nameAr: "فحص الكهرباء", nameEn: "Electrical Inspection", specialty: "ENGINEER" },
  { key: "MOISTURE_CRACKS", nameAr: "كشف الرطوبة والشروخ", nameEn: "Moisture & Cracks Detection", specialty: "ENGINEER" },
  { key: "ARCHITECTURE_FINISHING", nameAr: "فحص المعمار والتشطيبات", nameEn: "Architecture & Finishing", specialty: "ENGINEER" },
  { key: "INSULATION", nameAr: "فحص العزل", nameEn: "Insulation Inspection", specialty: "ENGINEER" },
  { key: "STRUCTURAL_INSPECTION", nameAr: "الفحص الإنشائي", nameEn: "Structural Inspection", specialty: "ENGINEER" },
  { key: "ENGINEERING_DRAWINGS", nameAr: "فحص الرسومات الهندسية", nameEn: "Engineering Drawings Review", specialty: "ENGINEER" },
  { key: "TECHNICAL_REPORT", nameAr: "إعداد التقرير الفني", nameEn: "Technical Report Preparation", specialty: "ENGINEER" },
  { key: "SITE_SUPERVISION", nameAr: "الزيارات والإشراف", nameEn: "Visits & Supervision", specialty: "ENGINEER" },
  { key: "ESTIMATION_COST", nameAr: "تقدير تكاليف الإصلاح", nameEn: "Repair Cost Estimation", specialty: "ENGINEER" },
  { key: "VIOLATIONS_CHECK", nameAr: "كشف المخالفات الإنشائية", nameEn: "Violations Check", specialty: "ENGINEER" },
  { key: "OWNERSHIP_VERIFY", nameAr: "فحص تسلسل الملكية", nameEn: "Ownership Verification", specialty: "LAWYER" },
  { key: "LICENSE_REVIEW", nameAr: "مراجعة التراخيص", nameEn: "License Review", specialty: "LAWYER" },
  { key: "TAX_STATUS", nameAr: "مراجعة موقف الضرائب", nameEn: "Tax Status Review", specialty: "LAWYER" },
  { key: "SALES_CONTRACT", nameAr: "صياغة عقد البيع", nameEn: "Sales Contract Drafting", specialty: "LAWYER" },
  { key: "MORTGAGE_SEIZURE", nameAr: "فحص الرهن والحجز", nameEn: "Mortgage & Seizure Check", specialty: "LAWYER" },
  { key: "LEGAL_STATUS", nameAr: "فحص الموقف القانوني", nameEn: "Legal Status Review", specialty: "LAWYER" },
  { key: "UTILITIES_REVIEW", nameAr: "مراجعة المرافق", nameEn: "Utilities Review", specialty: "LAWYER" },
  { key: "SIGNATURE_AUTHENTICATION", nameAr: "توثيق التوقيع", nameEn: "Signature Authentication", specialty: "LAWYER" },
  { key: "PROPERTY_REGISTRATION", nameAr: "تسجيل العقار", nameEn: "Property Registration", specialty: "LAWYER" },
  { key: "RENTAL_CONTRACTS", nameAr: "عقود الإيجار", nameEn: "Rental Contracts", specialty: "LAWYER" },
];

export const ENGINEER_TERMS = INSPECTION_TERMS.filter(t => t.specialty === "ENGINEER");
export const LAWYER_TERMS = INSPECTION_TERMS.filter(t => t.specialty === "LAWYER");

export function getTermName(key: string, lang: "ar" | "en" = "ar"): string {
  const term = INSPECTION_TERMS.find(t => t.key === key);
  return term ? (lang === "en" ? term.nameEn : term.nameAr) : key;
}

export type TermStatus = "PENDING" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED";
