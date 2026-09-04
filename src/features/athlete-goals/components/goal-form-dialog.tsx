"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target, Info, AlertCircle } from "lucide-react";
import {
  createAthleteGoalAction,
  updateAthleteGoalAction,
} from "../actions";
import { validateGoalTarget } from "../engine";
import type { ScoreDirection, MeasurementUnit } from "../types";

export interface TestItemOption {
  id: string;
  name: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  physicalComponent?: string | null;
  currentValue?: number | null;
  hasActiveGoal?: boolean;
}

interface GoalFormDialogProps {
  athleteId: string;
  athleteName: string;
  availableTestItems: TestItemOption[];
  existingGoal?: {
    id: string;
    testItemId: string;
    testItemName: string;
    unit: MeasurementUnit;
    scoreDirection: ScoreDirection;
    baselineValue: number;
    targetValue: number;
    title?: string | null;
    targetDate?: Date | string | null;
    notes?: string | null;
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalFormDialog({
  athleteId,
  athleteName,
  availableTestItems,
  existingGoal,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: GoalFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const setIsOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

  const [isPending, startTransition] = useTransition();

  // Form states
  const [selectedTestItemId, setSelectedTestItemId] = useState<string>(
    existingGoal?.testItemId || (availableTestItems[0]?.id ?? "")
  );
  const [targetValue, setTargetValue] = useState<string>(
    existingGoal ? String(existingGoal.targetValue) : ""
  );
  const [manualBaseline, setManualBaseline] = useState<string>(
    existingGoal ? String(existingGoal.baselineValue) : ""
  );
  const [title, setTitle] = useState<string>(existingGoal?.title || "");
  const [targetDate, setTargetDate] = useState<string>(
    existingGoal?.targetDate
      ? new Date(existingGoal.targetDate).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState<string>(existingGoal?.notes || "");

  const selectedTestItem =
    existingGoal
      ? {
          id: existingGoal.testItemId,
          name: existingGoal.testItemName,
          unit: existingGoal.unit,
          scoreDirection: existingGoal.scoreDirection,
          currentValue: existingGoal.baselineValue,
          hasActiveGoal: false,
        }
      : availableTestItems.find((t) => t.id === selectedTestItemId);

  const baseline = existingGoal
    ? existingGoal.baselineValue
    : selectedTestItem?.currentValue != null
    ? selectedTestItem.currentValue
    : manualBaseline
    ? parseFloat(manualBaseline)
    : null;

  // Real-time validation
  let validationError: string | null = null;
  if (selectedTestItem && baseline != null && targetValue) {
    const targetNum = parseFloat(targetValue);
    if (!isNaN(targetNum) && targetNum > 0) {
      const val = validateGoalTarget(
        baseline,
        targetNum,
        selectedTestItem.scoreDirection
      );
      if (!val.valid) {
        validationError = val.reason || "Arah target tidak valid";
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTestItem) {
      toast.error("Pilih parameter uji fisik terlebih dahulu.");
      return;
    }

    const targetNum = parseFloat(targetValue);
    if (isNaN(targetNum) || targetNum <= 0) {
      toast.error("Nilai target harus berupa angka positif yang valid.");
      return;
    }

    if (baseline == null) {
      toast.error("Nilai baseline wajib tersedia atau diisi manual.");
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    startTransition(async () => {
      if (existingGoal) {
        // Edit flow
        const res = await updateAthleteGoalAction({
          goalId: existingGoal.id,
          targetValue: targetNum,
          title: title || null,
          targetDate: targetDate || null,
          notes: notes || null,
        });

        if (res.success) {
          toast.success("Target performa berhasil diperbarui.");
          setIsOpen(false);
        } else {
          toast.error(res.error || "Gagal memperbarui target.");
        }
      } else {
        // Create flow
        const res = await createAthleteGoalAction({
          athleteId,
          testItemId: selectedTestItem.id,
          targetValue: targetNum,
          baselineValue: baseline,
          title: title || null,
          targetDate: targetDate || null,
          notes: notes || null,
        });

        if (res.success) {
          toast.success(`Target untuk "${selectedTestItem.name}" berhasil dibuat.`);
          setIsOpen(false);
          // Reset
          setTargetValue("");
          setTitle("");
          setNotes("");
          setTargetDate("");
        } else {
          toast.error(res.error || "Gagal membuat target.");
        }
      }
    });
  };

  return (
    <>
      {!isControlled && (
        trigger ? (
          <div onClick={() => setIsOpen(true)} className="inline-block">
            {trigger}
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Target</span>
          </Button>
        )
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="sm:max-w-[480px] p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="pr-8">
              <DialogTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                {existingGoal ? "Ubah Target Performa" : "Buat Target Performa Atlet"}
              </DialogTitle>
              <p className="text-xs text-muted">
                Atlet: <strong className="text-foreground">{athleteName}</strong>
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Test Item Selection */}
              {!existingGoal ? (
                <div className="space-y-1.5">
                  <label htmlFor="testItemSelect" className="text-xs font-semibold text-foreground block">
                    Parameter Uji Fisik <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="testItemSelect"
                    className="w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    value={selectedTestItemId}
                    onChange={(e) => setSelectedTestItemId(e.target.value)}
                    disabled={isPending}
                  >
                    {availableTestItems.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={item.hasActiveGoal}
                      >
                        {item.name} ({item.unit.toLowerCase()})
                        {item.hasActiveGoal ? " — [Sudah Memiliki Target Aktif]" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border flex justify-between items-center">
                  <span className="font-semibold text-foreground">
                    {existingGoal.testItemName}
                  </span>
                  <span className="text-[11px] text-muted">
                    Satuan: <strong>{existingGoal.unit.toLowerCase()}</strong>
                  </span>
                </div>
              )}

              {/* Baseline & Target Comparison Frame */}
              {selectedTestItem && (
                <div className="p-3 rounded-lg bg-surface-2/70 border border-border/80 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
                    <div className="flex items-center gap-1.5 text-muted">
                      <Info className="h-3.5 w-3.5 text-accent" />
                      <span>Arah Penilaian:</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {selectedTestItem.scoreDirection === "HIGHER_IS_BETTER"
                        ? "📈 Semakin Tinggi Semakin Baik"
                        : "⚡ Semakin Cepat/Rendah Semakin Baik"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Baseline Field */}
                    <div>
                      <label className="text-[11px] text-muted font-medium block">Baseline Awal</label>
                      {selectedTestItem.currentValue != null ? (
                        <div className="mt-1 font-mono font-bold text-sm text-foreground">
                          {selectedTestItem.currentValue}{" "}
                          <span className="text-xs font-normal text-muted">
                            {selectedTestItem.unit.toLowerCase()}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Nilai awal..."
                          className="mt-1 h-8 text-xs font-mono"
                          value={manualBaseline}
                          onChange={(e) => setManualBaseline(e.target.value)}
                          disabled={isPending || existingGoal !== undefined}
                          required
                        />
                      )}
                    </div>

                    {/* Target Field */}
                    <div>
                      <label htmlFor="targetInput" className="text-[11px] text-muted font-medium block">
                        Target Sasaran <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <Input
                          id="targetInput"
                          type="number"
                          step="0.01"
                          placeholder="Contoh: 4.10"
                          className="h-8 text-xs font-mono pr-12"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          disabled={isPending}
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono pointer-events-none">
                          {selectedTestItem.unit.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {validationError && (
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Optional Title */}
              <div className="space-y-1.5">
                <label htmlFor="titleInput" className="text-xs font-medium text-foreground block">
                  Label / Judul Target (Opsional)
                </label>
                <Input
                  id="titleInput"
                  type="text"
                  placeholder="Misal: Persiapan Seleksi Daerah U-16"
                  className="h-8 text-xs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={isPending}
                />
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label htmlFor="dateInput" className="text-xs font-medium text-foreground block">
                  Estimasi Tenggat Waktu (Opsional)
                </label>
                <Input
                  id="dateInput"
                  type="date"
                  className="h-8 text-xs"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label htmlFor="notesInput" className="text-xs font-medium text-foreground block">
                  Catatan Instruksi Pelatih (Opsional)
                </label>
                <textarea
                  id="notesInput"
                  placeholder="Fokus pada penguatan core dan akselerasi langkah awal..."
                  className="w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent min-h-[60px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  disabled={isPending}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs"
                disabled={isPending || Boolean(validationError) || !targetValue}
              >
                {isPending
                  ? "Menyimpan..."
                  : existingGoal
                  ? "Simpan Perubahan"
                  : "Tetapkan Target"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
