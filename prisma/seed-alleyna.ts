import fs from "fs";
import path from "path";

// Load .env.local SEBELUM PrismaClient di-import
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { PrismaClient, PhysicalComponent, ScoreDirection, MeasurementUnit, Gender } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Cari atau buat organisasi default
  let org = await prisma.organization.findFirst({
    include: { members: true },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Power Up Private Training",
        slug: "power-up-private-training",
      },
      include: { members: true },
    });
  }

  let memberId = org.members[0]?.id;
  if (!memberId) {
    const user = await prisma.user.create({
      data: {
        name: "Coach Andi",
        email: "coach.andi@powerup.id",
      },
    });
    const member = await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "admin",
      },
    });
    memberId = member.id;
  }

  // 2. Buat profil atlet Alleyna Meliora Putri
  const athlete = await prisma.athlete.create({
    data: {
      organizationId: org.id,
      fullName: "Alleyna Meliora Putri",
      gender: Gender.FEMALE,
      dateOfBirth: new Date("2015-09-03"),
      competitionLevel: "Montville / Power Up Private Training",
      isActive: true,
    },
  });

  console.log("✅ Atlet berhasil dibuat:", athlete.fullName, "ID:", athlete.id);

  // 3. Buat item tes sesuai spreadsheet Power Up
  const testItemsConfig = [
    {
      physicalComponent: PhysicalComponent.FLEXIBILITY,
      name: "Sit and Reach",
      unit: MeasurementUnit.CM,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 9,
      benchmark: 15,
      score: 60.0,
    },
    {
      physicalComponent: PhysicalComponent.SPEED,
      name: "Sprint 20 meter",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      rawValue: 4.34,
      benchmark: 3.7,
      score: 85.25,
    },
    {
      physicalComponent: PhysicalComponent.POWER,
      name: "Vertical Jump",
      unit: MeasurementUnit.CM,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 33,
      benchmark: 61,
      score: 54.1,
    },
    {
      physicalComponent: PhysicalComponent.AGILITY,
      name: "T -Test",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      rawValue: 13.5,
      benchmark: 10.5,
      score: 77.78,
    },
    {
      physicalComponent: PhysicalComponent.MUSCULAR_ENDURANCE,
      name: "Wall Squat",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 60,
      benchmark: 60,
      score: 100.0,
    },
    {
      physicalComponent: PhysicalComponent.MUSCULAR_ENDURANCE,
      name: "Sit Up",
      unit: MeasurementUnit.REPETITION,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 33,
      benchmark: 44,
      score: 75.0,
    },
    {
      physicalComponent: PhysicalComponent.MUSCULAR_ENDURANCE,
      name: "Knee Push-up",
      unit: MeasurementUnit.REPETITION,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 8,
      benchmark: 20,
      score: 40.0,
    },
    {
      physicalComponent: PhysicalComponent.ANAEROBIC_ENDURANCE,
      name: "Lari 300 meter",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      rawValue: 97.0,
      benchmark: 47.9,
      score: 49.38,
    },
    {
      physicalComponent: PhysicalComponent.AEROBIC_ENDURANCE,
      name: "Yo yo IR level 1",
      unit: MeasurementUnit.ML_KG_MIN,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      rawValue: 38.8,
      benchmark: 44.8,
      score: 86.61,
    },
  ];

  const resultItemsData = [];

  for (const item of testItemsConfig) {
    let testItem = await prisma.testItem.findFirst({
      where: { organizationId: org.id, name: item.name },
    });

    if (!testItem) {
      testItem = await prisma.testItem.create({
        data: {
          organizationId: org.id,
          physicalComponent: item.physicalComponent,
          name: item.name,
          unit: item.unit,
          scoreDirection: item.scoreDirection,
        },
      });

      await prisma.benchmark.create({
        data: {
          organizationId: org.id,
          testItemId: testItem.id,
          ageMin: 8,
          ageMax: 12,
          thresholdA: item.benchmark,
          thresholdB: item.benchmark * 0.8,
          thresholdC: item.benchmark * 0.6,
          thresholdD: item.benchmark * 0.4,
        },
      });
    }

    resultItemsData.push({
      testItemId: testItem.id,
      rawValue: item.rawValue,
      score: item.score,
    });
  }

  // 4. Buat Assessment & AssessmentAnalysis
  const assessment = await prisma.assessment.create({
    data: {
      organizationId: org.id,
      athleteId: athlete.id,
      createdByMemberId: memberId,
      assessmentDate: new Date(),
      status: "COMPLETED",
      overallScore: 69.79,
      overallGrade: "C+",
      resultItems: {
        create: resultItemsData,
      },
    },
  });

  const componentScores = {
    FLEXIBILITY: 60.0,
    SPEED: 85.25,
    POWER: 54.1,
    AGILITY: 77.78,
    MUSCULAR_ENDURANCE: 71.67,
    ANAEROBIC_ENDURANCE: 49.38,
    AEROBIC_ENDURANCE: 86.61,
  };

  await prisma.assessmentAnalysis.create({
    data: {
      assessmentId: assessment.id,
      componentScores: JSON.stringify(componentScores),
      bestComponent: PhysicalComponent.AEROBIC_ENDURANCE,
      weakestComponents: [PhysicalComponent.ANAEROBIC_ENDURANCE, PhysicalComponent.POWER],
      insightText:
        "Alleyna menunjukkan potensi luar biasa pada daya tahan aerobik (86.61%) dan kecepatan sprint 20m (85.25%), namun memerlukan peningkatan pada daya tahan anaerobik (Lari 300m) dan power eksplosif (Vertical Jump).",
      recommendationText:
        "Rekomendasi latihan: Plyometrics ringan (jump rope/box hop), latihan Knee Push-up bertahap 3-4 set, dan sprint interval 50m-100m untuk meningkatkan kapasitas anaerobik & power.",
      ruleEngineVersion: "v1.0",
    },
  });

  console.log("🎉 SUCCESS! Assessment Alleyna Meliora Putri berhasil dimasukkan ke PostgreSQL dengan skor 69.79%!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding Alleyna:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
