import { useState } from "react";
import type { DirectBuyerOfferItem, SellSmarterCropOption } from "../../types/sellSmarter";
import { sellSmarterService } from "../../services/sellSmarterService";

import { CropSelector } from "./sell-smarter/CropSelector";
import { FarmerCropSummaryCard } from "./sell-smarter/FarmerCropSummaryCard";
import { MainComparisonCard } from "./sell-smarter/MainComparisonCard";
import { PriceComparisonChart } from "./sell-smarter/PriceComparisonChart";
import { DirectBuyerOffersList } from "./sell-smarter/DirectBuyerOffersList";
import { WhyThisPriceModal } from "./sell-smarter/WhyThisPriceModal";
import { StorageStatusCard } from "./sell-smarter/StorageStatusCard";
import { MarketTrendOutlook } from "./sell-smarter/MarketTrendOutlook";
import { AISellingAdvisor } from "./sell-smarter/AISellingAdvisor";
import { ScenarioSimulator } from "./sell-smarter/ScenarioSimulator";
import { ProfitMarginCard } from "./sell-smarter/ProfitMarginCard";
import { DecisionSummaryCard } from "./sell-smarter/DecisionSummaryCard";
import { PriceHistoryCard } from "./sell-smarter/PriceHistoryCard";

import { AlertTriangle, BellRing, Sparkles, TrendingUp, Info } from "lucide-react";

interface SellSmarterViewProps {
  onViewCropReport?: (cropName: string) => void;
  onOpenBuyerProfile?: (buyerId: string) => void;
  onContactBuyer?: (buyer: DirectBuyerOfferItem) => void;
  onNavigateTab?: (tab: string) => void;
  onShowNotification?: (msg: string) => void;
}

