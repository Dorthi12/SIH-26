import { useState } from "react";
import { X, ShieldCheck, CheckCircle2, Lock, UserCheck, Sprout, ArrowRight, FileText, Phone, KeyRound } from "lucide-react";
import type { FarmerAuthDetails } from "../../types/mandi";
import { DEFAULT_FARMER_AUTH } from "../../context/MandiContext";
import { useLanguage } from "../../context/LanguageContext";

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (farmer: FarmerAuthDetails) => void;
}

export function FarmerAuthModal({ isOpen, onClose, onAuthenticate }: FarmerAuthModalProps) {
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Form Fields
  const [farmerId, setFarmerId] = useState("KPP-UP-2026-8912");
  const [fullName, setFullName] = useState("Ramesh Kumar Patel");
  const [mobileNumber, setMobileNumber] = useState("+91 98765 43210");
  const [aadhaarMock, setAadhaarMock] = useState("XXXX-XXXX-8912");
  const [khasraKhatauniNumber, setKhasraKhatauniNumber] = useState("Khasra #342 / Khatauni #891");
  const [state, setState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Barabanki");
  const [villageBlock, setVillageBlock] = useState("Haidergarh Block");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  if (!isOpen) return null;

  const handleQuickDemoFill = () => {
    onAuthenticate(DEFAULT_FARMER_AUTH);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verifiedDetails: FarmerAuthDetails = {
      farmerId: farmerId || `KPP-${state.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      mobileNumber,
      aadhaarMock: aadhaarMock || "XXXX-XXXX-8912",
      khasraKhatauniNumber: khasraKhatauniNumber || "Khasra #342 / Khatauni #891",
      state,
      district,
      villageBlock,
      isVerified: true,
      verificationDate: new Date().toISOString().split("T")[0],
      verificationId: `AGR-VER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      verifiedByOfficer: `Govt Agriculture Officer (${district} District)`,
    };

    onAuthenticate(verifiedDetails);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ivory-200 dark:border-charcoal-light bg-gradient-to-r from-forest/10 via-emerald-50 to-ivory-50 dark:from-forest/20 dark:via-charcoal dark:to-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-forest text-white shadow-md">
              <ShieldCheck className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h3 className="font-black text-xl text-charcoal dark:text-ivory-100 flex items-center gap-2">
                {t("Farmer ID (Kisan Pehchan Patra) Authentication", "किसान पहचान पत्र (Farmer ID) सत्यापन पोर्टल")}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {t(
                  "Verify government Kisan Pehchan Patra ID to unlock farmer selling features",
                  "फसल बिक्री सुविधाओं को अनलॉक करने के लिए सरकारी किसान पहचान पत्र का सत्यापन करें"
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 dark:hover:bg-charcoal-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuthMode("LOGIN")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                authMode === "LOGIN"
                  ? "bg-forest text-white shadow-sm"
                  : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
              }`}
            >
              🔑 {t("Login with Kisan Pehchan ID", "किसान ID से लॉग इन")}
            </button>

            <button
              onClick={() => setAuthMode("REGISTER")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                authMode === "REGISTER"
                  ? "bg-forest text-white shadow-sm"
                  : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
              }`}
            >
              📝 {t("Register & Verify New Farmer ID", "नया किसान ID पंजीकृत करें")}
            </button>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-3 py-1 rounded-lg text-3xs font-extrabold bg-amber text-charcoal shadow-sm hover:bg-amber-dark transition-all"
          >
            ⚡ {t("Instant Demo Verification", "त्वरित डेमो सत्यापन")}
          </button>
        </div>

        {/* Confidentiality Privacy Guarantee Banner */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-xs">
              {t("100% Privacy & Data Encryption Safeguard", "100% गोपनीयता व डेटा एन्क्रिप्शन सुरक्षा")}
            </p>
            <p className="text-2xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              {t(
                "Your sensitive details (Aadhaar, exact land record number, mobile number, village address) are strictly confidential. Buyers on the marketplace will ONLY see your District, State, and Verified Badge.",
                "आपकी संवेदनशील जानकारी (आधार, भूमि रिकॉर्ड संख्या, मोबाइल नंबर) पूरी तरह से गोपनीय है। खरीदार केवल आपका जिला, राज्य और सत्यापित मुहर देखेंगे।"
              )}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {authMode === "LOGIN" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                  {t("Farmer ID (Kisan Pehchan Patra No.)", "किसान पहचान पत्र (Farmer ID) संख्या")}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={farmerId}
                    onChange={(e) => setFarmerId(e.target.value)}
                    placeholder="e.g. KPP-UP-2026-8912"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                  {t("Registered Mobile Number", "पंजीकृत मोबाइल नंबर")}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                    required
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={() => setOtpSent(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-ivory-100 dark:bg-charcoal border border-ivory-300 text-forest dark:text-emerald-400 hover:bg-ivory-200 transition-colors"
                >
                  {t("Send OTP Verification Code", "OTP सत्यापन कोड भेजें")}
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 space-y-2">
                  <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-400 block">
                    ✓ Demo OTP sent to {mobileNumber} (Enter 1234)
                  </span>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full p-2 rounded-lg border border-ivory-300 bg-white font-bold text-center text-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Farmer Full Name (किसान का पूरा नाम)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Patel"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Kisan Pehchan Patra ID (Farmer ID)
                </label>
                <input
                  type="text"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  placeholder="e.g. KPP-UP-2026-8912"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Mobile Number (Confidential)
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Khasra / Khatauni Land No. (Confidential)
                </label>
                <input
                  type="text"
                  value={khasraKhatauniNumber}
                  onChange={(e) => setKhasraKhatauniNumber(e.target.value)}
                  placeholder="e.g. Khasra #342 / Khatauni #891"
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

              <div>
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  District (जिला)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Barabanki"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                  Village / Tehsil (Confidential - Only District & State Public)
                </label>
                <input
                  type="text"
                  value={villageBlock}
                  onChange={(e) => setVillageBlock(e.target.value)}
                  placeholder="e.g. Haidergarh Block"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold"
                  required
                />
              </div>

              {/* Valid ID Proof Document Uploads */}
              <div className="sm:col-span-2 space-y-3 pt-3 border-t border-ivory-200 dark:border-charcoal-light">
                <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
                  Upload Valid ID Proof Documents (सत्यापन दस्तावेज़)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-2xs">
                  <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 space-y-1">
                    <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
                      1. Kisan Pehchan Patra ID Card *
                    </span>
                    <span className="text-3xs text-emerald-600 block">✓ KPP_UP2026_FrontBack.pdf attached</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 space-y-1">
                    <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
                      2. Land Record (Khasra / Khatauni Extract) *
                    </span>
                    <span className="text-3xs text-emerald-600 block">✓ LandRecord_Khatauni_891.pdf attached</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs font-semibold text-charcoal-muted hover:underline"
            >
              {t("Skip & Use Verified Demo Profile", "डेमो प्रोफाइल का उपयोग करें")}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-extrabold bg-forest text-white hover:bg-forest-dark transition-all shadow-md flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-amber" />
              {t("Verify ID & Continue to Mandi", "ID सत्यापित करें और आगे बढ़ें")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
