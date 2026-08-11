-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "schedule_session" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_session_athlete" (
    "sessionId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,

    CONSTRAINT "schedule_session_athlete_pkey" PRIMARY KEY ("sessionId","athleteId")
);

-- CreateIndex
CREATE INDEX "schedule_session_organizationId_startTime_idx" ON "schedule_session"("organizationId", "startTime");

-- AddForeignKey
ALTER TABLE "schedule_session" ADD CONSTRAINT "schedule_session_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_session" ADD CONSTRAINT "schedule_session_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_session_athlete" ADD CONSTRAINT "schedule_session_athlete_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "schedule_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_session_athlete" ADD CONSTRAINT "schedule_session_athlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
