/*
  Warnings:

  - You are about to drop the column `location` on the `Earthquake` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Earthquake_geom_gist_idx";

-- AlterTable
ALTER TABLE "Earthquake" DROP COLUMN "location";

-- Ganti tipe kolom geom dari geometry ke geography
ALTER TABLE "Earthquake" 
  ALTER COLUMN "geom" TYPE geography(Point,4326) 
  USING geom::geography;

-- Recreate spatial index
CREATE INDEX "Earthquake_geom_gist_idx" ON "Earthquake" USING GIST (geom);