"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalFormDialog } from "./goal-form-dialog";
import type { ScoreDirection, MeasurementUnit } from "../types";

interface AssessmentQuickGoalButtonProps {
  athleteId: string;
  athleteName: string;
  testItemId: string;
  testItemName: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  currentRawValue: number;
  hasActiveGoal?: boolean;
}

export function AssessmentQuickGoalButton({
  athleteId,
  athleteName,
  testItemId,
  testItemName,
  unit,
  scoreDirection,
  currentRawValue,
  hasActiveGoal = false,
}: AssessmentQuickGoalButtonProps) {
  const [open, setOpen] = useState(false);

  const itemOption = {
    id: testItemId,
    name: testItemName,
    unit,
    scoreDirection,
    currentValue: currentRawValue,
    hasActiveGoal,
  };

  return (
    <GoalFormDialog
      athleteId={athleteId}
      athleteName={athleteName}
      availableTestItems={[itemOption]}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] font-medium text-accent hover:text-accent hover:bg-accent/10 gap-1 rounded"
          title="Tetapkan target performa dari hasil tes ini"
        >
          <Target className="h-3 w-3" />
          <span>Jadikan Target</span>
        </Button>
      }
    />
  );
}
