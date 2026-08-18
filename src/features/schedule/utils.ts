/**
 * Schedule Date & Time Boundary Utilities
 * Centralized helpers to ensure consistent date interpretation across Schedule and Dashboard modules
 * based on canonical wall-clock local time (Asia/Jakarta).
 */

export const DEFAULT_SCHEDULE_TIMEZONE = "Asia/Jakarta";

export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Extracts zoned date components (year, month, day, hour, minute, second) for a given Date
 * in the specified IANA timezone using native Intl.DateTimeFormat (hourCycle: h23).
 */
export function getZonedParts(
  date: Date,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/**
 * Parses a local datetime string (e.g. "2026-08-20T21:00") into a UTC Date object
 * assuming the time is in the target IANA timezone (default: Asia/Jakarta).
 * Throws explicit error for invalid or out-of-bounds inputs.
 */
export function parseLocalDateTimeToUTC(
  localDateTimeStr: string,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): Date {
  if (!localDateTimeStr || typeof localDateTimeStr !== "string") {
    throw new Error("String datetime lokal tidak valid");
  }

  const trimmed = localDateTimeStr.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error("Format datetime-local tidak valid. Diharapkan YYYY-MM-DDTHH:mm");
  }

  const [, yStr, mStr, dStr, hrStr, minStr, secStr] = match;
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);
  const hour = parseInt(hrStr, 10);
  const minute = parseInt(minStr, 10);
  const second = secStr ? parseInt(secStr, 10) : 0;

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw new Error("Nilai tanggal atau waktu di luar rentang valid");
  }

  // Candidate UTC timestamp
  const utcTargetMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const zonedParts = getZonedParts(new Date(utcTargetMs), timeZone);
  const zonedMs = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second
  );

  const offsetMs = zonedMs - utcTargetMs;
  const finalUtcMs = utcTargetMs - offsetMs;
  const resultDate = new Date(finalUtcMs);

  const verifyParts = getZonedParts(resultDate, timeZone);
  if (
    verifyParts.year !== year ||
    verifyParts.month !== month ||
    verifyParts.day !== day ||
    verifyParts.hour !== hour ||
    verifyParts.minute !== minute
  ) {
    throw new Error("Tanggal kalender tidak valid (misal: 30 Februari)");
  }

  return resultDate;
}

/**
 * Converts a Date object or ISO/date string into a local YYYY-MM-DD string
 * in the specified IANA timezone (default: Asia/Jakarta).
 */
export function toLocalDateStr(
  dateInput: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): string {
  let d: Date;
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    d = new Date(trimmed);
  } else {
    d = dateInput;
  }

  if (!d || isNaN(d.getTime())) {
    throw new Error("Tanggal tidak valid");
  }

  const parts = getZonedParts(d, timeZone);
  const y = String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Converts a Date object into a YYYY-MM-DDTHH:mm string suitable for <input type="datetime-local">
 * in the specified IANA timezone (default: Asia/Jakarta).
 */
export function toDateTimeLocalString(
  dateInput?: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): string {
  let d: Date;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === "string") {
    d = new Date(dateInput);
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) {
    throw new Error("Tanggal tidak valid");
  }

  const parts = getZonedParts(d, timeZone);
  const y = String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  const hr = String(parts.hour).padStart(2, "0");
  const min = String(parts.minute).padStart(2, "0");
  return `${y}-${m}-${day}T${hr}:${min}`;
}

/**
 * Returns a UTC Date representing 00:00:00.000 of the target calendar date in the specified timezone.
 */
export function getStartOfDay(
  dateInput?: string | Date,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): Date {
  let dateStr: string;
  if (!dateInput) {
    dateStr = toLocalDateStr(new Date(), timeZone);
  } else if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    dateStr = dateInput.trim();
  } else {
    dateStr = toLocalDateStr(dateInput, timeZone);
  }
  return parseLocalDateTimeToUTC(`${dateStr}T00:00`, timeZone);
}

/**
 * Returns a UTC Date representing 23:59:59.999 of the target calendar date in the specified timezone.
 */
export function getEndOfDay(
  dateInput?: string | Date,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): Date {
  let dateStr: string;
  if (!dateInput) {
    dateStr = toLocalDateStr(new Date(), timeZone);
  } else if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    dateStr = dateInput.trim();
  } else {
    dateStr = toLocalDateStr(dateInput, timeZone);
  }
  const d = parseLocalDateTimeToUTC(`${dateStr}T23:59:59`, timeZone);
  d.setUTCMilliseconds(999);
  return d;
}

/**
 * Formats YYYY-MM-DD or Date object into human-readable Indonesian header.
 */
export function formatDateHeader(
  dateInput: string | Date,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): string {
  const targetDateStr = toLocalDateStr(dateInput, timeZone);
  const todayStr = toLocalDateStr(new Date(), timeZone);

  const todayStart = getStartOfDay(todayStr, timeZone);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = toLocalDateStr(tomorrowStart, timeZone);

  const isToday = targetDateStr === todayStr;
  const isTomorrow = targetDateStr === tomorrowStr;

  const startOfDayUtc = getStartOfDay(targetDateStr, timeZone);
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(startOfDayUtc);

  if (isToday) return `Hari Ini — ${formattedDate}`;
  if (isTomorrow) return `Besok — ${formattedDate}`;
  return formattedDate;
}

/**
 * Formats start and end Dates into "HH:mm - HH:mm WIB".
 */
export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const s = formatter.format(startDate).replace(/\./g, ":");
  const e = formatter.format(endDate).replace(/\./g, ":");
  return `${s} - ${e} WIB`;
}

/**
 * Generates array of days to render in a 7-column month grid (Monday to Sunday).
 * Includes padding days from previous and next months.
 */
export function getCalendarDaysForMonth(
  year: number,
  month: number,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDateUtc = parseLocalDateTimeToUTC(
    `${year}-${String(month + 1).padStart(2, "0")}-01T00:00`,
    timeZone
  );

  const weekdayStr = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(
    firstDateUtc
  );
  const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const startDayOfWeek = dayMap[weekdayStr] ?? 0;

  const todayStr = toLocalDateStr(new Date(), timeZone);
  const days: CalendarDay[] = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYearNum = month === 0 ? year - 1 : year;
    const dateStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, "0")}-${String(prevDayNum).padStart(2, "0")}`;
    const dateObj = parseLocalDateTimeToUTC(`${dateStr}T00:00`, timeZone);
    days.push({
      date: dateObj,
      dateStr,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = parseLocalDateTimeToUTC(`${dateStr}T00:00`, timeZone);
    days.push({
      date: dateObj,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding to complete multiple of 7
  const remaining = (7 - (days.length % 7)) % 7;
  const nextMonthNum = month === 11 ? 1 : month + 2;
  const nextYearNum = month === 11 ? year + 1 : year;
  for (let i = 1; i <= remaining; i++) {
    const dateStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dateObj = parseLocalDateTimeToUTC(`${dateStr}T00:00`, timeZone);
    days.push({
      date: dateObj,
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

/**
 * Formats year and month into Indonesian title (e.g., "Agustus 2026").
 */
export function formatMonthHeader(
  year: number,
  month: number,
  timeZone: string = DEFAULT_SCHEDULE_TIMEZONE
): string {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-01T00:00`;
  const date = parseLocalDateTimeToUTC(dateStr, timeZone);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(date);
}
