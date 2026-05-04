"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="glass px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-1.5"
      title={lang === "ar" ? "Switch to English" : "ال��بديل للعربية"}
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}
