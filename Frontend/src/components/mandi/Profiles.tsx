import { ShieldCheck, MapPin, Award, Building2, CheckCircle2, DollarSign, Star, Calendar, Lock, LogOut, KeyRound, Phone, FileText, TrendingUp, BarChart3, Tag } from "lucide-react";
import type { FarmerPublicProfile, BuyerProfile, FarmerAuthDetails } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface FarmerProfileCardProps {
  profile: FarmerPublicProfile;
  farmerAuth: FarmerAuthDetails | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

const MOCK_SUCCESSFUL_TRANSACTIONS = [
  {
    txnId: "TXN-2026-8812",
    dealId: "AGR-DEAL-2026-004821",
    cropName: "Wheat (Sharbati / HD-2967)",
    quantityQuintals: 250,
    pricePerQuintal: 2880,
    totalAmount: 720000,
    date: "28 Aug 2026",
    buyerName: "ABC Foods Pvt Ltd",
    buyerType: "Food Processor",
    buyerLocation: "Lucknow, UP",
    paymentStatus: "Escrow Released & Bank Deposited",
    paymentMethod: "Direct Bank Transfer (NEFT)",
    qualityGrade: "Grade A (Moisture 11.8%)",
    rating: 5.0,
    feedbackNote: "Exceptional grain quality and clean moisture level. Fast delivery schedule.",
  },
  {
    txnId: "TXN-2026-7490",
    dealId: "AGR-DEAL-2026-003910",
    cropName: "Paddy / Basmati Rice (PB-1121)",
    quantityQuintals: 180,
    pricePerQuintal: 3450,
    totalAmount: 621000,
    date: "14 Jul 2026",
    buyerName: "Royal Grains India Corp",
    buyerType: "Export Merchant",
    buyerLocation: "Karnal, Haryana",
    paymentStatus: "Escrow Released & Bank Deposited",
    paymentMethod: "Agrisense Escrow Lock",
    qualityGrade: "Grade A Organic (NPOP Certified)",
    rating: 4.9,
    feedbackNote: "Lab report verified NPOP organic standard. Smooth contract settlement.",
  },
  {
    txnId: "TXN-2026-5120",
    dealId: "AGR-DEAL-2026-002105",
    cropName: "Mustard Seed (Pusa Mustard-30)",
    quantityQuintals: 120,
    pricePerQuintal: 5400,
    totalAmount: 648000,
    date: "02 Apr 2026",
    buyerName: "Shreedhar Agro Oils Ltd",
    buyerType: "Oil Mill Processor",
    buyerLocation: "Bharatpur, Rajasthan",
    paymentStatus: "Escrow Released & Bank Deposited",
    paymentMethod: "Direct Bank Transfer",
    qualityGrade: "Grade A (Oil Content 42%)",
    rating: 4.8,
    feedbackNote: "High oil content yield. Delivered via shared village transport.",
  },
  {
    txnId: "TXN-2025-9981",
    dealId: "AGR-DEAL-2025-009124",
    cropName: "Maize / Yellow Corn (Hybrid HQPM-1)",
    quantityQuintals: 300,
    pricePerQuintal: 2150,
    totalAmount: 645000,
    date: "19 Nov 2025",
    buyerName: "Star Feeds & Livestock",
    buyerType: "Feed Manufacturer",
    buyerLocation: "Kanpur, UP",
    paymentStatus: "Escrow Released & Bank Deposited",
    paymentMethod: "Instant UPI Settlement",
    qualityGrade: "Grade A Standard",
    rating: 5.0,
    feedbackNote: "Punctual logistics dispatch. Moisture retention within parameters.",
  },
];

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

      {/* SUCCESSFUL TRANSACTIONS & SALES HISTORY CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-charcoal dark:text-ivory-100 flex items-center gap-2">
                {t("Successful Trade Transactions & Sales History", "सफल व्यापार लेनदेन और बिक्री इतिहास")}
              </h4>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {t("Verified deal records with escrow payment clearances & buyer feedback", "एस्क्रौ भुगतान निकासी व खरीदार समीक्षा के साथ सत्यापित सौदे")}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Escrow Cleared</span>
          </div>
        </div>

        {/* Transaction Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
          <div>
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Total Revenue Earned", "कुल अर्जित राजस्व")}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              ₹26,34,000
            </span>
          </div>
          <div>
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Total Quantity Sold", "कुल बेची गई मात्रा")}
            </span>
            <span className="text-base sm:text-lg font-black text-charcoal dark:text-ivory-100 mt-0.5 block">
              850 Quintals
            </span>
          </div>
          <div>
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Escrow Success", "एस्क्रौ सफलता दर")}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              100%
            </span>
          </div>
          <div>
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              {t("Avg Buyer Rating", "औसत खरीदार रेटिंग")}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-500 mt-0.5 block flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" /> 4.95 / 5
            </span>
          </div>
        </div>

        {/* List of Successful Transactions */}
        <div className="space-y-4">
          {MOCK_SUCCESSFUL_TRANSACTIONS.map((txn) => (
            <div
              key={txn.txnId}
              className="p-4 sm:p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light hover:border-emerald-500/40 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                      {txn.cropName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-3xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      {txn.qualityGrade}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                    ID: <strong className="font-mono text-charcoal dark:text-ivory-200">{txn.txnId}</strong> • Deal Ref: {txn.dealId}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 block">
                    ₹{txn.totalAmount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    ✓ {txn.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Deal Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                    Quantity & Rate
                  </span>
                  <span className="font-extrabold text-charcoal dark:text-ivory-100">
                    {txn.quantityQuintals} q @ ₹{txn.pricePerQuintal}/q
                  </span>
                </div>

                <div>
                  <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                    Verified Buyer
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {txn.buyerName} ({txn.buyerLocation})
                  </span>
                </div>

                <div>
                  <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                    Completion Date
                  </span>
                  <span className="font-semibold text-charcoal dark:text-ivory-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0 text-forest" />
                    {txn.date}
                  </span>
                </div>

                <div>
                  <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                    Buyer Review Rating
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {txn.rating} / 5.0
                  </span>
                </div>
              </div>

              {/* Feedback Note */}
              <p className="text-xs text-charcoal-light dark:text-ivory-300 italic bg-white dark:bg-charcoal-dark p-2.5 rounded-xl border border-ivory-200 dark:border-charcoal-light">
                "{txn.feedbackNote}"
              </p>
            </div>
          ))}
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
            {t("Verified Trades", "सत्यापित व्यापार")}


        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
            {t("Escrow Deposit Record", "एस्क्रौ जमा रिकॉर्ड")}
          </span>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-2 block">
            100% On-Time
          </span>
        </div>
      </div>
    </div>
  );
}




