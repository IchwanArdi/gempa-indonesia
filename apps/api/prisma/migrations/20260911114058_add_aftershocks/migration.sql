-- AlterTable
ALTER TABLE "Earthquake" ADD COLUMN     "isAftershock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainshockId" TEXT;

-- CreateIndex
CREATE INDEX "Earthquake_mainshockId_idx" ON "Earthquake"("mainshockId");

-- AddForeignKey
ALTER TABLE "Earthquake" ADD CONSTRAINT "Earthquake_mainshockId_fkey" FOREIGN KEY ("mainshockId") REFERENCES "Earthquake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
