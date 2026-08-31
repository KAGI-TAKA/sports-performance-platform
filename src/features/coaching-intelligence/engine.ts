import type {
  ReTestStatus,
  AthleteReTestInsight,
  AthleteReTestSummary,
  WorkloadPeriod,
  AssistantWorkloadItem,
  CoachingWorkloadSummary,
  SessionHealthItem,
  SessionHealthSummary,
  SessionHealthType,
  AnomalySeverity,
} from "./types";
import { getZonedParts, parseLocalDateTimeToUTC, DEFAULT_SCHEDULE_TIMEZONE } from "@/features/schedule/utils";

export const RETEST_THRESHOLDS = {
  FRESH_MAX_DAYS: 29,     // < 30 days
  DUE_SOON_MAX_DAYS: 59,  // 30 - 59 days
  DUE_MAX_DAYS: 89,       // 60 - 89 days
  OVERDUE_MIN_DAYS: 90,   // >= 90 days
} as const;

/**
 * Calculates whole calendar days elapsed between an assessment date and a reference date
 * based on the Asia/Jakarta calendar timezone.
 */
export function calculateDaysSinceAssessment(
  assessmentDate: Date,
  referenceDate: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): number {
  const assessParts = getZonedParts(new Date(assessmentDate), timeZone);
  const refParts = getZonedParts(new Date(referenceDate), timeZone);

  // Construct UTC midnight representations for exact calendar-day arithmetic
  const assessUtcMidnight = Date.UTC(assessParts.year, assessParts.month - 1, assessParts.day);
  const refUtcMidnight = Date.UTC(refParts.year, refParts.month - 1, refParts.day);

  const diffMs = refUtcMidnight - assessUtcMidnight;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  return diffDays;
}

/**
 * Classifies an athlete's re-test status strictly based on days elapsed since the latest completed assessment.
 */
export function classifyReTestStatus(daysSince: number | null): ReTestStatus {
  if (daysSince === null || daysSince < 0) {
    return "NO_ASSESSMENT";
  }

  if (daysSince < 30) {
    return "FRESH";
  }

  if (daysSince < 60) {
    return "DUE_SOON";
  }

  if (daysSince < 90) {
    return "DUE";
  }

  return "OVERDUE";
}

/**
 * Returns human-friendly, supportive coaching labels, messages, and recommended actions.
 */
export function getReTestStatusMetadata(status: ReTestStatus, daysSince: number | null): {
  statusLabel: string;
  message: string;
  recommendedAction: string;
} {
  switch (status) {
    case "FRESH":
      return {
        statusLabel: "Data Masih Baru",
        message: `Evaluasi fisik terakhir ${daysSince ?? 0} hari yang lalu dan masih sangat relevan.`,
        recommendedAction: "Lanjutkan fase latihan dan pantau adaptasi beban atlet.",
      };
    case "DUE_SOON":
      return {
        statusLabel: "Mendekati Waktu Evaluasi",
        message: `Evaluasi fisik berumur ${daysSince ?? 30} hari (1 bulan latihan berjalan).`,
        recommendedAction: "Pertimbangkan penjadwalan evaluasi tengah siklus.",
      };
    case "DUE":
      return {
        statusLabel: "Perlu Evaluasi Ulang",
        message: `Evaluasi fisik berumur ${daysSince ?? 60} hari (siklus 2 bulan selesai).`,
        recommendedAction: "Jadwalkan sesi asesmen evaluasi berkala untuk mengukur progres.",
      };
    case "OVERDUE":
      return {
        statusLabel: "Sangat Disarankan Re-Test",
        message: `Evaluasi fisik telah berumur ${daysSince ?? 90} hari (lebih dari 1 kuartal).`,
        recommendedAction: "Segera jadwalkan evaluasi fisik baru untuk memperbarui profil benchmark atlet.",
      };
    case "NO_ASSESSMENT":
    default:
      return {
        statusLabel: "Belum Ada Evaluasi",
        message: "Belum ada evaluasi fisik yang terselesaikan untuk atlet ini.",
        recommendedAction: "Jadwalkan evaluasi baseline awal untuk menentukan titik mulai program latihan.",
      };
  }
}

