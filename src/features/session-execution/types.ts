import type { AttendanceStatus, ScheduleStatus } from "@prisma/client";

export type ExecutionItemStatus = "PLANNED" | "DONE" | "MODIFIED" | "SKIPPED";

export interface ExerciseExecutionItem {
  exerciseId: string;
  name: string;
  category: string | null;
  plannedSets: number | null;
  plannedReps: string | null;
  plannedRestSeconds: number | null;
  status: ExecutionItemStatus;
  notes?: string;
  actualSets?: number;
  actualReps?: string;
}

export interface AthleteInjurySummary {
  id: string;
  injuryType: string;
  severity: string | null;
  injuryDate: Date;
  description: string | null;
}

export interface SessionExecutionAthleteData {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
  photoUrl: string | null;
  activeInjuries: AthleteInjurySummary[];
  attendanceStatus: AttendanceStatus;
  attendanceNotes?: string | null;
  existingSessionLog?: {
    id: string;
    activitiesDone: string;
    coachFeedback: string | null;
    videoUrl: string | null;
  } | null;
}

export interface SessionExecutionPlanExercise {
  id: string;
  name: string;
  category: string | null;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  notes: string | null;
  order: number;
}

export interface SessionExecutionPlanData {
  id: string;
  title: string;
  description: string | null;
  exercises: SessionExecutionPlanExercise[];
}

export interface SessionExecutionData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  location: string | null;
  notes: string | null;
  coachId: string;
  coachName: string;
  coachRole: string;
  athletes: SessionExecutionAthleteData[];
  trainingPlan: SessionExecutionPlanData | null;
  canExecute: boolean;
  isReadOnly: boolean;
}

export interface AthleteExecutionInput {
  athleteId: string;
  attendanceStatus: AttendanceStatus;
  attendanceNotes?: string;
  exercises: Record<
    string,
    {
      status: ExecutionItemStatus;
      notes?: string;
      actualSets?: number;
      actualReps?: string;
    }
  >;
  coachFeedback?: string;
  videoUrl?: string;
}

export interface SessionExecutionPayload {
  sessionId: string;
  athletes: AthleteExecutionInput[];
  generalNotes?: string;
}
