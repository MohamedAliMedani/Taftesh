"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";
import {
  MapPin, CreditCard, AlertCircle, CalendarClock,
  Clock, Banknote, CheckCircle2, Building, StickyNote, Shield
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { motion } from "framer-motion";
import { PACKAGES, calculateTotalPrice } from "@/lib/config";
import type { PackageName } from "@/lib/config";
import Dropdown from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n";

export default function CheckoutPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-amber-500">{t("checkout.loading")}</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const t = useT();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pkgQuery = (searchParams.get("package") as PackageName) || "FULL";
  const expertId = searchParams.get("expertId");
  const engineerId = searchParams.get("engineerId");
  const lawyerId = searchParams.get("lawyerId");

  const [propertyAddress, setPropertyAddress] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<{name: string; profileImage: string | null; specialty: string; serviceRate: number | null} | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<{name: string; profileImage: string | null; serviceRate: number | null} | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<{name: string; profileImage: string | null; serviceRate: number | null} | null>(null);
  const [propertyArea, setPropertyArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [cashSuccess, setCashSuccess] = useState(false);

  const selectedPkg = PACKAGES[pkgQuery] || PACKAGES.FULL;

  // Calculate total price dynamically from expert rates
  const expertRate = selectedExpert?.serviceRate ?? 0;
  const engineerRate = selectedEngineer?.serviceRate ?? 0;
  const lawyerRate = selectedLawyer?.serviceRate ?? 0;
  const baseRate = pkgQuery === "FULL" ? engineerRate + lawyerRate : expertRate;
  const totalPrice = baseRate > 0 ? calculateTotalPrice(baseRate) : 0;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkout?package=${pkgQuery}`);
    }
  }, [status, router, pkgQuery]);

  useEffect(() => {
    if (expertId || engineerId || lawyerId) {
      fetch(`/api/experts?package=${pkgQuery}`)
        .then((r) => r.json())
        .then((data) => {
          const all = data.data || [];
          if (expertId) {
            const expert = all.find((e: any) => e.id === expertId);
            if (expert) setSelectedExpert({ name: expert.name, profileImage: expert.profileImage, specialty: expert.specialty, serviceRate: expert.serviceRate });
          }
          if (engineerId) {
            const eng = all.find((e: any) => e.id === engineerId);
            if (eng) setSelectedEngineer({ name: eng.name, profileImage: eng.profileImage, serviceRate: eng.serviceRate });
          }
          if (lawyerId) {
            const law = all.find((e: any) => e.id === lawyerId);
            if (law) setSelectedLawyer({ name: law.name, profileImage: law.profileImage, serviceRate: law.serviceRate });
          }
        })
        .catch(() => {});
    }
  }, [expertId, engineerId, lawyerId, pkgQuery]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center text-amber-500">{t("checkout.verifying")}</div>;
  }

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touchField = (f: string) => setTouched((p) => ({ ...p, [f]: true }));
  const fieldErrors = {
    address: !propertyAddress.trim() ? t("validation.addressRequired") : propertyAddress.trim().length < 10 ? t("validation.addressMin") : "",
    date: !selectedDate ? t("validation.dateRequired") : "",
    time: !selectedTime ? t("validation.timeRequired") : "",
  };

  const handlePayment = async () => {
    setTouched({ address: true, date: true, time: true });
    if (fieldErrors.address || fieldErrors.date || fieldErrors.time) {
      setError(t("checkout.fixErrors"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: pkgQuery,
          propertyAddress,
          propertyArea: propertyArea || undefined,
          propertyType: propertyType || undefined,
          scheduledDate: scheduledDateTime.toISOString(),
          paymentMethod,
          notes: notes || undefined,
          expertId: expertId || undefined,
          engineerId: engineerId || undefined,
          lawyerId: lawyerId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("checkout.error"));
        setLoading(false);
        return;
      }

      if (paymentMethod === "CASH") {
        setCashSuccess(true);
        setLoading(false);
        return;
      }

      // Online payment via Fawaterk
      if (data.hashKey) {
        setPaymentReady(true);
        const pluginConfig = {
          envType: "test",
          hashKey: data.hashKey,
          style: { listing: "horizontal" },
          version: "2",
          requestBody: {
            cartTotal: data.amount.toString(),
            currency: "EGP",
            customer: {
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              email: data.user.email,
              phone: data.user.phone,
              address: data.user.address,
            },
            redirectionUrls: {
              successUrl: `${window.location.origin}/dashboard?payment=success`,
              failUrl: `${window.location.origin}/dashboard?payment=fail`,
              pendingUrl: `${window.location.origin}/dashboard?payment=pending`,
            },
            cartItems: [
              { name: selectedPkg.nameAr, price: data.amount.toString(), quantity: "1" },
            ],
          },
        };

        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).fawaterkCheckout) {
            (window as any).fawaterkCheckout(pluginConfig);
          } else {
            setError(t("checkout.paymentGatewayError"));
            setPaymentReady(false);
          }
        }, 500);
      } else {
        setError(data.error || t("checkout.paymentSetupError"));
      }
    } catch {
      setError(t("checkout.serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (cashSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="hero-glow opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-[40px] text-center max-w-lg relative z-10"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold outfit mb-4">{t("checkout.successTitle")}</h1>
          <p className="text-muted-foreground mb-2">{t("checkout.successCash")}</p>
          <p className="text-sm text-amber-400 mb-8">{t("checkout.successCashNote")}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="gold-gradient text-black px-10 py-4 rounded-2xl font-bold hover:brightness-110"
          >
            {t("checkout.trackOrder")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 relative bg-[#0a0a0b]">
      <Script src="https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js" strategy="lazyOnload" />
      <div className="hero-glow opacity-30" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 relative z-10">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl self-start lg:sticky top-24 md:top-32"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
            <LogoMark size={48} />
            <div>
              <h2 className="text-xl font-bold outfit">{t("checkout.orderSummary")}</h2>
              <p className="text-sm text-muted-foreground">{t("checkout.reviewPackage")}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("checkout.package")}</span>
              <span className="font-bold">{selectedPkg.nameAr}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("checkout.description")}</span>
              <span className="text-end max-w-[200px]">{selectedPkg.desc}</span>
            </div>
            {selectedExpert && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("checkout.expert")}</span>
                <div className="flex items-center gap-2">
                  {selectedExpert.profileImage ? (
                    <img src={selectedExpert.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 gold-gradient rounded-full flex items-center justify-center text-black text-[10px] font-bold">
                      {selectedExpert.name?.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold">{selectedExpert.name}</span>
                </div>
              </div>
            )}
            {selectedEngineer && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("checkout.engineer")}</span>
                <div className="flex items-center gap-2">
                  {selectedEngineer.profileImage ? (
                    <img src={selectedEngineer.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-[10px] font-bold">
                      {selectedEngineer.name?.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold">{selectedEngineer.name}</span>
                </div>
              </div>
            )}
            {selectedLawyer && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("checkout.lawyer")}</span>
                <div className="flex items-center gap-2">
                  {selectedLawyer.profileImage ? (
                    <img src={selectedLawyer.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-[10px] font-bold">
                      {selectedLawyer.name?.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold">{selectedLawyer.name}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("checkout.paymentMethod")}</span>
              <span className="font-bold">{paymentMethod === "CASH" ? t("checkout.cash") : t("checkout.online")}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            {totalPrice > 0 ? (
              <div className="flex justify-between items-end">
                <div className="text-sm text-muted-foreground">{t("checkout.total")}</div>
                <div className="text-3xl font-bold text-amber-400 italic">{totalPrice.toLocaleString()} {t("checkout.currency")}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                {t("checkout.priceDynamic")}
              </div>
            )}
          </div>
        </motion.div>

        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {!paymentReady ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold outfit">{t("checkout.title")}</h1>
              <p className="text-muted-foreground">{t("checkout.subtitle")}</p>

              <div className="space-y-5">
                {/* Property Address */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-white">{t("checkout.propertyAddress")} {t("common.required")}</label>
                  <div className={`glass flex items-start px-4 py-3 md:py-4 rounded-2xl focus-within:ring-2 border transition-all ${touched.address && fieldErrors.address ? "ring-red-500/50 border-red-500/20" : "ring-amber-500/50 border-white/5"}`}>
                    <MapPin className="w-5 h-5 text-amber-500 mt-1 ml-3 flex-shrink-0" />
                    <textarea
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      onBlur={() => touchField("address")}
                      placeholder={t("checkout.propertyAddressPlaceholder")}
                      className="bg-transparent border-none outline-none text-sm w-full min-h-[70px] md:min-h-[80px] resize-none"
                    />
                  </div>
                  {touched.address && fieldErrors.address && <p className="text-[11px] text-red-400 mr-2">{fieldErrors.address}</p>}
                </div>

                {/* Area & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">{t("checkout.area")}</label>
                    <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/5">
                      <Building className="w-5 h-5 text-amber-500 ml-3" />
                      <input
                        type="text"
                        value={propertyArea}
                        onChange={(e) => setPropertyArea(e.target.value)}
                        placeholder={t("checkout.areaPlaceholder")}
                        className="bg-transparent border-none outline-none text-sm w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">{t("checkout.propertyType")}</label>
                    <Dropdown
                      value={propertyType}
                      onChange={setPropertyType}
                      placeholder={t("checkout.chooseType")}
                      icon={<Building className="w-5 h-5 text-amber-500" />}
                      options={[
                        { value: t("checkout.apartment"), label: t("checkout.apartment") },
                        { value: t("checkout.villa"), label: t("checkout.villa") },
                        { value: t("checkout.office"), label: t("checkout.office") },
                        { value: t("checkout.commercial"), label: t("checkout.commercial") },
                        { value: t("checkout.land"), label: t("checkout.land") },
                        { value: t("checkout.other"), label: t("checkout.other") },
                      ]}
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-white">{t("checkout.inspectionDate")} {t("common.required")}</label>
                    <div className={`glass flex items-center px-4 py-3 rounded-2xl border transition-all ${touched.date && fieldErrors.date ? "ring-2 ring-red-500/50 border-red-500/20" : "border-white/5"}`}>
                      <CalendarClock className="w-5 h-5 text-amber-500 ml-3 flex-shrink-0" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        onBlur={() => touchField("date")}
                        min={today}
                        className="bg-transparent border-none outline-none text-sm w-full text-white cursor-pointer"
                      />
                    </div>
                    {touched.date && fieldErrors.date && <p className="text-[11px] text-red-400 mr-2">{fieldErrors.date}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-white">{t("checkout.inspectionTime")} {t("common.required")}</label>
                    <div className={`glass flex items-center px-4 py-3 rounded-2xl border transition-all ${touched.time && fieldErrors.time ? "ring-2 ring-red-500/50 border-red-500/20" : "border-white/5"}`}>
                      <Clock className="w-5 h-5 text-amber-500 ml-3 flex-shrink-0" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        onBlur={() => touchField("time")}
                        className="bg-transparent border-none outline-none text-sm w-full text-white cursor-pointer"
                      />
                    </div>
                    {touched.time && fieldErrors.time && <p className="text-[11px] text-red-400 mr-2">{fieldErrors.time}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">{t("checkout.notes")}</label>
                  <div className="glass flex items-start px-4 py-3 rounded-2xl border border-white/5">
                    <StickyNote className="w-5 h-5 text-amber-500 mt-1 ml-3 flex-shrink-0" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("checkout.notesPlaceholder")}
                      className="bg-transparent border-none outline-none text-sm w-full min-h-[60px] resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white">{t("checkout.paymentMethodLabel")} {t("common.required")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`glass p-4 rounded-2xl border text-center transition-all ${
                        paymentMethod === "ONLINE"
                          ? "border-amber-500/50 bg-amber-500/10 ring-2 ring-amber-500/20"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "ONLINE" ? "text-amber-400" : "text-muted-foreground"}`} />
                      <div className="text-sm font-bold">{t("checkout.onlinePayment")}</div>
                      <div className="text-[10px] text-muted-foreground">{t("checkout.onlinePaymentDesc")}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`glass p-4 rounded-2xl border text-center transition-all ${
                        paymentMethod === "CASH"
                          ? "border-amber-500/50 bg-amber-500/10 ring-2 ring-amber-500/20"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <Banknote className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "CASH" ? "text-amber-400" : "text-muted-foreground"}`} />
                      <div className="text-sm font-bold">{t("checkout.cashPayment")}</div>
                      <div className="text-[10px] text-muted-foreground">{t("checkout.cashPaymentDesc")}</div>
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !propertyAddress}
                  className="w-full gold-gradient text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {paymentMethod === "CASH" ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  {loading ? t("checkout.preparing") : paymentMethod === "CASH" ? t("checkout.confirmOrder") : t("checkout.proceedPayment")}
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-4 rounded-2xl">
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>{t("checkout.securityNote")}</p>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-500" />
                {t("checkout.choosePaymentMethod")}
              </h2>
              <div id="fawaterkDivId" className="w-full min-h-[300px]"></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
