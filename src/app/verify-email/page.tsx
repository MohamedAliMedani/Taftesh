"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { useT } from "@/lib/i18n";

function VerifyFallback() {
  const t = useT();
  return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-amber-500">{t("verify.loading")}</div>;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const t = useT();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage(t("verify.invalidLink"));
      return;
    }

    fetch(`/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(t("verify.error"));
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 md:p-6">
      <div className="hero-glow opacity-30" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 rounded-3xl md:rounded-[40px] text-center w-full max-w-md relative z-10"
      >
        <div className="mx-auto mb-6 w-fit">
          <LogoMark size={64} />
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold outfit mb-2">{t("verify.loading")}</h1>
            <p className="text-muted-foreground">{t("verify.verifyingEmail")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold outfit mb-2">{t("verify.successTitle")}</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="gold-gradient text-black px-8 py-3 rounded-2xl font-bold"
            >
              {t("login.submit")}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold outfit mb-2">{t("verify.errorTitle")}</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => router.push("/register")}
              className="glass px-8 py-3 rounded-2xl font-bold border border-white/10"
            >
              {t("verify.reRegister")}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
