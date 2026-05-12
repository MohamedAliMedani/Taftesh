"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Star, Clock, Briefcase, User, CheckCircle2,
  ShoppingCart, X, Trash2, ChevronDown,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { PACKAGES, calculateTotalPrice, getTermName } from "@/lib/config";
import { SPECIALTY_LABELS } from "@/lib/types";
import { useT, useLanguage } from "@/lib/i18n";

/* ─── Types ─── */

interface ExpertTerm {
  termKey: string;
  experienceYears: number;
  price: number;
}

interface Expert {
  id: string;
  name: string;
  profileImage: string | null;
  specialty: string;
  bio: string | null;
  experienceYears: number | null;
  serviceRate: number | null;
  terms: ExpertTerm[];
  avgRating: number | null;
  totalRatings: number;
  completedRequests: number;
}

interface CartItem {
  expertId: string;
  expertName: string;
  termKey: string;
  price: number;
}

/* ─── Expert Card ─── */

function ExpertCard({
  expert,
  cartItems,
  onViewServices,
}: {
  expert: Expert;
  cartItems: CartItem[];
  onViewServices: () => void;
}) {
  const t = useT();
  const { lang } = useLanguage();

  const expertCartCount = cartItems.filter((c) => c.expertId === expert.id).length;
  const terms = expert.terms || [];
  const prices = terms.map((tm) => calculateTotalPrice(tm.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card p-6 rounded-2xl flex flex-col transition-all ${
        expertCartCount > 0
          ? "border-amber-500/50 ring-2 ring-amber-500/20"
          : "border-white/5"
      }`}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-4">
        {expert.profileImage ? (
          <img
            src={expert.profileImage}
            alt={expert.name || ""}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30"
          />
        ) : (
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center text-black text-xl font-bold">
            {expert.name?.charAt(0) || "\u062e"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{expert.name}</h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              expert.specialty === "ENGINEER"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-purple-500/10 text-purple-400"
            }`}
          >
            {SPECIALTY_LABELS[expert.specialty as keyof typeof SPECIALTY_LABELS] || expert.specialty}
          </span>
        </div>
        {expertCartCount > 0 && (
          <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
        )}
      </div>

      {/* Rating + completed */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <Star
            className={`w-4 h-4 ${
              expert.avgRating ? "fill-amber-400 text-amber-400" : "text-white/20"
            }`}
          />
          <span className="text-sm font-bold">{expert.avgRating ?? "\u2014"}</span>
          <span className="text-xs text-muted-foreground">
            ({expert.totalRatings} {t("experts.rating")})
          </span>
        </div>
        {expert.completedRequests > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            {expert.completedRequests} {t("experts.completedRequest")}
          </div>
        )}
      </div>

      {/* Experience + term count + price range */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
        {expert.experienceYears != null && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {expert.experienceYears} {t("experts.yearsExperience")}
          </div>
        )}
        {terms.length > 0 && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            {terms.length} {t("experts.servicesCount")}
          </div>
        )}
        {minPrice != null && (
          <div className="flex items-center gap-1">
            <span className="text-amber-400 font-bold">
              {t("experts.priceRange")} {minPrice.toLocaleString()} {t("common.currency")}
            </span>
          </div>
        )}
      </div>

      {/* Bio */}
      {expert.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
          {expert.bio}
        </p>
      )}
      {!expert.bio && <div className="flex-1" />}

      {/* Cart badge for this expert */}
      {expertCartCount > 0 && (
        <div className="text-xs text-amber-400 font-bold mb-2 text-center">
          {expertCartCount} {t("experts.cartItems")} {t("experts.cart")}
        </div>
      )}

      {/* View Services button */}
      <button
        onClick={onViewServices}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg mt-auto flex items-center justify-center gap-2 ${
          expertCartCount > 0
            ? "bg-white/10 text-amber-400 border border-amber-500/30"
            : "gold-gradient text-black hover:brightness-110 active:scale-[0.98] shadow-amber-500/10"
        }`}
      >
        {t("experts.viewServices")}
        <ChevronDown className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ─── Terms Selection Modal ─── */

function TermsModal({
  expert,
  cartItems,
  onAddToCart,
  onClose,
}: {
  expert: Expert;
  cartItems: CartItem[];
  onAddToCart: (items: CartItem[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const terms = expert.terms || [];

  // Track which terms are checked in this modal session
  const alreadyInCart = new Set(
    cartItems.filter((c) => c.expertId === expert.id).map((c) => c.termKey)
  );
  const [checked, setChecked] = useState<Set<string>>(new Set(alreadyInCart));

  const toggle = (termKey: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(termKey)) {
        next.delete(termKey);
      } else {
        next.add(termKey);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const newItems: CartItem[] = [];
    for (const tm of terms) {
      if (checked.has(tm.termKey)) {
        newItems.push({
          expertId: expert.id,
          expertName: expert.name,
          termKey: tm.termKey,
          price: calculateTotalPrice(tm.price),
        });
      }
    }
    onAddToCart(newItems);
    onClose();
  };

  const selectedCount = checked.size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-lg rounded-2xl p-6 border border-white/10 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">{t("experts.termsModal")}</h2>
            <p className="text-sm text-muted-foreground">{expert.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{t("experts.selectTerms")}</p>

        {/* Terms list */}
        <div className="space-y-3">
          {terms.map((tm) => {
            const isChecked = checked.has(tm.termKey);
            const totalPrice = calculateTotalPrice(tm.price);
            return (
              <label
                key={tm.termKey}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  isChecked
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-white/5 border border-white/5 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(tm.termKey)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked
                      ? "gold-gradient"
                      : "border-2 border-white/20"
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {getTermName(tm.termKey, lang)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tm.experienceYears} {t("experts.yearsExperience")}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-400 flex-shrink-0">
                  {totalPrice.toLocaleString()} {t("common.currency")}
                </span>
              </label>
            );
          })}
        </div>

        {terms.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t("experts.noExperts")}
          </div>
        )}

        {/* Add to cart button */}
        {terms.length > 0 && (
          <button
            onClick={handleAdd}
            disabled={selectedCount === 0}
            className="w-full mt-6 py-3 rounded-xl font-bold transition-all gold-gradient text-black hover:brightness-110 active:scale-[0.98] shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("experts.addToCart")}
            {selectedCount > 0 && ` (${selectedCount})`}
          </button>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          {t("common.cancel")}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Cart Bar ─── */

function CartBar({
  cartItems,
  onRemove,
  onProceed,
  canProceed = true,
  proceedHint,
}: {
  cartItems: CartItem[];
  onRemove: (expertId: string, termKey: string) => void;
  onProceed: () => void;
  canProceed?: boolean;
  proceedHint?: string;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-6 z-30">
      <div className="max-w-3xl mx-auto p-3 md:p-0">
        <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Expandable cart details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pb-2 space-y-2 max-h-60 overflow-y-auto border-b border-white/5">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.expertId}-${item.termKey}`}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {item.expertName}
                        </p>
                        <p className="text-sm font-bold truncate">
                          {getTermName(item.termKey, lang)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-400 flex-shrink-0">
                        {item.price.toLocaleString()} {t("common.currency")}
                      </span>
                      <button
                        onClick={() => onRemove(item.expertId, item.termKey)}
                        className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 p-1"
                        title={t("experts.removeFromCart")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary bar */}
          <div className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-black" />
              </div>
              <div className="text-start min-w-0">
                <p className="text-sm font-bold">
                  {t("experts.cart")} ({cartItems.length} {t("experts.cartItems")})
                </p>
                <p className="text-xs text-amber-400 font-bold">
                  {total.toLocaleString()} {t("common.currency")}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ms-1 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={onProceed}
                disabled={!canProceed}
                className="gold-gradient text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("experts.proceedToCheckout")}
              </button>
              {proceedHint && <p className="text-[10px] text-red-400">{proceedHint}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Content ─── */

function ExpertsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { lang } = useLanguage();
  const packageName = searchParams.get("package") || "FULL";
  const isFull = packageName === "FULL";

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalExpert, setModalExpert] = useState<Expert | null>(null);

  const pkg = PACKAGES[packageName as keyof typeof PACKAGES];

  // Fetch experts
  useEffect(() => {
    fetch(`/api/experts?package=${packageName}`)
      .then((r) => r.json())
      .then((data) => {
        setExperts(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [packageName]);

  const engineers = experts.filter((e) => e.specialty === "ENGINEER");
  const lawyers = experts.filter((e) => e.specialty === "LAWYER");

  // Cart operations
  const handleAddToCart = useCallback(
    (items: CartItem[]) => {
      setCart((prev) => {
        // Remove all items for this expert, then add the new selection
        const expertId = items.length > 0 ? items[0].expertId : null;
        const filtered = expertId
          ? prev.filter((c) => c.expertId !== expertId)
          : prev;
        return [...filtered, ...items];
      });
    },
    []
  );

  const handleRemoveFromCart = useCallback(
    (expertId: string, termKey: string) => {
      setCart((prev) =>
        prev.filter((c) => !(c.expertId === expertId && c.termKey === termKey))
      );
    },
    []
  );

  // For FULL: check if cart has at least one engineer term + one lawyer term
  const hasEngineerTerm = cart.some(item => {
    const expert = experts.find(e => e.id === item.expertId);
    return expert?.specialty === "ENGINEER";
  });
  const hasLawyerTerm = cart.some(item => {
    const expert = experts.find(e => e.id === item.expertId);
    return expert?.specialty === "LAWYER";
  });
  const canProceedFull = !isFull || (hasEngineerTerm && hasLawyerTerm);

  const handleProceed = useCallback(() => {
    sessionStorage.setItem("taftesh_cart", JSON.stringify(cart));
    const params = new URLSearchParams({ package: packageName });
    router.push(`/checkout?${params.toString()}`);
  }, [cart, packageName, router]);

  // Render expert grid for a given list
  const renderExpertGrid = (expertList: Expert[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expertList.map((expert) => (
        <ExpertCard
          key={expert.id}
          expert={expert}
          cartItems={cart}
          onViewServices={() => setModalExpert(expert)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans">
      <div className="hero-glow opacity-30" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-6 md:pb-8 relative z-10">
        <button
          onClick={() => router.push("/#pricing")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4" />
          {t("nav.backToPackages")}
        </button>

        <div className="flex items-center gap-4 mb-4">
          <LogoMark size={40} />
          {pkg && (
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
              {pkg.nameAr}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2">
          {isFull ? t("experts.chooseEngineerAndLawyer") : t("experts.chooseExpert")}
        </h1>
        <p className="text-muted-foreground">
          {isFull ? t("experts.fullPackageDesc") : t("experts.browseExperts")}
        </p>
      </div>

      {/* Experts Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-28 md:pb-20 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-white/10 rounded mb-4" />
                <div className="h-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("experts.noExperts")}</h3>
            <p className="text-muted-foreground text-sm">{t("experts.tryLater")}</p>
          </div>
        ) : isFull ? (
          /* FULL package: two sections - engineers and lawyers */
          <div className="space-y-12">
            {/* Engineers Section */}
            <div>
              <h2 className="text-xl font-bold outfit mb-1 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full" />
                {t("experts.chooseEngineer")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("experts.engineerDesc")}
              </p>
              {engineers.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl text-muted-foreground text-sm">
                  {t("experts.noEngineers")}
                </div>
              ) : (
                renderExpertGrid(engineers)
              )}
            </div>

            {/* Lawyers Section */}
            <div>
              <h2 className="text-xl font-bold outfit mb-1 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full" />
                {t("experts.chooseLawyer")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("experts.lawyerDesc")}
              </p>
              {lawyers.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-2xl text-muted-foreground text-sm">
                  {t("experts.noLawyers")}
                </div>
              ) : (
                renderExpertGrid(lawyers)
              )}
            </div>
          </div>
        ) : (
          /* Single specialty for TECHNICAL / LEGAL */
          renderExpertGrid(experts)
        )}
      </div>

      {/* Cart Bar */}
      <CartBar
        cartItems={cart}
        onRemove={handleRemoveFromCart}
        onProceed={handleProceed}
        canProceed={canProceedFull}
        proceedHint={isFull && !canProceedFull ? t("experts.fullRequiresBoth") : undefined}
      />

      {/* Terms Selection Modal */}
      <AnimatePresence>
        {modalExpert && (
          <TermsModal
            expert={modalExpert}
            cartItems={cart}
            onAddToCart={handleAddToCart}
            onClose={() => setModalExpert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExpertsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
        </div>
      }
    >
      <ExpertsContent />
    </Suspense>
  );
}
