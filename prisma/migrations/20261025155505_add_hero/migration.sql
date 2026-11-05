-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profileImage" TEXT,
    "profileImagePublicId" TEXT,
    "primaryButtonText" TEXT NOT NULL DEFAULT 'View My Projects',
    "primaryButtonLink" TEXT NOT NULL DEFAULT '#projects',
    "secondaryButtonText" TEXT NOT NULL DEFAULT 'Contact Me',
    "secondaryButtonLink" TEXT NOT NULL DEFAULT '#contact',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);
