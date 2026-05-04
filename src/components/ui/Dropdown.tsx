"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  allowClear?: boolean;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
  allowClear = false,
}: DropdownProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const resolvedPlaceholder = placeholder || t("dropdown.placeholder");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full glass flex items-center justify-between px-4 py-3 rounded-xl text-sm border border-white/10 bg-transparent text-white transition-all hover:border-white/20 focus:ring-2 ring-amber-500/50 outline-none"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className={selectedLabel ? "text-white" : "text-muted-foreground"}>
            {selectedLabel || resolvedPlaceholder}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full glass-card rounded-xl border border-white/10 shadow-2xl z-[60] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {allowClear && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  {t("dropdown.clear")}
                </button>
              )}
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    value === option.value
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
