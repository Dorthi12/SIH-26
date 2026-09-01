import type { PaymentRecord, DeliverySubmission, PaymentStatus } from "../types/mandi";

const DEFAULT_PAYMENT_DISCLAIMER =
  "Payment protection shown here is a prototype simulation. A production implementation would require a regulated payment/escrow partner and applicable compliance.";

let mockPaymentRecords: Record<string, PaymentRecord> = {
  "AGR-DEAL-2026-004821": {
    id: "PAY-2026-004821",
    dealId: "AGR-DEAL-2026-004821",
    totalAmount: 720000,
    protectedAmount: 720000,
    releasedAmount: 0,
    status: "Payment Protected",
    buyerName: "ABC Foods & Flour Mills Pvt Ltd",
    buyerVerified: true,
    sellerName: "Verified Farmer #1042 (Ramesh K. Patel)",
    sellerVerified: true,
    cropName: "Wheat (HD-2967)",
    quantityQuintals: 250,
    unitPrice: 2880,
    nextStep: "Awaiting Delivery Submission from Seller",
    updatedAt: "2026-09-01 11:30 AM",
    disclaimer: DEFAULT_PAYMENT_DISCLAIMER,
    milestones: [
      {
        stage: "1",
        title: "Deal Agreed",
        timestamp: "2026-09-01 10:15 AM",
        status: "COMPLETED",
        description: "Commercial terms & digital agreement signed by both parties.",
      },
      {
        stage: "2",
        title: "Payment Protection Initiated",
        timestamp: "2026-09-01 10:30 AM",
        status: "COMPLETED",
        description: "Buyer initiated payment deposit into protected simulation pool.",
      },
      {
        stage: "3",
        title: "Payment Protected",
        timestamp: "2026-09-01 11:00 AM",
        status: "COMPLETED",
        description: "₹7,20,000 held safely. Funds will release post delivery confirmation.",
      },
      {
        stage: "4",
        title: "Awaiting Delivery",
        timestamp: "Present",
        status: "CURRENT",
        description: "Farmer is dispatching produce from Lucknow region.",
      },
      {
        stage: "5",
        title: "Delivery Confirmation",
        status: "PENDING",
        description: "Buyer verifies weight slip & moisture quality upon receipt.",
      },
      {
        stage: "6",
        title: "Payment Release",
        status: "PENDING",
        description: "Instant electronic transfer of ₹7,20,000 to Farmer's bank account.",
      },
    ],
  },
  "AGR-POOL-DEAL-800Q": {
    id: "PAY-2026-800Q-AGG",
    dealId: "AGR-POOL-DEAL-800Q",
    totalAmount: 2280000,
    protectedAmount: 2280000,
    releasedAmount: 1140000,
    status: "Awaiting Delivery",
    buyerName: "ABC Foods & Flour Mills Pvt Ltd",
    buyerVerified: true,
    sellerName: "Multi-Farmer Supply Pool (6 Verified Farmers)",
    sellerVerified: true,
    cropName: "Wheat Grade A (Aggregated 800 q)",
    quantityQuintals: 800,
    unitPrice: 2850,
    nextStep: "Multi-lot delivery in progress (3/6 lots received)",
    updatedAt: "2026-09-01 12:45 PM",
    isAggregatedDeal: true,
    disclaimer: DEFAULT_PAYMENT_DISCLAIMER,
    milestones: [
      {
        stage: "1",
        title: "Aggregated Pool Deal Formed",
        timestamp: "2026-08-30 04:00 PM",
        status: "COMPLETED",
        description: "6 Farmers joined supply pool fulfilling 800 q requirement.",
      },
      {
        stage: "2",
        title: "Payment Protection Initiated",
        timestamp: "2026-08-31 09:00 AM",
        status: "COMPLETED",
        description: "ABC Foods deposited full ₹22,80,000 into protected transaction account.",
      },
      {
        stage: "3",
        title: "Payment Protected",
        timestamp: "2026-08-31 10:15 AM",
        status: "COMPLETED",
        description: "100% of deal value locked safely for multi-farmer release.",
      },
      {
        stage: "4",
        title: "Awaiting Delivery",
        timestamp: "Present",
        status: "CURRENT",
        description: "Multi-location pickup route active across 6 villages.",
      },
      {
        stage: "5",
        title: "Delivery Confirmation",
        status: "PENDING",
        description: "Lot-by-lot inspection at Kanpur Processing Plant.",
      },
      {
        stage: "6",
        title: "Proportional Payment Release",
        status: "PENDING",
        description: "Individual payouts released as each farmer's lot is accepted.",
      },
    ],
  },
};

