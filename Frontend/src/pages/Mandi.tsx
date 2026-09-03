import React, { useState, useEffect } from 'react';
import type {
  RoleMode,
  FarmerTab,
  BuyerTab,
  CropListing,
  BuyerProfile,
  Offer,
  SmartDeal,
} from '../types/mandi';
import {
  INITIAL_LAND_PARCELS,
  INITIAL_CROP_HISTORY,
  INITIAL_COMPANY_CONTRACTS,
  INITIAL_CROP_LISTINGS,
  INITIAL_BUYERS,
  INITIAL_BUYER_REQUIREMENTS,
  INITIAL_OFFERS,
  INITIAL_SMART_DEALS,
  INITIAL_SUPPLY_POOLS,
  INITIAL_DOCUMENTS,
  fetchListings,
  fetchBuyerProfiles,
  fetchOffers,
  fetchDeals,
  createListingApi,
  counterOfferApi,
  acceptOfferApi,
} from '../services/mandiService';

import { MandiHome } from '../components/mandi/MandiHome';
import { FarmProfileView } from '../components/mandi/FarmProfileView';
import { MarketplaceView } from '../components/mandi/MarketplaceView';
import { TradeChatModal } from '../components/mandi/TradeChatModal';
import { OffersNegotiationView } from '../components/mandi/OffersNegotiationView';
import { SmartDealsView } from '../components/mandi/SmartDealsView';
import { PaymentProtectionView } from '../components/mandi/PaymentProtectionView';
import { LogisticsView } from '../components/mandi/LogisticsView';
import { SellingComparisonView } from '../components/mandi/SellingComparisonView';
import { SellingAdvisorView } from '../components/mandi/SellingAdvisorView';
import { SupplyAggregationView } from '../components/mandi/SupplyAggregationView';
import { FarmerProtectionCenter } from '../components/mandi/FarmerProtectionCenter';
import { DocumentCenterView } from '../components/mandi/DocumentCenterView';
import { BuyerProfilesView } from '../components/mandi/BuyerProfilesView';
import { CropReportModal } from '../components/mandi/CropReportModal';
import { MandiDecisionCenterModal } from '../components/mandi/MandiDecisionCenterModal';
import { CreateListingView } from '../components/mandi/CreateListingView';

