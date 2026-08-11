import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { convertToCSV } from "@/features/export/utils/csv-exporter";

export async function GET() {
  try {
    const ctx = await requireOrgContext();

    const assessments = await prisma.assessment.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        athlete: true,
        createdBy: {
          include: { user: true },
        },
      },
      orderBy: { assessmentDate: "desc" },
    });

    const headers = [
      "ID Assessment",
      "Nama Atlet",
      "Tanggal Assessment",
      "Skor Akhir (%)",
      "Grade Akhir",
      "Status",
      "Pelatih Penguji",
    ];

    const rows = assessments.map((a) => [
      a.id,
      a.athlete.fullName,
      new Date(a.assessmentDate).toISOString().split("T")[0],
      a.overallScore != null ? Number(a.overallScore).toFixed(1) : "",
      a.overallGrade ?? "",
      a.status,
      a.createdBy.user.name,
    ]);

    const csvData = convertToCSV(headers, rows);
    const fileName = `Kinetiq_Assessment_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("Export assessments failed:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor data assessment" },
      { status: 500 }
    );
  }
}
