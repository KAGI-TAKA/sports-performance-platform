import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_COMPONENTS = [
  { name: "Flexibility", description: "Kelentukan & jangkauan gerak sendi", order: 1, legacyEnum: "FLEXIBILITY" },
  { name: "Speed", description: "Kecepatan gerak & akselerasi", order: 2, legacyEnum: "SPEED" },
  { name: "Power", description: "Daya ledak otot & eksploftivitas", order: 3, legacyEnum: "POWER" },
  { name: "Agility", description: "Kelincahan & perubahan arah gerak", order: 4, legacyEnum: "AGILITY" },
  { name: "Muscular Endurance", description: "Daya tahan otot terhadap beban berulang", order: 5, legacyEnum: "MUSCULAR_ENDURANCE" },
  { name: "Anaerobic Endurance", description: "Daya tahan anaerobik kapasitas tinggi", order: 6, legacyEnum: "ANAEROBIC_ENDURANCE" },
  { name: "Aerobic Endurance", description: "Daya tahan jantung & paru-paru (Kardiovaskular)", order: 7, legacyEnum: "AEROBIC_ENDURANCE" },
];

const DEFAULT_EXERCISES = [
  { name: "Barbell Back Squat", category: "Strength", description: "Gerakan beban utama untuk ekstensi panggul dan lutut." },
  { name: "Push Up", category: "Strength", description: "Latihan kekuatan dorong tubuh bagian atas." },
  { name: "Plank", category: "Core", description: "Latihan isometrik stabilitas bagian inti tubuh." },
  { name: "Sprint 20m", category: "Speed", description: "Latihan akselerasi kecepatan tinggi." },
  { name: "Vertical Jump", category: "Plyometrics", description: "Latihan daya ledak dan loncatan vertikal." },
  { name: "Bleep Test / Shuttle Run", category: "Cardio", description: "Latihan daya tahan aerobik bertingkat." },
];

async function main() {
  console.log("🚀 Starting data migration: Seeding AssessmentComponents & Master Exercises...");

  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  console.log(`Found ${orgs.length} organization(s).`);

  for (const org of orgs) {
    console.log(`\nProcessing Org: "${org.name}" (${org.id})`);

    // 1. Seed AssessmentComponents
    const componentMap: Record<string, string> = {};

    for (const comp of DEFAULT_COMPONENTS) {
      let existing = await prisma.assessmentComponent.findFirst({
        where: { organizationId: org.id, name: comp.name },
      });

      if (!existing) {
        existing = await prisma.assessmentComponent.create({
          data: {
            organizationId: org.id,
            name: comp.name,
            description: comp.description,
            order: comp.order,
            isActive: true,
          },
        });
        console.log(`  + Created AssessmentComponent: "${comp.name}" (${existing.id})`);
      } else {
        console.log(`  = Found existing AssessmentComponent: "${comp.name}" (${existing.id})`);
      }

      componentMap[comp.legacyEnum] = existing.id;
    }

    // 2. Link existing TestItems to componentId
    const testItems = await prisma.testItem.findMany({
      where: { organizationId: org.id, componentId: null },
    });

    for (const item of testItems) {
      if (item.physicalComponent && componentMap[item.physicalComponent]) {
        await prisma.testItem.update({
          where: { id: item.id },
          data: { componentId: componentMap[item.physicalComponent] },
        });
        console.log(`  -> Linked TestItem "${item.name}" to Component ID ${componentMap[item.physicalComponent]}`);
      }
    }

    // 3. Seed Master Exercises
    for (const ex of DEFAULT_EXERCISES) {
      const existingEx = await prisma.exercise.findFirst({
        where: { organizationId: org.id, name: ex.name },
      });

      if (!existingEx) {
        await prisma.exercise.create({
          data: {
            organizationId: org.id,
            name: ex.name,
            category: ex.category,
            description: ex.description,
            isActive: true,
          },
        });
        console.log(`  + Created Master Exercise: "${ex.name}"`);
      }
    }
  }

  console.log("\n✅ Data migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Data migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
