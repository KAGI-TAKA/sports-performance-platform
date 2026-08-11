-- CreateTable
CREATE TABLE "training_plan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "athleteId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_exercise" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "sets" INTEGER,
    "reps" TEXT,
    "restSeconds" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_plan_organizationId_idx" ON "training_plan"("organizationId");

-- AddForeignKey
ALTER TABLE "training_plan" ADD CONSTRAINT "training_plan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan" ADD CONSTRAINT "training_plan_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_exercise" ADD CONSTRAINT "training_exercise_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
