import type { SmartDealRecord, BuyerOffer } from "../types/mandi";

const DEFAULT_SMART_DEAL: SmartDealRecord = {
  dealId: "AGR-DEAL-2026-004821",
  offerId: "OFFER-2026-001",
  listingId: "MND-2026-WHT-001",
  status: "CONFIRMED_LOCKED",
  version: "Version 1.0",
  createdAt: "2026-09-01 11:06 AM",
  lockedAt: "2026-09-01 11:10 AM",
  buyerInfo: {
    buyerId: "BUYER-001",
    businessName: "ABC Foods Pvt Ltd",
    buyerType: "Food Processor",
    location: "Lucknow, Uttar Pradesh",
    isVerified: true,
    verificationId: "AGR-BUY-2026-UP001",
  },
  sellerInfo: {
    farmerId: "FARMER-UP-1042",
    displayName: "Verified Farmer #1042 (Ramesh K.)",
    district: "Barabanki",
    state: "Uttar Pradesh",
    isVerified: true,
    verificationId: "AGR-VER-2026-UP8912",
  },
  produceInfo: {
    cropName: "Wheat",
    variety: "HD-2967",
    quantityQuintals: 250,
    qualityGrade: "Grade A",
    moisturePercentage: 11.8,
    productionMethod: "Organic",
  },
  commercialTerms: {
    finalPricePerQuintal: 2880,
    totalAmount: 720000,
    paymentTerms: "Direct Bank Transfer",
    paymentTimeframe: "Within 48 hours",
  },
  logisticsInfo: {
    pickupType: "Buyer Arranged Truck Pickup",
    pickupDate: "15 October 2026",
    transportArrangedBy: "ABC Foods Logistics Network",
  },
  sellerConfirmed: true,
  sellerConfirmedAt: "2026-09-01 11:08 AM",
  buyerConfirmed: true,
  buyerConfirmedAt: "2026-09-01 11:10 AM",
  timeline: [
    {
      id: "TL-01",
      timestamp: "10:50 AM",
      actorName: "ABC Foods Pvt Ltd",
      actorRole: "BUYER",
      actionType: "OFFER_CREATED",
      pricePerQuintal: 2850,
      quantityQuintals: 250,
      note: "Buyer offered ₹2,850/q",
    },
    {
      id: "TL-02",
      timestamp: "10:58 AM",
      actorName: "Verified Farmer #1042",
      actorRole: "SELLER",
      actionType: "COUNTER_OFFER",
      pricePerQuintal: 2880,
      quantityQuintals: 250,
      note: "Farmer countered ₹2,880/q",
    },
    {
      id: "TL-03",
      timestamp: "11:05 AM",
      actorName: "ABC Foods Pvt Ltd",
      actorRole: "BUYER",
      actionType: "OFFER_ACCEPTED",
      pricePerQuintal: 2880,
      quantityQuintals: 250,
      note: "Buyer accepted ₹2,880/q",
    },
    {
      id: "TL-04",
      timestamp: "11:10 AM",
      actorName: "Agrisense Smart Engine",
      actorRole: "BUYER",
      actionType: "DEAL_CONFIRMED",
      pricePerQuintal: 2880,
      quantityQuintals: 250,
      note: "Both parties digitally confirmed. Agreement locked Version 1.0.",
    },
  ],
};

let localDeals: SmartDealRecord[] = [DEFAULT_SMART_DEAL];

