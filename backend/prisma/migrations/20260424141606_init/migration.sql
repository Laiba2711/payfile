-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BTC', 'USDT');

-- CreateEnum
CREATE TYPE "Network" AS ENUM ('NONE', 'TRC20');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('active', 'expired', 'sold');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'confirmed', 'expired');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "sharePassword" TEXT,
    "shareExpiresAt" TIMESTAMP(3),
    "previewPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BTC',
    "network" "Network" NOT NULL DEFAULT 'NONE',
    "address" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" "SaleStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "bitcartId" TEXT,
    "bitcartPayoutId" TEXT,
    "adminBitcartPayoutId" TEXT,
    "sellerPayoutProcessed" BOOLEAN NOT NULL DEFAULT false,
    "adminPayoutProcessed" BOOLEAN NOT NULL DEFAULT false,
    "payoutsProcessed" BOOLEAN NOT NULL DEFAULT false,
    "checkoutUrl" TEXT,
    "pendingExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BTC',
    "purchaseId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "adminAddress" TEXT NOT NULL DEFAULT '',
    "payoutSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "adminBtcAddress" TEXT NOT NULL DEFAULT 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    "adminUsdtAddress" TEXT NOT NULL DEFAULT '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    "adminUsdtTrc20Address" TEXT NOT NULL DEFAULT '',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "btcWalletId" TEXT NOT NULL DEFAULT '',
    "usdtTrc20WalletId" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "Sale_sellerId_idx" ON "Sale"("sellerId");

-- CreateIndex
CREATE INDEX "Sale_fileId_idx" ON "Sale"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_tokenId_key" ON "Purchase"("tokenId");

-- CreateIndex
CREATE INDEX "Purchase_sellerId_status_idx" ON "Purchase"("sellerId", "status");

-- CreateIndex
CREATE INDEX "Purchase_bitcartId_idx" ON "Purchase"("bitcartId");

-- CreateIndex
CREATE INDEX "Purchase_pendingExpiresAt_idx" ON "Purchase"("pendingExpiresAt");

-- CreateIndex
CREATE INDEX "Purchase_createdAt_idx" ON "Purchase"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Income_createdAt_currency_idx" ON "Income"("createdAt", "currency");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
