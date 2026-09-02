import { useState } from "react";
import { Building2, KeyRound, ShieldCheck, X, CheckCircle2, ArrowRight } from "lucide-react";
import type { BuyerAuthDetails } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface BuyerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (buyerAuth: BuyerAuthDetails) => void;
}

export function BuyerAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: BuyerAuthModalProps) {
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");

  // Login form state
  const [merchantId, setMerchantId] = useState<string>("AGR-BUY-2026-UP001");
  const [passwordPin, setPasswordPin] = useState<string>("1234");
  const [gstinNo, setGstinNo] = useState<string>("09AAACA1234F1Z5");

  // Signup form state
  const [businessName, setBusinessName] = useState<string>("ABC Foods & Flour Mills Pvt Ltd");
  const [buyerType, setBuyerType] = useState<string>("Food Processor");
  const [district, setDistrict] = useState<string>("Lucknow");
  const [state, setState] = useState<string>("Uttar Pradesh");
  const [contactEmail, setContactEmail] = useState<string>("procurement@abcfoods.com");

  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");

  if (!isOpen) return null;

  const handleQuickDemoLogin = () => {
    const demoBuyer: BuyerAuthDetails = {
      buyerId: "BUYER-DEMO-001",
      merchantId: "AGR-BUY-2026-UP001",
      businessName: "ABC Foods & Flour Mills Pvt Ltd",
      contactPerson: "Alok Verma (Procurement Officer)",
      email: "procurement@abcfoods.com",
      phone: "+91 98765 12345",
      gstinMock: "09AAACA1234F1Z5",
      buyerType: "Food Processor",
      state: "Uttar Pradesh",
      district: "Lucknow",
      isVerified: true,
    };
    onLoginSuccess(demoBuyer);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buyerAuth: BuyerAuthDetails = {
      buyerId: `BUYER-${Date.now()}`,
      merchantId: merchantId || "AGR-BUY-2026-UP001",
      businessName: authMode === "LOGIN" ? "ABC Foods & Flour Mills Pvt Ltd" : businessName,
      contactPerson: "Corporate Procurement Representative",
      email: contactEmail || "procurement@merchant.com",
      phone: "+91 98765 43210",
      gstinMock: gstinNo || "09AAACA1234F1Z5",
      buyerType: (buyerType as "Food Processor" | "Exporter" | "Wholesaler" | "Retail Chain" | "Agri Cooperative" | "Individual Buyer") || "Food Processor",
      state: state || "Uttar Pradesh",
      district: district || "Lucknow",
      isVerified: true,
    };
    onLoginSuccess(buyerAuth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-forest-dark to-forest text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
              <Building2 className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {authMode === "LOGIN"
                  ? t("Merchant Buyer Portal Authentication", "व्यापारी खरीदार पोर्टल प्रमाणीकरण")
                  : t("Register Govt-Verified Buyer Account", "सरकारी सत्यापित खरीदार खाता पंजीकृत करें")}
              </h3>
              <p className="text-3xs text-ivory-200">
                Agrisense Mandi Corporate Procurement Network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-2 bg-ivory-100 dark:bg-charcoal border-b border-ivory-300 dark:border-charcoal-light text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode("LOGIN")}
            className={`py-2 rounded-xl transition-all ${
              authMode === "LOGIN"
                ? "bg-white dark:bg-charcoal-dark text-forest dark:text-emerald-400 shadow-xs"
                : "text-charcoal-muted"
            }`}
          >
            Merchant Login (व्यापारी लॉगिन)
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("SIGNUP")}
            className={`py-2 rounded-xl transition-all ${
              authMode === "SIGNUP"
                ? "bg-white dark:bg-charcoal-dark text-forest dark:text-emerald-400 shadow-xs"
                : "text-charcoal-muted"
            }`}
          >
            New Buyer Registration (नया पंजीकरण)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Demo Fill Button */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-amber-900 dark:text-amber-200 block">
                ⚡ Instant Merchant Buyer Login
              </span>
              <span className="text-3xs text-amber-800 dark:text-amber-300">
                Log in as ABC Foods Pvt Ltd (Govt Verified ID: AGR-BUY-2026-UP001)
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-3 py-1.5 rounded-xl font-black text-xs bg-amber text-charcoal hover:bg-amber-dark transition-all shadow-xs shrink-0"
            >
              Quick Login
            </button>
          </div>

          {authMode === "LOGIN" ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal dark:text-ivory-200 mb-1">
                  Unique Merchant Buyer ID / GSTIN
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="e.g. AGR-BUY-2026-UP001 or GSTIN 09AAACA1234F1Z5"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal dark:text-ivory-200 mb-1">
                  Registered GSTIN Number
                </label>
                <input
                  type="text"
                  value={gstinNo}
                  onChange={(e) => setGstinNo(e.target.value)}
                  placeholder="e.g. 09AAACA1234F1Z5"
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal dark:text-ivory-200 mb-1">
                  Merchant Access PIN / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    value={passwordPin}
                    onChange={(e) => setPasswordPin(e.target.value)}
                    placeholder="Enter merchant PIN"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Business Name (कंपनी / फ़र्म का नाम)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. ABC Foods & Flour Mills Pvt Ltd"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Buyer Category
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                >
                  <option value="Food Processor">Food Processor (खाद्य प्रसंस्करण)</option>
                  <option value="Exporter">Exporter (निर्यातकर्ता)</option>
                  <option value="Wholesaler">Wholesaler (थोक व्यापारी)</option>
                  <option value="Retail Chain">Retail Chain (खुदरा श्रृंखला)</option>
                  <option value="Institutional Buyer">Institutional Buyer</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  District (जिला)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Lucknow"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  State (राज्य)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Official Procurement Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. procurement@abcfoods.com"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>
            </div>
          )}

          {/* Privacy & Compliance Banner */}
          <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center gap-2 text-3xs text-charcoal-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All registered merchant buyers undergo MCA & APMC verification. Privacy protected under Agrisense Mandi Rules.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber" />
            {authMode === "LOGIN" ? "Enter Merchant Buyer Portal" : "Complete Buyer Merchant Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
