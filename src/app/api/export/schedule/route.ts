import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { convertToCSV } from "@/features/export/utils/csv-exporter";

export async function GET() {
  try {
    const ctx = await requireOrgContext();

    const sessions = await prisma.scheduleSession.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        coach: { include: { user: true } },
        athletes: { include: { athlete: true } },
      },
      orderBy: { startTime: "desc" },
    });

    const headers = [
      "ID Sesi",
      "Judul Sesi",
      "Waktu Mulai",
      "Waktu Selesai",
      "Status",
      "Pelatih",
      "Daftar Atlet",
      "Jumlah Atlet",
      "Lokasi",
      "Catatan",
    ];

    const rows = sessions.map((s) => {
      const athleteNames = s.athletes.map((a) => a.athlete.fullName).join("; ");
      return [
        s.id,
        s.title,
        new Date(s.startTime).toLocaleString("id-ID"),
        new Date(s.endTime).toLocaleString("id-ID"),
        s.status,
        s.coach.user.name,
        athleteNames,
        s.athletes.length,
        s.location ?? "",
        s.notes ?? "",
      ];
    });

    const csvData = convertToCSV(headers, rows);
    const fileName = `Kinetiq_Jadwal_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("Export schedule failed:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor jadwal latihan" },
      { status: 500 }
    );
  }
}