export interface RawAssessmentItem {
  id: string;
  status: string;
  assessmentDate: Date;
  overallScore: number | null | { toNumber?: () => number } | unknown;
  overallGrade: string | null;
  createdAt?: Date;
}

export interface RawAthleteWithAssessments {
  id: string;
  fullName: string;
  category: string | null;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  assessments: RawAssessmentItem[];
}

/**
 * Pure evaluator that resolves the latest valid COMPLETED assessment for an athlete
 * and computes the comprehensive ReTestInsight.
 */
export function buildAthleteReTestInsight(
  athlete: RawAthleteWithAssessments,
  referenceDate: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): AthleteReTestInsight {
  const refParts = getZonedParts(referenceDate, timeZone);
  const refUtcMidnight = Date.UTC(refParts.year, refParts.month - 1, refParts.day);

  // 1. Filter only COMPLETED assessments that are NOT future-dated relative to calendar date in WIB
  const validCompleted = (athlete.assessments || []).filter((a) => {
    if (a.status !== "COMPLETED") return false;
    const aParts = getZonedParts(new Date(a.assessmentDate), timeZone);
    const aUtcMidnight = Date.UTC(aParts.year, aParts.month - 1, aParts.day);
    // Disallow future assessment
    return aUtcMidnight <= refUtcMidnight;
  });

  // 2. Sort with deterministic tie-breaker: assessmentDate DESC, then createdAt DESC / id DESC
  validCompleted.sort((a, b) => {
    const timeA = new Date(a.assessmentDate).getTime();
    const timeB = new Date(b.assessmentDate).getTime();
    if (timeB !== timeA) return timeB - timeA;

    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (createdB !== createdA) return createdB - createdA;

    return b.id.localeCompare(a.id);
  });

  const latest = validCompleted[0] || null;

  let daysSince: number | null = null;
  let latestAssessmentDateStr: string | null = null;
  let scoreNum: number | null = null;

  if (latest) {
    daysSince = calculateDaysSinceAssessment(latest.assessmentDate, referenceDate, timeZone);
    const parts = getZonedParts(new Date(latest.assessmentDate), timeZone);
    latestAssessmentDateStr = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;

    if (latest.overallScore !== null && latest.overallScore !== undefined) {
      if (typeof latest.overallScore === "number") {
        scoreNum = latest.overallScore;
      } else if (
        typeof latest.overallScore === "object" &&
        latest.overallScore !== null &&
        "toNumber" in latest.overallScore &&
        typeof (latest.overallScore as { toNumber: () => number }).toNumber === "function"
      ) {
        scoreNum = (latest.overallScore as { toNumber: () => number }).toNumber();
      } else {
        scoreNum = Number(latest.overallScore);
      }
    }
  }

  const status = classifyReTestStatus(daysSince);
  const meta = getReTestStatusMetadata(status, daysSince);

  return {
    athleteId: athlete.id,
    athleteName: athlete.fullName,
    category: athlete.category,
    jerseyNumber: athlete.jerseyNumber,
    position: athlete.position,
    photoUrl: athlete.photoUrl,
    latestAssessmentId: latest ? latest.id : null,
    latestAssessmentDate: latest ? new Date(latest.assessmentDate) : null,
    latestAssessmentDateStr,
    latestOverallScore: scoreNum,
    latestOverallGrade: latest ? latest.overallGrade : null,
    daysSinceAssessment: daysSince,
    reTestStatus: status,
    statusLabel: meta.statusLabel,
    message: meta.message,
    recommendedAction: meta.recommendedAction,
  };
}

/**
 * Summarizes a list of athlete re-test insights into high-level dashboard metrics.
 */
