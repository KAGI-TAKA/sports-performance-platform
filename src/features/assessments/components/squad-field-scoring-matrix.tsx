"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Award,
  Calendar,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { batchCreateSquadAssessmentAction } from "../actions";
import { calculateItemScore, calculateAgeAtDate, pickBestBenchmark } from "../engine";
import { scoreToGrade } from "@/lib/constants";

export interface SquadMatrixAthlete {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  gender: string;
  dateOfBirth: string | Date;
  position?: string | null;
}

export interface SquadMatrixTestItem {
  id: string;
  name: string;
  category?: string | null;
  unit: string;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  physicalComponent?: string | null;
  benchmarks: {
    ageMin: number;
    ageMax: number;
    gender: string | null;
    thresholdA: number | unknown;
    thresholdB: number | unknown;
    thresholdC: number | unknown;
    thresholdD: number | unknown;
  }[];
}

interface SquadFieldScoringMatrixProps {
  athletes: SquadMatrixAthlete[];
  testItems: SquadMatrixTestItem[];
  defaultTestItemId?: string;
  onSuccess?: () => void;
}

export function SquadFieldScoringMatrix({
  athletes,
  testItems,
  defaultTestItemId,
  onSuccess,
}: SquadFieldScoringMatrixProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedTestItemId, setSelectedTestItemId] = useState<string>(
    defaultTestItemId || testItems[0]?.id || ""
  );
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [assessmentType, setAssessmentType] = useState<"BENCHMARK_BASED" | "PROGRESS_BASED">(
    "BENCHMARK_BASED"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Matrix entries state: map of athleteId -> { rawValueString, notes }
  const [entries, setEntries] = useState<
    Record<string, { rawValueString: string; notes: string }>
  >(() => {
    const init: Record<string, { rawValueString: string; notes: string }> = {};
    athletes.forEach((a) => {
      init[a.id] = { rawValueString: "", notes: "" };
    });
    return init;
  });

  const selectedTestItem = useMemo(
    () => testItems.find((t) => t.id === selectedTestItemId),
    [testItems, selectedTestItemId]
  );

  // Handle raw value input change with comma-to-dot normalization
  const handleRawValueChange = (athleteId: string, value: string) => {
    const normalized = value.replace(",", ".");
    setEntries((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        rawValueString: normalized,
      },
    }));
  };

  const handleNotesChange = (athleteId: string, notes: string) => {
    setEntries((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        notes,
      },
    }));
  };

  // Filter athletes locally by search
  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    const clean = searchQuery.toLowerCase();
    return athletes.filter(
      (a) =>
        a.fullName.toLowerCase().includes(clean) ||
        (a.jerseyNumber !== null && String(a.jerseyNumber).includes(clean))
    );
  }, [athletes, searchQuery]);

  // Valid entries count
  const filledEntriesCount = useMemo(() => {
    return Object.values(entries).filter((e) => {
      const val = parseFloat(e.rawValueString);
      return !isNaN(val) && val > 0;
    }).length;
  }, [entries]);

  // Submit batch
  const handleSubmitBatch = () => {
    if (!selectedTestItem) {
      toast.error("Pilih item tes terlebih dahulu.");
      return;
    }

    const payloadEntries: { athleteId: string; rawValue: number; notes?: string }[] = [];

    for (const [athleteId, data] of Object.entries(entries)) {
      const val = parseFloat(data.rawValueString);
      if (!isNaN(val) && val > 0) {
        payloadEntries.push({
          athleteId,
          rawValue: val,
          notes: data.notes.trim() || undefined,
        });
      }
    }

    if (payloadEntries.length === 0) {
      toast.error("Isi minimal 1 hasil tes atlet sebelum menyimpan.");
      return;
    }

    startTransition(async () => {
      const result = await batchCreateSquadAssessmentAction({
        testItemId: selectedTestItem.id,
        assessmentDate,
        assessmentType,
        entries: payloadEntries,
      });

      if (result.success) {
        toast.success(`Berhasil menyimpan ${result.savedCount} penilaian squad!`);
        // Reset filled entries
        setEntries((prev) => {
          const reset: Record<string, { rawValueString: string; notes: string }> = {};
          athletes.forEach((a) => {
            reset[a.id] = { rawValueString: "", notes: "" };
          });
          return reset;
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/assessments");
          router.refresh();
        }
      } else {
        // Form state preserved on error
        toast.error(result.error || "Gagal menyimpan penilaian squad. Data Anda tetap tersimpan di layar.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. CONFIGURATION HEADER */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">Squad Field Scoring Matrix</h2>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
            {filledEntriesCount} dari {athletes.length} Atlet Terisi
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Test Item Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Item Tes Fisik
            </label>
            <select
              value={selectedTestItemId}
              onChange={(e) => setSelectedTestItemId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            >
              {testItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit}) — {item.category}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tanggal Pelaksanaan
            </label>
            <div className="relative">
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Assessment Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Metode Penilaian
            </label>
            <select
              value={assessmentType}
              onChange={(e) =>
                setAssessmentType(e.target.value as "BENCHMARK_BASED" | "PROGRESS_BASED")
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="BENCHMARK_BASED">Standar Benchmark Master</option>
              <option value="PROGRESS_BASED">Progres Evaluasi Mandiri</option>
            </select>
          </div>
        </div>

        {/* Test Item Specs Banner */}
        {selectedTestItem && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Info className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>
              Satuan: <strong>{selectedTestItem.unit}</strong> · Arah Skor:{" "}
              <strong>
                {selectedTestItem.scoreDirection === "HIGHER_IS_BETTER"
                  ? "Semakin Tinggi Semakin Baik (Max)"
                  : "Semakin Rendah/Cepat Semakin Baik (Min)"}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* 2. SQUAD MATRIX TABLE / ROSTER */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        {/* Table Search & Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari atlet di squad ini…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium self-end sm:self-auto">
            <span>Menampilkan {filteredAthletes.length} Atlet</span>
          </div>
        </div>

        {/* Matrix Rows */}
        <div className="divide-y divide-slate-100">
          {filteredAthletes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada atlet yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredAthletes.map((athlete, idx) => {
              const entry = entries[athlete.id] || { rawValueString: "", notes: "" };
              const val = parseFloat(entry.rawValueString);
              const hasValidVal = !isNaN(val) && val > 0;

              // Calculate live preview score using existing engine logic
              const athleteAge = calculateAgeAtDate(
                new Date(athlete.dateOfBirth),
                new Date(assessmentDate)
              );
              const bm = pickBestBenchmark(
                selectedTestItem?.benchmarks || [],
                athlete.gender,
                athleteAge
              );

              let previewScore: number | null = null;
              let previewGrade: string | null = null;

              if (hasValidVal && selectedTestItem) {
                previewScore = calculateItemScore({
                  testItemId: selectedTestItem.id,
                  physicalComponent: selectedTestItem.physicalComponent || "FLEXIBILITY",
                  rawValue: val,
                  scoreDirection: selectedTestItem.scoreDirection,
                  thresholdA: bm ? Number(bm.thresholdA) : undefined,
                  thresholdB: bm ? Number(bm.thresholdB) : undefined,
                  thresholdC: bm ? Number(bm.thresholdC) : undefined,
                  thresholdD: bm ? Number(bm.thresholdD) : undefined,
                });
                previewGrade = scoreToGrade(previewScore);
              }

              return (
                <div
                  key={athlete.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left: Athlete Identity */}
                  <div className="flex items-start gap-3 min-w-0 md:w-5/12">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-mono font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {athlete.fullName}
                        </span>
                        {athlete.jerseyNumber !== null && (
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            #{athlete.jerseyNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {athleteAge} thn · {athlete.gender === "MALE" ? "Putra" : "Putri"} ·{" "}
                        <span className="text-slate-700">{athlete.position || "Umum"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle & Right: Input & Score Preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:w-7/12 justify-end">
                    {/* Raw Value Input (min 44px height) */}
                    <div className="relative w-full sm:w-36">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={entry.rawValueString}
                        onChange={(e) => handleRawValueChange(athlete.id, e.target.value)}
                        placeholder={`0.00 ${selectedTestItem?.unit || ""}`}
                        className="w-full h-11 px-3 text-right font-mono font-bold text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition shadow-2xs"
                      />
                    </div>

                    {/* Calculated Preview Score Badge */}
                    <div className="flex items-center gap-2 w-full sm:w-44 justify-between sm:justify-start">
                      {hasValidVal && previewScore !== null ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                              previewScore >= 80
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : previewScore >= 60
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {previewScore}%
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs shadow-2xs">
                            Grade {previewGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum diisi</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3. SUBMISSION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-border bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <strong>{filledEntriesCount}</strong> atlet siap disimpan ke database.
          </div>

          <button
            type="button"
            onClick={handleSubmitBatch}
            disabled={isPending || filledEntriesCount === 0}
            className={`min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
              isPending || filledEntriesCount === 0
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-95 cursor-pointer shadow-indigo-200"
            }`}
          >
            <Save className="h-4 w-4" />
            <span>
              {isPending
                ? "Menyimpan Data Squad…"
                : `Simpan Penilaian Squad (${filledEntriesCount} Atlet)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
