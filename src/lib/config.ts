// ──────────────────────────────────────────────
// Centralized App Configuration
// All business data is here — no hardcoded values in components
// ──────────────────────────────────────────────

export const SITE_CONFIG = {
  name: "تفتيش وتوثيق",
  nameEn: "Taftesh",
  description: "المنصة الأولى في مصر لفحص العقارات فنياً وقانونياً قبل الشراء.",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "01000000000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@taftesh.com",
  fallbackEmail: "client@taftesh.com",
};

export type PackageName = "LEGAL" | "TECHNICAL" | "FULL";

export const PACKAGES: Record<
  PackageName,
  { name: PackageName; nameAr: string; price: number; desc: string; features: string[] }
> = {
  TECHNICAL: {
    name: "TECHNICAL",
    nameAr: "الفحص الهندسي",
    price: Number(process.env.NEXT_PUBLIC_PRICE_TECHNICAL) || 5000,
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
    price: Number(process.env.NEXT_PUBLIC_PRICE_LEGAL) || 5000,
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
    price: Number(process.env.NEXT_PUBLIC_PRICE_FULL) || 8000,
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