export function SellSmarterView({
  onViewCropReport,
  onOpenBuyerProfile,
  onContactBuyer,
  onNavigateTab,
  onShowNotification,
}: SellSmarterViewProps) {
  const cropOptions = sellSmarterService.getCropOptions();
  const [selectedCropId, setSelectedCropId] = useState<string>(cropOptions[0].id);

  const selectedCrop: SellSmarterCropOption =
    cropOptions.find((c) => c.id === selectedCropId) || cropOptions[0];

  const [selectedBuyerOffer, setSelectedBuyerOffer] = useState<DirectBuyerOfferItem>(
    selectedCrop.directBuyers[0]
  );

  const [activeWhyThisPriceOffer, setActiveWhyThisPriceOffer] = useState<DirectBuyerOfferItem | null>(null);

  // Update selected buyer offer when crop changes
  const handleSelectCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    const newCrop = cropOptions.find((c) => c.id === cropId) || cropOptions[0];
    setSelectedBuyerOffer(newCrop.directBuyers[0]);
  };

  const handleContactBuyerClick = (buyer: DirectBuyerOfferItem) => {
    if (onContactBuyer) {
      onContactBuyer(buyer);
    } else if (onNavigateTab) {
      onNavigateTab("chat-workspace");
    }
  };

  const handleOpenBuyerProfileClick = (buyerId: string) => {
    if (onOpenBuyerProfile) {
      onOpenBuyerProfile(buyerId);
    } else if (onNavigateTab) {
      onNavigateTab("buyer-profile");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-forest via-forest-dark to-emerald-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber text-charcoal font-black text-xs uppercase tracking-wider shadow-xs">
            💰 Sell Smarter
          </span>
          <span className="text-xs text-ivory-200 font-semibold">
            Market Comparison + AI Selling Advisor
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Compare Your Selling Options
        </h1>

        <p className="text-sm sm:text-base text-ivory-200 font-medium max-w-2xl">
          "Compare your mandi realization with verified direct-buyer offers before making a decision."
        </p>

        {/* Informational Alerts Strip (Section 29 in prompt) */}
        <div className="pt-2 flex flex-wrap gap-3 text-3xs font-extrabold">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber" />
            <span>⚠️ Direct Buyer offer from ABC Foods expires in 24 hours</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>📈 Regional wheat prices increased +2.4% this week</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-300" />
            <span>Market Data • Decision Support Engine Active</span>
          </div>
        </div>
      </div>

      {/* 2. CROP SELECTION */}
      <CropSelector
        crops={cropOptions}
        selectedCropId={selectedCropId}
        onSelectCrop={handleSelectCrop}
      />

      {/* 3. FARMER SUMMARY */}
      <FarmerCropSummaryCard
        crop={selectedCrop}
        onViewCropReport={() => {
          if (onViewCropReport) {
            onViewCropReport(selectedCrop.cropName);
          } else if (onShowNotification) {
            onShowNotification(`Viewing Crop Report for ${selectedCrop.cropName} (${selectedCrop.variety})`);
          }
        }}
      />

      {/* 4, 5, 6, 7, 8. MAIN COMPARISON CARD (VISUAL CENTERPIECE) */}
      <MainComparisonCard
        crop={selectedCrop}
        bestBuyer={selectedBuyerOffer}
        onOpenBuyerProfile={handleOpenBuyerProfileClick}
        onOpenWhyThisPrice={(buyer) => setActiveWhyThisPriceOffer(buyer)}
        onContactBuyer={handleContactBuyerClick}
      />

      {/* 9. PRICE COMPARISON VISUALIZATION */}
      <PriceComparisonChart
        crop={selectedCrop}
        bestBuyer={selectedBuyerOffer}
      />

      {/* 10, 11, 12. MULTIPLE BUYER OFFERS LIST & QUALITY CHECK */}
      <DirectBuyerOffersList
        crop={selectedCrop}
        offers={selectedCrop.directBuyers}
        onSelectBuyer={(buyer) => setSelectedBuyerOffer(buyer)}
        onOpenWhyThisPrice={(buyer) => setActiveWhyThisPriceOffer(buyer)}
        onOpenBuyerProfile={handleOpenBuyerProfileClick}
      />

      {/* 14, 15. STORAGE INFORMATION & CROP PERISHABILITY */}
      <StorageStatusCard crop={selectedCrop} />

      {/* 16, 17. MARKET TREND & SHORT-TERM FORECAST */}
      <MarketTrendOutlook crop={selectedCrop} />

      {/* 18, 19, 20, 21. AI SELLING ADVISOR */}
      <AISellingAdvisor crop={selectedCrop} />

      {/* 22, 23. SELL NOW VS WAIT SCENARIO SIMULATOR */}
      <ScenarioSimulator
        crop={selectedCrop}
        bestBuyer={selectedBuyerOffer}
      />

      {/* 24, 25. PROFIT MARGIN & COST-BASED REFERENCE FLOOR */}
      <ProfitMarginCard
        crop={selectedCrop}
        bestBuyer={selectedBuyerOffer}
      />

      {/* 26, 27, 28. DECISION SUMMARY & RECOMMENDATION STATES */}
      <DecisionSummaryCard
        crop={selectedCrop}
        bestBuyer={selectedBuyerOffer}
        onContactBuyer={handleContactBuyerClick}
        onSaveDecision={() => {
          if (onShowNotification) {
            onShowNotification(`Decision saved for ${selectedCrop.cropName}! Notification alert active.`);
          }
        }}
        onMonitorPrice={() => {
          if (onShowNotification) {
            onShowNotification(`Price monitoring active for ${selectedCrop.cropName}. You will receive alerts on trend changes.`);
          }
        }}
        onViewAllBuyers={() => {
          const el = document.getElementById("buyer-offers-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 31, 32. CROP PRICE CONTEXT & HISTORY */}
      <PriceHistoryCard crop={selectedCrop} />

      {/* 13. WHY THIS PRICE MODAL */}
      {activeWhyThisPriceOffer && (
        <WhyThisPriceModal
          crop={selectedCrop}
          buyer={activeWhyThisPriceOffer}
          onClose={() => setActiveWhyThisPriceOffer(null)}
        />
      )}
    </div>
  );
}

export default SellSmarterView;
