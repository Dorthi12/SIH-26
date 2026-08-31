/*
  Warnings:

  - You are about to drop the column `awsS3ObjectKey` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `awsS3ObjectKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AIModelType" ADD VALUE 'DISEASE_DETECTION';

-- AlterTable
ALTER TABLE "AIAnalysis" ADD COLUMN     "diseaseResult" JSONB;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "awsS3ObjectKey",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "awsS3ObjectKey",
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preSignedUrl" TEXT NOT NULL DEFAULT 'https://netravaah-bucket.s3.ap-south-1.amazonaws.com/profile/default.png',
ADD COLUMN     "verificationToken" TEXT;

-- CreateTable
CREATE TABLE "CropRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "topK" INTEGER NOT NULL DEFAULT 5,
    "recommendations" JSONB NOT NULL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YieldPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "cropYear" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB NOT NULL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "warnings" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YieldPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseasePrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL,
    "crop" TEXT,
    "disease" TEXT,
    "isHealthy" BOOLEAN,
    "confidence" DOUBLE PRECISION,
    "responsePayload" JSONB NOT NULL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseasePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZeroProductionRisk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "rawProbability" DOUBLE PRECISION NOT NULL,
    "calibratedProbability" DOUBLE PRECISION NOT NULL,
    "zeroProductionFlag" BOOLEAN NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB NOT NULL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZeroProductionRisk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CropRecommendation_userId_idx" ON "CropRecommendation"("userId");

-- CreateIndex
CREATE INDEX "CropRecommendation_userId_createdAt_idx" ON "CropRecommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "YieldPrediction_userId_idx" ON "YieldPrediction"("userId");

-- CreateIndex
CREATE INDEX "YieldPrediction_userId_createdAt_idx" ON "YieldPrediction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DiseasePrediction_userId_idx" ON "DiseasePrediction"("userId");

-- CreateIndex
CREATE INDEX "DiseasePrediction_userId_createdAt_idx" ON "DiseasePrediction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ZeroProductionRisk_userId_idx" ON "ZeroProductionRisk"("userId");

-- CreateIndex
CREATE INDEX "ZeroProductionRisk_userId_createdAt_idx" ON "ZeroProductionRisk"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldPrediction" ADD CONSTRAINT "YieldPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseasePrediction" ADD CONSTRAINT "DiseasePrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZeroProductionRisk" ADD CONSTRAINT "ZeroProductionRisk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
