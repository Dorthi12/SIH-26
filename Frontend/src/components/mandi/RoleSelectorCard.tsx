import {
  Sprout,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileText,
  CheckCircle2,
  Users,
  TrendingUp,
  Award,
  DollarSign,
  Truck,
  MessageSquare,
  Sparkles,
  Lock,
  Star,
  Quote,
  Building2,
  UserCheck,
} from "lucide-react";
import type { UserRole } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface RoleSelectorCardProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onBrowseMarketplace: () => void;
  onCreateListing: () => void;
  onOpenFarmerAuth: () => void;
  onOpenBuyerAuth: () => void;
}

export function RoleSelectorCard({
  currentRole,
  onSelectRole,
  onBrowseMarketplace,
  onCreateListing,
  onOpenFarmerAuth,
  onOpenBuyerAuth,
}: RoleSelectorCardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative rounded-3xl bg-[#0A3225] text-white p-8 sm:p-12 shadow-2xl overflow-hidden border-2 border-emerald-600/40 min-h-[320px] flex items-center">
        {/* Background glow */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none z-10" />

        {/* High Definition Farm Field Image on Right with Smooth Fade Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 pointer-events-none hidden lg:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=90"
            alt="Farm Fields at Sunrise"
            className="w-full h-full object-cover object-right opacity-85 saturate-125"
          />
          {/* Gradient Overlay Mask to smoothly blend image into text section */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A3225] via-[#0A3225]/75 to-transparent" />
        </div>

        <div className="relative z-20 max-w-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-2xs font-black bg-amber-400 text-slate-950 shadow-sm">
              🌾 {t("AGRISENSE MANDI MARKETPLACE", "एग्रीसेंस मंडी डिजिटल बाज़ार")}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-2xs font-extrabold bg-emerald-950/80 text-amber-300 border border-emerald-500/50">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> ⭐ 4.9 / 5 Overall Mandi Rating
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            {t("Transparent Prices.", "पारदर्शी मूल्य।")}{" "}
            <span className="text-emerald-400">{t("Verified Participants.", "सत्यापित प्रतिभागी।")}</span>{" "}
            <span className="text-amber-400">{t("Direct Trade.", "प्रत्यक्ष व्यापार।")}</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
            {t(
              "Empowering farmers with justified fair prices based on production costs, while providing corporate buyers with 100% verified, lab-tested agricultural produce and escrow payment protection.",
              "उत्पादन लागत और गुणवत्ता के आधार पर किसानों को उचित मूल्य और खरीदारों को 100% सत्यापित कृषि उपज और भुगतान सुरक्षा प्रदान करना।"
            )}
          </p>

          {/* Social Proof Impact Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-500/30">
            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block tracking-tight">
                50,000+
              </span>
              <span className="text-3xs font-extrabold uppercase text-emerald-200/90 tracking-wider block">
                {t("Farmers Benefitted", "लाभांवित किसान")}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 block tracking-tight">
                ₹14.2 Cr+
              </span>
              <span className="text-3xs font-extrabold uppercase text-emerald-200/90 tracking-wider block">
                {t("Extra Income Earned", "अतिरिक्त आय अर्जित")}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block tracking-tight">
                1,280+
              </span>
              <span className="text-3xs font-extrabold uppercase text-emerald-200/90 tracking-wider block">
                {t("Merchant Buyers", "व्यापारी खरीदार")}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 block tracking-tight">
                98.4%
              </span>
              <span className="text-3xs font-extrabold uppercase text-emerald-200/90 tracking-wider block">
                {t("Trade Satisfaction", "व्यापार संतुष्टि दर")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PORTAL SELECTION ENTRY CARDS (FARMER & MERCHANT BUYER) */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
            {t("Select Your Mandi Portal Section", "अपना मंडी पोर्टल अनुभाग चुनें")}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 font-medium">
            Log in or sign up to access your tailored seller or buyer workspace tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* OPTION 1: FARMER / SELLER PORTAL */}
          <div
            onClick={() => {
              onSelectRole("SELLER");
              onOpenFarmerAuth();
            }}
            className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
              currentRole === "SELLER"
                ? "border-forest bg-white dark:bg-charcoal-dark shadow-2xl ring-4 ring-forest/20"
                : "border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark hover:border-forest hover:shadow-xl"
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Sprout className="w-9 h-9" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-3xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  👩‍🌾 Farmer Section
                </span>
              </div>

              <div>
                <span className="text-2xs uppercase tracking-widest font-black text-forest dark:text-emerald-400 block">
                  {t("OPTION 1: FARMER / SELLER PORTAL", "विकल्प 1: किसान / विक्रेता पोर्टल")}
                </span>
                <h3 className="text-2xl font-black text-charcoal dark:text-ivory-100 mt-1">
                  {t("I'm a Farmer / Seller", "मैं एक किसान / विक्रेता हूँ")}
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-2 leading-relaxed font-medium">
                  {t(
                    "Sell your produce at justified fair prices backed by input costs. Benefit from AI price predictions, multi-village shared transport, and escrow payment protection.",
                    "अपनी उपज को लागत आधारित उचित मूल्य पर बेचें। AI मूल्य भविष्यवाणी, शेयर ट्रांसपोर्ट और एस्क्रौ भुगतान सुरक्षा का लाभ उठाएं।"
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Evidence-Backed Fair Price Engine (+18.4% Income)</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kisan Pehchan Patra ID Verification</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Village Aggregated Shared Logistics</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <span className="text-xs font-black text-forest dark:text-emerald-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                {t("Login / Sign Up as Farmer", "किसान के रूप में लॉगिन / साइनअप करें")}
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-3xs font-extrabold px-3 py-1 rounded-full bg-forest text-white shadow-xs">
                Kisan Pehchan Login
              </span>
            </div>
          </div>

          {/* OPTION 2: MERCHANT BUYER PORTAL */}
          <div
            onClick={() => {
              onSelectRole("BUYER");
              onOpenBuyerAuth();
            }}
            className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
              currentRole === "BUYER"
                ? "border-amber bg-white dark:bg-charcoal-dark shadow-2xl ring-4 ring-amber/20"
                : "border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark hover:border-amber hover:shadow-xl"
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-amber/10 text-charcoal dark:bg-amber/20 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ShoppingBag className="w-9 h-9" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-3xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300">
                  🏢 Merchant Buyer Section
                </span>
              </div>

              <div>
                <span className="text-2xs uppercase tracking-widest font-black text-amber-600 dark:text-amber-400 block">
                  {t("OPTION 2: MERCHANT BUYER PORTAL", "विकल्प 2: व्यापारी खरीदार पोर्टल")}
                </span>
                <h3 className="text-2xl font-black text-charcoal dark:text-ivory-100 mt-1">
                  {t("I'm a Merchant Buyer", "मैं एक व्यापारी खरीदार हूँ")}
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-2 leading-relaxed font-medium">
                  {t(
                    "Source verified agricultural commodities directly from accredited farmers. Inspect production economics, laboratory quality test reports, and execute Smart Deals.",
                    "सत्यापित किसानों से सीधे कृषि उत्पाद खरीदें। उत्पाद अर्थशास्त्र, लैब रिपोर्ट और स्मार्ट सौदे निष्पादित करें।"
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Unique Govt-Verified Merchant ID / GSTIN Auth</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>APMC Grade & NPOP Organic Certificate Inspection</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal dark:text-ivory-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Digital Smart Deal & Escrow Payment Protection</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                {t("Login / Sign Up as Merchant Buyer", "व्यापारी खरीदार के रूप में लॉगिन करें")}
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-3xs font-extrabold px-3 py-1 rounded-full bg-amber text-charcoal shadow-xs">
                Merchant ID Login
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL FLOWCHART DIAGRAM: FARMER ICON (👩‍🌾) ──► BUYER ICON (🏢) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full text-3xs font-extrabold bg-forest/10 text-forest dark:text-emerald-400 uppercase tracking-wider">
            ⚡ Visual Trade Lifecycle Flowchart
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal dark:text-ivory-100">
            {t("How Produce Moves from Farmer to Buyer", "किसान से खरीदार तक फसल पहुंचने की प्रक्रिया")}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 font-medium">
            Visual step-by-step journey connecting smallholder farmers directly to corporate buyers
          </p>
        </div>

        {/* Visual Diagram Box */}
        <div className="space-y-6">
          {/* Top Visual Flow Bar connecting Farmer to Buyer */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50 to-blue-50 dark:from-emerald-950/40 dark:via-amber-950/40 dark:to-blue-950/40 border border-ivory-300 dark:border-charcoal-light flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                👩‍🌾
              </div>
              <div>
                <span className="text-3xs font-black uppercase tracking-wider text-forest dark:text-emerald-400 block">Origin Point</span>
                <h4 className="font-black text-sm text-charcoal dark:text-ivory-100">Verified Farmer (किसान)</h4>
                <span className="text-3xs text-charcoal-muted dark:text-ivory-400">Inputs seeds, fertilizer, labour & land costs</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-forest dark:text-emerald-400 font-black text-sm">
              <span>──────►</span>
              <span className="px-3 py-1 rounded-full bg-forest/10 text-forest dark:text-emerald-300 text-3xs font-extrabold">Agrisense AI Engine</span>
              <span>──────►</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                🏢
              </div>
              <div>
                <span className="text-3xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Destination Point</span>
                <h4 className="font-black text-sm text-charcoal dark:text-ivory-100">Merchant Buyer (खरीदार)</h4>
                <span className="text-3xs text-charcoal-muted dark:text-ivory-400">Receives lab-tested produce with escrow protection</span>
              </div>
            </div>
          </div>

          {/* 6 Grid Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: t("Production Economics Input", "1. लागत दर्ज"),
                badge: "👩‍🌾 Farmer Action",
                desc: t("Farmer inputs seeds, fertilizer, labour, and irrigation expenses with receipts.", "किसान बीज, खाद, श्रम और सिंचाई खर्च रसीदों के साथ दर्ज करता है।"),
                icon: Sprout,
                color: "bg-emerald-600",
              },
              {
                step: "02",
                title: t("AI Fair Price Calculation", "2. AI उचित मूल्य"),
                badge: "🤖 Agrisense AI Engine",
                desc: t("Algorithm computes a justified, transparent price range based on actual farm input economics.", "एल्गोरिथ्म वास्तविक लागत के आधार पर पारदर्शी कीमत तय करता है।"),
                icon: Sparkles,
                color: "bg-amber-500",
              },
              {
                step: "03",
                title: t("Verified Listing Published", "3. सत्यापित लिस्टिंग"),
                badge: "🛡️ Mandi Network",
                desc: t("Listing goes live with Kisan Pehchan ID & APMC lab grade report.", "किसान पहचान पत्र और लैब रिपोर्ट के साथ लिस्टिंग लाइव होती है।"),
                icon: ShieldCheck,
                color: "bg-forest",
              },
              {
                step: "04",
                title: t("Direct Farmer–Buyer Chat", "4. सीधी बातचीत"),
                badge: "💬 Negotiation",
                desc: t("Buyer inspects price breakdown and negotiates directly via text or bilingual voice.", "खरीदार मूल्य विभाजन देखकर सीधे चैट या वॉयस से बातचीत करता है।"),
                icon: MessageSquare,
                color: "bg-blue-600",
              },
              {
                step: "05",
                title: t("Smart Deal & Shared Trucking", "5. स्मार्ट सौदा व परिवहन"),
                badge: "🚚 Logistics",
                desc: t("Digital agreement locked with multi-village aggregated shared transport route.", "डिजिटल अनुबंध लॉक होता है और बहु-ग्राम साझा परिवहन मार्ग तय होता है।"),
                icon: Truck,
                color: "bg-purple-600",
              },
              {
                step: "06",
                title: t("Escrow Release & Delivery", "6. एस्क्रौ भुगतान व वितरण"),
                badge: "🏢 Merchant Buyer",
                desc: t("Buyer receives quality produce and funds are released to farmer securely.", "गुणवत्तापूर्ण उपज मिलने पर एस्क्रौ से भुगतान किसान को मिलता है।"),
                icon: Lock,
                color: "bg-emerald-700",
              },
            ].map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.step}
                  className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3 relative hover:border-forest/40 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-xl ${node.color} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                      {node.step}
                    </span>
                    <span className="text-3xs font-extrabold px-2.5 py-0.5 rounded-full bg-ivory-200 dark:bg-charcoal-light text-charcoal dark:text-ivory-200">
                      {node.badge}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                    <span>{node.title}</span>
                  </h4>
                  <p className="text-xs text-charcoal-muted dark:text-ivory-400 leading-relaxed font-medium">
                    {node.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DEDICATED FARMERS & BUYERS MANDI REVIEWS & RATING COLUMN SECTION */}
      <div className="p-8 sm:p-10 rounded-3xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-8">
        {/* Ratings Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ivory-300 dark:border-charcoal-light/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-amber fill-amber" />
              <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
                {t("Mandi Participant Reviews & Ratings", "मंडी प्रतिभागी समीक्षाएं और रेटिंग")}
              </h2>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1 font-medium">
              Verified experiences shared by 4,820+ farmers and corporate merchant buyers on Agrisense Mandi
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light flex items-center gap-3 shadow-xs shrink-0">
            <span className="text-3xl font-black text-forest dark:text-emerald-400">4.9</span>
            <div>
              <div className="flex items-center gap-0.5 text-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber text-amber" />
                ))}
              </div>
              <span className="text-3xs font-extrabold text-charcoal-muted block">
                Based on 4,820+ verified trades
              </span>
            </div>
          </div>
        </div>

        {/* 4 Rating Trust Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs uppercase font-extrabold text-charcoal-muted block">Price Fairness</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-charcoal dark:text-ivory-100">4.9 / 5</span>
              <span className="text-emerald-600 text-3xs font-extrabold">⭐ 98% Positive</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs uppercase font-extrabold text-charcoal-muted block">Payment Speed</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-charcoal dark:text-ivory-100">5.0 / 5</span>
              <span className="text-emerald-600 text-3xs font-extrabold">💳 2.3 Days Avg</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs uppercase font-extrabold text-charcoal-muted block">Logistics Match</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-charcoal dark:text-ivory-100">4.8 / 5</span>
              <span className="text-emerald-600 text-3xs font-extrabold">🚚 Farmgate Pickup</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs uppercase font-extrabold text-charcoal-muted block">Direct Transparency</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-charcoal dark:text-ivory-100">4.9 / 5</span>
              <span className="text-emerald-600 text-3xs font-extrabold">💬 Zero Middleman</span>
            </div>
          </div>
        </div>

        {/* Two Column Review Section (Farmer Reviews vs Buyer Reviews) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* COLUMN 1: FARMER REVIEWS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-forest/20 pb-2">
              <h3 className="font-black text-sm text-forest dark:text-emerald-400 flex items-center gap-2">
                <span>👩‍🌾</span> Verified Farmer Reviews (किसानों की राय)
              </h3>
              <span className="text-3xs font-bold text-charcoal-muted">3,200+ Farmer Ratings</span>
            </div>

            {/* Review Card 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>Ramesh Kumar Patel</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                      ✓ Verified Farmer
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Barabanki, Uttar Pradesh • Wheat (250 quintals)</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "Agrisense allowed me to prove my input costs of ₹1,450/q. I received ₹2,880/q from ABC Foods with 100% upfront escrow payment protection! Earned ₹1.15 Lakh more than local mandi."
              </p>
              <div className="text-3xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> +₹460/q Net Profit Gain Above Local APMC
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>Sunita Devi</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                      ✓ Verified Farmer
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Fatehpur, Uttar Pradesh • Organic Chana / Gram (180 quintals)</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "The voice chat assistant translated my Hindi voice notes directly to the corporate buyer. Direct trade without middleman commission!"
              </p>
              <div className="text-3xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> NPOP Organic Certificate Verified
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>Gurpreet Singh</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                      ✓ Verified Farmer
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Ludhiana, Punjab • Basmati Rice (400 quintals)</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "Multi-village transport matching picked up produce directly from my farmgate. Trucking cost was split 50/50 with buyer."
              </p>
              <div className="text-3xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Shared Logistics Pickup
              </div>
            </div>
          </div>

          {/* COLUMN 2: MERCHANT BUYER REVIEWS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3 className="font-black text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span>🏢</span> Verified Merchant Buyer Reviews (खरीदारों का अनुभव)
              </h3>
              <span className="text-3xs font-bold text-charcoal-muted">1,280+ Buyer Ratings</span>
            </div>

            {/* Review Card 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>ABC Foods & Flour Mills Pvt Ltd</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                      ✓ Govt MCA Verified
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Alok Verma (Procurement Head) • Lucknow, UP</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "Sourcing directly from verified UP farmers with NPOP organic certificates and lab test reports reduced our procurement overhead by 12%."
              </p>
              <div className="text-3xs text-amber-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% On-Time Multi-Village Freight Delivery
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>Taj Agro Exports Pvt Ltd</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                      ✓ Verified Exporter
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Vikramaditya Shah (Export Director) • Mumbai, MH</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "The Smart Deal escrow agreement guarantees produce quality before payment release. Zero payment disputes in 2 years of trading on Agrisense Mandi."
              </p>
              <div className="text-3xs text-amber-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Escrow Digital Contract Protection
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                    <span>FreshBasket Retail Supply Chain</span>
                    <span className="text-3xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                      ✓ Retail Chain
                    </span>
                  </h4>
                  <span className="text-3xs text-charcoal-muted">Priya Nair (Category Manager) • New Delhi</span>
                </div>
                <div className="flex items-center text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber text-amber" />
                  ))}
                </div>
              </div>
              <p className="text-charcoal-muted dark:text-ivory-300 italic font-medium leading-relaxed">
                "Transparent price breakdown showing seed, fertilizer, and labour costs gives us full confidence in raw material quality and fair pricing."
              </p>
              <div className="text-3xs text-amber-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full Production Cost Breakdown Visibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
