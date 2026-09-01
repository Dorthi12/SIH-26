import {
  ShoppingBag,
  Sprout,
  PlusCircle,
  MessageSquare,
  Scale,
  ShieldCheck,
  User,
  LogOut,
  KeyRound,
  UserCheck,
  Building2,
  Truck,
  Package,
  Lock,
  FileCheck,
} from "lucide-react";
import type { UserRole, FarmerAuthDetails, BuyerAuthDetails } from "../../types/mandi";
import type { MandiTab } from "../../context/MandiContext";
import { useLanguage } from "../../context/LanguageContext";

interface MandiSubNavProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: MandiTab;
  onTabChange: (tab: MandiTab) => void;
  farmerAuth: FarmerAuthDetails | null;
  onOpenFarmerAuth: () => void;
  onLogoutFarmer: () => void;
  buyerAuth: BuyerAuthDetails | null;
  onOpenBuyerAuth: () => void;
  onLogoutBuyer: () => void;
  onOpenLanding?: () => void;
}

export function MandiSubNav({
  userRole,
  onRoleChange,
  activeTab,
  onTabChange,
  farmerAuth,
  onOpenFarmerAuth,
  onLogoutFarmer,
  buyerAuth,
  onOpenBuyerAuth,
  onLogoutBuyer,
  onOpenLanding,
}: MandiSubNavProps) {
  const { t } = useLanguage();

  const allSellerTabs: { tab: MandiTab; label: string; icon: React.ElementType; isProtected?: boolean }[] = [
    { tab: "marketplace", label: t("Marketplace", "मंडी बाज़ार"), icon: ShoppingBag },
    { tab: "price-intelligence", label: t("Price Intelligence", "मूल्य बुद्धिमत्ता"), icon: Scale },
    { tab: "buyer-profile", label: t("Buyer Profiles", "खरीदार प्रोफ़ाइल"), icon: Building2 },
    { tab: "chat-workspace", label: t("Negotiation Chat", "व्यापारिक चैट"), icon: MessageSquare, isProtected: true },
    { tab: "aggregation", label: t("Produce Aggregation", "समूह बिक्री"), icon: Package, isProtected: true },
    { tab: "logistics", label: t("Logistics Matching", "परिवहन मिलान"), icon: Truck, isProtected: true },
    { tab: "payment-protection", label: t("Payment Protection", "भुगतान सुरक्षा"), icon: Lock, isProtected: true },
    { tab: "my-deals", label: t("Smart Deals", "स्मार्ट सौदे"), icon: FileCheck, isProtected: true },
    { tab: "my-listings", label: t("My Listings", "मेरी लिस्टिंग"), icon: Sprout, isProtected: true },
    { tab: "create-listing", label: t("Create Listing", "लिस्टिंग बनाएं"), icon: PlusCircle, isProtected: true },
    { tab: "profile", label: t("Farmer Profile", "किसान प्रोफ़ाइल"), icon: User, isProtected: true },
  ];

  const allBuyerTabs: { tab: MandiTab; label: string; icon: React.ElementType; isProtected?: boolean }[] = [
    { tab: "marketplace", label: t("Marketplace", "मंडी बाज़ार"), icon: ShoppingBag },
    { tab: "price-intelligence", label: t("Price Intelligence", "मूल्य बुद्धिमत्ता"), icon: Scale },
    { tab: "buyer-profile", label: t("My Buyer Profile", "मेरी खरीदार प्रोफ़ाइल"), icon: Building2, isProtected: true },
    { tab: "buyer-verification", label: t("Buyer Verification", "खरीदार सत्यापन"), icon: ShieldCheck, isProtected: true },
    { tab: "chat-workspace", label: t("Negotiation Chat", "व्यापारिक चैट"), icon: MessageSquare, isProtected: true },
    { tab: "aggregation", label: t("Produce Aggregation", "समूह आपूर्ति"), icon: Package, isProtected: true },
    { tab: "logistics", label: t("Logistics Matching", "परिवहन मिलान"), icon: Truck, isProtected: true },
    { tab: "payment-protection", label: t("Payment Protection", "भुगतान सुरक्षा"), icon: Lock, isProtected: true },
    { tab: "my-deals", label: t("Smart Deals", "स्मार्ट सौदे"), icon: FileCheck, isProtected: true },
  ];

  // Filter tabs: Protected tabs are ONLY shown when logged into the respective portal!
  const currentTabs = (userRole === "SELLER" ? allSellerTabs : allBuyerTabs).filter((item) => {
    if (!item.isProtected) return true;
    if (userRole === "SELLER") return farmerAuth !== null;
    if (userRole === "BUYER") return buyerAuth !== null;
    return false;
  });

  return (
    <div className="bg-white dark:bg-charcoal-dark border-b border-ivory-300 dark:border-charcoal-light sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2">
        {/* Top Header Row: Brand, Role Switcher & Auth Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Role Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer group"
              title="Logout Profile & Return to Mandi Landing Page"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🌾</span>
              <span className="font-black text-base tracking-tight text-charcoal dark:text-ivory-100">
                Agrisense <span className="text-forest dark:text-emerald-400">Mandi</span>
              </span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center p-1 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light">
              <button
                onClick={() => onRoleChange("SELLER")}
                className={`px-3 py-1 rounded-lg text-2xs font-extrabold transition-all ${
                  userRole === "SELLER"
                    ? "bg-forest text-white shadow-sm"
                    : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
                }`}
              >
                👩‍🌾 {t("Seller / Farmer", "किसान / विक्रेता")}
              </button>

              <button
                onClick={() => onRoleChange("BUYER")}
                className={`px-3 py-1 rounded-lg text-2xs font-extrabold transition-all ${
                  userRole === "BUYER"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
                }`}
              >
                🏢 {t("Buyer", "खरीदार")}
              </button>
            </div>
          </div>

          {/* Auth Button or User Account Badge */}
          <div>
            {userRole === "SELLER" ? (
              farmerAuth ? (
                <div className="flex items-center gap-2 p-1 pl-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-2xs font-bold text-emerald-900 dark:text-emerald-200">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[160px]">
                    ID: {farmerAuth.farmerId}
                  </span>
                  <button
                    onClick={onLogoutFarmer}
                    title="Logout Farmer Account"
                    className="px-2 py-0.5 rounded-lg bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenFarmerAuth}
                  className="px-3.5 py-1.5 rounded-xl text-2xs font-extrabold bg-amber text-charcoal shadow-sm hover:bg-amber-dark transition-colors flex items-center gap-1.5 animate-pulse"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verify Farmer ID (Kisan Pehchan)</span>
                </button>
              )
            ) : (
              buyerAuth ? (
                <div className="flex items-center gap-2 p-1 pl-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/60 text-2xs font-bold text-blue-900 dark:text-blue-200">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[160px]">
                    {buyerAuth.businessName}
                  </span>
                  <button
                    onClick={onLogoutBuyer}
                    title="Logout Buyer Account"
                    className="px-2 py-0.5 rounded-lg bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenBuyerAuth}
                  className="px-3.5 py-1.5 rounded-xl text-2xs font-extrabold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 animate-pulse"
                >
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span>Verify Merchant / Buyer Login</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Bottom Row: Full-width Navigation Tabs Strip */}
        <div className="pt-1 border-t border-ivory-200 dark:border-charcoal-light/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {currentTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.tab}
                  onClick={() => onTabChange(item.tab)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? userRole === "SELLER"
                        ? "bg-forest text-white shadow-sm"
                        : "bg-blue-600 text-white shadow-sm"
                      : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal hover:bg-ivory-100 dark:hover:bg-charcoal"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
