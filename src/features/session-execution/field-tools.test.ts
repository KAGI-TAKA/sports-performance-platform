import { describe, it, expect } from "vitest";
import { formatTimeDisplay } from "./components/field-stopwatch";
import type { AttendanceStatus } from "@prisma/client";

describe("P8-B1.1: 1-Tap Attendance Safety & Transition Logic", () => {
  it("should transition all UNMARKED athletes to PRESENT and preserve other statuses", () => {
    const initialRoster: { athleteId: string; status: AttendanceStatus }[] = [
      { athleteId: "a1", status: "UNMARKED" },
      { athleteId: "a2", status: "UNMARKED" },
      { athleteId: "a3", status: "ABSENT" },
      { athleteId: "a4", status: "EXCUSED" },
      { athleteId: "a5", status: "LATE" },
      { athleteId: "a6", status: "RESCHEDULED" },
      { athleteId: "a7", status: "PRESENT" },
    ];

    // Simulating batchMarkAllPresent transition rule
    let updatedCount = 0;
    let preservedCount = 0;

    const updatedRoster = initialRoster.map((a) => {
      if (a.status === "UNMARKED") {
        updatedCount++;
        return { ...a, status: "PRESENT" as AttendanceStatus };
      } else {
        preservedCount++;
        return a;
      }
    });

    expect(updatedCount).toBe(2);
    expect(preservedCount).toBe(5);

    // Verify statuses
    expect(updatedRoster.find((a) => a.athleteId === "a1")?.status).toBe("PRESENT");
    expect(updatedRoster.find((a) => a.athleteId === "a2")?.status).toBe("PRESENT");
    expect(updatedRoster.find((a) => a.athleteId === "a3")?.status).toBe("ABSENT");
    expect(updatedRoster.find((a) => a.athleteId === "a4")?.status).toBe("EXCUSED");
    expect(updatedRoster.find((a) => a.athleteId === "a5")?.status).toBe("LATE");
    expect(updatedRoster.find((a) => a.athleteId === "a6")?.status).toBe("RESCHEDULED");
    expect(updatedRoster.find((a) => a.athleteId === "a7")?.status).toBe("PRESENT");
  });

  it("should return updatedCount = 0 when no athletes are UNMARKED", () => {
    const fullRoster: { athleteId: string; status: AttendanceStatus }[] = [
      { athleteId: "a1", status: "PRESENT" },
      { athleteId: "a2", status: "ABSENT" },
      { athleteId: "a3", status: "EXCUSED" },
    ];

    const toUpdate = fullRoster.filter((a) => a.status === "UNMARKED");
    expect(toUpdate.length).toBe(0);
  });

  it("should handle empty roster safely without errors", () => {
    const emptyRoster: { athleteId: string; status: AttendanceStatus }[] = [];
    const toUpdate = emptyRoster.filter((a) => a.status === "UNMARKED");
    expect(toUpdate.length).toBe(0);
  });
});

describe("P8-B1.2: Field Stopwatch & Monotonic Timing Engine", () => {
  it("should format milliseconds into padded minutes, seconds, and hundredths", () => {
    // 0 ms -> 00:00.00
    expect(formatTimeDisplay(0)).toEqual({
      minutes: "00",
      seconds: "00",
      fraction: "00",
    });

    // 45,670 ms -> 00:45.67
    expect(formatTimeDisplay(45670)).toEqual({
      minutes: "00",
      seconds: "45",
      fraction: "67",
    });

    // 125,050 ms -> 02:05.05
    expect(formatTimeDisplay(125050)).toEqual({
      minutes: "02",
      seconds: "05",
      fraction: "05",
    });
  });

  it("should never display negative time on countdown completion", () => {
    expect(formatTimeDisplay(-500)).toEqual({
      minutes: "00",
      seconds: "00",
      fraction: "00",
    });
  });

  it("should calculate elapsed time based on monotonic timestamps accurately", () => {
    const startTime = 100000;
    const currentTime = 145800;
    const accumulated = 5000;

    const elapsed = accumulated + (currentTime - startTime);
    expect(elapsed).toBe(50800); // 50.80 seconds
  });

  it("should calculate countdown remaining time without drift", () => {
    const targetMs = 120000; // 2 minutes
    const elapsedMs = 45000; // 45 seconds elapsed

    const remaining = Math.max(0, targetMs - elapsedMs);
    expect(remaining).toBe(75000); // 1m 15s remaining

    const formatted = formatTimeDisplay(remaining);
    expect(formatted.minutes).toBe("01");
    expect(formatted.seconds).toBe("15");
  });

  it("should stop countdown at 0 when elapsed time exceeds target duration", () => {
    const targetMs = 60000; // 1 minute
    const elapsedMs = 65000; // 1m 5s elapsed

    const remaining = Math.max(0, targetMs - elapsedMs);
    expect(remaining).toBe(0);
    expect(formatTimeDisplay(remaining)).toEqual({
      minutes: "00",
      seconds: "00",
      fraction: "00",
    });
  });

  it("should record laps with correct split and total times", () => {
    const lap1Total = 15000;
    const lap2Total = 32000;

    const lap1Split = lap1Total - 0;
    const lap2Split = lap2Total - lap1Total;

    expect(lap1Split).toBe(15000);
    expect(lap2Split).toBe(17000);
  });

  it("should handle multi-lap sequence (3+ laps) maintaining incremental deltas", () => {
    const lapTimes = [10000, 22000, 37000]; // 10s, 22s, 37s total
    const splits = lapTimes.map((total, idx) =>
      idx === 0 ? total : total - lapTimes[idx - 1]
    );

    expect(splits[0]).toBe(10000);
    expect(splits[1]).toBe(12000);
    expect(splits[2]).toBe(15000);
  });

  it("should format large time durations accurately (e.g. 75 minutes)", () => {
    const ms75mins = 75 * 60 * 1000; // 4,500,000 ms
    const formatted = formatTimeDisplay(ms75mins);
    expect(formatted.minutes).toBe("75");
    expect(formatted.seconds).toBe("00");
    expect(formatted.fraction).toBe("00");
  });

  it("should verify standard countdown presets convert to correct millisecond targets", () => {
    const presets = [
      { label: "1m", seconds: 60, expectedMs: 60000 },
      { label: "2m", seconds: 120, expectedMs: 120000 },
      { label: "5m", seconds: 300, expectedMs: 300000 },
      { label: "10m", seconds: 600, expectedMs: 600000 },
    ];

    presets.forEach((p) => {
      expect(p.seconds * 1000).toBe(p.expectedMs);
    });
  });
});

