/*
  Warnings:

  - Made the column `sizeBytes` on table `Ebook` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('EBOOK', 'DATASHEET', 'STANDARD_DRAWING', 'CODE_STANDARD');

-- AlterTable
ALTER TABLE "public"."Ebook" ADD COLUMN     "category" "public"."Category" NOT NULL DEFAULT 'EBOOK',
ALTER COLUMN "sizeBytes" SET NOT NULL,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
