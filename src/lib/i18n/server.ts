import { cookies } from "next/headers";
import ar from "./ar.json";
import en from "./en.json";

type Lang = "ar" | "en";
type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = { ar, en };

/**
 * Get the translation function for API routes (server-side).
 * Reads language from the `lang` cookie set by the frontend.
 */
export async function getServerT() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "ar";
  const dict = dictionaries[lang] || dictionaries.ar;

  return (key: string, params?: Record<string, string | number>): string => {
    let value = dict[key] || dictionaries.ar[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
}
