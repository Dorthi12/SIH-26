import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  UserRole,
  MarketplaceFilter,
  CropListing,
  CostEvidence,
  FarmerAuthDetails,
  BuyerAuthDetails,
} from "../types/mandi";

export type MandiTab =
  | "marketplace"
  | "my-listings"
  | "create-listing"
  | "my-offers"
  | "price-intelligence"
  | "sell-smarter"
  | "verification"
  | "profile"
  | "buyer-profile"
  | "buyer-verification"
  | "chat-workspace"
  | "smart-deal"
  | "my-deals"
  | "payment-protection"
  | "logistics"
  | "aggregation";

export const DEFAULT_FARMER_AUTH: FarmerAuthDetails = {
  farmerId: "KPP-UP-2026-8912",
  fullName: "Ramesh Kumar Patel",
  mobileNumber: "+91 98765 43210",
  aadhaarMock: "XXXX-XXXX-8912",
  khasraKhatauniNumber: "Khasra #342 / Khatauni #891",
  state: "Uttar Pradesh",
  district: "Barabanki",
  villageBlock: "Haidergarh Block",
  isVerified: true,
  verificationDate: "2026-01-10",
  verificationId: "AGR-VER-2026-UP8912",
  verifiedByOfficer: "District Agriculture Officer (Barabanki)",
};

export const DEFAULT_BUYER_AUTH: BuyerAuthDetails = {
  buyerId: "BUYER-001",
  businessName: "ABC Foods Pvt Ltd",
  contactPerson: "Alok Verma",
  email: "procurement@abcfoods.com",
  phone: "+91 91234 56789",
  gstinMock: "09AAACA1234F1Z5",
  buyerType: "Food Processor",
  state: "Uttar Pradesh",
  district: "Lucknow",
  isVerified: true,
};

interface MandiContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: MandiTab;
  setActiveTab: (tab: MandiTab) => void;
  filters: MarketplaceFilter;
  setFilters: React.Dispatch<React.SetStateAction<MarketplaceFilter>>;
  resetFilters: () => void;
  
  // Auth state for Farmer & Buyer
  farmerAuth: FarmerAuthDetails | null;
  loginFarmer: (details: FarmerAuthDetails) => void;
  logoutFarmer: () => void;
  
  buyerAuth: BuyerAuthDetails | null;
  loginBuyer: (details: BuyerAuthDetails) => void;
  logoutBuyer: () => void;

  isFarmerAuthModalOpen: boolean;
  setIsFarmerAuthModalOpen: (open: boolean) => void;

  activeListingForReport: CropListing | null;
  setActiveListingForReport: (listing: CropListing | null) => void;
  activeOfferModalListing: CropListing | null;
  setActiveOfferModalListing: (listing: CropListing | null) => void;
  activeDocumentViewer: CostEvidence | null;
  setActiveDocumentViewer: (doc: CostEvidence | null) => void;
  notificationMessage: string | null;
  showNotification: (msg: string) => void;
}

const DEFAULT_FILTERS: MarketplaceFilter = {
  searchQuery: "",
  cropName: "ALL",
  state: "ALL",
  district: "ALL",
  minQuantity: null,
  maxQuantity: null,
  minPrice: null,
  maxPrice: null,
  organicOnly: false,
  qualityGrade: "ALL",
  govtVerifiedOnly: false,
  sortBy: "NEWEST",
};

const MandiContext = createContext<MandiContextType | undefined>(undefined);

export function MandiProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("agrisense_mandi_role");
    return saved === "BUYER" ? "BUYER" : "SELLER";
  });

  const [activeTab, setActiveTab] = useState<MandiTab>("marketplace");
  const [filters, setFilters] = useState<MarketplaceFilter>(DEFAULT_FILTERS);

  // Farmer auth state (null by default until farmer verifies Kisan Pehchan)
  const [farmerAuth, setFarmerAuth] = useState<FarmerAuthDetails | null>(() => {
    const saved = localStorage.getItem("agrisense_mandi_farmer");
    if (saved && saved !== "null") {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Buyer auth state (null by default until merchant logs in)
  const [buyerAuth, setBuyerAuth] = useState<BuyerAuthDetails | null>(() => {
    const saved = localStorage.getItem("agrisense_mandi_buyer");
    if (saved && saved !== "null") {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [isFarmerAuthModalOpen, setIsFarmerAuthModalOpen] = useState<boolean>(false);

  const [activeListingForReport, setActiveListingForReport] = useState<CropListing | null>(null);
  const [activeOfferModalListing, setActiveOfferModalListing] = useState<CropListing | null>(null);
  const [activeDocumentViewer, setActiveDocumentViewer] = useState<CostEvidence | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem("agrisense_mandi_role", role);
  };

  const loginFarmer = (details: FarmerAuthDetails) => {
    setFarmerAuth(details);
    localStorage.setItem("agrisense_mandi_farmer", JSON.stringify(details));
  };

  const logoutFarmer = () => {
    setFarmerAuth(null);
    localStorage.setItem("agrisense_mandi_farmer", "null");
  };

  const loginBuyer = (details: BuyerAuthDetails) => {
    setBuyerAuth(details);
    localStorage.setItem("agrisense_mandi_buyer", JSON.stringify(details));
  };

  const logoutBuyer = () => {
    setBuyerAuth(null);
    localStorage.setItem("agrisense_mandi_buyer", "null");
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  return (
    <MandiContext.Provider
      value={{
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
      }}
    >
      {children}
    </MandiContext.Provider>
  );
}

export function useMandi() {
  const ctx = useContext(MandiContext);
  if (!ctx) {
    throw new Error("useMandi must be used within a MandiProvider");
  }
  return ctx;
}
