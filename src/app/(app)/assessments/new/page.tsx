import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteById, listAthletes } from "@/features/athletes/queries";
import { listTestItems, getLatestAssessmentWithResults } from "@/features/assessments/queries";
import { calculateAgeAtDate } from "@/features/assessments/engine";
import { AssessmentWizard } from "@/features/assessments/components/assessment-wizard";
import { SquadFieldScoringMatrix } from "@/features/assessments/components/squad-field-scoring-matrix";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, AlertTriangle, Sparkles, Users, User, Award } from "lucide-react";

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string; mode?: string }>;
}) {
  const { athleteId, mode } = await searchParams;
  const ctx = await requireOrgContext();

  const testItemsRaw = await listTestItems(ctx.organizationId);

  const testItems = testItemsRaw.map((t) => ({
    id: t.id,
    physicalComponent: t.physicalComponent,
    name: t.name,
    category: t.physicalComponent,
    unit: t.unit,
    scoreDirection: t.scoreDirection,
    benchmarks: t.benchmarks.map((b) => ({
      id: b.id,
      ageMin: b.ageMin,
      ageMax: b.ageMax,
      gender: b.gender,
      thresholdA: Number(b.thresholdA),
      thresholdB: Number(b.thresholdB),
      thresholdC: Number(b.thresholdC),
      thresholdD: Number(b.thresholdD),
    })),
  }));

  const isSquadMode = mode === "squad";

  if (!athleteId) {
    const { athletes } = await listAthletes(ctx.organizationId, { status: "active" });

    return (
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <Link href="/assessments">
              <Button variant="outline" size="xs" className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                Asesmen &amp; Observasi Fisik
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                Step 01: Memahami profil gerak awal atlet sebagai dasar penentuan prioritas dan arah program latihan.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-xl p-1 bg-surface-2 border border-border text-xs self-start sm:self-auto">
            <Link
              href="/assessments/new"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                !isSquadMode
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Individu</span>
            </Link>
            <Link
              href="/assessments/new?mode=squad"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                isSquadMode
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Matriks Squad (Massal)</span>
            </Link>
          </div>
        </div>

        {isSquadMode ? (
          /* SQUAD MATRIX MODE */
          <SquadFieldScoringMatrix
            athletes={athletes.map((a) => ({
              id: a.id,
              fullName: a.fullName,
              jerseyNumber: a.jerseyNumber,
              gender: a.gender,
              dateOfBirth: a.dateOfBirth,
              position: a.position,
            }))}
            testItems={testItems}
          />
        ) : (
          /* INDIVIDUAL ATHLETE SELECTION */
          <div className="space-y-3">
            {athletes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center space-y-3">
                  <p className="text-xs text-muted">
                    Belum ada atlet aktif terdaftar di organisasi ini.
                  </p>
                  <Link href="/athletes/new">
                    <Button size="sm" className="bg-accent text-white font-semibold">
                      + Tambah Atlet Pertama
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              athletes.map((a) => {
                const age = calculateAgeAtDate(a.dateOfBirth);
                const genderText = a.gender === "MALE" ? "Putra" : "Putri";
                const levelText =
                  a.trainingLevel === "BEGINNER"
                    ? "Pemula"
                    : a.trainingLevel === "INTERMEDIATE"
                      ? "Menengah"
                      : "Kompetitif / Pro";

                return (
                  <Link
                    key={a.id}
                    href={`/assessments/new?athleteId=${a.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-1 hover:border-accent hover:bg-surface-2/60 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-xs">
                        {a.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                          {a.fullName}
                        </div>
                        <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <span>{genderText}</span>
                          <span>·</span>
                          <span>Usia {age} Thn</span>
                          <span>·</span>
                          <span className="text-accent font-medium">Level {levelText}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="xs" className="gap-1 text-accent">
                      Mulai Tes <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }


  const athlete = await getAthleteById(ctx.organizationId, athleteId);
  if (!athlete) notFound();

  if (!athlete.isActive) {
    return (
      <div className="mx-auto max-w-md p-8 text-center space-y-4">
        <Card className="border-warning/30 bg-warning-bg/40 p-6 space-y-3">
          <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Atlet Status Nonaktif</h2>
          <p className="text-xs text-muted">
            Assessment baru hanya dapat dibuat untuk atlet yang berstatus aktif. Silakan aktifkan kembali atlet ini dari profilnya.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href="/assessments/new">
              <Button variant="outline" size="xs">Pilih Atlet Lain</Button>
            </Link>
            <Link href={`/athletes/${athlete.id}`}>
              <Button size="xs" className="bg-accent text-white">Buka Profil Atlet</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Ambil asesmen terakhir atlet untuk perbandingan live progres di wizard
  const [previousAssessmentRaw, { athletes: allAthletes }] = await Promise.all([
    getLatestAssessmentWithResults(ctx.organizationId, athlete.id),
    listAthletes(ctx.organizationId, { status: "active" }),
  ]);

  const previousAssessment = previousAssessmentRaw
    ? {
        id: previousAssessmentRaw.id,
        assessmentDate: previousAssessmentRaw.assessmentDate,
        overallScore: previousAssessmentRaw.overallScore != null ? Number(previousAssessmentRaw.overallScore) : null,
        overallGrade: previousAssessmentRaw.overallGrade,
        assessmentType: previousAssessmentRaw.assessmentType,
        resultItems: previousAssessmentRaw.resultItems.map((r) => ({
          testItemId: r.testItemId,
          rawValue: Number(r.rawValue),
          testItemName: r.testItem.name,
          unit: r.testItem.unit,
        })),
      }
    : null;

  return (
    <div className="p-6 max-w-[1400px]">
      <AssessmentWizard
        athlete={{
          id: athlete.id,
          fullName: athlete.fullName,
          position: athlete.position,
          dateOfBirth: athlete.dateOfBirth,
          gender: athlete.gender,
          trainingLevel: athlete.trainingLevel,
        }}
        allAthletes={allAthletes.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          trainingLevel: a.trainingLevel,
        }))}
        testItems={testItems}
        previousAssessment={previousAssessment}
      />
    </div>
  );
}
