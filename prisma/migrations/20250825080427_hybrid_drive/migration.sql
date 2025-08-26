-- AlterTable
ALTER TABLE "public"."Ebook" ALTER COLUMN "storage" SET DEFAULT 'DRIVE';

-- CreateIndex
CREATE INDEX "Ebook_category_visibility_createdAt_idx" ON "public"."Ebook"("category", "visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Ebook_storage_createdAt_idx" ON "public"."Ebook"("storage", "createdAt");

-- CreateIndex
CREATE INDEX "Ebook_driveFileId_idx" ON "public"."Ebook"("driveFileId");
