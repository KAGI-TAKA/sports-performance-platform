import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { convertToCSV } from "@/features/export/utils/csv-exporter";

export async function GET() {
  try {
    const ctx = await requireOrgContext();

    const athletes = await prisma.athlete.findMany({
      where: { organizationId: ctx.organizationId, isActive: true },
      orderBy: { fullName: "asc" },
    });

    const headers = [
      "ID",
      "Nama Lengkap",
      "No. Jersey",
      "Posisi",
      "Jenis Kelamin",
      "Tanggal Lahir",
      "Tinggi (cm)",
      "Berat (kg)",
      "BMI",
      "Wingspan (cm)",
      "Nama Ortu",
      "No. WA Ortu",
      "Alergi",
      "Catatan Kesehatan",
      "Tingkat Kompetisi",
    ];

    const rows = athletes.map((a) => {
      const heightM = a.heightCm ? Number(a.heightCm) / 100 : null;
      const weightKg = a.weightKg ? Number(a.weightKg) : null;
      const bmi = heightM && weightKg && heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : "";

      return [
        a.id,
        a.fullName,
        a.jerseyNumber ?? "",
        a.position.replace(/_/g, " "),
        a.gender === "FEMALE" ? "Perempuan" : "Laki-laki",
        new Date(a.dateOfBirth).toISOString().split("T")[0],
        a.heightCm ? Number(a.heightCm) : "",
        a.weightKg ? Number(a.weightKg) : "",
        bmi,
        a.wingspanCm ? Number(a.wingspanCm) : "",
        a.parentName ?? "",
        a.parentPhone ?? "",
        a.allergies ?? "",
        a.healthNotes ?? "",
        a.competitionLevel ?? "",
      ];
    });

    const csvData = convertToCSV(headers, rows);
    const fileName = `Kinetiq_Atlet_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export athletes failed:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor data atlet" },
      { status: 500 }
    );
  }
}
