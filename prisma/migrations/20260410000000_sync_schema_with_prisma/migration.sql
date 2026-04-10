-- Bring DB schema in line with current Prisma models.

-- User columns added after initial migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscription_status" TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_founding_member" BOOLEAN NOT NULL DEFAULT false;

-- Unique index for optional Stripe customer ID
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- Client table
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- Invoice -> Client relation
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "client_id" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Client_user_id_fkey'
  ) THEN
    ALTER TABLE "Client"
      ADD CONSTRAINT "Client_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_client_id_fkey'
  ) THEN
    ALTER TABLE "Invoice"
      ADD CONSTRAINT "Invoice_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
