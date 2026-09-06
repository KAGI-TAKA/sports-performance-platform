import { prisma } from "../src/lib/prisma";

async function main() {
  const feedbacks = await prisma.parentFeedback.findMany({
    include: {
      scheduleSession: {
        include: {
          coach: { include: { user: true } },
          executor: { include: { user: true } },
        },
      },
      coachMember: {
        include: { user: true },
      },
      athlete: true,
    },
  });

  console.log("FEEDBACK COUNT:", feedbacks.length);
  for (const fb of feedbacks) {
    console.log({
      feedbackId: fb.id,
      sessionTitle: fb.scheduleSession?.title,
      sessionId: fb.scheduleSessionId,
      sessionCoachId: fb.scheduleSession?.coachId,
      sessionCoachName: fb.scheduleSession?.coach?.user?.name,
      sessionExecutorId: fb.scheduleSession?.executorId,
      sessionExecutorName: fb.scheduleSession?.executor?.user?.name,
      feedbackCoachMemberId: fb.coachMemberId,
      feedbackCoachMemberName: fb.coachMember?.user?.name,
      feedbackCoachRole: fb.coachMember?.role,
      rating: fb.sessionRating,
      comment: fb.comment,
      isReviewed: fb.isReviewed,
    });
  }
}

main().finally(() => prisma.$disconnect());
