-- CreateEnum
CREATE TYPE "AthletePosition" AS ENUM ('POINT_GUARD', 'SHOOTING_GUARD', 'SMALL_FORWARD', 'POWER_FORWARD', 'CENTER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PhysicalComponent" AS ENUM ('FLEXIBILITY', 'SPEED', 'POWER', 'AGILITY', 'MUSCULAR_ENDURANCE', 'ANAEROBIC_ENDURANCE', 'AEROBIC_ENDURANCE');

-- CreateEnum
CREATE TYPE "ScoreDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('CM', 'M', 'KG', 'SECOND', 'REPETITION', 'ML_KG_MIN', 'SCORE');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "activeOrganizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'assistant_coach',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'assistant_coach',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inviterId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "position" "AthletePosition" NOT NULL DEFAULT 'UNSPECIFIED',
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "heightCm" DECIMAL(5,1),
    "weightKg" DECIMAL(5,1),
    "wingspanCm" DECIMAL(5,1),
    "competitionLevel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_injury_history" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,
    "description" TEXT,
    "injuryDate" TIMESTAMP(3) NOT NULL,
    "recoveredAt" TIMESTAMP(3),
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_injury_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_item" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "physicalComponent" "PhysicalComponent" NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "scoreDirection" "ScoreDirection" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "createdByMemberId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "overallScore" DECIMAL(5,2),
    "overallGrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_result_item" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "testItemId" TEXT NOT NULL,
    "rawValue" DECIMAL(8,2) NOT NULL,
    "score" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_result_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "testItemId" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "gender" "Gender",
    "position" "AthletePosition",
    "competitionLevel" TEXT,
    "thresholdA" DECIMAL(8,2) NOT NULL,
    "thresholdB" DECIMAL(8,2) NOT NULL,
    "thresholdC" DECIMAL(8,2) NOT NULL,
    "thresholdD" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_analysis" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "componentScores" JSONB NOT NULL,
    "bestComponent" "PhysicalComponent",
    "weakestComponents" "PhysicalComponent"[],
    "insightText" TEXT NOT NULL,
    "recommendationText" TEXT NOT NULL,
    "ruleEngineVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "generatedByMemberId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "athlete_organizationId_idx" ON "athlete"("organizationId");

-- CreateIndex
CREATE INDEX "athlete_injury_history_athleteId_idx" ON "athlete_injury_history"("athleteId");

-- CreateIndex
CREATE INDEX "test_item_organizationId_physicalComponent_idx" ON "test_item"("organizationId", "physicalComponent");

-- CreateIndex
CREATE INDEX "assessment_organizationId_idx" ON "assessment"("organizationId");

-- CreateIndex
CREATE INDEX "assessment_athleteId_assessmentDate_idx" ON "assessment"("athleteId", "assessmentDate");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_result_item_assessmentId_testItemId_key" ON "assessment_result_item"("assessmentId", "testItemId");

-- CreateIndex
CREATE INDEX "benchmark_organizationId_testItemId_idx" ON "benchmark"("organizationId", "testItemId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_analysis_assessmentId_key" ON "assessment_analysis"("assessmentId");

-- CreateIndex
CREATE INDEX "report_assessmentId_isLatest_idx" ON "report"("assessmentId", "isLatest");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete" ADD CONSTRAINT "athlete_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_injury_history" ADD CONSTRAINT "athlete_injury_history_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_item" ADD CONSTRAINT "test_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_result_item" ADD CONSTRAINT "assessment_result_item_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_result_item" ADD CONSTRAINT "assessment_result_item_testItemId_fkey" FOREIGN KEY ("testItemId") REFERENCES "test_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark" ADD CONSTRAINT "benchmark_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark" ADD CONSTRAINT "benchmark_testItemId_fkey" FOREIGN KEY ("testItemId") REFERENCES "test_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_analysis" ADD CONSTRAINT "assessment_analysis_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_generatedByMemberId_fkey" FOREIGN KEY ("generatedByMemberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
