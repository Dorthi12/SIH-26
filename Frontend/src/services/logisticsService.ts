import type { LogisticsEstimate, NetRealizationData, TransportOption, PayerOption } from "../types/mandi";

const DEFAULT_TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: "OPT-A",
    title: "Standard Truck",
    vehicleType: "10-ton Truck (Euler / Leyland)",
    capacityTonnes: 10,
    estimatedCost: 18500,
    costPerQuintal: 74,
    estimatedDays: "1 day",
    badgeText: "Recommended",
  },
  {
    id: "OPT-B",
    title: "Large Multi-Axle Truck",
    vehicleType: "20-ton Heavy Carrier",
    capacityTonnes: 20,
    estimatedCost: 31000,
    costPerQuintal: 62,
    estimatedDays: "1 day",
    badgeText: "Best for Large Bulk",
  },
  {
    id: "OPT-C",
    title: "Aggregated Shared Route",
    vehicleType: "Shared 25-ton Multi-Village Transport",
    capacityTonnes: 25,
    estimatedCost: 12800,
    costPerQuintal: 51.2,
    estimatedDays: "1–2 days",
    badgeText: "Lowest Cost / Shared",
  },
];

export const logisticsService = {
  calculateEstimate(
    quantityQuintals: number = 250,
    farmerLocation: string = "Lucknow, UP",
    buyerLocation: string = "Kanpur, UP",
    distanceKm: number = 185,
    payer: PayerOption = "Buyer Pays"
  ): LogisticsEstimate {
    const baseTransport = Math.round(distanceKm * 80); // ₹14,800 approx
    const distanceAdjustment = 2000;
    const loading = 750;
    const unloading = 750;
    const totalEstimatedCost = baseTransport + distanceAdjustment + loading + unloading;
    const costPerQuintal = Math.round((totalEstimatedCost / quantityQuintals) * 10) / 10;

    return {
      dealId: "AGR-DEAL-2026-004821",
      farmerLocation,
      buyerLocation,
      distanceKm,
      quantityQuintals,
      estimatedVehicle: quantityQuintals > 200 ? "10-ton Truck" : "5-ton Container",
      totalEstimatedCost,
      costPerQuintal,
      breakdown: {
        baseTransport,
        distanceAdjustment,
        loading,
        unloading,
      },
      transportOptions: DEFAULT_TRANSPORT_OPTIONS,
      payer,
      deliveryEstimateDays: "1 day",
      pickupRouteStops: [
        { village: "Haidergarh (Barabanki)", farmerName: "Farmer A", quantity: 120, distanceKm: 0 },
        { village: "Nawabganj (Unnao)", farmerName: "Farmer D", quantity: 100, distanceKm: 45 },
        { village: "Bachhrawan (Rae Bareli)", farmerName: "Farmer F", quantity: 190, distanceKm: 78 },
        { village: "Mahona (Sitapur)", farmerName: "Farmer C", quantity: 150, distanceKm: 110 },
        { village: "Kanpur Processing Hub", farmerName: "Destination (ABC Foods)", quantity: 800, distanceKm: 185 },
      ],
      aggregatedSavings: {
        individualCost: 32000,
        aggregatedCost: 21500,
        savingsAmount: 10500,
      },
    };
  },

  calculateNetRealization(
    askingPricePerQuintal: number = 2880,
    quantityQuintals: number = 250,
    transportationCost: number = 18500,
    storageCost: number = 5000,
    otherCharges: number = 2500,
    transportPaidBy: PayerOption = "Buyer Pays"
  ): NetRealizationData {
    const grossValue = askingPricePerQuintal * quantityQuintals;
    let actualTransportDeduction = 0;

    if (transportPaidBy === "Seller Pays") {
      actualTransportDeduction = transportationCost;
    } else if (transportPaidBy === "Shared 50/50") {
      actualTransportDeduction = transportationCost / 2;
    } else {
      // "Buyer Pays" or "Included in Price" -> 0 deduction for seller beyond listed price
      actualTransportDeduction = 0;
    }

    const expectedNetTotal = grossValue - actualTransportDeduction - storageCost - otherCharges;
    const expectedNetPerQuintal = Math.round((expectedNetTotal / quantityQuintals) * 100) / 100;

    return {
      askingPricePerQuintal,
      quantityQuintals,
      grossValue,
      transportationCost,
      storageCost,
      otherCharges,
      expectedNetTotal,
      expectedNetPerQuintal,
      transportPaidBy,
    };
  },
};
