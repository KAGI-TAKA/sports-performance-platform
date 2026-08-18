-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('PROGRESS_BASED', 'BENCHMARK_BASED');

-- CreateEnum
CREATE TYPE "TrainingPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- DropIndex
DROP INDEX "session_log_scheduleSessionId_key";

-- DropIndex
DROP INDEX "test_item_organizationId_physicalComponent_idx";

-- AlterTable
ALTER TABLE "assessment" ADD COLUMN     "assessmentType" "AssessmentType" NOT NULL DEFAULT 'BENCHMARK_BASED';

-- AlterTable
ALTER TABLE "athlete" ADD COLUMN     "trainingLevel" "TrainingLevel" NOT NULL DEFAULT 'BEGINNER';

-- AlterTable
ALTER TABLE "test_item" ADD COLUMN     "componentId" TEXT,
ALTER COLUMN "physicalComponent" DROP NOT NULL;

-- AlterTable
ALTER TABLE "training_exercise" ADD COLUMN     "exerciseId" TEXT;

-- AlterTable
ALTER TABLE "training_plan" ADD COLUMN     "status" "TrainingPlanStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "assessment_component" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_component_organizationId_idx" ON "assessment_component"("organizationId");

-- CreateIndex
CREATE INDEX "exercise_organizationId_idx" ON "exercise"("organizationId");

-- CreateIndex
CREATE INDEX "session_log_scheduleSessionId_idx" ON "session_log"("scheduleSessionId");

-- CreateIndex
CREATE INDEX "test_item_organizationId_idx" ON "test_item"("organizationId");

-- CreateIndex
CREATE INDEX "test_item_componentId_idx" ON "test_item"("componentId");

-- CreateIndex
CREATE INDEX "training_exercise_trainingPlanId_idx" ON "training_exercise"("trainingPlanId");

-- CreateIndex
CREATE INDEX "training_exercise_exerciseId_idx" ON "training_exercise"("exerciseId");

-- AddForeignKey
ALTER TABLE "assessment_component" ADD CONSTRAINT "assessment_component_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_item" ADD CONSTRAINT "test_item_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "assessment_component"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_exercise" ADD CONSTRAINT "training_exercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
