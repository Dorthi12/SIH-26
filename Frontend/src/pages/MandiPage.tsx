import { useState } from "react";
import {
  MandiProvider,
  useMandi,
  type MandiTab,
} from "../context/MandiContext";
import { MandiSubNav } from "../components/mandi/MandiSubNav";
import { RoleSelectorCard } from "../components/mandi/RoleSelectorCard";
import { CropListingCard } from "../components/mandi/CropListingCard";
import { CropReportView } from "../components/mandi/CropReportView";
import { CreateListingWizard } from "../components/mandi/CreateListingWizard";
import { OfferModal } from "../components/mandi/OfferModal";
import { NegotiationPanel } from "../components/mandi/NegotiationPanel";
import { BuyerVerificationForm } from "../components/mandi/BuyerVerificationForm";
import { MarketplaceFilterSidebar } from "../components/mandi/MarketplaceFilterSidebar";
import { FarmerProfileCard, BuyerProfileCard } from "../components/mandi/Profiles";
import { PriceIntelligenceView } from "../components/mandi/PriceIntelligenceView";
import { DocumentViewerModal } from "../components/mandi/DocumentViewerModal";
import { FarmerAuthModal } from "../components/mandi/FarmerAuthModal";
import { BuyerAuthModal } from "../components/mandi/BuyerAuthModal";

import { BuyerProfileView } from "../components/mandi/BuyerProfileView";
import { BuyerVerificationPage } from "../components/mandi/BuyerVerificationPage";
import { BuyerPreviewCard } from "../components/mandi/BuyerPreviewCard";
import { TradeChatWorkspace } from "../components/mandi/TradeChatWorkspace";
import { SmartDealView } from "../components/mandi/SmartDealView";
import { DealHistoryTab } from "../components/mandi/DealHistoryTab";
import { CreateBuyerProfileWizard } from "../components/mandi/CreateBuyerProfileWizard";
import { PaymentProtectionView } from "../components/mandi/PaymentProtectionView";
import { LogisticsMatchingView } from "../components/mandi/LogisticsMatchingView";
import { AggregationDashboardView } from "../components/mandi/AggregationDashboardView";

import { mandiService } from "../services/mandiService";
import { buyerService } from "../services/buyerService";
import { dealService } from "../services/dealService";
import { MOCK_BUYER_PROFILES, MOCK_CROP_LISTINGS } from "../data/mockMandiData";
import type { CropListing, BuyerOffer, FarmerAuthDetails, SmartDealRecord, BuyerProfile } from "../types/mandi";
import { useLanguage } from "../context/LanguageContext";
import { PlusCircle, ShoppingBag, CheckCircle2, Search, KeyRound, ShieldCheck, Building2 } from "lucide-react";

