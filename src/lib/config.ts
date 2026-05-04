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
