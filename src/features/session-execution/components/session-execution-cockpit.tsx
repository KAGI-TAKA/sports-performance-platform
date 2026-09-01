"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AttendanceStatus } from "@prisma/client";
import type {
  ExecutionItemStatus,
  SessionExecutionData,
  SessionExecutionPayload,
} from "../types";
import {
  saveSessionExecutionDraftAction,
  completeSessionExecutionAction,
  batchMarkAllPresentAction,
} from "../actions";
import { SessionExecutionHeader } from "./session-execution-header";
import { InjuryAlertBanner } from "./injury-alert-banner";
import { FieldStopwatch } from "./field-stopwatch";
import { AttendanceChecklistSection } from "./attendance-checklist-section";
import { AthleteExecutionPanel } from "./athlete-execution-panel";
import { SessionCompletionBar } from "./session-completion-bar";
import { SessionReadonlySummary } from "./session-readonly-summary";

interface SessionExecutionCockpitProps {
  initialData: SessionExecutionData;
}

export function SessionExecutionCockpit({ initialData }: SessionExecutionCockpitProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for attendance per athlete
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; notes?: string }>
  >(() => {
    const map: Record<string, { status: AttendanceStatus; notes?: string }> = {};
    initialData.athletes.forEach((a) => {
      map[a.id] = {
        status: a.attendanceStatus,
        notes: a.attendanceNotes || undefined,
      };
    });
    return map;
  });

  // Local state for exercise execution per athlete -> per exercise
  // STRICT DEFAULT: PLANNED (Belum Dilakukan)
  const [executionState, setExecutionState] = useState<
    Record<
      string,
      Record<
        string,
        {
          status: ExecutionItemStatus;
          notes?: string;
          actualSets?: number;
          actualReps?: string;
        }
      >
    >
  >(() => {
    const map: Record<
      string,
      Record<
        string,
        {
          status: ExecutionItemStatus;
          notes?: string;
          actualSets?: number;
          actualReps?: string;
        }
      >
    > = {};
    initialData.athletes.forEach((a) => {
      map[a.id] = {};
      initialData.trainingPlan?.exercises.forEach((ex) => {
        // Initialize all exercises to default PLANNED
        map[a.id][ex.id] = { status: "PLANNED" };
      });
    });
    return map;
  });

  // Local state for feedback per athlete
  const [feedbackState, setFeedbackState] = useState<
    Record<string, { coachFeedback?: string; videoUrl?: string }>
  >(() => {
    const map: Record<string, { coachFeedback?: string; videoUrl?: string }> = {};
    initialData.athletes.forEach((a) => {
      map[a.id] = {
        coachFeedback: a.existingSessionLog?.coachFeedback || undefined,
        videoUrl: a.existingSessionLog?.videoUrl || undefined,
      };
    });
    return map;
  });

  // Active athlete selection for group view
  const [activeAthleteId, setActiveAthleteId] = useState<string>(
    initialData.athletes[0]?.id || ""
  );

  // General notes state
  const [generalNotes, setGeneralNotes] = useState<string>(initialData.notes || "");

  // Attendance change handler
  const handleAttendanceChange = (
    athleteId: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    if (initialData.isReadOnly) return;
    setAttendanceState((prev) => ({
      ...prev,
      [athleteId]: { status, notes },
    }));
  };

  // P8-B1.1: 1-Tap Attendance ("Tandai Semua Hadir")
  const handleMarkAllPresent = () => {
    if (initialData.isReadOnly) return;

    // 1. Optimistic client update: only change UNMARKED -> PRESENT
    setAttendanceState((prev) => {
      const next = { ...prev };
      initialData.athletes.forEach((a) => {
        if (!next[a.id] || next[a.id].status === "UNMARKED") {
          next[a.id] = { status: "PRESENT", notes: next[a.id]?.notes };
        }
      });
      return next;
    });

    // 2. Server transaction
    startTransition(async () => {
      const result = await batchMarkAllPresentAction(initialData.id);
      if (result.success) {
        if (result.updatedCount && result.updatedCount > 0) {
          toast.success(`${result.updatedCount} atlet berhasil ditandai Hadir`);
        } else {
          toast.info("Semua presensi atlet telah diperbarui");
        }
      } else {
        toast.error(result.error || "Gagal memperbarui presensi massal");
      }
    });
  };

  // Exercise execution status change handler
  const handleExerciseStatusChange = (
    athleteId: string,
    exerciseId: string,
    status: ExecutionItemStatus,
    notes?: string,
    actualSets?: number,
    actualReps?: string
  ) => {
    if (initialData.isReadOnly) return;
    setExecutionState((prev) => ({
      ...prev,
      [athleteId]: {
        ...(prev[athleteId] || {}),
        [exerciseId]: { status, notes, actualSets, actualReps },
      },
    }));
  };

  // Coach feedback change handler
  const handleFeedbackChange = (
    athleteId: string,
    coachFeedback?: string,
    videoUrl?: string
  ) => {
    if (initialData.isReadOnly) return;
    setFeedbackState((prev) => ({
      ...prev,
      [athleteId]: { coachFeedback, videoUrl },
    }));
  };

  // Build current payload
  const buildPayload = (): SessionExecutionPayload => {
    return {
      sessionId: initialData.id,
      generalNotes,
      athletes: initialData.athletes.map((a) => {
        const att = attendanceState[a.id] || { status: "UNMARKED" };
        const exec = executionState[a.id] || {};
        const fb = feedbackState[a.id] || {};
        return {
          athleteId: a.id,
          attendanceStatus: att.status,
          attendanceNotes: att.notes,
          exercises: exec,
          coachFeedback: fb.coachFeedback,
          videoUrl: fb.videoUrl,
        };
      }),
    };
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    const payload = buildPayload();
    startTransition(async () => {
      const result = await saveSessionExecutionDraftAction(payload);
      if (result.success) {
        toast.success("Draf progres sesi berhasil disimpan");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan draf");
      }
    });
  };

  // Complete Session Handler
  const handleCompleteSession = () => {
    const payload = buildPayload();
    startTransition(async () => {
      const result = await completeSessionExecutionAction(payload);
      if (result.success) {
        toast.success("Sesi latihan berhasil diselesaikan & log telah dibuat");
        router.push("/schedule");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyelesaikan sesi");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      {/* 1. SESSION IDENTITY HEADER */}
      <SessionExecutionHeader
        title={initialData.title}
        startTime={initialData.startTime}
        endTime={initialData.endTime}
        location={initialData.location}
        coachName={initialData.coachName}
        athleteCount={initialData.athletes.length}
        status={initialData.status}
      />

      {/* READ-ONLY SUMMARY IF COMPLETED/CANCELLED */}
      {initialData.isReadOnly && <SessionReadonlySummary data={initialData} />}

      {/* ACTIVE WORKSPACE IF EDITABLE */}
      {!initialData.isReadOnly && (
        <>
          {/* 2. INJURY ALERT WARNING BANNER */}
          <InjuryAlertBanner athletes={initialData.athletes} />

          {/* 3. FIELD STOPWATCH & DRILL TIMER (P8-B1.2) */}
          <FieldStopwatch />

          {/* 4. ATTENDANCE SECTION (P8-B1.1 with 1-Tap Attendance) */}
          <AttendanceChecklistSection
            athletes={initialData.athletes}
            attendanceState={attendanceState}
            onAttendanceChange={handleAttendanceChange}
            onMarkAllPresent={handleMarkAllPresent}
            isReadOnly={initialData.isReadOnly}
          />

          {/* 5. PER-ATHLETE TRAINING EXECUTION PANEL */}
          <AthleteExecutionPanel
            athletes={initialData.athletes}
            trainingPlan={initialData.trainingPlan}
            activeAthleteId={activeAthleteId}
            onSelectAthlete={setActiveAthleteId}
            attendanceState={attendanceState}
            executionState={executionState}
            feedbackState={feedbackState}
            onExerciseStatusChange={handleExerciseStatusChange}
            onFeedbackChange={handleFeedbackChange}
            isReadOnly={initialData.isReadOnly}
          />

          {/* 6. STICKY BOTTOM COMPLETION BAR */}
          <SessionCompletionBar
            athletes={initialData.athletes}
            trainingPlan={initialData.trainingPlan}
            attendanceState={attendanceState}
            executionState={executionState}
            isSavingDraft={isPending}
            isCompleting={isPending}
            onSaveDraft={handleSaveDraft}
            onCompleteSession={handleCompleteSession}
            isReadOnly={initialData.isReadOnly}
          />
        </>
      )}
    </div>
  );
}