function MandiContent() {
  const { t } = useLanguage();
  const {
    userRole,
    setUserRole,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
    farmerAuth,
    loginFarmer,
    logoutFarmer,
    buyerAuth,
    loginBuyer,
    logoutBuyer,
    isFarmerAuthModalOpen,
    setIsFarmerAuthModalOpen,
    activeListingForReport,
    setActiveListingForReport,
    activeOfferModalListing,
    setActiveOfferModalListing,
    activeDocumentViewer,
    setActiveDocumentViewer,
    notificationMessage,
    showNotification,
  } = useMandi();

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [showRoleLanding, setShowRoleLanding] = useState<boolean>(true);
  const [selectedCropForIntelligenceId, setSelectedCropForIntelligenceId] = useState<string>("");

  // Active Buyer Selection & Creation Modal State
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile>(buyerService.getDefaultBuyer());
  const [isCreateBuyerModalOpen, setIsCreateBuyerModalOpen] = useState<boolean>(false);
  const [isBuyerAuthModalOpen, setIsBuyerAuthModalOpen] = useState<boolean>(false);
  
  // Active Smart Deal Selection
  const [activeSmartDeal, setActiveSmartDeal] = useState<SmartDealRecord | null>(null);

  // Filtered listings
  const listings = mandiService.getListings(filters);

  // All listings for Price Intelligence Selector
  const allListingsOnSale = mandiService.getListings({
    searchQuery: "",
    cropName: "ALL",
    state: "ALL",
    qualityGrade: "ALL",
    organicOnly: false,
    sortBy: "NEWEST",
  });

  // User's own listings (for Seller)
  const mySellerListings = mandiService.getListings({
    searchQuery: "",
    cropName: "ALL",
    state: "ALL",
    qualityGrade: "ALL",
    organicOnly: false,
    sortBy: "NEWEST",
  });

  // Offers
  const offers =
    userRole === "SELLER"
      ? mandiService.getOffersForSeller("FARMER-UP-1042")
      : mandiService.getOffersForBuyer("BUYER-001");

  const currentActiveOffer: BuyerOffer = offers[0] || {
    id: "OFFER-2026-001",
    listingId: MOCK_CROP_LISTINGS[0].id,
    cropListing: MOCK_CROP_LISTINGS[0],
    buyerId: selectedBuyer.id,
    buyerProfile: selectedBuyer,
    sellerId: "FARMER-UP-1042",
    quantityQuintals: 250,
    proposedPricePerQuintal: 2850,
    totalAmount: 712500,
    qualityGrade: "Grade A",
    maxMoisturePercentage: 12.0,
    pickupPreference: "Buyer Arranged Transport",
    expectedDeliveryDate: "15 October 2026",
    paymentTerms: "Within 48 hours",
    status: "AWAITING_RESPONSE",
    counterPricePerQuintal: 2880,
    createdAt: "2026-09-01 10:15 AM",
    updatedAt: "2026-09-01 11:05 AM",
    messages: [
      {
        id: "MSG-01",
        senderRole: "SELLER",
        senderName: "Verified Farmer #1042 (Ramesh K.)",
        timestamp: "10:15 AM",
        message: "नमस्ते, मेरे पास 250 क्विंटल गेहूं उपलब्ध है।",
      },
      {
        id: "MSG-02",
        senderRole: "BUYER",
        senderName: "ABC Foods Pvt Ltd (Alok Verma)",
        timestamp: "10:20 AM",
        message: "Hello. What is the moisture level?",
      },
    ],
    negotiationTimeline: [],
  };

  const handleOfferSent = (newOffer: BuyerOffer) => {
    setActiveOfferModalListing(null);
    showNotification(
      t(
        `Offer sent to ${newOffer.cropListing.farmerProfile.displayName}!`,
        `प्रस्ताव सफलता पूर्वक भेजा गया!`
      )
    );
    setActiveTab("chat-workspace");
  };

  const handleListingCreated = (newListing: CropListing) => {
    showNotification(
      t(
        `Crop report & listing published for ${newListing.cropName}!`,
        `${newListing.cropName} की रिपोर्ट व लिस्टिंग प्रकाशित की गई!`
      )
    );
    setActiveListingForReport(newListing);
  };

  const handleFarmerAuthSuccess = (farmer: FarmerAuthDetails) => {
    loginFarmer(farmer);
    showNotification(
      t(
        `Farmer ID Verified: ${farmer.farmerId} (${farmer.fullName})`,
        `किसान ID सत्यापित: ${farmer.farmerId}`
      )
    );
  };

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-charcoal">
      {/* Sub Navbar */}
      <MandiSubNav
        userRole={userRole}
        onRoleChange={(role) => {
          setUserRole(role);
          setShowRoleLanding(false);
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          const protectedTabs = [
            "chat-workspace",
            "aggregation",
            "logistics",
            "payment-protection",
            "smart-deal",
            "my-deals",
            "my-listings",
            "create-listing",
            "profile",
            "buyer-verification",
          ];
          if (protectedTabs.includes(tab)) {
            if (userRole === "SELLER" && !farmerAuth) {
              setIsFarmerAuthModalOpen(true);
              return;
            }
            if (userRole === "BUYER" && !buyerAuth) {
              setIsBuyerAuthModalOpen(true);
              return;
            }
          }
          setActiveTab(tab);
          setShowRoleLanding(false);
        }}
        farmerAuth={farmerAuth}
        onOpenFarmerAuth={() => setIsFarmerAuthModalOpen(true)}
        onLogoutFarmer={() => {
          logoutFarmer();
          showNotification(t("Farmer Account Logged Out", "किसान खाता लॉग आउट हो गया"));
          setActiveTab("marketplace");
        }}
        buyerAuth={buyerAuth}
        onOpenBuyerAuth={() => setIsBuyerAuthModalOpen(true)}
        onLogoutBuyer={() => {
          logoutBuyer();
          showNotification(t("Buyer Account Logged Out", "खरीदार खाता लॉग आउट हो गया"));
          setActiveTab("marketplace");
        }}
        onOpenLanding={() => {
          logoutFarmer();
          logoutBuyer();
          setActiveListingForReport(null);
          setActiveTab("marketplace");
          setShowRoleLanding(true);
          showNotification(
            t(
              "Logged out of profile & returned to Mandi landing page",
              "प्रोफ़ाइल से लॉग आउट होकर मंडी लैंडिंग पेज पर पहुंचे"
            )
          );
        }}
      />

      {/* Notification Toast */}
      {notificationMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-forest text-white shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber" />
          <span className="text-xs font-extrabold">{notificationMessage}</span>
        </div>
      )}

      {/* Main Page Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {activeListingForReport ? (
          <CropReportView
            listing={activeListingForReport}
            onBack={() => setActiveListingForReport(null)}
            onMakeOffer={(listing) => setActiveOfferModalListing(listing)}
          />
        ) : (
          <>
        {/* Role Selector Home Banner */}
        {showRoleLanding && activeTab === "marketplace" && (
          <RoleSelectorCard
            currentRole={userRole}
            onSelectRole={(role) => {
              setUserRole(role);
              setShowRoleLanding(false);
            }}
            onBrowseMarketplace={() => setShowRoleLanding(false)}
            onCreateListing={() => {
              setShowRoleLanding(false);
              if (!farmerAuth) {
                setIsFarmerAuthModalOpen(true);
              } else {
                setActiveTab("create-listing");
              }
            }}
            onOpenFarmerAuth={() => setIsFarmerAuthModalOpen(true)}
            onOpenBuyerAuth={() => setIsBuyerAuthModalOpen(true)}
          />
        )}

        {/* Farmer ID Verification Banner (If Seller Mode & Not Authenticated) */}
        {userRole === "SELLER" && !farmerAuth && activeTab !== "marketplace" && (
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber text-charcoal shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                  {t("Farmer ID Verification Required", "किसान पहचान पत्र (Farmer ID) सत्यापन आवश्यक है")}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  {t(
                    "Please verify your Kisan Pehchan Patra ID to list crops, view price reports, and receive direct buyer offers.",
                    "फसलों को सूचीबद्ध करने और खरीदार ऑफ़र प्राप्त करने के लिए कृपया अपना किसान पहचान पत्र सत्यापित करें।"
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFarmerAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md shrink-0 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber" />
              {t("Verify Farmer ID Now", "अभी किसान ID सत्यापित करें")}
            </button>
          </div>
        )}

        {/* TAB 1: MARKETPLACE */}
        {activeTab === "marketplace" && !showRoleLanding && (
          <div className="space-y-6">
            {/* Header Title */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-forest dark:text-emerald-400" />
                  {t("Agricultural Produce Marketplace", "कृषि उपज मंडी बाज़ार")}
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
                  {t(
                    "Discover verified listings with transparent evidence-backed prices",
                    "पारदर्शी साक्ष्य-आधारित कीमतों के साथ सत्यापित लिस्टिंग खोजें"
                  )}
                </p>
              </div>

              {userRole === "SELLER" && (
                <button
                  onClick={() => {
                    if (!farmerAuth) {
                      setIsFarmerAuthModalOpen(true);
                    } else {
                      setActiveTab("create-listing");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-amber" />
                  {t("List New Crop", "नई फसल सूचीबद्ध करें")}
                </button>
              )}
            </div>

            {/* Layout Grid: Sidebar Filters + Listings Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar Filter */}
              <div className="lg:col-span-1">
                <MarketplaceFilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                />
              </div>

              {/* Right Listings Grid */}
              <div className="lg:col-span-3 space-y-4">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {listings.map((listing) => (
                      <CropListingCard
                        key={listing.id}
                        listing={listing}
                        onOpenReport={(item) => setActiveListingForReport(item)}
                        onMakeOffer={(item) => setActiveOfferModalListing(item)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-ivory-100 dark:bg-charcoal flex items-center justify-center mx-auto text-charcoal-muted">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg text-charcoal dark:text-ivory-100">
                      {t("No matching crops found", "कोई मेल खाती फसल नहीं मिली")}
                    </h3>
                    <p className="text-xs text-charcoal-muted dark:text-ivory-400 max-w-md mx-auto">
                      {t(
                        "Try increasing your search radius, removing a filter, or changing the price range.",
                        "कृपया अपना फ़िल्टर हटाएं या खोज सीमा बदलें।"
                      )}
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest text-white hover:bg-forest-dark"
                    >
                      {t("Reset All Filters", "सभी फ़िल्टर रीसेट करें")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEW TAB: BUYER PROFILE VIEW */}
        {activeTab === "buyer-profile" && (
          <BuyerProfileView
            buyer={selectedBuyer}
            onContactBuyer={() => setActiveTab("chat-workspace")}
            onViewRequirementsClick={() => {}}
            onMakeOfferClick={() => setActiveTab("chat-workspace")}
            onCreateBuyerProfile={() => setIsCreateBuyerModalOpen(true)}
          />
        )}

        {/* NEW TAB: BUYER VERIFICATION PAGE */}
        {activeTab === "buyer-verification" && (
          <BuyerVerificationPage
            buyer={selectedBuyer}
            onDocUploaded={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {/* NEW TAB: TRADE CHAT WORKSPACE */}
        {activeTab === "chat-workspace" && (
          <TradeChatWorkspace
            userRole={userRole}
            offer={currentActiveOffer}
            onOfferUpdated={() => setRefreshTrigger((prev) => prev + 1)}
            onOpenBuyerProfile={() => setActiveTab("buyer-profile")}
            onOpenCropReport={(listing) => setActiveListingForReport(listing)}
            onGenerateSmartDeal={(off) => {
              const deal = dealService.createSmartDeal(off);
              setActiveSmartDeal(deal);
              setActiveTab("smart-deal");
            }}
          />
        )}

        {/* NEW TAB: SMART DEAL GENERATOR */}
        {activeTab === "smart-deal" && (
          <SmartDealView
            deal={activeSmartDeal || dealService.getAllDeals()[0]}
            userRole={userRole}
            onDealUpdated={() => setRefreshTrigger((prev) => prev + 1)}
            onBackToChat={() => setActiveTab("chat-workspace")}
          />
        )}

        {/* NEW TAB: MY DEALS HISTORY */}
        {activeTab === "my-deals" && (
          <DealHistoryTab
            userRole={userRole}
            onSelectDeal={(deal) => {
              setActiveSmartDeal(deal);
              setActiveTab("smart-deal");
            }}
          />
        )}

        {/* TAB 2: MY LISTINGS (SELLER DASHBOARD) */}
        {activeTab === "my-listings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
                  {t("My Mandi — Seller Dashboard", "मेरी मंडी — विक्रेता डैशबोर्ड")}
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
                  {t("Manage your active crop listings and generated price reports", "अपनी सक्रिय फसल सूचियों और उत्पन्न मूल्य रिपोर्टों का प्रबंधन करें")}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!farmerAuth) setIsFarmerAuthModalOpen(true);
                  else setActiveTab("create-listing");
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber" />
                {t("Create Crop Listing", "फसल लिस्टिंग बनाएं")}
              </button>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                  {t("Active Listings", "सक्रिय लिस्टिंग")}
                </span>
                <span className="text-2xl font-black text-forest dark:text-emerald-400 block">
                  {mySellerListings.length}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                  {t("Total Quantity Listed", "कुल सूचीबद्ध मात्रा")}
                </span>
                <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
                  {mySellerListings.reduce((sum, item) => sum + item.quantityQuintals, 0)} q
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                  {t("Verified Listings", "सत्यापित लिस्टिंग")}
                </span>
                <span className="text-2xl font-black text-emerald-600 block">
                  {mySellerListings.filter((item) => item.verification.isVerified).length}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                  {t("Buyer Interests", "खरीदार प्रस्ताव")}
                </span>
                <span className="text-2xl font-black text-amber-500 block">
                  {offers.length}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                  {t("Average Listed Price", "औसत सूचीबद्ध मूल्य")}
                </span>
                <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
                  ₹2,780/q
                </span>
              </div>
            </div>

            {/* My Crop Listings Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mySellerListings.map((listing) => (
                <CropListingCard
                  key={listing.id}
                  listing={listing}
                  onOpenReport={(item) => setActiveListingForReport(item)}
                  onMakeOffer={() => setActiveTab("chat-workspace")}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE LISTING WIZARD */}
        {activeTab === "create-listing" && (
          <CreateListingWizard
            onSuccess={handleListingCreated}
            onCancel={() => setActiveTab("marketplace")}
          />
        )}

        {/* TAB 4: MY OFFERS & NEGOTIATION */}
        {activeTab === "my-offers" && (
          <NegotiationPanel
            userRole={userRole}
            offers={offers}
            onOfferUpdated={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {/* TAB 5: PRICE INTELLIGENCE */}
        {activeTab === "price-intelligence" && (
          <PriceIntelligenceView
            listings={allListingsOnSale}
            initialSelectedListingId={selectedCropForIntelligenceId}
            onSelectListing={(listing) => setSelectedCropForIntelligenceId(listing.id)}
          />
        )}

        {/* NEW TAB: PAYMENT PROTECTION */}
        {activeTab === "payment-protection" && <PaymentProtectionView />}

        {/* NEW TAB: LOGISTICS MATCHING */}
        {activeTab === "logistics" && <LogisticsMatchingView />}

        {/* NEW TAB: MULTI-FARMER PRODUCE AGGREGATION */}
        {activeTab === "aggregation" && <AggregationDashboardView />}

        {/* TAB 6: VERIFICATION ONBOARDING */}
        {activeTab === "verification" && <BuyerVerificationForm />}

        {/* TAB 7: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
              {t("Participant Profile & Trust System", "प्रतिभागी प्रोफ़ाइल व विश्वास प्रणाली")}
            </h2>

            {userRole === "SELLER" ? (
              <FarmerProfileCard
                profile={MOCK_CROP_LISTINGS[0].farmerProfile}
                farmerAuth={farmerAuth}
                onOpenAuthModal={() => setIsFarmerAuthModalOpen(true)}
                onLogout={() => {
                  logoutFarmer();
                  showNotification(t("Logged Out", "लॉग आउट हो गया"));
                }}
              />
            ) : (
              <BuyerProfileCard profile={selectedBuyer} />
            )}
          </div>
        )}
          </>
        )}
      </main>

      {/* Farmer ID Verification Modal */}
      <FarmerAuthModal
        isOpen={isFarmerAuthModalOpen}
        onClose={() => setIsFarmerAuthModalOpen(false)}
        onAuthenticate={handleFarmerAuthSuccess}
      />

      {/* Buyer Merchant Auth Modal */}
      <BuyerAuthModal
        isOpen={isBuyerAuthModalOpen}
        onClose={() => setIsBuyerAuthModalOpen(false)}
        onLoginSuccess={(auth) => {
          setUserRole("BUYER");
          loginBuyer(auth);
          showNotification(
            t(
              `Merchant Buyer Verified: ${auth.businessName} (${auth.merchantId})`,
              `व्यापारी खरीदार सत्यापित: ${auth.businessName}`
            )
          );
        }}
      />

      {/* Offer Modal */}
      {activeOfferModalListing && (
        <OfferModal
          listing={activeOfferModalListing}
          onClose={() => setActiveOfferModalListing(null)}
          onOfferSent={handleOfferSent}
        />
      )}

      {/* Create Buyer Profile Wizard Modal */}
      {isCreateBuyerModalOpen && (
        <CreateBuyerProfileWizard
          onClose={() => setIsCreateBuyerModalOpen(false)}
          onBuyerCreated={(newBuyer) => {
            setSelectedBuyer(newBuyer);
            setIsCreateBuyerModalOpen(false);
            showNotification(
              t(
                `Buyer Profile Created & Demo Verified: ${newBuyer.businessName} (${newBuyer.verificationId})`,
                `खरीदार प्रोफ़ाइल सफलतापूर्वक बनाई गई: ${newBuyer.businessName}`
              )
            );
            setActiveTab("buyer-profile");
          }}
        />
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={activeDocumentViewer}
        onClose={() => setActiveDocumentViewer(null)}
      />
    </div>
  );
}

export function MandiPage() {
  return (
    <MandiProvider>
      <MandiContent />
    </MandiProvider>
  );
}
export default MandiPage;
