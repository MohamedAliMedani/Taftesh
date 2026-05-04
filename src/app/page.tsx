"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, FileCheck, CheckCircle2, Phone, ArrowLeft, Zap, Scale } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PACKAGES, SITE_CONFIG } from "@/lib/config";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { useT } from "@/lib/i18n";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useT();
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
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">{t("nav.howItWorks")}</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">{t("nav.packages")}</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">{t("nav.contactUs")}</a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            {session ? (
              <>
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center text-black text-xs font-bold">
                    {session.user?.name?.charAt(0) || t("nav.user").charAt(0)}
                  </div>
                  <span className="text-sm font-bold">{session.user?.name || t("nav.user")}</span>
                </div>
                <a
                  href={(session.user as any)?.role === "ADMIN" ? "/admin" : (session.user as any)?.role === "EXPERT" ? "/provider" : "/dashboard"}
                  className="glass px-5 py-2 rounded-full text-xs font-bold text-amber-400 hover:bg-white/10 transition-colors border border-amber-500/20"
                >
                  {(session.user as any)?.role === "ADMIN" ? t("nav.dashboard") : t("nav.myRequests")}
                </a>
                <button
                  onClick={() => signOut()}
                  className="glass px-4 py-2 rounded-full text-xs font-medium hover:bg-white/10 transition-colors border border-white/5"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <a href="/login" className="glass px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors border border-white/10">
                {t("nav.login")}
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
            <span className="text-xs font-semibold text-amber-200">{SITE_CONFIG.tagline} — {t("hero.badge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight outfit"
          >
            {t("hero.title")} <span className="text-gradient underline decoration-amber-500/30">{t("hero.titleHighlight")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-12 leading-relaxed px-2"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-xl flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4"
          >
            <a
              href="#pricing"
              className="gold-gradient text-black px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
            >
              {t("hero.browsePackages")}
              <ArrowLeft className="w-5 h-5" />
            </a>
            <a
              href="/register"
              className="glass text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] font-bold border border-white/10 hover:bg-white/5 transition-colors"
            >
              {t("nav.registerAsExpert")}
            </a>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="how-it-works" className="py-24 bg-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold outfit mb-4 text-gradient">{t("features.title")}</h2>
              <p className="text-muted-foreground">{t("features.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: t("features.technical.title"),
                  desc: t("features.technical.desc"),
                  icon: Search,
                  color: "amber"
                },
                {
                  title: t("features.legal.title"),
                  desc: t("features.legal.desc"),
                  icon: Scale,
                  color: "amber"
                },
                {
                  title: t("features.report.title"),
                  desc: t("features.report.desc"),
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
              <h2 className="text-4xl font-bold outfit mb-4 text-gradient">{t("pricing.title")}</h2>
              <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Engineering */}
              <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col">
                <h3 className="text-xl font-bold mb-2 outfit">{PACKAGES.TECHNICAL.nameAr}</h3>
                <div className="text-3xl font-bold mb-2 text-amber-100 italic">{t("pricing.basedOnExpert")}</div>
                <div className="text-sm text-amber-500/60 mb-6">{t("pricing.engineerFee")}</div>
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
                  {t("pricing.requestTechnical")}
                </button>
              </div>

              {/* Full Protection */}
              <div className="glass-card p-1 rounded-3xl border-transparent bg-gradient-to-b from-amber-400 to-amber-700 shadow-2xl shadow-amber-500/20 transform scale-105 z-10 flex flex-col">
                <div className="bg-[#0a0a0b] p-8 rounded-[22px] h-full flex flex-col">
                  <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-fit mb-4 uppercase">{t("pricing.absoluteSecurity")}</div>
                  <h3 className="text-xl font-bold mb-2 outfit text-gradient">{PACKAGES.FULL.nameAr}</h3>
                  <div className="text-4xl font-bold mb-2 text-white italic">{t("pricing.basedOnExperts")}</div>
                  <div className="text-sm text-amber-400 mb-6">{t("pricing.fullFee")}</div>
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
                    {t("pricing.bookFull")}
                  </button>
                </div>
              </div>

              {/* Legal */}
              <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col">
                <h3 className="text-xl font-bold mb-2 outfit">{PACKAGES.LEGAL.nameAr}</h3>
                <div className="text-3xl font-bold mb-2 text-amber-100 italic">{t("pricing.basedOnExpert")}</div>
                <div className="text-sm text-amber-500/60 mb-6">{t("pricing.lawyerFee")}</div>
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
                  {t("pricing.requestLegal")}
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
              <h2 className="text-4xl font-bold outfit mb-6">{t("cta.question")}</h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto">{t("cta.description")}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                  target="_blank"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/20"
                >
                  <Phone className="w-5 h-5" />
                  {t("cta.whatsapp")}
                </a>
                <a
                  href="#contact"
                  className="glass px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                >
                  {t("cta.sendMessage")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Form Section */}
        <section id="contact" className="py-24 bg-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold outfit text-gradient">{t("contact.title")}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("contact.description")}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 glass p-4 rounded-2xl border-white/5 w-fit">
                  <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("contact.customerService")}</div>
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
          © {new Date().getFullYear()} {SITE_CONFIG.name} - {t("site.rights")}
        </div>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = React.useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = React.useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const t = useT();

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
        <h3 className="text-xl font-bold">{t("contact.success")}</h3>
        <p className="text-muted-foreground">{t("contact.successDesc")}</p>
        <button onClick={() => setStatus("IDLE")} className="text-amber-400 text-sm font-bold">{t("contact.sendAnother")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/50 mr-2 border-none">{t("contact.name")}</label>
          <input
            type="text"
            placeholder={t("contact.namePlaceholder")}
            required
            className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/50 mr-2">{t("contact.phone")}</label>
          <input
            type="text"
            placeholder={t("contact.phonePlaceholder")}
            required
            className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-500/50 mr-2">{t("contact.email")}</label>
        <input
          type="email"
          placeholder={t("contact.emailPlaceholder")}
          required
          className="w-full glass p-4 rounded-2xl border-white/5 outline-none focus:ring-2 ring-amber-500/20"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-500/50 mr-2">{t("contact.details")}</label>
        <textarea
          placeholder={t("contact.detailsPlaceholder")}
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
        {status === "LOADING" ? t("contact.sending") : t("contact.send")}
      </button>
      {status === "ERROR" && <div className="text-red-500 text-xs text-center">{t("contact.error")}</div>}
    </form>
  );
}
