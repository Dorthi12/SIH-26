/*
  Warnings:

  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('FARMER', 'BUYER', 'TRADER', 'WHOLESALER', 'EXPORTER', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingGrade" AS ENUM ('GRADE_A', 'GRADE_B', 'STANDARD');

-- CreateEnum
CREATE TYPE "OrganicStatus" AS ENUM ('VERIFIED_ORGANIC', 'CLAIMED_ORGANIC', 'CONVENTIONAL');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DealPaymentState" AS ENUM ('PENDING', 'PROTECTION_REQUESTED', 'PAYMENT_PROTECTED', 'AWAITING_DELIVERY', 'DELIVERY_SUBMITTED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('FOOD_PROCESSOR', 'WHOLESALER', 'EXPORTER', 'RETAIL_CHAIN', 'INSTITUTIONAL_BUYER', 'PRIVATE_AGRO_CO');

-- CreateEnum
CREATE TYPE "CropSeason" AS ENUM ('KHARIF', 'RABI', 'ZAID', 'ALL_SEASON');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isEmailVerified",
DROP COLUMN "verificationToken",
ADD COLUMN     "occupation" "Occupation" DEFAULT 'FARMER';

-- CreateTable
CREATE TABLE "Commodity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "category" TEXT NOT NULL,
    "season" "CropSeason" NOT NULL DEFAULT 'ALL_SEASON',
    "mspPerQuintal" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commodity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiMarket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandiMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiPrice" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "mandiId" TEXT NOT NULL,
    "modalPrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "arrivalTonnes" DOUBLE PRECISION,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MandiPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiCropListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "variety" TEXT,
    "quantityQuintals" DOUBLE PRECISION NOT NULL,
    "askingPricePerQuintal" DOUBLE PRECISION NOT NULL,
    "grade" "ListingGrade" NOT NULL DEFAULT 'STANDARD',
    "moisturePercentage" DOUBLE PRECISION,
    "organicStatus" "OrganicStatus" NOT NULL DEFAULT 'CONVENTIONAL',
    "organicCertificateNo" TEXT,
    "harvestDate" TIMESTAMP(3),
    "productionMethod" TEXT,
    "productionCostPerQuintal" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "locationState" TEXT,
    "locationDistrict" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedCrop" BOOLEAN NOT NULL DEFAULT false,
    "verifiedFarmer" BOOLEAN NOT NULL DEFAULT false,
    "evidenceStatus" JSONB,
    "fairPriceRange" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandiCropListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiBuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" "BuyerType" NOT NULL DEFAULT 'WHOLESALER',
    "location" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "completedTransactions" INTEGER NOT NULL DEFAULT 0,
    "paymentReliabilityPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPaymentDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transparencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeDisputes" INTEGER NOT NULL DEFAULT 0,
    "resolvedDisputes" INTEGER NOT NULL DEFAULT 0,
    "reputationBreakdown" JSONB,
    "purchaseCategories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandiBuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiOffer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "quantityQuintals" DOUBLE PRECISION NOT NULL,
    "offeredPricePerQuintal" DOUBLE PRECISION NOT NULL,
    "qualityCondition" TEXT,
    "moistureCondition" TEXT,
    "pickupType" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 3,
    "transportResponsibility" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "negotiationHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandiOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MandiDeal" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "buyerProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT,
    "quantityQuintals" DOUBLE PRECISION NOT NULL,
    "pricePerQuintal" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "qualityGrade" TEXT,
    "moisturePercentage" DOUBLE PRECISION,
    "pickupLocation" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "transportResponsibility" TEXT,
    "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "farmerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "termsLocked" BOOLEAN NOT NULL DEFAULT false,
    "paymentState" "DealPaymentState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandiDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Commodity_name_idx" ON "Commodity"("name");

-- CreateIndex
CREATE INDEX "Commodity_season_idx" ON "Commodity"("season");

-- CreateIndex
CREATE UNIQUE INDEX "Commodity_name_variety_key" ON "Commodity"("name", "variety");

-- CreateIndex
CREATE INDEX "MandiMarket_state_idx" ON "MandiMarket"("state");

-- CreateIndex
CREATE INDEX "MandiMarket_district_idx" ON "MandiMarket"("district");

-- CreateIndex
CREATE UNIQUE INDEX "MandiMarket_name_district_state_key" ON "MandiMarket"("name", "district", "state");

-- CreateIndex
CREATE INDEX "MandiPrice_commodityId_idx" ON "MandiPrice"("commodityId");

-- CreateIndex
CREATE INDEX "MandiPrice_mandiId_idx" ON "MandiPrice"("mandiId");

-- CreateIndex
CREATE INDEX "MandiPrice_arrivalDate_idx" ON "MandiPrice"("arrivalDate");

-- CreateIndex
CREATE UNIQUE INDEX "MandiPrice_commodityId_mandiId_arrivalDate_key" ON "MandiPrice"("commodityId", "mandiId", "arrivalDate");

-- CreateIndex
CREATE INDEX "MandiCropListing_userId_idx" ON "MandiCropListing"("userId");

-- CreateIndex
CREATE INDEX "MandiCropListing_commodityId_idx" ON "MandiCropListing"("commodityId");

-- CreateIndex
CREATE INDEX "MandiCropListing_isActive_idx" ON "MandiCropListing"("isActive");

-- CreateIndex
CREATE INDEX "MandiCropListing_createdAt_idx" ON "MandiCropListing"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MandiBuyerProfile_userId_key" ON "MandiBuyerProfile"("userId");

-- CreateIndex
CREATE INDEX "MandiBuyerProfile_type_idx" ON "MandiBuyerProfile"("type");

-- CreateIndex
CREATE INDEX "MandiBuyerProfile_verified_idx" ON "MandiBuyerProfile"("verified");

-- CreateIndex
CREATE INDEX "MandiOffer_listingId_idx" ON "MandiOffer"("listingId");

-- CreateIndex
CREATE INDEX "MandiOffer_buyerProfileId_idx" ON "MandiOffer"("buyerProfileId");

-- CreateIndex
CREATE INDEX "MandiOffer_userId_idx" ON "MandiOffer"("userId");

-- CreateIndex
CREATE INDEX "MandiOffer_status_idx" ON "MandiOffer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MandiDeal_offerId_key" ON "MandiDeal"("offerId");

-- CreateIndex
CREATE INDEX "MandiDeal_buyerProfileId_idx" ON "MandiDeal"("buyerProfileId");

-- CreateIndex
CREATE INDEX "MandiDeal_userId_idx" ON "MandiDeal"("userId");

-- CreateIndex
CREATE INDEX "MandiDeal_paymentState_idx" ON "MandiDeal"("paymentState");

-- AddForeignKey
ALTER TABLE "MandiPrice" ADD CONSTRAINT "MandiPrice_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "Commodity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiPrice" ADD CONSTRAINT "MandiPrice_mandiId_fkey" FOREIGN KEY ("mandiId") REFERENCES "MandiMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiCropListing" ADD CONSTRAINT "MandiCropListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiCropListing" ADD CONSTRAINT "MandiCropListing_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "Commodity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiBuyerProfile" ADD CONSTRAINT "MandiBuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiOffer" ADD CONSTRAINT "MandiOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MandiCropListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiOffer" ADD CONSTRAINT "MandiOffer_buyerProfileId_fkey" FOREIGN KEY ("buyerProfileId") REFERENCES "MandiBuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiOffer" ADD CONSTRAINT "MandiOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiDeal" ADD CONSTRAINT "MandiDeal_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "MandiOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiDeal" ADD CONSTRAINT "MandiDeal_buyerProfileId_fkey" FOREIGN KEY ("buyerProfileId") REFERENCES "MandiBuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MandiDeal" ADD CONSTRAINT "MandiDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
