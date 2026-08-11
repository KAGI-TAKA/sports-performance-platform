import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Ambil semua atlet aktif beserta riwayat assessment (COMPLETED) mereka
 * dalam urutan tanggal ascending — siap dikonsumsi oleh grafik time-series.
 */
export async function getAthleteProgressData(organizationId: string) {
  return prisma.athlete.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      fullName: true,
      position: true,
      jerseyNumber: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { assessmentDate: "asc" }, // ascending → X-axis kiri = terlama
        select: {
          id: true,
          assessmentDate: true,
          overallScore: true,
          overallGrade: true,
          analysis: {
            select: { componentScores: true },
          },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });
}
