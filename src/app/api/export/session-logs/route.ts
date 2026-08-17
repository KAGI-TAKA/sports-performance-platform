import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { convertToCSV } from "@/features/export/utils/csv-exporter";

export async function GET() {
  try {
    const ctx = await requireOrgContext();

    const logs = await prisma.sessionLog.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        athlete: true,
        createdBy: { include: { user: true } },
      },
      orderBy: { sessionDate: "desc" },
    });

    const headers = [
      "ID Log",
      "Nama Atlet",
      "Tanggal Sesi",
      "Aktivitas Latihan",
      "Evaluasi Pelatih",
      "URL Video",
      "Dicatat Oleh",
    ];

    const rows = logs.map((l) => [
      l.id,
      l.athlete.fullName,
      new Date(l.sessionDate).toISOString().split("T")[0],
      l.activitiesDone,
      l.coachFeedback ?? "",
      l.videoUrl ?? "",
      l.createdBy.user.name,
    ]);

    const csvData = convertToCSV(headers, rows);
    const fileName = `Kinetiq_CatatanSesi_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export session logs failed:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor catatan sesi latihan" },
      { status: 500 }
    );
  }
}
