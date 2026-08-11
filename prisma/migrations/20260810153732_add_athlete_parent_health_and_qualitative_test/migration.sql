-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('NUMERIC', 'QUALITATIVE');

-- AlterTable
ALTER TABLE "assessment_result_item" ADD COLUMN     "qualitativeValue" TEXT,
ALTER COLUMN "rawValue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "athlete" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "healthNotes" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentPhone" TEXT;

-- AlterTable
ALTER TABLE "test_item" ADD COLUMN     "testType" "TestType" NOT NULL DEFAULT 'NUMERIC';
