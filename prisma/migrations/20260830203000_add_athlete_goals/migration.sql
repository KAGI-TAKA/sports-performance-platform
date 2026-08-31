-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "athlete_goal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "testItemId" TEXT NOT NULL,
    "createdByMemberId" TEXT NOT NULL,
    "title" TEXT,
    "baselineValue" DECIMAL(8,2) NOT NULL,
    "targetValue" DECIMAL(8,2) NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "achievedAt" TIMESTAMP(3),
    "achievedAssessmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "athlete_goal_organizationId_athleteId_idx" ON "athlete_goal"("organizationId", "athleteId");

-- CreateIndex
CREATE INDEX "athlete_goal_athleteId_testItemId_status_idx" ON "athlete_goal"("athleteId", "testItemId", "status");

-- AddForeignKey
ALTER TABLE "athlete_goal" ADD CONSTRAINT "athlete_goal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_goal" ADD CONSTRAINT "athlete_goal_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_goal" ADD CONSTRAINT "athlete_goal_testItemId_fkey" FOREIGN KEY ("testItemId") REFERENCES "test_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_goal" ADD CONSTRAINT "athlete_goal_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_goal" ADD CONSTRAINT "athlete_goal_achievedAssessmentId_fkey" FOREIGN KEY ("achievedAssessmentId") REFERENCES "assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
