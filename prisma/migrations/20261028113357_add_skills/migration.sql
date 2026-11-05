-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('PROGRAMMING_LANGUAGES', 'FRAMEWORKS', 'DATABASES', 'TOOLS_AND_PLATFORMS', 'TECHNICAL', 'PROBLEM_SOLVING', 'SOFT_SKILLS', 'OTHER');

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "description" TEXT,
    "proficiency" INTEGER NOT NULL DEFAULT 70,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "iconPublicId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Skill_userId_category_sortOrder_idx" ON "Skill"("userId", "category", "sortOrder");

-- CreateIndex
CREATE INDEX "Skill_userId_isVisible_idx" ON "Skill"("userId", "isVisible");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
