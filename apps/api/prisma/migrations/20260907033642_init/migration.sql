-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "EarthquakeSource" AS ENUM ('BMKG', 'USGS');

-- CreateTable
CREATE TABLE "Earthquake" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "EarthquakeSource" NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "depthKm" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "geom" geometry(Point,4326),

    CONSTRAINT "Earthquake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Earthquake_occurredAt_idx" ON "Earthquake"("occurredAt");

-- CreateIndex
CREATE INDEX "Earthquake_magnitude_idx" ON "Earthquake"("magnitude");

-- CreateIndex
CREATE INDEX "Earthquake_source_idx" ON "Earthquake"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Earthquake_source_externalId_key" ON "Earthquake"("source", "externalId");

-- Create spatial index manually
CREATE INDEX "Earthquake_geom_gist_idx" ON "Earthquake" USING GIST ("geom");