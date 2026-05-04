"use client";

import { useT, useLanguage } from "@/lib/i18n";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "default" | "dark" | "gold";
}

const sizes = {
  sm: { icon: 32, text: "text-lg", gap: "gap-2" },
  md: { icon: 40, text: "text-xl", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-2xl", gap: "gap-3" },
  xl: { icon: 64, text: "text-4xl", gap: "gap-4" },
};

export function Logo({ size = "md", showText = true, variant = "default" }: LogoProps) {
  const s = sizes[size];
  const t = useT();
  const { lang } = useLanguage();
  const name = t("site.name");
  const parts = lang === "ar" ? ["أمانك", "العقاري"] : name.split(" ").length > 1 ? [name.split(" ")[0], name.split(" ").slice(1).join(" ")] : [name, ""];

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div
        className="gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          width={s.icon * 0.6}
          height={s.icon * 0.6}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 3L3 14h3v13h8v-8h4v8h8V14h3L16 3z" fill="none" stroke="#0a0a0b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 12c-3 0-5 1.5-5 1.5v5.5s2 2 5 2 5-2 5-2v-5.5S19 12 16 12z" fill="#0a0a0b" fillOpacity="0.25" stroke="#0a0a0b" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M13.5 17l1.5 1.5 3.5-3.5" stroke="#0a0a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-bold tracking-tight outfit`}>
            {variant === "dark" ? (
              <span className="text-black">{parts[0]} <span className="text-amber-700">{parts[1]}</span></span>
            ) : (
              <>{parts[0]} <span className="text-gradient">{parts[1]}</span></>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 3L3 14h3v13h8v-8h4v8h8V14h3L16 3z"
          fill="none"
          stroke="#0a0a0b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 12c-3 0-5 1.5-5 1.5v5.5s2 2 5 2 5-2 5-2v-5.5S19 12 16 12z"
          fill="#0a0a0b"
          fillOpacity="0.25"
          stroke="#0a0a0b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 17l1.5 1.5 3.5-3.5"
          stroke="#0a0a0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
