/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add code column with a temporary default, then update existing rows, then drop default
ALTER TABLE "tables" ADD COLUMN "code" TEXT NOT NULL DEFAULT '000';

-- Fill existing rows with sequential codes (001, 002, ...)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM "tables"
)
UPDATE "tables"
SET "code" = LPAD(ranked.rn::TEXT, 3, '0')
FROM ranked
WHERE "tables".id = ranked.id;

-- Remove the temporary default
ALTER TABLE "tables" ALTER COLUMN "code" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "tables_code_key" ON "tables"("code");
