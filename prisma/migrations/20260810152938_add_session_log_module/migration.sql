-- CreateTable
CREATE TABLE "session_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "scheduleSessionId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activitiesDone" TEXT NOT NULL,
    "coachFeedback" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_log_scheduleSessionId_key" ON "session_log"("scheduleSessionId");

-- CreateIndex
CREATE INDEX "session_log_organizationId_athleteId_idx" ON "session_log"("organizationId", "athleteId");

-- AddForeignKey
ALTER TABLE "session_log" ADD CONSTRAINT "session_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_log" ADD CONSTRAINT "session_log_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_log" ADD CONSTRAINT "session_log_scheduleSessionId_fkey" FOREIGN KEY ("scheduleSessionId") REFERENCES "schedule_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_log" ADD CONSTRAINT "session_log_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
