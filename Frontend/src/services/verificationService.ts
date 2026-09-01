import type { BuyerVerificationDoc, VerificationState } from "../types/mandi";
import { buyerService } from "./buyerService";

export const REQUIRED_BUYER_DOCS: Array<{
  docType: BuyerVerificationDoc["docType"];
  title: string;
  description: string;
  mandatory: boolean;
}> = [
  {
    docType: "Business Registration",
    title: "Certificate of Incorporation / MCA Registration",
    description: "Official government business registration document verifying legal corporate status.",
    mandatory: true,
  },
  {
    docType: "Business Address Proof",
    title: "Registered Premises & Processing Plant Address Proof",
    description: "Utility bill or property lease extract proving operating physical location.",
    mandatory: true,
  },
  {
    docType: "Tax Registration",
    title: "GSTIN Certificate & Annual Tax Registration",
    description: "Valid GST Registration Certificate for tax compliance in grain trading.",
    mandatory: true,
  },
  {
    docType: "Authorized Rep ID",
    title: "Authorized Representative Government ID",
    description: "Identity verification of procurement manager authorized to negotiate deals.",
    mandatory: true,
  },
];

export const verificationService = {
  /**
   * Get all verification documents for a buyer
   */
  getBuyerDocs(buyerId: string): BuyerVerificationDoc[] {
    const buyer = buyerService.getBuyerById(buyerId);
    return buyer ? buyer.documents : [];
  },

  /**
   * Calculate overall verification progress percentage (0 - 100)
   */
  calculateProgress(buyerId: string): number {
    const docs = this.getBuyerDocs(buyerId);
    if (docs.length === 0) return 0;
    const verifiedCount = docs.filter((d) => d.status === "VERIFIED").length;
    return Math.round((verifiedCount / REQUIRED_BUYER_DOCS.length) * 100);
  },

  /**
   * Simulate uploading a document for a buyer
   */
  uploadDocument(
    buyerId: string,
    docType: BuyerVerificationDoc["docType"],
    fileName: string
  ): BuyerVerificationDoc {
    const buyer = buyerService.getBuyerById(buyerId);
    if (!buyer) throw new Error("Buyer not found");

    const existingIndex = buyer.documents.findIndex((d) => d.docType === docType);
    const newDoc: BuyerVerificationDoc = {
      id: `BD-${Date.now()}`,
      docType,
      fileName,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "UNDER_REVIEW",
      notes: "Document submitted for demo platform review",
    };

    if (existingIndex >= 0) {
      buyer.documents[existingIndex] = newDoc;
    } else {
      buyer.documents.push(newDoc);
    }

    buyer.verificationProgress = this.calculateProgress(buyerId);
    return newDoc;
  },
};