export function summarizeReTestInsights(insights: AthleteReTestInsight[]): AthleteReTestSummary {
  let freshCount = 0;
  let dueSoonCount = 0;
  let dueCount = 0;
  let overdueCount = 0;
  let noAssessmentCount = 0;

  for (const item of insights) {
    switch (item.reTestStatus) {
      case "FRESH":
        freshCount++;
        break;
      case "DUE_SOON":
        dueSoonCount++;
        break;
      case "DUE":
        dueCount++;
        break;
      case "OVERDUE":
        overdueCount++;
        break;
      case "NO_ASSESSMENT":
        noAssessmentCount++;
        break;
    }
  }

  return {
    totalAthletes: insights.length,
    freshCount,
    dueSoonCount,
    dueCount,
    overdueCount,
    noAssessmentCount,
    insights,
  };
}

// ============================================================
// P7-C2: WORKLOAD INTELLIGENCE CALCULATION ENGINE
// ============================================================

/**
 * Calculates session duration in minutes with defensive normalization.
 * If endTime <= startTime, returns duration 0 and marks as invalid.
 */
export function calculateSessionDurationMinutes(
  startTime: Date,
  endTime: Date
): { durationMinutes: number; isValid: boolean } {
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();

  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
    return { durationMinutes: 0, isValid: false };
  }

  const diffMs = endMs - startMs;
  const durationMinutes = Math.round(diffMs / (60 * 1000));
  return { durationMinutes, isValid: true };
}

export interface WorkloadPeriodRange {
  period: WorkloadPeriod;
  label: string;
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
}

/**
 * Computes exact start and end boundaries for workload periods in Asia/Jakarta timezone.
 */
export function getWorkloadPeriodRangeJakarta(
  period: WorkloadPeriod,
  referenceDate: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): WorkloadPeriodRange {
  const parts = getZonedParts(referenceDate, timeZone);
  const nowUtcIso = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;

  switch (period) {
    case "month": {
      // 1st of current month 00:00:00 WIB to end of current month 23:59:59 WIB
      const startStr = `${parts.year}-${String(parts.month).padStart(2, "0")}-01`;
      const daysInMonth = new Date(parts.year, parts.month, 0).getDate();
      const endStr = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const startDate = parseLocalDateTimeToUTC(`${startStr}T00:00:00`, timeZone);
      const endDate = parseLocalDateTimeToUTC(`${endStr}T23:59:59`, timeZone);

      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const label = `Bulan Ini (${monthNames[parts.month - 1]} ${parts.year})`;

      return {
        period,
        label,
        startDate,
        endDate,
        startDateStr: startStr,
        endDateStr: endStr,
      };
    }

    case "last90": {
      // Rolling 90 days: referenceDate - 89 days to referenceDate
      const startMidnightUtc = Date.UTC(parts.year, parts.month - 1, parts.day) - 89 * 24 * 60 * 60 * 1000;
      const startDateObj = new Date(startMidnightUtc);
      const sParts = getZonedParts(startDateObj, "UTC");
      const startStr = `${sParts.year}-${String(sParts.month).padStart(2, "0")}-${String(sParts.day).padStart(2, "0")}`;

      const startDate = parseLocalDateTimeToUTC(`${startStr}T00:00:00`, timeZone);
      const endDate = parseLocalDateTimeToUTC(`${nowUtcIso}T23:59:59`, timeZone);

      return {
        period,
        label: "90 Hari Terakhir",
        startDate,
        endDate,
        startDateStr: startStr,
        endDateStr: nowUtcIso,
      };
    }

    case "last30":
    default: {
      // Rolling 30 days: referenceDate - 29 days to referenceDate
      const startMidnightUtc = Date.UTC(parts.year, parts.month - 1, parts.day) - 29 * 24 * 60 * 60 * 1000;
      const startDateObj = new Date(startMidnightUtc);
      const sParts = getZonedParts(startDateObj, "UTC");
      const startStr = `${sParts.year}-${String(sParts.month).padStart(2, "0")}-${String(sParts.day).padStart(2, "0")}`;

      const startDate = parseLocalDateTimeToUTC(`${startStr}T00:00:00`, timeZone);
      const endDate = parseLocalDateTimeToUTC(`${nowUtcIso}T23:59:59`, timeZone);

      return {
        period: "last30",
        label: "30 Hari Terakhir",
        startDate,
        endDate,
        startDateStr: startStr,
        endDateStr: nowUtcIso,
      };
    }
  }
}

