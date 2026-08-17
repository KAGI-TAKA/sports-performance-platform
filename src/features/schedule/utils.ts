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

export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates array of days to render in a 7-column month grid (Monday to Sunday).
 * Includes padding days from previous and next months.
 */
export function getCalendarDaysForMonth(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for 1st of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  // Convert so Monday = 0, Sunday = 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const todayStr = new Date().toISOString().split("T")[0];
  const days: CalendarDay[] = [];

  // Previous month padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  const totalDays = lastDayOfMonth.getDate();
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: d,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding days to complete 7-col grid (up to multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

/**
 * Formats year and month into Indonesian title (e.g., "Agustus 2026").
 */
export function formatMonthHeader(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

