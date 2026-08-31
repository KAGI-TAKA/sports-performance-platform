import type { ScheduleStatus } from "@prisma/client";
import { parseLocalDateTimeToUTC, getZonedParts, DEFAULT_SCHEDULE_TIMEZONE } from "./utils";

export type ScheduleScope = "all" | "mine";
export type SchedulePeriod = "all" | "today" | "week";
export type ActiveQuickFilter = "all" | "mine" | "today" | "week";

/**
 * Resolves the default scope based on user role.
 * Assistant Coach defaults to "mine" (Sesi Saya), whereas Admin/Head Coach/Owner default to "all".
 */
export function resolveDefaultScope(role: string): ScheduleScope {
  const normalized = (role || "").toLowerCase().trim();
  if (normalized === "assistant_coach" || normalized === "assistant") {
    return "mine";
  }
  return "all";
}

/**
 * Normalizes scope query parameter safely.
 */
export function normalizeScope(
  rawScope: string | null | undefined,
  defaultScope: ScheduleScope
): ScheduleScope {
  if (rawScope === "mine" || rawScope === "all") {
    return rawScope;
  }
  return defaultScope;
}

/**
 * Normalizes period query parameter safely.
 */
export function normalizePeriod(rawPeriod: string | null | undefined): SchedulePeriod {
  if (rawPeriod === "today" || rawPeriod === "week" || rawPeriod === "all") {
    return rawPeriod;
  }
  return "all";
}

/**
 * Computes the exact UTC Date range for "Today" in Asia/Jakarta (00:00:00 to 23:59:59.999 WIB).
 */
export function getTodayRangeJakarta(
  now: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): { startDate: Date; endDate: Date; todayIso: string } {
  const parts = getZonedParts(now, timeZone);
  const y = parts.year;
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  const todayIso = `${y}-${m}-${d}`;

  const startDate = parseLocalDateTimeToUTC(`${todayIso}T00:00:00`, timeZone);
  // 23:59:59.999
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { startDate, endDate, todayIso };
}

/**
 * Computes the exact UTC Date range for "Week" in Asia/Jakarta (Today 00:00:00 to +6 days 23:59:59.999 WIB, total 7 days).
 */
export function getWeekRangeJakarta(
  now: Date = new Date(),
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): { startDate: Date; endDate: Date; startIso: string; endIso: string } {
  const { startDate, todayIso } = getTodayRangeJakarta(now, timeZone);

  // 7 full calendar days = 7 * 24 * 60 * 60 * 1000 - 1 ms
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  const endParts = getZonedParts(endDate, timeZone);
  const endIso = `${endParts.year}-${String(endParts.month).padStart(2, "0")}-${String(endParts.day).padStart(2, "0")}`;

  return { startDate, endDate, startIso: todayIso, endIso };
}

export interface ResolveFiltersInput {
  role: string;
  memberId: string;
  searchParams?: {
    scope?: string;
    period?: string;
    date?: string;
    coachId?: string;
    status?: string;
  };
  now?: Date;
  timeZone?: string;
}

export interface ResolvedScheduleFilters {
  scope: ScheduleScope;
  period: SchedulePeriod;
  activeQuickFilter: ActiveQuickFilter;
  effectiveCoachId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ScheduleStatus;
  isSpecificDate: boolean;
}

/**
 * Pure evaluator that parses raw searchParams and role context to compute the exact Prisma query filters.
 */
export function resolveEffectiveScheduleFilters(
  input: ResolveFiltersInput
): ResolvedScheduleFilters {
  const { role, memberId, searchParams = {}, now = new Date(), timeZone = DEFAULT_SCHEDULE_TIMEZONE } = input;

  const defaultScope = resolveDefaultScope(role);
  const scope = normalizeScope(searchParams.scope, defaultScope);
  const period = normalizePeriod(searchParams.period);
  const dateParam = searchParams.date?.trim();

  // Determine active quick filter button
  let activeQuickFilter: ActiveQuickFilter = "all";
  if (period === "today") {
    activeQuickFilter = "today";
  } else if (period === "week") {
    activeQuickFilter = "week";
  } else if (scope === "mine") {
    activeQuickFilter = "mine";
  } else {
    activeQuickFilter = "all";
  }

  // 1. Resolve Coach Filter
  let effectiveCoachId: string | undefined = undefined;
  if (scope === "mine") {
    effectiveCoachId = memberId;
  } else if (searchParams.coachId && searchParams.coachId !== "ALL") {
    effectiveCoachId = searchParams.coachId;
  }

  // 2. Resolve Date Range
  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;
  let isSpecificDate = false;

  if (period === "today") {
    const today = getTodayRangeJakarta(now, timeZone);
    startDate = today.startDate;
    endDate = today.endDate;
  } else if (period === "week") {
    const week = getWeekRangeJakarta(now, timeZone);
    startDate = week.startDate;
    endDate = week.endDate;
  } else if (dateParam) {
    // Specific single date parameter
    const start = parseLocalDateTimeToUTC(`${dateParam}T00:00:00`, timeZone);
    startDate = start;
    endDate = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    isSpecificDate = true;
  }

  // 3. Resolve Status Filter
  let status: ScheduleStatus | undefined = undefined;
  const rawStatus = searchParams.status?.toUpperCase();
  if (
    rawStatus === "SCHEDULED" ||
    rawStatus === "COMPLETED" ||
    rawStatus === "CANCELLED" ||
    rawStatus === "NO_SHOW"
  ) {
    status = rawStatus as ScheduleStatus;
  }

  return {
    scope,
    period,
    activeQuickFilter,
    effectiveCoachId,
    startDate,
    endDate,
    status,
    isSpecificDate,
  };
}

/**
 * Returns user-friendly empty state titles and descriptions tailored to active quick filters.
 */
export function getQuickFilterEmptyState(
  activeFilter: ActiveQuickFilter,
  role: string
): { title: string; description: string } {
  const isAssistant = resolveDefaultScope(role) === "mine";

  switch (activeFilter) {
    case "today":
      return {
        title: "Tidak Ada Sesi Latihan Hari Ini",
        description: isAssistant
          ? "Anda tidak memiliki jadwal sesi latihan yang ditugaskan untuk hari ini."
          : "Belum ada sesi latihan yang dijadwalkan untuk organisasi pada hari ini.",
      };
    case "week":
      return {
        title: "Tidak Ada Sesi Dalam 7 Hari ke Depan",
        description: isAssistant
          ? "Tidak ada jadwal latihan yang ditugaskan kepada Anda dalam 7 hari ke depan."
          : "Belum ada sesi latihan yang terjadwal di organisasi dalam 7 hari ke depan.",
      };
    case "mine":
      return {
        title: "Belum Ada Sesi yang Ditugaskan",
        description: "Saat ini Anda belum memiliki jadwal sesi latihan yang ditugaskan sebagai pelatih penanggung jawab.",
      };
    case "all":
    default:
      return {
        title: "Belum Ada Sesi Terjadwal",
        description: "Belum ada jadwal sesi latihan di organisasi. Buat jadwal sesi baru atau gunakan jadwal berulang.",
      };
  }
}
