/**
 * Schedule Date & Time Boundary Utilities
 * Centralized helpers to ensure consistent date interpretation across Schedule and Dashboard modules.
 */

/**
 * Returns a Date set to 00:00:00.000 for a given Date or ISO date string (YYYY-MM-DD).
 */
export function getStartOfDay(dateInput?: string | Date): Date {
  if (!dateInput) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("-").map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 0, 0, 0, 0);
}

/**
 * Returns a Date set to 23:59:59.999 for a given Date or ISO date string (YYYY-MM-DD).
 */
export function getEndOfDay(dateInput?: string | Date): Date {
  if (!dateInput) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("-").map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 23, 59, 59, 999);
}

/**
 * Formats YYYY-MM-DD or Date object into human-readable Indonesian header.
 */
export function formatDateHeader(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? getStartOfDay(dateInput) : dateInput;
  const today = getStartOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const formattedDate = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isToday) return `Hari Ini — ${formattedDate}`;
  if (isTomorrow) return `Besok — ${formattedDate}`;
  return formattedDate;
}

/**
 * Formats start and end Dates into "HH:mm - HH:mm WIB".
 */
export function formatTimeRange(start: Date, end: Date): string {
  const s = new Date(start).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const e = new Date(end).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${s} - ${e} WIB`;
}
