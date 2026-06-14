-- Migration: Add 'completed' value to PurchaseStatus enum
-- The initial migration only included: 'pending', 'confirmed', 'expired'
-- The application code sets status = 'completed' after payouts succeed,
-- which caused: invalid input value for enum "PurchaseStatus": "completed"

ALTER TYPE "PurchaseStatus" ADD VALUE IF NOT EXISTS 'completed';
