-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('UNMARKED', 'PRESENT', 'LATE', 'EXCUSED', 'ABSENT', 'RESCHEDULED');

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'UNMARKED',
    "checkInTime" TIMESTAMP(3),
    "notes" TEXT,
    "markedByMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_feedback" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "scheduleSessionId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "portalAccessId" TEXT NOT NULL,
    "coachMemberId" TEXT NOT NULL,
    "sessionRating" INTEGER NOT NULL,
    "communicationRating" INTEGER NOT NULL,
    "athleteAttentionRating" INTEGER NOT NULL,
    "comment" TEXT,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "headCoachNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_organizationId_sessionId_status_idx" ON "attendance"("organizationId", "sessionId", "status");

-- CreateIndex
CREATE INDEX "attendance_organizationId_athleteId_status_idx" ON "attendance"("organizationId", "athleteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessionId_athleteId_key" ON "attendance"("sessionId", "athleteId");

-- CreateIndex
CREATE INDEX "parent_feedback_organizationId_coachMemberId_createdAt_idx" ON "parent_feedback"("organizationId", "coachMemberId", "createdAt");

-- CreateIndex
CREATE INDEX "parent_feedback_organizationId_isReviewed_idx" ON "parent_feedback"("organizationId", "isReviewed");

-- CreateIndex
CREATE INDEX "parent_feedback_organizationId_athleteId_idx" ON "parent_feedback"("organizationId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_feedback_scheduleSessionId_athleteId_key" ON "parent_feedback"("scheduleSessionId", "athleteId");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "schedule_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_markedByMemberId_fkey" FOREIGN KEY ("markedByMemberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_feedback" ADD CONSTRAINT "parent_feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_feedback" ADD CONSTRAINT "parent_feedback_scheduleSessionId_fkey" FOREIGN KEY ("scheduleSessionId") REFERENCES "schedule_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_feedback" ADD CONSTRAINT "parent_feedback_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_feedback" ADD CONSTRAINT "parent_feedback_coachMemberId_fkey" FOREIGN KEY ("coachMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_feedback" ADD CONSTRAINT "parent_feedback_portalAccessId_fkey" FOREIGN KEY ("portalAccessId") REFERENCES "portal_access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
