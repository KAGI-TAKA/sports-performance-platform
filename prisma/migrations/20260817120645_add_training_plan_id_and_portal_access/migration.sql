-- AlterTable
ALTER TABLE "schedule_session" ADD COLUMN     "trainingPlanId" TEXT;

-- CreateTable
CREATE TABLE "portal_access" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "createdByMemberId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "accessType" TEXT NOT NULL DEFAULT 'ATHLETE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_access_tokenHash_key" ON "portal_access"("tokenHash");

-- CreateIndex
CREATE INDEX "portal_access_organizationId_athleteId_idx" ON "portal_access"("organizationId", "athleteId");

-- CreateIndex
CREATE INDEX "portal_access_tokenHash_idx" ON "portal_access"("tokenHash");

-- CreateIndex
CREATE INDEX "schedule_session_trainingPlanId_idx" ON "schedule_session"("trainingPlanId");

-- AddForeignKey
ALTER TABLE "portal_access" ADD CONSTRAINT "portal_access_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_access" ADD CONSTRAINT "portal_access_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_access" ADD CONSTRAINT "portal_access_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_session" ADD CONSTRAINT "schedule_session_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
