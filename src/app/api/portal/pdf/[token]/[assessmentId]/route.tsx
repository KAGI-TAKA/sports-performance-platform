import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getPortalContextByToken } from "@/features/portal/queries";
import { prisma } from "@/lib/prisma";
import { AssessmentReportPDF } from "@/features/reports/components/report-pdf";

function calcAge(dob: Date): number {
  const now = new Date();
  return Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; assessmentId: string }> }
) {
  try {
    const { token, assessmentId } = await params;

    const auth = await getPortalContextByToken(token);
    if (!auth.success) {
      return NextResponse.json(
        { error: "Akses portal tidak valid atau sudah kedaluwarsa" },
        { status: 403 }
      );
    }

    const { context } = auth;

    const [assessment, org] = await Promise.all([
      prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          organizationId: context.organizationId,
          status: "COMPLETED",
        },
        include: {
          athlete: true,
          resultItems: {
            include: {
              testItem: {
                include: {
                  benchmarks: {
                    where: { organizationId: context.organizationId },
                    take: 1,
                  },
                },
              },
            },
          },
          analysis: true,
        },
      }),
      prisma.organization.findUnique({
        where: { id: context.organizationId },
        select: { name: true },
      }),
    ]);

    if (!assessment) {
      return NextResponse.json(
        { error: "Laporan assessment tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    const athlete = assessment.athlete;

    const formattedAssessmentDate = new Date(
      assessment.assessmentDate
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formattedDOB = new Date(athlete.dateOfBirth).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    const genderLabel =
      athlete.gender === "FEMALE"
        ? "Perempuan"
        : athlete.gender === "MALE"
        ? "Laki-laki"
        : "—";

    const positionLabel =
      athlete.position !== "UNSPECIFIED"
        ? athlete.position.replace(/_/g, " ")
        : "—";

    const items = assessment.resultItems.map((r) => {
      const bm = r.testItem.benchmarks?.[0];
      const benchmarkValue = bm ? Number(bm.thresholdA) : undefined;
      return {
        name: r.testItem.name,
        component: r.testItem.physicalComponent,
        rawValue: Number(r.rawValue).toString(),
        unit: r.testItem.unit,
        score: Number(r.score ?? 0),
        benchmark: benchmarkValue,
      };
    });

    let componentScores: Record<string, number> = {};
    if (assessment.analysis?.componentScores) {
      try {
        componentScores =
          typeof assessment.analysis.componentScores === "string"
            ? JSON.parse(assessment.analysis.componentScores)
            : (assessment.analysis.componentScores as Record<
                string,
                number
              >);
      } catch {}
    }

    const pdfStream = await renderToStream(
      <AssessmentReportPDF
        athleteName={athlete.fullName}
        gender={genderLabel}
        dateOfBirth={formattedDOB}
        age={calcAge(athlete.dateOfBirth)}
        club={athlete.competitionLevel ?? "—"}
        position={positionLabel}
        assessmentDate={formattedAssessmentDate}
        overallScore={Number(assessment.overallScore ?? 0)}
        overallGrade={assessment.overallGrade ?? "—"}
        items={items}
        componentScores={componentScores}
        insightText={
          assessment.analysis?.insightText ?? "Belum ada analisis otomatis."
        }
        recommendationText={
          assessment.analysis?.recommendationText ??
          "Lanjutkan program latihan rutin."
        }
        orgName={org?.name ?? "Kinetiq"}
      />
    );

    const safeName = athlete.fullName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const fileName = `Kinetiq_${safeName}_${new Date(
      assessment.assessmentDate
    )
      .toISOString()
      .slice(0, 10)}.pdf`;

    return new NextResponse(pdfStream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Gagal generate portal PDF:", err);
    return NextResponse.json(
      { error: "Gagal membuat laporan PDF" },
      { status: 500 }
    );
  }
}
