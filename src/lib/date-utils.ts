/**
 * Standardized Date & Time Formatting Utilities
 * Single Source of Truth for localized date presentation (Asia/Jakarta / Indonesian format)
 */

export const DEFAULT_TIMEZONE = "Asia/Jakarta";
export const DEFAULT_LOCALE = "id-ID";

/**
 * Formats a date into localized Indonesian full format (e.g. "20 Agustus 2026")
 */
export function formatDateID(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString(DEFAULT_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  });
}

/**
 * Formats a date into localized short format (e.g. "20 Agu 2026")
 */
export function formatShortDateID(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DEFAULT_TIMEZONE,
  });
}

/**
 * Formats time in 24-hour WIB format (e.g. "15:30 WIB")
 */
export function formatTimeID(
  date: Date | string | number | null | undefined,
  includeZone = true
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const timeStr = d.toLocaleTimeString(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIMEZONE,
  });

  return includeZone ? `${timeStr} WIB` : timeStr;
}

/**
 * Formats full date and time (e.g. "Senin, 20 Agustus 2026 · 15:30 WIB")
 */
export function formatDateTimeID(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const datePart = d.toLocaleDateString(DEFAULT_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DEFAULT_TIMEZONE,
  });

  const timePart = formatTimeID(d, true);
  return `${datePart} · ${timePart}`;
}

/**
 * Formats relative date indicator (e.g. "Hari ini", "Kemarin", "Besok", or formatted date)
 */
export function formatRelativeDateID(
  date: Date | string | number | null | undefined,
  baseDate: Date = new Date()
): string {
  if (!date) return "—";
  const target = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(target.getTime())) return "—";

  const tDate = formatDateID(target);
  const bDate = formatDateID(baseDate);

  if (tDate === bDate) return "Hari Ini";

  const yesterday = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
  if (tDate === formatDateID(yesterday)) return "Kemarin";

  const tomorrow = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  if (tDate === formatDateID(tomorrow)) return "Besok";

  return formatShortDateID(target);
}
