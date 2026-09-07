"use client";

import React, { useState, useTransition } from "react";
import { Edit3, Check, RotateCcw, Sparkles, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAssessmentRecommendation } from "../actions";

interface AssessmentRecommendationEditorProps {
  assessmentId: string;
  initialRecommendation: string;
  defaultSystemSuggestion?: string;
  weakestComponents?: string[];
  bestComponent?: string | null;
}

export function AssessmentRecommendationEditor({
  assessmentId,
  initialRecommendation,
  defaultSystemSuggestion,
  weakestComponents = [],
}: AssessmentRecommendationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialRecommendation);
  const [savedText, setSavedText] = useState(initialRecommendation);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const fallbackSuggestion =
    defaultSystemSuggestion ||
    (weakestComponents.length > 0
      ? `Rekomendasi program latihan 6-8 minggu: fokus pada penguatan ${weakestComponents
          .map((w) => w.replace(/_/g, " ").toLowerCase())
          .join(" & ")} serta stabilitas gerak.`
      : "Rekomendasi program latihan 6-8 minggu: fokus pada pengembangan daya tahan umum dan mobilitas gerak.");

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateAssessmentRecommendation(assessmentId, text);
      if (res.success) {
        setSavedText(text);
        setIsEditing(false);
        setFeedback("Rekomendasi program latihan berhasil diperbarui!");
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(res.error ?? "Gagal menyimpan rekomendasi.");
      }
    });
  };

  const handleUseSystemSuggestion = () => {
    setText(fallbackSuggestion);
  };

  const quickPicks = [
    "Fokus Daya Tahan Aerobik & Interval Yo-Yo (6–8 Minggu)",
    "Penguatan Core & Daya Tahan Otot (Sit Up, Wall Squat, Push-up)",
    "Pengembangan Power Eksplosif & Plyometrics",
    "Latihan Kelincahan & Reaktivitas (Agility Ladder & Cone Drills)",
    "Rutin Mobilitas Gerak & Fleksibilitas Terjadwal",
  ];

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            03. Program Latihan yang Direkomendasikan
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-300">
            <Sparkles className="h-3 w-3" />
            Rekomendasi Pelatih
          </span>
        </div>

        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="h-6 gap-1 text-[11px] text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-3 w-3" />
            Edit Rekomendasi
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-1.5">
          <p className="text-xs text-foreground font-semibold leading-relaxed">
            {savedText || fallbackSuggestion}
          </p>
          <p className="text-[11px] text-muted">
            Tercetak langsung di dokumen PDF laporan fisik &amp; portal orang tua atlet.
          </p>
          {feedback && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" />
              {feedback}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Sistem menyarankan arahan latihan berbasis data uji fisik. Anda dapat mengedit,
              menambah instruksi khusus, atau mengetik arahan program sendiri.
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted">
                Teks Rekomendasi Pelatih:
              </label>
              <button
                type="button"
                onClick={handleUseSystemSuggestion}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Gunakan Saran Sistem
              </button>
            </div>

            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed resize-y"
              placeholder="Ketik rekomendasi program latihan untuk atlet ini..."
            />
          </div>

          {/* Quick template chips */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted block">Opsi Cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPicks.map((pick) => (
                <button
                  key={pick}
                  type="button"
                  onClick={() => setText(pick)}
                  className="rounded-md border border-border/70 bg-surface-2 px-2 py-0.5 text-[10px] text-muted hover:text-foreground hover:bg-surface-3 transition"
                >
                  + {pick}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setText(savedText);
                setIsEditing(false);
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="xs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              onClick={handleSave}
              disabled={isPending || !text.trim()}
            >
              <Save className="h-3.5 w-3.5" />
              {isPending ? "Menyimpan..." : "Simpan Rekomendasi"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
