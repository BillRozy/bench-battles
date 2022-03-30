/*
  Warnings:

  - You are about to drop the column `svVer` on the `Bench` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bench" DROP COLUMN "svVer",
ADD COLUMN     "swVer" TEXT;

-- CreateTable
CREATE TABLE "Version" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "Versions_pkey" PRIMARY KEY ("id")
);
