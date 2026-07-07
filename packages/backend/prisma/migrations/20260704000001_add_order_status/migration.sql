-- Rename status to payment_status, add order_status
ALTER TABLE "transactions" RENAME COLUMN "status" TO "payment_status";
ALTER TABLE "transactions" ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID';
ALTER TABLE "transactions" ADD COLUMN "order_status" VARCHAR NOT NULL DEFAULT 'PENDING';