export const dealService = {
  /**
   * Get all smart deals
   */
  getAllDeals(): SmartDealRecord[] {
    return localDeals;
  },

  /**
   * Get deal by ID
   */
  getDealById(dealId: string): SmartDealRecord | undefined {
    return localDeals.find((d) => d.dealId === dealId);
  },

  /**
   * Generate a Smart Deal from an agreed offer
   */
  createSmartDeal(offer: BuyerOffer): SmartDealRecord {
    const finalPrice = offer.counterPricePerQuintal || offer.proposedPricePerQuintal;
    const dealId = `AGR-DEAL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newDeal: SmartDealRecord = {
      dealId,
      offerId: offer.id,
      listingId: offer.cropListing.id,
      status: "AWAITING_CONFIRMATION",
      version: "Version 1.0",
      createdAt: new Date().toLocaleString(),
      buyerInfo: {
        buyerId: offer.buyerProfile.id,
        businessName: offer.buyerProfile.businessName,
        buyerType: offer.buyerProfile.buyerType,
        location: `${offer.buyerProfile.district}, ${offer.buyerProfile.state}`,
        isVerified: offer.buyerProfile.isVerified,
        verificationId: offer.buyerProfile.verificationId,
      },
      sellerInfo: {
        farmerId: offer.cropListing.farmerProfile.id,
        displayName: offer.cropListing.farmerProfile.displayName,
        district: offer.cropListing.farmerProfile.district,
        state: offer.cropListing.farmerProfile.state,
        isVerified: offer.cropListing.farmerProfile.isGovtVerified,
        verificationId: offer.cropListing.farmerProfile.verificationId,
      },
      produceInfo: {
        cropName: offer.cropListing.cropName,
        variety: offer.cropListing.variety,
        quantityQuintals: offer.quantityQuintals,
        qualityGrade: offer.cropListing.quality.grade,
        moisturePercentage: offer.cropListing.quality.moisturePercentage,
        productionMethod: offer.cropListing.productionMethod,
      },
      commercialTerms: {
        finalPricePerQuintal: finalPrice,
        totalAmount: finalPrice * offer.quantityQuintals,
        paymentTerms: offer.paymentTerms,
        paymentTimeframe: "Within 48 hours",
      },
      logisticsInfo: {
        pickupType: offer.pickupPreference,
        pickupDate: offer.expectedDeliveryDate,
        transportArrangedBy: offer.pickupPreference,
      },
      sellerConfirmed: false,
      buyerConfirmed: false,
      timeline: offer.negotiationTimeline || [],
    };

    localDeals = [newDeal, ...localDeals];
    return newDeal;
  },

  /**
   * Confirm agreement by role
   */
  confirmDeal(dealId: string, role: "SELLER" | "BUYER"): SmartDealRecord {
    const deal = this.getDealById(dealId);
    if (!deal) throw new Error("Deal not found");

    if (role === "SELLER") {
      deal.sellerConfirmed = true;
      deal.sellerConfirmedAt = new Date().toLocaleString();
    } else {
      deal.buyerConfirmed = true;
      deal.buyerConfirmedAt = new Date().toLocaleString();
    }

    if (deal.sellerConfirmed && deal.buyerConfirmed) {
      deal.status = "CONFIRMED_LOCKED";
      deal.lockedAt = new Date().toLocaleString();
      deal.timeline.push({
        id: `TL-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actorName: "Agrisense Smart Engine",
        actorRole: role,
        actionType: "DEAL_CONFIRMED",
        pricePerQuintal: deal.commercialTerms.finalPricePerQuintal,
        quantityQuintals: deal.produceInfo.quantityQuintals,
        note: "Digital transaction confirmed by both parties. Terms locked Version 1.0.",
      });
    }

    return deal;
  },

  /**
   * Trigger browser printable agreement record view / PDF mock download
   */
  downloadAgreementRecord(deal: SmartDealRecord) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the Digital Agreement Record.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AGRISENSE SMART DEAL — ${deal.dealId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #065f46; }
            .badge { background: #d1fae5; color: #065f46; border: 1px solid #10b981; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
            .section-title { font-size: 14px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px; }
            .total-box { background: #065f46; color: white; border-radius: 12px; padding: 20px; margin-top: 24px; text-align: center; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">🌾 AGRISENSE SMART DEAL</div>
              <div style="font-size: 13px; color: #64748b;">Digital Transaction Confirmation & Recorded Agreement</div>
            </div>
            <div>
              <span class="badge">🔒 TERMS LOCKED (${deal.version})</span>
              <div style="font-size: 11px; text-align: right; margin-top: 6px; font-family: monospace;">ID: ${deal.dealId}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Contracting Parties</div>
            <div class="grid">
              <div>
                <strong>Buyer:</strong> ${deal.buyerInfo.businessName}<br/>
                <span>Type: ${deal.buyerInfo.buyerType} (${deal.buyerInfo.location})</span><br/>
                <span style="color: #059669; font-size: 12px;">✓ Demo Verified (${deal.buyerInfo.verificationId})</span>
              </div>
              <div>
                <strong>Seller:</strong> ${deal.sellerInfo.displayName}<br/>
                <span>Location: ${deal.sellerInfo.district}, ${deal.sellerInfo.state}</span><br/>
                <span style="color: #059669; font-size: 12px;">✓ Verified Farmer (${deal.sellerInfo.verificationId})</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Produce Specifications</div>
            <div class="grid">
              <div><strong>Crop:</strong> ${deal.produceInfo.cropName} (${deal.produceInfo.variety})</div>
              <div><strong>Quantity:</strong> ${deal.produceInfo.quantityQuintals} Quintals</div>
              <div><strong>Quality Grade:</strong> ${deal.produceInfo.qualityGrade}</div>
              <div><strong>Moisture Content:</strong> ≤ ${deal.produceInfo.moisturePercentage}%</div>
              <div><strong>Production Method:</strong> ${deal.produceInfo.productionMethod}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Commercial & Logistics Terms</div>
            <div class="grid">
              <div><strong>Agreed Unit Rate:</strong> ₹${deal.commercialTerms.finalPricePerQuintal.toLocaleString()} / Quintal</div>
              <div><strong>Total Transaction Value:</strong> ₹${deal.commercialTerms.totalAmount.toLocaleString()}</div>
              <div><strong>Payment Schedule:</strong> ${deal.commercialTerms.paymentTimeframe} (${deal.commercialTerms.paymentTerms})</div>
              <div><strong>Pickup Date & Method:</strong> ${deal.logisticsInfo.pickupDate} (${deal.logisticsInfo.pickupType})</div>
            </div>
          </div>

          <div class="total-box">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Agreed Transaction Value</div>
            <div style="font-size: 32px; font-weight: 900; margin-top: 4px;">₹${deal.commercialTerms.totalAmount.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Verified Digital Transaction Record • Agrisense Mandi Module</div>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleString()} • Version 1.0 • Agrisense Digital Agriculture Platform
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  },
};