export interface RawCoachMember {
  id: string;
  role: string;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export interface RawWorkloadSession {
  id: string;
  coachId: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

/**
 * Aggregates workload metrics for a specific coach based strictly on actual sessions.
 * Separates Actual Delivery (COMPLETED) from Planned Load (Future SCHEDULED).
 */
export function aggregateCoachWorkload(
  coach: RawCoachMember,
  sessions: RawWorkloadSession[],
  referenceDate: Date = new Date()
): AssistantWorkloadItem {
  const coachSessions = sessions.filter((s) => s.coachId === coach.id);
  const nowMs = referenceDate.getTime();

  let completedSessions = 0;
  let deliveredMinutes = 0;

  let plannedSessions = 0;
  let plannedMinutes = 0;

  let anomaliesCount = 0;

  for (const sess of coachSessions) {
    const { durationMinutes, isValid } = calculateSessionDurationMinutes(sess.startTime, sess.endTime);

    if (!isValid) {
      anomaliesCount++;
      continue;
    }

    if (sess.status === "COMPLETED") {
      completedSessions++;
      deliveredMinutes += durationMinutes;
    } else if (sess.status === "SCHEDULED") {
      const startMs = new Date(sess.startTime).getTime();
      if (startMs >= nowMs) {
        // Future scheduled -> planned load
        plannedSessions++;
        plannedMinutes += durationMinutes;
      } else {
        // Past scheduled -> Not delivered hours! Needs operational follow-up
        anomaliesCount++;
      }
    }
    // CANCELLED and NO_SHOW are ignored from delivered/planned hours
  }

  const deliveredHours = Math.round((deliveredMinutes / 60) * 10) / 10;
  const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;

  return {
    coachId: coach.id,
    coachName: coach.user.name,
    coachEmail: coach.user.email,
    coachPhotoUrl: coach.user.image,
    role: coach.role,
    completedSessions,
    deliveredMinutes,
    deliveredHours,
    plannedSessions,
    plannedMinutes,
    plannedHours,
    anomaliesCount,
  };
}

/**
 * Builds the overall coaching workload summary for an organization.
 */
export function buildCoachingWorkloadSummary(
  assistants: AssistantWorkloadItem[],
  periodRange: WorkloadPeriodRange
): CoachingWorkloadSummary {
  let totalCompletedSessions = 0;
  let totalDeliveredMinutes = 0;
  let totalPlannedSessions = 0;
  let totalPlannedMinutes = 0;

  for (const item of assistants) {
    totalCompletedSessions += item.completedSessions;
    totalDeliveredMinutes += item.deliveredMinutes;
    totalPlannedSessions += item.plannedSessions;
    totalPlannedMinutes += item.plannedMinutes;
  }

  const totalDeliveredHours = Math.round((totalDeliveredMinutes / 60) * 10) / 10;
  const totalPlannedHours = Math.round((totalPlannedMinutes / 60) * 10) / 10;

  return {
    period: periodRange.period,
    periodLabel: periodRange.label,
    startDate: periodRange.startDate,
    endDate: periodRange.endDate,
    startDateStr: periodRange.startDateStr,
    endDateStr: periodRange.endDateStr,
    totalAssistants: assistants.length,
    totalCompletedSessions,
    totalDeliveredMinutes,
    totalDeliveredHours,
    totalPlannedSessions,
    totalPlannedMinutes,
    totalPlannedHours,
    assistants,
  };
}

// ============================================================
// P7-C3: SESSION HEALTH INTELLIGENCE ENGINE
// ============================================================

export interface RawHealthSessionAthlete {
  id: string;
  fullName: string;
}

export interface RawHealthAttendance {
  athleteId: string;
  status: string;
}

export interface RawHealthSessionLog {
  id: string;
  athleteId: string;
}

export interface RawHealthSession {
  id: string;
  title: string;
  coachId: string;
  coachName: string;
  startTime: Date;
  endTime: Date;
  status: string;
  athletes: RawHealthSessionAthlete[];
  attendances: RawHealthAttendance[];
  sessionLogs: RawHealthSessionLog[];
}

/**
 * Evaluates the operational health of a training session based on strict execution rules.
 * Uses deterministic collision priority:
 * 1. PAST_SCHEDULED (startTime < now && status === "SCHEDULED")
 * 2. UNMARKED_ATTENDANCE (endTime < now && has UNMARKED attendance)
 * 3. COMPLETED_MISSING_LOG (status === "COMPLETED" && PRESENT/LATE missing log)
 * 4. TODAY_UPCOMING (status === "SCHEDULED" && in today's Jakarta window)
 * 5. COMPLETED_HEALTHY (status === "COMPLETED" && fully logged)
 */
export function classifySessionHealth(
  session: RawHealthSession,
  now: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): SessionHealthItem | null {
  // 1. CANCELLED and NO_SHOW sessions are ignored from health alerts
  if (session.status === "CANCELLED" || session.status === "NO_SHOW") {
    return null;
  }

  const startMs = new Date(session.startTime).getTime();
  const endMs = new Date(session.endTime).getTime();
  const nowMs = now.getTime();

  const startParts = getZonedParts(new Date(session.startTime), timeZone);
  const endParts = getZonedParts(new Date(session.endTime), timeZone);
  const nowParts = getZonedParts(now, timeZone);

  const startTimeFormatted = `${String(startParts.hour).padStart(2, "0")}:${String(startParts.minute).padStart(2, "0")}`;
  const endTimeFormatted = `${String(endParts.hour).padStart(2, "0")}:${String(endParts.minute).padStart(2, "0")}`;

  const athleteMap = new Map<string, string>();
  for (const a of session.athletes) {
    athleteMap.set(a.id, a.fullName);
  }

  // Base DTO builder
  const makeItem = (
    healthType: SessionHealthType,
    severity: AnomalySeverity,
    title: string,
    description: string,
    affectedAthleteNames: string[]
  ): SessionHealthItem => ({
    sessionId: session.id,
    sessionTitle: session.title,
    coachId: session.coachId,
    coachName: session.coachName,
    startTime: session.startTime,
    endTime: session.endTime,
    startTimeFormatted,
    endTimeFormatted,
    status: session.status,
    healthType,
    severity,
    title,
    description,
    affectedAthleteNames,
    ctaLabel: "Buka Workspace Eksekusi",
    ctaUrl: `/schedule/${session.id}/execute`,
  });

  // Priority 1: PAST_SCHEDULED (Session time has passed, but status is still SCHEDULED)
  if (session.status === "SCHEDULED" && startMs < nowMs) {
    return makeItem(
      "PAST_SCHEDULED",
      "ATTENTION",
      "Sesi Belum Difinalisasi",
      `Waktu sesi telah lewat (${startTimeFormatted} WIB) tetapi status masih terjadwal.`,
      session.athletes.map((a) => a.fullName)
    );
  }

  // Priority 2: UNMARKED_ATTENDANCE (Session has ended, and has UNMARKED attendances)
  if (endMs < nowMs && session.attendances.length > 0) {
    const unmarkedAthletes: string[] = [];
    for (const att of session.attendances) {
      if (att.status === "UNMARKED") {
        unmarkedAthletes.push(athleteMap.get(att.athleteId) || "Atlet");
      }
    }

    if (unmarkedAthletes.length > 0) {
      return makeItem(
        "UNMARKED_ATTENDANCE",
        "ATTENTION",
        "Presensi Belum Lengkap",
        `${unmarkedAthletes.length} atlet belum ditandai status presensinya pada sesi ini.`,
        unmarkedAthletes
      );
    }
  }

  // Priority 3: COMPLETED_MISSING_LOG (COMPLETED session, but PRESENT/LATE athletes have no SessionLog)
  if (session.status === "COMPLETED") {
    const loggedAthleteIds = new Set<string>();
    for (const log of session.sessionLogs) {
      loggedAthleteIds.add(log.athleteId);
    }

    const missingLogAthletes: string[] = [];

    // Per P7-A Ground Truth: ONLY PRESENT or LATE require a SessionLog
    for (const att of session.attendances) {
      if (att.status === "PRESENT" || att.status === "LATE") {
        if (!loggedAthleteIds.has(att.athleteId)) {
          missingLogAthletes.push(athleteMap.get(att.athleteId) || "Atlet");
        }
      }
    }

    if (missingLogAthletes.length > 0) {
      return makeItem(
        "COMPLETED_MISSING_LOG",
        "ATTENTION",
        "Catatan Sesi Belum Lengkap",
        `${missingLogAthletes.length} atlet hadir belum memiliki rekaman log latihan.`,
        missingLogAthletes
      );
    }

    // Priority 5: COMPLETED_HEALTHY (All present/late athletes logged)
    return makeItem(
      "COMPLETED_HEALTHY",
      "NORMAL",
      "Sesi Selesai Lengkap",
      "Seluruh presensi dan catatan latihan telah difinalisasi dengan lengkap.",
      []
    );
  }

  // Priority 4: TODAY_UPCOMING (SCHEDULED session within today's calendar window in Asia/Jakarta)
  if (session.status === "SCHEDULED") {
    const isToday =
      startParts.year === nowParts.year &&
      startParts.month === nowParts.month &&
      startParts.day === nowParts.day;

    if (isToday) {
      return makeItem(
        "TODAY_UPCOMING",
        "INFO",
        "Sesi Hari Ini",
        `Sesi terjadwal pukul ${startTimeFormatted}–${endTimeFormatted} WIB siap dilaksanakan.`,
        session.athletes.map((a) => a.fullName)
      );
    }
  }

  // Future scheduled on another date -> normal future schedule, not an anomaly
  return null;
}

/**
 * Builds the comprehensive SessionHealthSummary from evaluated sessions.
 */
export function buildSessionHealthSummary(
  items: (SessionHealthItem | null)[]
): SessionHealthSummary {
  const validItems = items.filter((item): item is SessionHealthItem => item !== null);

  let healthyCount = 0;
  let pastScheduledCount = 0;
  let missingLogCount = 0;
  let unmarkedAttendanceCount = 0;
  let todayUpcomingCount = 0;

  const anomalies: SessionHealthItem[] = [];
  const todayUpcoming: SessionHealthItem[] = [];

  for (const item of validItems) {
    switch (item.healthType) {
      case "COMPLETED_HEALTHY":
        healthyCount++;
        break;
      case "PAST_SCHEDULED":
        pastScheduledCount++;
        anomalies.push(item);
        break;
      case "COMPLETED_MISSING_LOG":
        missingLogCount++;
        anomalies.push(item);
        break;
      case "UNMARKED_ATTENDANCE":
        unmarkedAttendanceCount++;
        anomalies.push(item);
        break;
      case "TODAY_UPCOMING":
        todayUpcomingCount++;
        todayUpcoming.push(item);
        break;
    }
  }

  return {
    totalSessionsAudited: validItems.length,
    healthyCount,
    pastScheduledCount,
    missingLogCount,
    unmarkedAttendanceCount,
    todayUpcomingCount,
    anomalies,
    todayUpcoming,
  };
}
