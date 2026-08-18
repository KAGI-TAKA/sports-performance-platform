import { describe, it, expect } from "vitest";
import {
  parseLocalDateTimeToUTC,
  toLocalDateStr,
  toDateTimeLocalString,
  getStartOfDay,
  getEndOfDay,
  formatTimeRange,
  DEFAULT_SCHEDULE_TIMEZONE,
} from "./utils";

describe("Schedule Timezone Utilities (Asia/Jakarta Canonical)", () => {
  it("Test 1: Parses morning time 09:00 Asia/Jakarta to 02:00:00.000Z", () => {
    const utcDate = parseLocalDateTimeToUTC("2026-08-20T09:00", DEFAULT_SCHEDULE_TIMEZONE);
    expect(utcDate.toISOString()).toBe("2026-08-20T02:00:00.000Z");
  });

  it("Test 2: Parses evening time 21:00 Asia/Jakarta to 14:00:00.000Z", () => {
    const utcDate = parseLocalDateTimeToUTC("2026-08-20T21:00", DEFAULT_SCHEDULE_TIMEZONE);
    expect(utcDate.toISOString()).toBe("2026-08-20T14:00:00.000Z");
  });

  it("Test 3: Converts UTC Date to local date string (2026-08-20)", () => {
    const localDateStr = toLocalDateStr(new Date("2026-08-20T14:00:00.000Z"), DEFAULT_SCHEDULE_TIMEZONE);
    expect(localDateStr).toBe("2026-08-20");
  });

  it("Test 4: Converts UTC Date to datetime-local input string (2026-08-20T21:00)", () => {
    const inputVal = toDateTimeLocalString(new Date("2026-08-20T14:00:00.000Z"), DEFAULT_SCHEDULE_TIMEZONE);
    expect(inputVal).toBe("2026-08-20T21:00");
  });

  it("Test 5: Parses midnight 00:00 Asia/Jakarta to previous day 17:00:00.000Z", () => {
    const utcDate = parseLocalDateTimeToUTC("2026-08-20T00:00", DEFAULT_SCHEDULE_TIMEZONE);
    expect(utcDate.toISOString()).toBe("2026-08-19T17:00:00.000Z");
  });

  it("Test 6: Parses late night 23:00 Asia/Jakarta to 16:00:00.000Z", () => {
    const utcDate = parseLocalDateTimeToUTC("2026-08-20T23:00", DEFAULT_SCHEDULE_TIMEZONE);
    expect(utcDate.toISOString()).toBe("2026-08-20T16:00:00.000Z");
  });

  it("Test 7: Handles sessions crossing midnight cleanly", () => {
    const startUtc = parseLocalDateTimeToUTC("2026-08-20T23:00", DEFAULT_SCHEDULE_TIMEZONE);
    const endUtc = parseLocalDateTimeToUTC("2026-08-21T01:00", DEFAULT_SCHEDULE_TIMEZONE);

    expect(startUtc.toISOString()).toBe("2026-08-20T16:00:00.000Z");
    expect(endUtc.toISOString()).toBe("2026-08-20T18:00:00.000Z");

    expect(toLocalDateStr(startUtc, DEFAULT_SCHEDULE_TIMEZONE)).toBe("2026-08-20");
    expect(toLocalDateStr(endUtc, DEFAULT_SCHEDULE_TIMEZONE)).toBe("2026-08-21");
    expect(formatTimeRange(startUtc, endUtc, DEFAULT_SCHEDULE_TIMEZONE)).toBe("23:00 - 01:00 WIB");
  });

  it("Boundary Test: getStartOfDay and getEndOfDay for 2026-08-20", () => {
    const startOfDay = getStartOfDay("2026-08-20", DEFAULT_SCHEDULE_TIMEZONE);
    const endOfDay = getEndOfDay("2026-08-20", DEFAULT_SCHEDULE_TIMEZONE);

    expect(startOfDay.toISOString()).toBe("2026-08-19T17:00:00.000Z");
    expect(endOfDay.toISOString()).toBe("2026-08-20T16:59:59.999Z");
  });

  it("Validation Test: Rejects invalid or non-existent date strings", () => {
    expect(() => parseLocalDateTimeToUTC("invalid")).toThrow("Format datetime-local tidak valid");
    expect(() => parseLocalDateTimeToUTC("2026-99-99T99:99")).toThrow("Nilai tanggal atau waktu di luar rentang valid");
    expect(() => parseLocalDateTimeToUTC("2026-02-30T10:00")).toThrow("Tanggal kalender tidak valid");
  });
});
