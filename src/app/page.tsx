"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, FileCheck, CheckCircle2, Phone, ArrowLeft, Zap, Scale } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PACKAGES, SITE_CONFIG } from "@/lib/config";
import { Logo, LogoMark } from "@/components/ui/Logo";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const handleBooking = (pkgName: string) => {
    router.push(`/experts?package=${pkgName}`);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500/30">
      {/* Hero Background Glow */}
      <div className="hero-glow" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">كيف يعمل؟</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">الباقات</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">اتصل بنا</a>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center text-black text-xs font-bold">
                    {session.user?.name?.charAt(0) || "م"}
                  </div>
                  <span className="text-sm font-bold">{session.user?.name || "مستخدم"}</span>
                </div>
                <a
                  href={(session.user as any)?.role === "ADMIN" ? "/admin" : (session.user as any)?.role === "EXPERT" ? "/provider" : "/dashboard"}
                  className="glass px-5 py-2 rounded-full text-xs font-bold text-amber-400 hover:bg-white/10 transition-colors border border-amber-500/20"
                >
                  {(session.user as any)?.role === "ADMIN" ? "لوحة التحكم" : (session.user as any)?.role === "EXPERT" ? "طلباتي" : "طلباتي"}
                </a>
                <button
                  onClick={() => signOut()}
                  className="glass px-4 py-2 rounded-full text-xs font-medium hover:bg-white/10 transition-colors border border-white/5"
                >
                  خروج
                </button>
              </>
            ) : (
              <a href="/login" className="glass px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors border border-white/10">
                تسجيل الدخول
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/5"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-200">{SITE_CONFIG.tagline} — المنصة الأولى في مصر</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight outfit"
          >
            استثمر في عقارك بـ <span className="text-gradient underline decoration-amber-500/30">أمان مطلق</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
          >
            اختر باقتك الآن لتأمين عقارك. نحن نحميك من العيوب الفنية والمخاطر القانونية بأسعار ثابتة وشفافة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-xl flex justify-center gap-4"
          >
            <a
              href="#pricing"
              className="gold-gradient text-black px-10 py-5 rounded-[24px] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
            >
              تصفح الباقات
              <ArrowLeft className="w-5 h-5" />
            </a>
            <a
              href="/register"
              className="glass text-white px-10 py-5 rounded-[24px] font-bold border border-white/10 hover:bg-white/5 transition-colors"
            >
              تسجيل كخبير
            </a>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="how-it-works" className="py-24 bg-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold outfit mb-4 text-gradient">حماية كاملة لاستثمارك</h2>
              <p className="text-muted-foreground">خدمات احترافية يقدمها نخبة من المهندسين والمحامين</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "الفحص الهندسي الشامل",
                  desc: "معاينة السباكة، الكهرباء، الرطوبة، والشروخ بأحدث أجهزة الليزر والكواشف.",
                  icon: Search,
                  color: "amber"
                },
                {
                  title: "المراجعة القانونية",
                  desc: "التأكد من تسلسل الملكية، التراخيص، وموقف الضرائب العقارية قبل التوقيع.",
                  icon: Scale,
                  color: "amber"
                },
                {
                  title: "تقرير PDF مفضل",
                  desc: "تحصل على تقرير فني وقانوني شامل يوضح حالة العقار بكل دقة ووضوح.",
                  icon: FileCheck,
                  color: "amber"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="glass-card p-8 rounded-3xl"
                >
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 outfit">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold outfit mb-4 text-gradient">باقات الأمان العقاري</h2>
              <p className="text-muted-foreground">التسعير ثابت وشفاف لخدمات احترافية بمستويات غير مسبوقة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Engineering */}
              <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col">
                <h3 className="text-xl font-bold mb-2 outfit">{PACKAGES.TECHNICAL.nameAr}</h3>
                <div className="text-4xl font-bold mb-2 text-amber-100 italic">{PACKAGES.TECHNICAL.price.toLocaleString()} ج.م</div>
                <div className="text-sm text-amber-500/60 mb-6">تدفع مرة واحدة</div>
                <ul className="space-y-4 mb-10 flex-1">
                  {PACKAGES.TECHNICAL.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBooking("TECHNICAL")}
                  className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-bold"
                >
                  اطلب الفحص الهندسي
                </button>
              </div>

              {/* Full Protection */}
              <div className="glass-card p-1 rounded-3xl border-transparent bg-gradient-to-b from-amber-400 to-amber-700 shadow-2xl shadow-amber-500/20 transform scale-105 z-10 flex flex-col">
                <div className="bg-[#0a0a0b] p-8 rounded-[22px] h-full flex flex-col">
                  <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-fit mb-4 uppercase">الأمان المطلق</div>
                  <h3 className="text-xl font-bold mb-2 outfit text-gradient">باقة "{PACKAGES.FULL.nameAr}"</h3>
                  <div className="text-5xl font-bold mb-2 text-white italic">{PACKAGES.FULL.price.toLocaleString()} ج.م</div>
                  <div className="text-sm text-amber-400 mb-6">شاملة كل شيء</div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {PACKAGES.FULL.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-amber-50">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 font-bold" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleBooking("FULL")}
                    className="w-full py-4 rounded-xl gold-gradient text-black font-bold hover:brightness-110 transition-all shadow-lg"
                  >
                    احجز الأمان الشامل
                  </button>
                </div>
              </div>

              {/* Legal */}
              <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col">
                <h3 className="text-xl font-bold mb-2 outfit">{PACKAGES.LEGAL.nameAr}</h3>
                <div className="text-4xl font-bold mb-2 text-amber-100 italic">{PACKAGES.LEGAL.price.toLocaleString()} ج.م</div>
                <div className="text-sm text-amber-500/60 mb-6">تدفع مرة واحدة</div>
                <ul className="space-y-4 mb-10 flex-1">
                  {PACKAGES.LEGAL.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBooking("LEGAL")}
                  className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-bold"
                >
                  اطلب الفحص القانوني
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact-cta" className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="glass-card p-12 rounded-[40px] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px]" />
              <h2 className="text-4xl font-bold outfit mb-6">هل لديك استفسار؟</h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto">تواصل معنا عبر الواتساب أو الهاتف للحصول على استشارة سريعة حول عقارك القادم.</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                  target="_blank"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/20"
                >
                  <Phone className="w-5 h-5" />
                  تحدث معنا عبر واتساب
                </a>
                <a
                  href="#contact"
                  className="glass px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                >
                  إرسال رسالة تفصيلية
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Form Section */}
        <section id="contact" className="py-24 bg-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold outfit text-gradient">تواصل معنا</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                هل لديك استفسار محدد؟ فريقنا من المهندسين والمحامين جاهز للرد عليك وتوجيهك لاتخاذ القرار الصحيح.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 glass p-4 rounded-2xl border-white/5 w-fit">
                  <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">خدمة العملاء</div>
                    <div className="font-bold">{SITE_CONFIG.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="glass-card p-10 rounded-[40px] border-white/10"
            >
              <ContactForm />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} {SITE_CONFIG.name} - جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = React.useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = React.useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("LOADING");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus("SUCCESS");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("ERROR");
      }
    } catch (err) {
      setStatus("ERROR");
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold">تم الإرسال بنجاح!</h3>
        <p className="text-muted-foreground">سيتواصل فريقنا معك قريباً جداً.</p>
        <button onClick={() => setStatus("IDLE")} className="text-amber-400 text-sm font-bold">إرسال رسالة أخرى</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/50 mr-2 border-none">الاسم</label>
          <input
            type="text"
            placeholder="محمد..."
            required
            className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/50 mr-2">الهاتف</label>
          <input
            type="text"
            placeholder="010..."
            required
            className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-500/50 mr-2">البريد الإلكتروني</label>
        <input
          type="email"
          placeholder="example@mail.com"
          required
          className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-500/50 mr-2">التفاصيل / ملاحظات إضافية</label>
        <textarea
          placeholder="كيف يمكننا مساعدتك؟"
          required
          className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20 h-32 resize-none"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      <button
        disabled={status === "LOADING"}
        className="w-full gold-gradient text-black py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl shadow-amber-500/10"
      >
        {status === "LOADING" ? "جاري الإرسال..." : "إرسال الرسالة"}
      </button>
      {status === "ERROR" && <div className="text-red-500 text-xs text-center">حدث خطأ، حاول مرة أخرى</div>}
    </form>
  );
}