import {
  Store,
  User,
  List,
  FileCheck2,
  Building,
  Scale,
  Sparkles,
  Layers,
  Truck,
  Lock,
  ShieldCheck,
  FileText,
  PieChart,
  Sprout,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';

export function Mandi() {
  const [role, setRole] = useState<RoleMode>('farmer');
  const [farmerTab, setFarmerTab] = useState<FarmerTab>('home');
  const [buyerTab, setBuyerTab] = useState<BuyerTab>('marketplace');

  // Active Data State
  const [parcels] = useState(INITIAL_LAND_PARCELS);
  const [cropHistory] = useState(INITIAL_CROP_HISTORY);
  const [contracts] = useState(INITIAL_COMPANY_CONTRACTS);
  const [listings, setListings] = useState<CropListing[]>(INITIAL_CROP_LISTINGS);
  const [buyers, setBuyers] = useState<BuyerProfile[]>(INITIAL_BUYERS);
  const [requirements] = useState(INITIAL_BUYER_REQUIREMENTS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [deals, setDeals] = useState<SmartDeal[]>(INITIAL_SMART_DEALS);
  const [pools] = useState(INITIAL_SUPPLY_POOLS);
  const [documents] = useState(INITIAL_DOCUMENTS);

  // Load data from Backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [listingsRes, buyersRes, offersRes, dealsRes] = await Promise.allSettled([
          fetchListings(),
          fetchBuyerProfiles(),
          fetchOffers(),
          fetchDeals(),
        ]);

        if (listingsRes.status === 'fulfilled' && listingsRes.value?.listings?.length > 0) {
          setListings(listingsRes.value.listings);
        }
        if (buyersRes.status === 'fulfilled' && buyersRes.value?.length > 0) {
          setBuyers(buyersRes.value);
        }
        if (offersRes.status === 'fulfilled' && offersRes.value?.length > 0) {
          setOffers(offersRes.value);
        }
        if (dealsRes.status === 'fulfilled' && dealsRes.value?.length > 0) {
          setDeals(dealsRes.value);
        }
      } catch (err) {
        console.warn('Fallback to local mock data:', err);
      }
    }

    loadBackendData();
  }, []);

  const handlePublishNewListing = async (newListingData: Partial<CropListing>) => {
    const fullListing: CropListing = {
      id: newListingData.id || `lst-${Date.now()}`,
      farmerId: newListingData.farmerId || 'AGR-F-882190',
      farmerName: newListingData.farmerName || 'Ramesh Kumar Verma',
      farmerLocation: newListingData.farmerLocation || 'Barabanki, UP',
      farmerRating: 4.8,
      farmerCompletedTransactions: 38,
      crop: newListingData.crop || 'Wheat',
      variety: newListingData.variety || 'HD 2967',
      quantityQuintals: newListingData.quantityQuintals || 100,
      location: newListingData.location || 'Barabanki, UP',
      harvestDate: newListingData.harvestDate || '2025-05-12',
      productionMethod: newListingData.productionMethod || 'Conventional',
      productionCostPerQuintal: newListingData.productionCostPerQuintal || 1850,
      grade: newListingData.grade || 'Grade A',
      moisturePercentage: newListingData.moisturePercentage || 12.0,
      organicStatus: newListingData.organicStatus || 'Conventional',
      evidenceStatus: newListingData.evidenceStatus || {
        organic: 'Not Applicable',
        qualityReport: 'Verified',
        productionCost: 'Evidence Provided',
        harvestDate: 'Verified',
      },
      fairPriceRange: newListingData.fairPriceRange || {
        min: 2280,
        max: 2420,
        breakdown: {
          regionalRef: 2150,
          productionCost: 1850,
          qualityPremium: 120,
          gradePremium: 100,
          organicPremium: 0,
          demandPremium: 150,
          transportDeduction: 50,
          storageDeduction: 20,
        },
      },
      askingPricePerQuintal: newListingData.askingPricePerQuintal || 2340,
      verifiedCrop: true,
      verifiedFarmer: true,
    };

    setListings((prev) => [fullListing, ...prev]);
    setFarmerTab('listings');

    // Persist to backend if possible
    try {
      await createListingApi({
        commodityId: 'placeholder', // server resolves commodity
        crop: fullListing.crop,
        variety: fullListing.variety,
        quantityQuintals: fullListing.quantityQuintals,
        askingPricePerQuintal: fullListing.askingPricePerQuintal,
        grade: fullListing.grade === 'Grade A' ? 'GRADE_A' : fullListing.grade === 'Grade B' ? 'GRADE_B' : 'STANDARD',
        moisturePercentage: fullListing.moisturePercentage,
        location: fullListing.location,
        harvestDate: fullListing.harvestDate,
        productionMethod: fullListing.productionMethod,
        productionCostPerQuintal: fullListing.productionCostPerQuintal,
        evidenceStatus: fullListing.evidenceStatus,
        fairPriceRange: fullListing.fairPriceRange,
      });
    } catch (e) {
      console.warn('Backend sync for new listing:', e);
    }
  };

  // Modals state
  const [activeChatListing, setActiveChatListing] = useState<CropListing | undefined>();
  const [activeChatBuyer, setActiveChatBuyer] = useState<BuyerProfile | undefined>();
  const [showChatModal, setShowChatModal] = useState(false);

  const [activeCropReport, setActiveCropReport] = useState<CropListing | undefined>();
  const [showCropReportModal, setShowCropReportModal] = useState(false);

  const [showDecisionCenterModal, setShowDecisionCenterModal] = useState(false);

  // Handlers
  const handleOpenChatForListing = (listing: CropListing) => {
    setActiveChatListing(listing);
    setActiveChatBuyer(undefined);
    setShowChatModal(true);
  };

  const handleOpenChatForBuyer = (buyer: BuyerProfile) => {
    setActiveChatBuyer(buyer);
    setActiveChatListing(undefined);
    setShowChatModal(true);
  };

  const handleOpenCropReport = (listing: CropListing) => {
    setActiveCropReport(listing);
    setShowCropReportModal(true);
  };

  const handleAcceptOffer = (offer: Offer) => {
    const newDeal: SmartDeal = {
      id: `deal-${Date.now().toString().slice(-4)}`,
      offerId: offer.id,
      dealVersion: 'Version 2.0 (Final Locked)',
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      farmerId: offer.farmerId,
      farmerName: offer.farmerName,
      crop: offer.crop,
      variety: 'Grade A Produce',
      quantityQuintals: offer.quantityQuintals,
      pricePerQuintal: offer.offeredPricePerQuintal,
      totalValue: offer.offeredPricePerQuintal * offer.quantityQuintals,
      qualityGrade: 'Grade A',
      moisturePercentage: 11.8,
      pickupLocation: 'Farm Gate, Barabanki',
      deliveryDate: offer.deliveryDate,
      paymentTerms: `Payment within ${offer.paymentTermsDays} days of confirmation`,
      transportResponsibility: offer.transportResponsibility,
      buyerConfirmed: true,
      farmerConfirmed: true,
      termsLocked: true,
      paymentProtectionState: 'Payment Protected',
    };

    setDeals((prev) => [newDeal, ...prev]);

    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, status: 'Accepted' } : o))
    );

    acceptOfferApi(offer.id).catch((e) =>
      console.warn('Backend sync for offer accept:', e)
    );

    if (role === 'farmer') {
      setFarmerTab('deals');
    } else {
      setBuyerTab('deals');
    }
  };

  const handleCounterOffer = (offerId: string, price: number, qty: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              offeredPricePerQuintal: price,
              quantityQuintals: qty,
              status: 'Countered',
              negotiationTimeline: [
                ...o.negotiationTimeline,
                {
                  version: Number((o.negotiationTimeline.length * 0.1 + 1.0).toFixed(1)),
                  by: 'farmer',
                  price,
                  quantity: qty,
                  notes: 'Farmer counter proposal',
                  timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                },
              ],
            }
          : o
      )
    );

    counterOfferApi(offerId, { offeredPricePerQuintal: price, quantityQuintals: qty }).catch((e) =>
      console.warn('Backend sync for counter offer:', e)
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Sub Navigation & Role Header ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-3 shadow-sm sticky top-16 z-30 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mandi Sub-Nav Tabs for Farmer Mode */}
        {role === 'farmer' ? (
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'home', label: 'Home', icon: Store },
              { id: 'marketplace', label: 'Marketplace', icon: List },
              { id: 'create_listing', label: 'Create Listing & Price Engine', icon: Scale },
              { id: 'profile', label: 'Farm Profile', icon: User },
              { id: 'listings', label: 'My Listings', icon: Sprout },
              { id: 'offers', label: 'My Offers', icon: FileCheck2 },
              { id: 'buyers', label: 'Buyer Profiles', icon: Building },
              { id: 'price', label: 'Price Intel', icon: Scale },
              { id: 'advisor', label: 'Sell Smarter', icon: Sparkles },
              { id: 'aggregation', label: 'Aggregation', icon: Layers },
              { id: 'logistics', label: 'Logistics', icon: Truck },
              { id: 'payment', label: 'Payment Escrow', icon: Lock },
              { id: 'deals', label: 'Smart Deals', icon: ShieldCheck },
              { id: 'protection', label: 'Farmer Protection', icon: PieChart },
              { id: 'documents', label: 'Documents', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFarmerTab(tab.id as FarmerTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  farmerTab === tab.id
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-ivory-100 dark:hover:bg-charcoal/40'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          /* Mandi Sub-Nav Tabs for Buyer Mode */
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: List },
              { id: 'buyer_dashboard', label: 'Buyer Dashboard', icon: Store },
              { id: 'requirements', label: 'Requirements', icon: FileText },
              { id: 'offers', label: 'My Offers', icon: FileCheck2 },
              { id: 'farmer_listings', label: 'Farmer Listings', icon: Sprout },
              { id: 'aggregation', label: 'Aggregation Pool', icon: Layers },
              { id: 'logistics', label: 'Logistics', icon: Truck },
              { id: 'payment', label: 'Payment Protection', icon: Lock },
              { id: 'deals', label: 'Smart Deals', icon: ShieldCheck },
              { id: 'business_profile', label: 'Business Profile', icon: Building },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBuyerTab(tab.id as BuyerTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  buyerTab === tab.id
                    ? 'bg-amber text-charcoal shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-ivory-100 dark:hover:bg-charcoal/40'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Quick Role Switcher */}
          <div className="flex items-center bg-ivory-100 dark:bg-charcoal/40 p-1 rounded-xl border border-ivory-300 dark:border-[#26362f]">
            <button
              type="button"
              onClick={() => {
                setRole('farmer');
                setFarmerTab('home');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'farmer'
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal dark:hover:text-ivory-100'
              }`}
            >
              🌾 Farmer Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('buyer');
                setBuyerTab('marketplace');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'buyer'
                  ? 'bg-amber text-charcoal shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal dark:hover:text-ivory-100'
              }`}
            >
              🏢 Buyer Mode
            </button>
          </div>

          {/* Central Decision Center Launcher Button */}
          <button
            type="button"
            onClick={() => setShowDecisionCenterModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-bold border border-forest/30 hover:bg-forest hover:text-white transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mandi Decision Hub
          </button>
        </div>
      </div>

      {/* ── Active View Rendering ────────────────────────────────────────── */}
      <main className="space-y-6">
        {role === 'farmer' ? (
          <>
            {farmerTab === 'home' && (
              <MandiHome
                role={role}
                onSetRole={setRole}
                onNavigateFarmerTab={setFarmerTab}
                onNavigateBuyerTab={setBuyerTab}
              />
            )}
            {farmerTab === 'marketplace' && (
              <MarketplaceView
                listings={listings}
                onOpenCropReport={handleOpenCropReport}
                onContactFarmer={handleOpenChatForListing}
                onMakeOffer={handleOpenChatForListing}
              />
            )}
            {farmerTab === 'create_listing' && (
              <CreateListingView onPublishListing={handlePublishNewListing} />
            )}
            {farmerTab === 'profile' && (
              <FarmProfileView
                parcels={parcels}
                cropHistory={cropHistory}
                contracts={contracts}
                onAcceptContract={() => setFarmerTab('protection')}
              />
            )}
            {farmerTab === 'listings' && (
              <MarketplaceView
                listings={listings}
                onOpenCropReport={handleOpenCropReport}
                onContactFarmer={handleOpenChatForListing}
                onMakeOffer={handleOpenChatForListing}
              />
            )}
            {farmerTab === 'offers' && (
              <OffersNegotiationView
                offers={offers}
                onAcceptOffer={handleAcceptOffer}
                onCounterOffer={handleCounterOffer}
              />
            )}
            {farmerTab === 'buyers' && (
              <BuyerProfilesView
                buyers={buyers}
                requirements={requirements}
                onContactBuyer={handleOpenChatForBuyer}
              />
            )}
            {farmerTab === 'price' && <SellingComparisonView />}
            {farmerTab === 'advisor' && <SellingAdvisorView />}
            {farmerTab === 'aggregation' && <SupplyAggregationView pools={pools} />}
            {farmerTab === 'logistics' && <LogisticsView />}
            {farmerTab === 'payment' && <PaymentProtectionView deals={deals} />}
            {farmerTab === 'deals' && (
              <SmartDealsView
                deals={deals}
                onNavigateToPayment={() => setFarmerTab('payment')}
              />
            )}
            {farmerTab === 'protection' && (
              <FarmerProtectionCenter contracts={contracts} />
            )}
            {farmerTab === 'documents' && <DocumentCenterView documents={documents} />}
          </>
        ) : (
          /* BUYER MODE VIEWS */
          <>
            {buyerTab === 'marketplace' && (
              <MarketplaceView
                listings={listings}
                onOpenCropReport={handleOpenCropReport}
                onContactFarmer={handleOpenChatForListing}
                onMakeOffer={handleOpenChatForListing}
              />
            )}
            {buyerTab === 'buyer_dashboard' && (
              <BuyerProfilesView
                buyers={buyers}
                requirements={requirements}
                onContactBuyer={handleOpenChatForBuyer}
              />
            )}
            {buyerTab === 'requirements' && (
              <BuyerProfilesView
                buyers={buyers}
                requirements={requirements}
                onContactBuyer={handleOpenChatForBuyer}
              />
            )}
            {buyerTab === 'offers' && (
              <OffersNegotiationView
                offers={offers}
                onAcceptOffer={handleAcceptOffer}
                onCounterOffer={handleCounterOffer}
              />
            )}
            {buyerTab === 'farmer_listings' && (
              <MarketplaceView
                listings={listings}
                onOpenCropReport={handleOpenCropReport}
                onContactFarmer={handleOpenChatForListing}
                onMakeOffer={handleOpenChatForListing}
              />
            )}
            {buyerTab === 'aggregation' && <SupplyAggregationView pools={pools} />}
            {buyerTab === 'logistics' && <LogisticsView />}
            {buyerTab === 'payment' && <PaymentProtectionView deals={deals} />}
            {buyerTab === 'deals' && (
              <SmartDealsView
                deals={deals}
                onNavigateToPayment={() => setBuyerTab('payment')}
              />
            )}
            {buyerTab === 'business_profile' && (
              <BuyerProfilesView
                buyers={buyers}
                requirements={requirements}
                onContactBuyer={handleOpenChatForBuyer}
              />
            )}
          </>
        )}
      </main>

      {/* ── Modals & Drawers ────────────────────────────────────────────── */}
      {showChatModal && (
        <TradeChatModal
          listing={activeChatListing}
          buyer={activeChatBuyer}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {showCropReportModal && activeCropReport && (
        <CropReportModal
          listing={activeCropReport}
          onClose={() => setShowCropReportModal(false)}
        />
      )}

      {showDecisionCenterModal && (
        <MandiDecisionCenterModal
          onClose={() => setShowDecisionCenterModal(false)}
        />
      )}
    </div>
  );
}
