/*
  Warnings:

  - Added the required column `felt` to the `Earthquake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Earthquake` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Earthquake_geom_gist_idx";

-- AlterTable
ALTER TABLE "Earthquake" ADD COLUMN     "felt" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL;
