import { ShieldCheck, MapPin, Award, Building2, CheckCircle2, DollarSign, Star, Calendar, Lock, LogOut, KeyRound, Phone, FileText } from "lucide-react";
import type { FarmerPublicProfile, BuyerProfile, FarmerAuthDetails } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface FarmerProfileCardProps {
  profile: FarmerPublicProfile;
  farmerAuth: FarmerAuthDetails | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export function FarmerProfileCard({
  profile,
  farmerAuth,
  onOpenAuthModal,
  onLogout,
}: FarmerProfileCardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-forest text-white shadow-md">
              <span className="text-xl">👩‍🌾</span>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-charcoal dark:text-ivory-100 flex items-center gap-2">
                {farmerAuth ? farmerAuth.fullName : profile.displayName}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>
                  {farmerAuth ? `${farmerAuth.district}, ${farmerAuth.state}` : `${profile.district}, ${profile.state}`}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {farmerAuth ? (
              <>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>🟢 Farmer ID Verified: {farmerAuth.farmerId}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 hover:bg-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("Logout Farmer Account", "किसान खाता लॉग आउट करें")}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber" />
                <span>{t("Login & Verify Farmer ID", "लॉग इन व किसान ID सत्यापित करें")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Completed Sales", "पूर्ण बिक्री")}
            </span>
            <span className="text-lg font-black text-charcoal dark:text-ivory-100 mt-1 block">
              {profile.completedSalesCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Farmer Rating", "किसान रेटिंग")}
            </span>
            <span className="text-lg font-black text-amber-500 mt-1 block flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {profile.averageRating}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Active Listings", "सक्रिय लिस्टिंग")}
            </span>
            <span className="text-lg font-black text-forest dark:text-emerald-400 mt-1 block">
              {profile.activeListingsCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Member Since", "सदस्यता वर्ष")}
            </span>
            <span className="text-lg font-black text-charcoal dark:text-ivory-100 mt-1 block">
              {profile.memberSinceYear}
            </span>
          </div>
        </div>

        {/* Crops Grown */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-charcoal dark:text-ivory-200 block">
            {t("Crops Grown & Traded", "उगाई गई व व्यापारिक फसलें")}
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.cropsGrown.map((crop, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400 text-xs font-bold border border-forest/20"
              >
                🌾 {crop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIDENTIAL PRIVATE DETAILS CARD (ONLY VISIBLE TO LOGGED IN FARMER) */}
      {farmerAuth && (
        <div className="p-6 rounded-3xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-forest dark:text-emerald-400" />
              <h4 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
                {t("Confidential Farmer Credentials (Private to You)", "गोपनीय किसान क्रेडेंशियल (केवल आपके लिए निजी)")}
              </h4>
            </div>
            <span className="text-3xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
              ENCRYPTED & PROTECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Kisan Pehchan Patra ID (Farmer ID)
              </span>
              <span className="font-mono font-extrabold text-forest dark:text-emerald-400 text-sm mt-0.5 block">
                {farmerAuth.farmerId}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Registered Mobile Number
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100 text-xs mt-0.5 block">
                {farmerAuth.mobileNumber}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Khasra / Khatauni Land Record No.
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100 text-xs mt-0.5 block">
                {farmerAuth.khasraKhatauniNumber}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Aadhaar Mock Reference
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100 text-xs mt-0.5 block">
                {farmerAuth.aadhaarMock}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Village & Block
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100 text-xs mt-0.5 block">
                {farmerAuth.villageBlock}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Verification Officer & Date
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-3xs mt-0.5 block">
                {farmerAuth.verifiedByOfficer} ({farmerAuth.verificationDate})
              </span>
            </div>
          </div>

          {/* Privacy Statement */}
          <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light text-3xs text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t(
                "These confidential government credentials remain strictly protected. Buyers on the Mandi marketplace will only see your District, State, and Verified Badge.",
                "ये गोपनीय सरकारी क्रेडेंशियल पूरी तरह सुरक्षित हैं। खरीदार केवल आपका जिला, राज्य और सत्यापित मुहर देखेंगे।"
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface BuyerProfileCardProps {
  profile: BuyerProfile;
}

export function BuyerProfileCard({ profile }: BuyerProfileCardProps) {
  const { t } = useLanguage();

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-charcoal dark:text-ivory-100">
              {profile.businessName}
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <span>{profile.buyerType}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {profile.district}, {profile.state}
              </span>
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 font-bold text-xs flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>🔵 Business Verified</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
            {t("Completed Transactions", "पूर्ण लेन-देन")}
          </span>
          <span className="text-lg font-black text-charcoal dark:text-ivory-100 mt-1 block">
            {profile.completedTransactionsCount}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
            {t("Payment Reliability", "भुगतान विश्वसनीयता")}
          </span>
          <span className="text-lg font-black text-emerald-600 mt-1 block">
            {profile.paymentReliabilityPercentage}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
            {t("Avg Payment Time", "औसत भुगतान समय")}
          </span>
          <span className="text-lg font-black text-blue-600 mt-1 block">
            {profile.averagePaymentDays} Days
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
            {t("Typical Order Volume", "विशिष्ट ऑर्डर मात्रा")}
          </span>
          <span className="text-xs font-bold text-charcoal dark:text-ivory-100 mt-2 block">
            {profile.typicalOrderVolume}
          </span>
        </div>
      </div>

      {/* Active Requirements */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-charcoal dark:text-ivory-200 block">
          {t("Active Buying Requirements", "सक्रिय खरीद आवश्यकताएं")}
        </span>
        <div className="flex flex-wrap gap-2">
          {profile.activeRequirements.map((req, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold border border-blue-200"
            >
              📦 {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
