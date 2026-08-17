export interface DashboardStats {
  totalAthletes: number;
  assessmentsThisMonth: number;
  todaySessionsCount: number;
  avgScore: number | null;
  topActiveAthlete: { fullName: string; count: number } | null;
  squadComponentScores: Record<string, number> | null;
  upcomingSessions: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location: string | null;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    athleteCount: number;
    coachName: string | null;
  }>;
  latestAssessments: Array<{
    id: string;
    assessmentDate: Date;
    status: "DRAFT" | "COMPLETED";
    overallScore: number | null;
    overallGrade: string | null;
    athlete: {
      id: string;
      fullName: string;
      position: string;
    };
  }>;
  attentionItems: {
    draftAssessmentsCount: number;
    activeInjuriesCount: number;
    unloggedSessionsCount: number;
  };
}
