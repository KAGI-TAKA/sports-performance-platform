import { prisma } from "../src/lib/prisma";

async function check() {
  const daniUser = await prisma.user.findUnique({ where: { email: "dani@coachzulfi.com" } });
  console.log("Dani user:", daniUser?.id, daniUser?.email, "hasPassword:", !!daniUser?.password);
  
  const athletes = await prisma.athlete.findMany({ select: { id: true, fullName: true, competitionLevel: true } });
  console.log("Athletes:", athletes);

  const portals = await prisma.portalAccess.findMany({ include: { athlete: true } });
  console.log("Portals:", portals.map(p => ({
    id: p.id,
    athlete: p.athlete.fullName,
    competitionLevel: p.athlete.competitionLevel,
    accessType: p.accessType,
    tokenHash: p.tokenHash,
    username: p.username,
    plainPassword: p.plainPassword
  })));

  const feedbacks = await prisma.parentFeedback.findMany({
    include: {
      coachMember: { include: { user: true } },
      scheduleSession: true
    }
  });
  console.log("Feedbacks count:", feedbacks.length, feedbacks.map(f => ({
    id: f.id,
    coachName: f.coachMember?.user?.name,
    coachRole: f.coachMember?.role,
    isReviewed: f.isReviewed,
    comment: f.comment,
    sessionTitle: f.scheduleSession?.title
  })));
}

check().finally(() => prisma.$disconnect());
