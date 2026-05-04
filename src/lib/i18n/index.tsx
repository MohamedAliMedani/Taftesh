"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import ar from "./ar.json";
import en from "./en.json";

type Lang = "ar" | "en";
type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = { ar, en };

interface I18nContextType {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  dir: "rtl",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && (saved === "ar" || saved === "en")) {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    document.cookie = `lang=${newLang};path=/;max-age=31536000`;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  }, []);

  // Set initial dir/lang on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang, mounted]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = dictionaries[lang][key] || dictionaries.ar[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }
      return value;
    },
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const { t } = useContext(I18nContext);
  return t;
}

export function useLanguage() {
  const { lang, dir, setLang } = useContext(I18nContext);
  return { lang, dir, setLang };
}
