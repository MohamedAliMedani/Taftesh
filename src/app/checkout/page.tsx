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
import { PACKAGES } from "@/lib/config";
import type { PackageName } from "@/lib/config";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-amber-500">جاري التحميل...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pkgQuery = (searchParams.get("package") as PackageName) || "FULL";

  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyArea, setPropertyArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [cashSuccess, setCashSuccess] = useState(false);

  const selectedPkg = PACKAGES[pkgQuery] || PACKAGES.FULL;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkout?package=${pkgQuery}`);
    }
  }, [status, router, pkgQuery]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center text-amber-500">جاري التحقق...</div>;
  }

  const handlePayment = async () => {
    if (!propertyAddress || !selectedDate || !selectedTime) {
      setError("يرجى إكمال عنوان العقار وتحديد الموعد والتاريخ.");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "حدث خطأ");
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
            setError("تأخر تحميل بوابة الدفع. تفقد اتصالك.");
            setPaymentReady(false);
          }
        }, 500);
      } else {
        setError(data.error || "حدث خطأ أثناء إعداد الدفع");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
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
          <h1 className="text-3xl font-bold outfit mb-4">تم تسجيل طلبك بنجاح!</h1>
          <p className="text-muted-foreground mb-2">تم اختيار الدفع النقدي. سيتواصل فريقنا معك قريباً لتأكيد الموعد.</p>
          <p className="text-sm text-amber-400 mb-8">يتم الدفع عند زيارة الخبير للعقار.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="gold-gradient text-black px-10 py-4 rounded-2xl font-bold hover:brightness-110"
          >
            تتبع طلبك
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative bg-[#0a0a0b]">
      <Script src="https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js" strategy="lazyOnload" />
      <div className="hero-glow opacity-30" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-3xl self-start sticky top-32"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
            <LogoMark size={48} />
            <div>
              <h2 className="text-xl font-bold outfit">ملخص الطلب</h2>
              <p className="text-sm text-muted-foreground">راجع تفاصيل باقتك</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">الباقة:</span>
              <span className="font-bold">{selectedPkg.nameAr}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">الوصف:</span>
              <span className="text-end max-w-[200px]">{selectedPkg.desc}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">طريقة الدفع:</span>
              <span className="font-bold">{paymentMethod === "CASH" ? "نقدي" : "أونلاين"}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex justify-between items-end">
            <div className="text-sm text-muted-foreground">الإجمالي</div>
            <div className="text-3xl font-bold text-amber-400 italic">{selectedPkg.price.toLocaleString()} ج.م</div>
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
              <h1 className="text-3xl font-bold outfit">إتمام الحجز</h1>
              <p className="text-muted-foreground">أدخل تفاصيل العقار لنتمكن من توجيه الخبير المناسب.</p>

              <div className="space-y-5">
                {/* Property Address */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">عنوان العقار بالتفصيل *</label>
                  <div className="glass flex items-start px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 border border-white/5">
                    <MapPin className="w-5 h-5 text-amber-500 mt-1 ml-3 flex-shrink-0" />
                    <textarea
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      placeholder="مثال: مدينة نصر، شارع عباس العقاد، عمارة 5، الدور الخامس..."
                      className="bg-transparent border-none outline-none text-sm w-full min-h-[80px] resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Area & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">المنطقة</label>
                    <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/5">
                      <Building className="w-5 h-5 text-amber-500 ml-3" />
                      <input
                        type="text"
                        value={propertyArea}
                        onChange={(e) => setPropertyArea(e.target.value)}
                        placeholder="مثال: التجمع الخامس"
                        className="bg-transparent border-none outline-none text-sm w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">نوع العقار</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full glass px-4 py-3.5 rounded-2xl border border-white/5 bg-transparent text-sm [&>option]:text-black"
                    >
                      <option value="">اختر النوع</option>
                      <option value="شقة">شقة</option>
                      <option value="فيلا">فيلا</option>
                      <option value="مكتب">مكتب</option>
                      <option value="محل تجاري">محل تجاري</option>
                      <option value="أرض">أرض</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">تاريخ الفحص *</label>
                    <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/5">
                      <CalendarClock className="w-5 h-5 text-amber-500 ml-3" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="bg-transparent border-none outline-none text-sm w-full text-white cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">الوقت المناسب *</label>
                    <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/5">
                      <Clock className="w-5 h-5 text-amber-500 ml-3" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-white cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">ملاحظات إضافية</label>
                  <div className="glass flex items-start px-4 py-3 rounded-2xl border border-white/5">
                    <StickyNote className="w-5 h-5 text-amber-500 mt-1 ml-3 flex-shrink-0" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي تفاصيل إضافية تود إبلاغنا بها..."
                      className="bg-transparent border-none outline-none text-sm w-full min-h-[60px] resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white">طريقة الدفع *</label>
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
                      <div className="text-sm font-bold">دفع أونلاين</div>
                      <div className="text-[10px] text-muted-foreground">بطاقة / محفظة إلكترونية</div>
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
                      <div className="text-sm font-bold">دفع نقدي</div>
                      <div className="text-[10px] text-muted-foreground">عند زيارة الخبير</div>
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
                  {loading ? "جاري الإعداد..." : paymentMethod === "CASH" ? "تأكيد الطلب" : "المتابعة للدفع"}
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-4 rounded-2xl">
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>مدفوعاتك محمية ومشفرة بالكامل. لن يتم حفظ بيانات بطاقتك على خوادمنا.</p>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-500" />
                اختيار طريقة الدفع
              </h2>
              <div id="fawaterkDivId" className="w-full min-h-[300px]"></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
