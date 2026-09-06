import { prisma } from "../src/lib/prisma";

async function main() {
  const feedback = await prisma.parentFeedback.findUnique({
    where: { id: "cmtmkkby90001hkhg6xueolem" },
    include: { scheduleSession: true },
  });

  if (!feedback) {
    console.log("Record not found, nothing to migrate.");
    return;
  }

  console.log("Found record:", {
    id: feedback.id,
    sessionId: feedback.scheduleSessionId,
    currentCoachMemberId: feedback.coachMemberId,
    sessionExecutorId: feedback.scheduleSession.executorId,
  });

  if (feedback.scheduleSession.executorId && feedback.coachMemberId !== feedback.scheduleSession.executorId) {
    const updated = await prisma.parentFeedback.update({
      where: { id: feedback.id },
      data: {
        coachMemberId: feedback.scheduleSession.executorId,
      },
      include: {
        coachMember: {
          include: { user: true },
        },
      },
    });

    console.log("Successfully updated feedback attribution:", {
      id: updated.id,
      newCoachMemberId: updated.coachMemberId,
      coachName: updated.coachMember.user.name,
      coachRole: updated.coachMember.role,
    });
  } else {
    console.log("No update required.");
  }
}

main().finally(() => prisma.$disconnect());
