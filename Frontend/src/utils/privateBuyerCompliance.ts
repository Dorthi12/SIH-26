import type { BuyerProfile, PrivateBuyerCompliance } from "../types/mandi";

export const PRIVATE_BUYER_TYPES = [
  "Food Processor",
  "Exporter",
  "Wholesaler",
  "Retail Chain",
  "Institutional Buyer",
  "Private Agribusiness",
  "Corporate Buyer",
] as const;

export function isPrivateBuyerEntity(buyerOrType?: Partial<BuyerProfile> | string | boolean | null): boolean {
  if (!buyerOrType) return false;

  if (typeof buyerOrType === "boolean") return buyerOrType;

  if (typeof buyerOrType === "object") {
    if (typeof buyerOrType.isPrivateEntity === "boolean") {
      return buyerOrType.isPrivateEntity;
    }
    const bType = buyerOrType.buyerType;
    if (!bType) return false;
    return PRIVATE_BUYER_TYPES.some(
      (type) => type.toLowerCase() === bType.toLowerCase()
    );
  }

  if (typeof buyerOrType === "string") {
    return PRIVATE_BUYER_TYPES.some(
      (type) => type.toLowerCase() === buyerOrType.toLowerCase()
    );
  }

  return false;
}

export function getPrivateBuyerCompliance(
  buyer?: Partial<BuyerProfile> | null,
  overrideOptions?: {
    landPercentage?: number;
    cropCycles?: number;
    isCashCrop?: boolean;
    unresolvedComplaints?: number;
  }
): PrivateBuyerCompliance {
  const isPrivate = isPrivateEntityCheck(buyer);

  if (!isPrivate) {
    return {
      isPrivateEntity: false,
      contractedCashCropLandPercentage: 0,
      landControlLimitPercentage: 40,
      consecutiveCropCycles: 1,
      cropRotationLimit: 2,
      landControlStatus: "COMPLIANT",
      cropRotationStatus: "COMPLIANT",
      stockTransparencyStatus: "TRANSPARENT",
      overallStatus: "COMPLIANT",
      unresolvedComplaintsCount: 0,
    };
  }

  // Reuse existing compliance object on buyer if available
  const existing = buyer?.compliance;

  const contractedLandPct =
    overrideOptions?.landPercentage ??
    existing?.contractedCashCropLandPercentage ??
    32;

  const cropCycles =
    overrideOptions?.cropCycles ??
    existing?.consecutiveCropCycles ??
    1;

  const unresolvedComplaints =
    overrideOptions?.unresolvedComplaints ??
    existing?.unresolvedComplaintsCount ??
    0;

  // Land Control Safeguard (Rule A)
  let landControlStatus: "COMPLIANT" | "NEAR_LIMIT" | "VIOLATION" = "COMPLIANT";
  if (contractedLandPct > 40) {
    landControlStatus = "VIOLATION";
  } else if (contractedLandPct >= 35) {
    landControlStatus = "NEAR_LIMIT";
  }

  // Crop Rotation Safeguard (Rule B)
  let cropRotationStatus: "COMPLIANT" | "REVIEW_REQUIRED" | "VIOLATION" = "COMPLIANT";
  if (cropCycles >= 2) {
    cropRotationStatus = "VIOLATION";
  }

  // Overall Status
  let overallStatus: "COMPLIANT" | "REVIEW_REQUIRED" | "BLOCKED" = "COMPLIANT";
  if (landControlStatus === "VIOLATION") {
    overallStatus = "BLOCKED";
  } else if (cropRotationStatus === "VIOLATION" || landControlStatus === "NEAR_LIMIT" || unresolvedComplaints > 0) {
    overallStatus = "REVIEW_REQUIRED";
  }

  return {
    isPrivateEntity: true,
    contractedCashCropLandPercentage: contractedLandPct,
    landControlLimitPercentage: 40,
    consecutiveCropCycles: cropCycles,
    cropRotationLimit: 2,
    landControlStatus,
    cropRotationStatus,
    stockTransparencyStatus: existing?.stockTransparencyStatus || "TRANSPARENT",
    overallStatus,
    unresolvedComplaintsCount: unresolvedComplaints,
    lastAuditDate: existing?.lastAuditDate || "2026-08-20",
    notes: existing?.notes,
  };
}

function isPrivateEntityCheck(buyer?: Partial<BuyerProfile> | null): boolean {
  if (!buyer) return false;
  if (typeof buyer.isPrivateEntity === "boolean") return buyer.isPrivateEntity;
  return isPrivateBuyerEntity(buyer.buyerType);
}
