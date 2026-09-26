import { PrismaClient, PhysicalComponent, ScoreDirection, MeasurementUnit } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDefaultTestItemsAndBenchmarks(organizationId: string) {
  const defaultItems = [
    {
      physicalComponent: PhysicalComponent.POWER,
      name: "Vertical Jump",
      unit: MeasurementUnit.CM,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 1,
      bm: { thresholdA: 65, thresholdB: 55, thresholdC: 45, thresholdD: 35 },
    },
    {
      physicalComponent: PhysicalComponent.POWER,
      name: "Standing Broad Jump",
      unit: MeasurementUnit.CM,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 2,
      bm: { thresholdA: 240, thresholdB: 210, thresholdC: 180, thresholdD: 150 },
    },
    {
      physicalComponent: PhysicalComponent.POWER,
      name: "Medicine Ball Throw",
      unit: MeasurementUnit.M,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 3,
      bm: { thresholdA: 5.5, thresholdB: 4.5, thresholdC: 3.5, thresholdD: 2.5 },
    },
    {
      physicalComponent: PhysicalComponent.SPEED,
      name: "30m Sprint",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      order: 4,
      bm: { thresholdA: 4.2, thresholdB: 4.6, thresholdC: 5.0, thresholdD: 5.5 },
    },
    {
      physicalComponent: PhysicalComponent.AGILITY,
      name: "Pro Agility Shuttle Run",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      order: 5,
      bm: { thresholdA: 4.5, thresholdB: 4.9, thresholdC: 5.3, thresholdD: 5.8 },
    },
    {
      physicalComponent: PhysicalComponent.FLEXIBILITY,
      name: "Sit and Reach",
      unit: MeasurementUnit.CM,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 6,
      bm: { thresholdA: 35, thresholdB: 28, thresholdC: 20, thresholdD: 12 },
    },
    {
      physicalComponent: PhysicalComponent.MUSCULAR_ENDURANCE,
      name: "Push-Up 1 Menit",
      unit: MeasurementUnit.REPETITION,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 7,
      bm: { thresholdA: 45, thresholdB: 35, thresholdC: 25, thresholdD: 15 },
    },
    {
      physicalComponent: PhysicalComponent.ANAEROBIC_ENDURANCE,
      name: "Repeated Sprint Ability (RSA)",
      unit: MeasurementUnit.SECOND,
      scoreDirection: ScoreDirection.LOWER_IS_BETTER,
      order: 8,
      bm: { thresholdA: 28.0, thresholdB: 30.5, thresholdC: 33.0, thresholdD: 36.0 },
    },
    {
      physicalComponent: PhysicalComponent.AEROBIC_ENDURANCE,
      name: "Yo-Yo Intermittent Recovery Test L1",
      unit: MeasurementUnit.SCORE,
      scoreDirection: ScoreDirection.HIGHER_IS_BETTER,
      order: 9,
      bm: { thresholdA: 16.5, thresholdB: 15.0, thresholdC: 13.5, thresholdD: 12.0 },
    },
  ];

  // Ensure default BenchmarkProfile exists
  let defaultProfile = await prisma.benchmarkProfile.findFirst({
    where: { organizationId, isDefault: true },
  });

  if (!defaultProfile) {
    defaultProfile = await prisma.benchmarkProfile.create({
      data: {
        organizationId,
        name: "Standar Acuan Fisik Nasional (Universal)",
        description: "Benchmark acuan standar fisik atletik umum untuk pembinaan performa olahraga.",
        gender: null,
        ageMin: 12,
        ageMax: 25,
        isDefault: true,
        isActive: true,
      },
    });
  }

  for (const item of defaultItems) {
    let existingItem = await prisma.testItem.findFirst({
      where: { organizationId, name: item.name },
    });

    if (!existingItem) {
      existingItem = await prisma.testItem.create({
        data: {
          organizationId,
          physicalComponent: item.physicalComponent,
          name: item.name,
          unit: item.unit,
          scoreDirection: item.scoreDirection,
          order: item.order,
        },
      });
    }

    const existingBm = await prisma.benchmark.findFirst({
      where: { organizationId, testItemId: existingItem.id },
    });

    if (!existingBm) {
      await prisma.benchmark.create({
        data: {
          organizationId,
          testItemId: existingItem.id,
          benchmarkProfileId: defaultProfile.id,
          ageMin: 12,
          ageMax: 25,
          thresholdA: item.bm.thresholdA,
          thresholdB: item.bm.thresholdB,
          thresholdC: item.bm.thresholdC,
          thresholdD: item.bm.thresholdD,
        },
      });
    } else if (!existingBm.benchmarkProfileId) {
      await prisma.benchmark.update({
        where: { id: existingBm.id },
        data: { benchmarkProfileId: defaultProfile.id },
      });
    }
  }
}
