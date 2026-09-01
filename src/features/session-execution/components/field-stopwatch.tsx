"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Timer,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Volume2,
} from "lucide-react";

export type TimerMode = "STOPWATCH" | "COUNTDOWN";
export type TimerState = "idle" | "running" | "paused" | "finished";

export interface LapRecord {
  index: number;
  lapTimeMs: number;
  totalTimeMs: number;
}

const COUNTDOWN_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
];

export function formatTimeDisplay(ms: number): {
  minutes: string;
  seconds: string;
  fraction: string;
} {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((safeMs % 1000) / 10);

  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    fraction: String(hundredths).padStart(2, "0"),
  };
}

export function FieldStopwatch() {
  const [mode, setMode] = useState<TimerMode>("STOPWATCH");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [collapsed, setCollapsed] = useState(false);

  // Stopwatch tracking (Monotonic Date.now())
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);

  // Countdown duration (default 2 minutes = 120,000 ms)
  const [countdownTargetMs, setCountdownTargetMs] = useState(120000);
  const [remainingMs, setRemainingMs] = useState(120000);

  // Monotonic tracking references
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const lastLapTotalMsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateTick = useCallback(() => {
    if (!startTimeRef.current) return;
    const now = Date.now();
    const currentElapsed = accumulatedMsRef.current + (now - startTimeRef.current);

    if (mode === "STOPWATCH") {
      setElapsedMs(currentElapsed);
    } else {
      const left = Math.max(0, countdownTargetMs - currentElapsed);
      setRemainingMs(left);
      if (left <= 0) {
        setTimerState("finished");
        clearTimerInterval();
      }
    }
  }, [mode, countdownTargetMs, clearTimerInterval]);

  // Start / Resume Timer
  const handleStart = () => {
    if (timerState === "running") return;

    startTimeRef.current = Date.now();
    setTimerState("running");

    clearTimerInterval();
    intervalRef.current = setInterval(updateTick, 50);
  };

  // Pause Timer
  const handlePause = () => {
    if (timerState !== "running") return;

    if (startTimeRef.current) {
      accumulatedMsRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }

    clearTimerInterval();
    setTimerState("paused");
  };

  // Reset Timer
  const handleReset = () => {
    clearTimerInterval();
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    lastLapTotalMsRef.current = 0;
    setElapsedMs(0);
    setRemainingMs(countdownTargetMs);
    setLaps([]);
    setTimerState("idle");
  };

  // Lap Recorder (Stopwatch mode only)
  const handleLap = () => {
    if (mode !== "STOPWATCH" || timerState === "idle") return;

    const currentTotal =
      accumulatedMsRef.current + (startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    const lapTime = currentTotal - lastLapTotalMsRef.current;
    lastLapTotalMsRef.current = currentTotal;

    setLaps((prev) => [
      {
        index: prev.length + 1,
        lapTimeMs: lapTime,
        totalTimeMs: currentTotal,
      },
      ...prev,
    ]);
  };

  // Preset Selector (Countdown mode)
  const handleSelectPreset = (seconds: number) => {
    const targetMs = seconds * 1000;
    setCountdownTargetMs(targetMs);
    setRemainingMs(targetMs);
    handleReset();
  };

  // Mode Switcher
  const handleSwitchMode = (newMode: TimerMode) => {
    if (mode === newMode) return;
    handleReset();
    setMode(newMode);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const displayTime = mode === "STOPWATCH" ? elapsedMs : remainingMs;
  const { minutes, seconds, fraction } = formatTimeDisplay(displayTime);
  const isFinished = mode === "COUNTDOWN" && remainingMs === 0 && timerState === "finished";

  return (
    <section
      aria-label="Field Stopwatch & Interval Timer"
      className="rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-md overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-900/80 select-none">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-emerald-400 shrink-0" />
          <h2 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-200">
            Field Stopwatch & Timer
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-800 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchMode("STOPWATCH")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                mode === "STOPWATCH"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stopwatch
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("COUNTDOWN")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                mode === "COUNTDOWN"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Interval
            </button>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={collapsed ? "Perluas Stopwatch" : "Perkecil Stopwatch"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Countdown Preset Selector */}
          {mode === "COUNTDOWN" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Hourglass className="h-3 w-3" /> Preset:
              </span>
              {COUNTDOWN_PRESETS.map((preset) => {
                const isActive = countdownTargetMs === preset.seconds * 1000;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.seconds)}
                    disabled={timerState === "running"}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                      isActive
                        ? "bg-indigo-500 text-white border-indigo-400 shadow-xs"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                    } ${timerState === "running" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Time LCD Display (Outdoor High Contrast) */}
          <div
            className={`rounded-xl border p-4 sm:p-6 text-center transition-all ${
              isFinished
                ? "bg-rose-950/80 border-rose-600 animate-pulse text-rose-300"
                : timerState === "running"
                  ? "bg-slate-900 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-900/60 border-slate-800 text-slate-100"
            }`}
          >
            <div
              className="font-mono font-black text-4xl sm:text-6xl tracking-tight select-none tabular-nums"
              aria-live="polite"
            >
              <span>{minutes}</span>
              <span className="animate-pulse opacity-80">:</span>
              <span>{seconds}</span>
              <span className="text-xl sm:text-3xl text-slate-500 font-medium">.{fraction}</span>
            </div>

            {isFinished && (
              <div className="mt-2 text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Volume2 className="h-4 w-4" /> Waktu Interval Selesai!
              </div>
            )}
          </div>

          {/* Controls Bar (Min Height 44px) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {timerState !== "running" ? (
              <button
                type="button"
                onClick={handleStart}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                aria-label="Mulai Timer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>{timerState === "paused" ? "Lanjutkan" : "Mulai"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                aria-label="Jeda Timer"
              >
                <Pause className="h-4 w-4 fill-white" />
                <span>Jeda</span>
              </button>
            )}

            {/* Lap Button (Stopwatch mode) */}
            {mode === "STOPWATCH" && (
              <button
                type="button"
                onClick={handleLap}
                disabled={timerState === "idle"}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  timerState === "idle"
                    ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer"
                }`}
                aria-label="Catat Lap"
              >
                <Flag className="h-4 w-4" />
                <span>+ Lap</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={timerState === "idle" && laps.length === 0 && elapsedMs === 0}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                timerState === "idle" && laps.length === 0 && elapsedMs === 0
                  ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                  : "bg-slate-800 text-slate-200 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 active:scale-95 cursor-pointer"
              }`}
              aria-label="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Lap History List (if any) */}
          {mode === "STOPWATCH" && laps.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 flex justify-between">
                <span>Lap</span>
                <span>Waktu Lap</span>
                <span>Total</span>
              </div>
              {laps.map((lap) => {
                const lapFormatted = formatTimeDisplay(lap.lapTimeMs);
                const totalFormatted = formatTimeDisplay(lap.totalTimeMs);

                return (
                  <div
                    key={lap.index}
                    className="flex justify-between items-center text-xs font-mono py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-slate-300"
                  >
                    <span className="font-bold text-emerald-400">#{lap.index}</span>
                    <span>
                      +{lapFormatted.minutes}:{lapFormatted.seconds}.{lapFormatted.fraction}
                    </span>
                    <span className="text-slate-400">
                      {totalFormatted.minutes}:{totalFormatted.seconds}.{totalFormatted.fraction}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