let mockDeliverySubmissions: Record<string, DeliverySubmission> = {
  "AGR-DEAL-2026-004821": {
    id: "DEL-004821",
    dealId: "AGR-DEAL-2026-004821",
    farmerId: "FARMER-UP-1042",
    deliveryDate: "15 October 2026",
    quantityQuintals: 250,
    receivedQuantityQuintals: 250,
    vehicleNumber: "UP-32-BZ-9410",
    pickupLocation: "Haidergarh, Barabanki, UP",
    deliveryLocation: "Kanpur Processing Plant, Kanpur, UP",
    deliveryReceiptUrl: "Delivery_Receipt_AGR004821.pdf",
    weighbridgeReceiptUrl: "Weighbridge_Slip_Kanpur_250Q.pdf",
    photos: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"],
    qualityGrade: "Grade A",
    moisturePercentage: 11.8,
    status: "SUBMITTED",
  },
};

export const paymentService = {
  getPaymentStatus(dealId: string): PaymentRecord {
    return mockPaymentRecords[dealId] || mockPaymentRecords["AGR-DEAL-2026-004821"];
  },

  getAllPayments(): PaymentRecord[] {
    return Object.values(mockPaymentRecords);
  },

  submitDelivery(submission: DeliverySubmission): DeliverySubmission {
    mockDeliverySubmissions[submission.dealId] = submission;
    
    // Update payment record status
    if (mockPaymentRecords[submission.dealId]) {
      mockPaymentRecords[submission.dealId].status = "Delivery Submitted";
      mockPaymentRecords[submission.dealId].nextStep = "Buyer inspecting produce & weight slip";
      mockPaymentRecords[submission.dealId].updatedAt = new Date().toLocaleString();
      
      const milestones = mockPaymentRecords[submission.dealId].milestones;
      const idx = milestones.findIndex((m) => m.title.includes("Delivery"));
      if (idx !== -1) {
        milestones[idx].status = "COMPLETED";
      }
    }
    return submission;
  },

  getDeliverySubmission(dealId: string): DeliverySubmission | null {
    return mockDeliverySubmissions[dealId] || null;
  },

  confirmDelivery(dealId: string): PaymentRecord {
    const record = mockPaymentRecords[dealId] || mockPaymentRecords["AGR-DEAL-2026-004821"];
    record.status = "Payment Released";
    record.releasedAmount = record.totalAmount;
    record.nextStep = "Transaction Completed — Funds Transferred";
    record.updatedAt = new Date().toLocaleString();
    
    record.milestones.forEach((m) => {
      m.status = "COMPLETED";
    });
    
    if (mockDeliverySubmissions[dealId]) {
      mockDeliverySubmissions[dealId].status = "CONFIRMED";
    }
    return record;
  },

  raiseDeliveryDispute(dealId: string, issueDetails: { issueType: string; expectedQuantity: number; receivedQuantity: number; details: string }): PaymentRecord {
    const record = mockPaymentRecords[dealId] || mockPaymentRecords["AGR-DEAL-2026-004821"];
    record.status = "Disputed";
    record.nextStep = "⚠ Dispute Under Review by Mandi Quality Desk";
    record.updatedAt = new Date().toLocaleString();

    if (mockDeliverySubmissions[dealId]) {
      mockDeliverySubmissions[dealId].status = "DISPUTED";
      mockDeliverySubmissions[dealId].disputeDetails = {
        issueType: issueDetails.issueType,
        expectedQuantity: issueDetails.expectedQuantity,
        receivedQuantity: issueDetails.receivedQuantity,
        details: issueDetails.details,
        statusText: "⚠ Dispute Under Review",
        reportedAt: new Date().toLocaleString(),
      };
    }
    return record;
  },
};
