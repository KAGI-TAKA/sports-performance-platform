import { prisma } from "../src/lib/prisma";
import { resolveAthletePathway } from "../src/lib/athlete-pathway";

async function main() {
  const athletes = await prisma.athlete.findMany();
  let count = 0;
  for (const a of athletes) {
    const pathway = resolveAthletePathway(a);
    const comp = (a.competitionLevel || "").trim();
    if (!comp.startsWith("YAP") && !comp.startsWith("MFD")) {
      const levelPart = comp || "Pemula";
      const newComp = `${pathway} • ${levelPart}`;
      await prisma.athlete.update({
        where: { id: a.id },
        data: { competitionLevel: newComp },
      });
      console.log(`Updated: ${a.fullName} -> ${newComp}`);
      count++;
    }
  }
  console.log(`Sync complete! Updated ${count} athletes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
