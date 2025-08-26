-- CreateEnum
CREATE TYPE "public"."StorageProvider" AS ENUM ('SUPABASE', 'DRIVE');

-- AlterTable
ALTER TABLE "public"."Ebook" ADD COLUMN     "driveCoverId" TEXT,
ADD COLUMN     "driveFileId" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "storage" "public"."StorageProvider" NOT NULL DEFAULT 'SUPABASE',
ALTER COLUMN "fileKey" DROP NOT NULL;
