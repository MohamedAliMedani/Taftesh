"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";
import { CopyCheck, MapPin, Building, CreditCard, Shield, AlertCircle, CalendarClock, Clock } from "lucide-react";
import { motion } from "framer-motion";

const PACKAGES = {
    TECHNICAL: { name: "الفحص الهندسي", price: 5000, desc: "فحص شامل للمواسير، الكهرباء، المعمار" },
    LEGAL: { name: "المراجعة القانونية", price: 5000, desc: "مراجعة عقود، تراخيص، وتاريخ الملكية" },
    FULL: { name: "الأمان الشامل", price: 8000, desc: "الخدمة الهندسية والقانونية معاً" },
};

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pkgQuery = searchParams.get("package") as keyof typeof PACKAGES || "FULL";

    const [propertyAddress, setPropertyAddress] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentReady, setPaymentReady] = useState(false);

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
            // Combine date and time
            const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);

            const response = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageName: pkgQuery,
                    propertyAddress,
                    scheduledDate: scheduledDateTime.toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.hashKey) {
                setPaymentReady(true);
                const pluginConfig = {
                    envType: "test", // Change to "live" in production
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
                            {
                                name: selectedPkg.name,
                                price: data.amount.toString(),
                                quantity: "1",
                            },
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
                }, 500); // Give the DOM a moment to render the mount point
            } else {
                setError(data.error || "حدث خطأ أثناء إعداد الدفع");
            }
        } catch (err) {
            setError("حدث خطأ في الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 relative">
            <Script src="https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js" strategy="lazyOnload" />
            <div className="hero-glow opacity-30" />

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Order Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 rounded-3xl self-start sticky top-32"
                >
                    <div className="flex items-center gap-3 mb-6 block border-b border-white/10 pb-6">
                        <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold outfit">ملخص الطلب</h2>
                            <p className="text-sm text-muted-foreground">راجع تفاصيل باقتك قبل الدفع</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">الباقة المختارة:</span>
                            <span className="text-white">{selectedPkg.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">الوصف:</span>
                            <span className="text-white text-end max-w-[200px]">{selectedPkg.desc}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">الضرائب (0%):</span>
                            <span className="text-white">0 ج.م</span>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                        <div className="text-sm text-muted-foreground">الإجمالي المطلوب الدفع</div>
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
                            <h1 className="text-3xl font-bold outfit">إتمام الحجز والدفع</h1>
                            <p className="text-muted-foreground">أدخل تفاصيل العقار لنتمكن من توجيه الخبير المناسب.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-white mr-2">عنوان العقار المراد فحصه بالتفصيل</label>
                                    <div className="glass flex items-start px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                                        <MapPin className="w-5 h-5 text-amber-500 mt-1 ml-3 flex-shrink-0" />
                                        <textarea
                                            value={propertyAddress}
                                            onChange={(e) => setPropertyAddress(e.target.value)}
                                            placeholder="مثال: مدينة نصر، شارع عباس العقاد، الدور الخامس..."
                                            className="bg-transparent border-none outline-none text-sm w-full min-h-[80px] resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-white mr-2">تاريخ الفحص التقديري</label>
                                        <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                                            <CalendarClock className="w-5 h-5 text-amber-500 ml-3" />
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="bg-transparent border-none outline-none text-sm w-full font-sans text-white placeholder-white/50 cursor-pointer"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-white mr-2">الوقت المناسب (صباحاً/مساءً)</label>
                                        <div className="glass flex items-center px-4 py-4 rounded-2xl focus-within:ring-2 ring-amber-500/50 transition-all border border-white/5">
                                            <Clock className="w-5 h-5 text-amber-500 ml-3" />
                                            <input
                                                type="time"
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className="bg-transparent border-none outline-none text-sm w-full font-sans text-white placeholder-white/50 cursor-pointer"
                                                required
                                            />
                                        </div>
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
                                    <CreditCard className="w-5 h-5" />
                                    {loading ? "جاري الإعداد..." : "المتابعة لإتمام الدفع"}
                                </button>
                            </div>

                            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-4 rounded-2xl">
                                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <p>مدفوعاتك محمية ومشفرة بالكامل بمعايير الأمان العالمية (PCI-DSS). لن يتم حفظ بيانات بطاقتك على خوادمنا.</p>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card p-6 md:p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center">
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
