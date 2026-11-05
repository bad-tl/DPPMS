-- CreateEnum
CREATE TYPE "AboutStrengthCategory" AS ENUM ('STRENGTH', 'VALUE', 'INTEREST');

-- CreateTable
CREATE TABLE "About" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL DEFAULT 'About Me',
    "subtitle" TEXT NOT NULL DEFAULT 'A little about who I am',
    "biography" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "professionalRole" TEXT,
    "professionalStatus" TEXT,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "projectsCompleted" INTEGER NOT NULL DEFAULT 0,
    "happyClients" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutHighlight" (
    "id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutStrength" (
    "id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "AboutStrengthCategory" NOT NULL DEFAULT 'STRENGTH',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutStrength_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "About_userId_key" ON "About"("userId");

-- CreateIndex
CREATE INDEX "About_userId_idx" ON "About"("userId");

-- CreateIndex
CREATE INDEX "AboutHighlight_aboutId_sortOrder_idx" ON "AboutHighlight"("aboutId", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutStrength_aboutId_sortOrder_idx" ON "AboutStrength"("aboutId", "sortOrder");

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutHighlight" ADD CONSTRAINT "AboutHighlight_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "About"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutStrength" ADD CONSTRAINT "AboutStrength_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "About"("id") ON DELETE CASCADE ON UPDATE CASCADE;
