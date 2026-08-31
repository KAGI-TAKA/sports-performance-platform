import { prisma } from "@/lib/prisma";
import type { CoachGuidanceItem } from "./types";

export async function getCoachGuidancesForPortal(
  organizationId: string,
  athleteId?: string
): Promise<CoachGuidanceItem[]> {
  try {
    const posts = await prisma.coachGuidance.findMany({
      where: {
        organizationId,
        OR: [
          { athleteId: null }, // Broadcast to all in org
          ...(athleteId ? [{ athleteId }] : []),
        ],
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          include: {
            user: { select: { name: true } },
          },
        },
        athlete: { select: { fullName: true } },
      },
    });

    return posts.map((p) => ({
      id: p.id,
      organizationId: p.organizationId,
      authorId: p.authorId,
      authorName: p.author?.user?.name || "Coach Zulfi",
      athleteId: p.athleteId,
      athleteName: p.athlete?.fullName,
      title: p.title,
      category: p.category,
      content: p.content,
      linkUrl: p.linkUrl,
      isPinned: p.isPinned,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  } catch (err: unknown) {
    console.error("Gagal mengambil coach guidance:", err);
    return [];
  }
}
