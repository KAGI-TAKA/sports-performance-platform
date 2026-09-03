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
  Zap,
  Repeat,
  Flame,
} from "lucide-react";

export type TimerMode = "STOPWATCH" | "COUNTDOWN" | "DRILL";
export type TimerState = "idle" | "running" | "paused" | "finished";
export type DrillPhase = "WORK" | "REST";

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

const DRILL_PRESETS = [
  { label: "Tabata (20s/10s - 8x)", work: 20, rest: 10, rounds: 8 },
  { label: "Agility Drill (30s/15s - 5x)", work: 30, rest: 15, rounds: 5 },
  { label: "Conditioning (45s/30s - 6x)", work: 45, rest: 30, rounds: 6 },
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

  // Drill Timer (Interval Work/Rest/Rounds)
  const [drillWorkSec, setDrillWorkSec] = useState(30);
  const [drillRestSec, setDrillRestSec] = useState(15);
  const [drillTotalRounds, setDrillTotalRounds] = useState(5);
  const [drillCurrentRound, setDrillCurrentRound] = useState(1);
  const [drillPhase, setDrillPhase] = useState<DrillPhase>("WORK");
  const [drillRemainingMs, setDrillRemainingMs] = useState(30000);

  // Monotonic tracking references
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const lastLapTotalMsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mutable refs for Drill Timer state transitions inside tick
  const drillPhaseRef = useRef<DrillPhase>("WORK");
  const drillRoundRef = useRef<number>(1);
  const drillWorkSecRef = useRef<number>(drillWorkSec);
  const drillRestSecRef = useRef<number>(drillRestSec);
  const drillTotalRoundsRef = useRef<number>(drillTotalRounds);

  useEffect(() => {
    drillWorkSecRef.current = drillWorkSec;
    drillRestSecRef.current = drillRestSec;
    drillTotalRoundsRef.current = drillTotalRounds;
  }, [drillWorkSec, drillRestSec, drillTotalRounds]);

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
    } else if (mode === "COUNTDOWN") {
      const left = Math.max(0, countdownTargetMs - currentElapsed);
      setRemainingMs(left);
      if (left <= 0) {
        setTimerState("finished");
        clearTimerInterval();
      }
    } else if (mode === "DRILL") {
      const phaseTargetMs =
        drillPhaseRef.current === "WORK"
          ? drillWorkSecRef.current * 1000
          : drillRestSecRef.current * 1000;

      const left = Math.max(0, phaseTargetMs - currentElapsed);
      setDrillRemainingMs(left);

      if (left <= 0) {
        // Reset base for next phase
        startTimeRef.current = Date.now();
        accumulatedMsRef.current = 0;

        if (drillPhaseRef.current === "WORK") {
          if (drillRestSecRef.current > 0) {
            drillPhaseRef.current = "REST";
            setDrillPhase("REST");
            setDrillRemainingMs(drillRestSecRef.current * 1000);
          } else {
            // No rest, advance round directly
            if (drillRoundRef.current >= drillTotalRoundsRef.current) {
              setTimerState("finished");
              clearTimerInterval();
            } else {
              drillRoundRef.current += 1;
              setDrillCurrentRound(drillRoundRef.current);
              setDrillRemainingMs(drillWorkSecRef.current * 1000);
            }
          }
        } else {
          // Finished REST phase -> check next round
          if (drillRoundRef.current >= drillTotalRoundsRef.current) {
            setTimerState("finished");
            clearTimerInterval();
          } else {
            drillRoundRef.current += 1;
            drillPhaseRef.current = "WORK";
            setDrillRoundRefState(drillRoundRef.current);
            setDrillPhase("WORK");
            setDrillRemainingMs(drillWorkSecRef.current * 1000);
          }
        }
      }
    }
  }, [mode, countdownTargetMs, clearTimerInterval]);

  function setDrillRoundRefState(r: number) {
    setDrillCurrentRound(r);
  }

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

    // Reset Drill
    drillPhaseRef.current = "WORK";
    drillRoundRef.current = 1;
    setDrillPhase("WORK");
    setDrillCurrentRound(1);
    setDrillRemainingMs(drillWorkSec * 1000);

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

  // Switch timer mode
  const handleSwitchMode = (newMode: TimerMode) => {
    if (mode === newMode) return;
    handleReset();
    setMode(newMode);
    if (newMode === "DRILL") {
      setDrillRemainingMs(drillWorkSec * 1000);
    }
  };

  // Select Countdown Preset
  const handleSelectCountdownPreset = (seconds: number) => {
    if (timerState === "running") return;
    handleReset();
    setCountdownTargetMs(seconds * 1000);
    setRemainingMs(seconds * 1000);
  };

  // Select Drill Preset
  const handleSelectDrillPreset = (work: number, rest: number, rounds: number) => {
    if (timerState === "running") return;
    handleReset();
    setDrillWorkSec(work);
    setDrillRestSec(rest);
    setDrillTotalRounds(rounds);
    drillWorkSecRef.current = work;
    drillRestSecRef.current = rest;
    drillTotalRoundsRef.current = rounds;
    drillRoundRef.current = 1;
    drillPhaseRef.current = "WORK";
    setDrillCurrentRound(1);
    setDrillPhase("WORK");
    setDrillRemainingMs(work * 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  // Compute Active Display Value
  const activeTimeMs =
    mode === "STOPWATCH" ? elapsedMs : mode === "COUNTDOWN" ? remainingMs : drillRemainingMs;
  const { minutes, seconds, fraction } = formatTimeDisplay(activeTimeMs);
  const isFinished = timerState === "finished";

  return (
    <div className="rounded-2xl border border-border bg-slate-950 text-white shadow-md overflow-hidden">
      {/* Top Bar: Title & Mode Switcher */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-200 block leading-tight">
              Tools Lapangan
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Stopwatch &amp; Drill Timer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 3-Mode Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchMode("STOPWATCH")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mode === "STOPWATCH"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stopwatch
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("DRILL")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mode === "DRILL"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Drill Timer
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("COUNTDOWN")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mode === "COUNTDOWN"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Mundur
            </button>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label={collapsed ? "Perluas Stopwatch" : "Perkecil Stopwatch"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Countdown Presets */}
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
                    onClick={() => handleSelectCountdownPreset(preset.seconds)}
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

          {/* Drill Timer Configuration & Presets */}
          {mode === "DRILL" && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-400" /> Presets:
                </span>
                {DRILL_PRESETS.map((p) => {
                  const isActive =
                    drillWorkSec === p.work &&
                    drillRestSec === p.rest &&
                    drillTotalRounds === p.rounds;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectDrillPreset(p.work, p.rest, p.rounds)}
                      disabled={timerState === "running"}
                      className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        isActive
                          ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      } ${timerState === "running" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Status Header for Drill: Round & Phase indicator */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-400 uppercase text-[11px]">
                    Round:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-black text-white text-xs border border-slate-700">
                    {drillCurrentRound} / {drillTotalRounds}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-400 text-[11px]">Fase:</span>
                  <span
                    className={`px-3 py-0.5 rounded-full font-bold text-xs tracking-wider uppercase flex items-center gap-1 ${
                      drillPhase === "WORK"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {drillPhase === "WORK" ? (
                      <>
                        <Zap className="h-3 w-3 fill-emerald-400" />
                        <span>WORK ({drillWorkSec}s)</span>
                      </>
                    ) : (
                      <>
                        <Hourglass className="h-3 w-3" />
                        <span>REST ({drillRestSec}s)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Time LCD Display (Outdoor High Contrast) */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 text-center transition-all shadow-inner ${
              isFinished
                ? "bg-rose-950/80 border-rose-600 animate-pulse text-rose-300"
                : mode === "DRILL" && drillPhase === "REST"
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-400"
                  : timerState === "running"
                    ? "bg-slate-900 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-100"
            }`}
          >
            <div
              className="font-mono font-black text-5xl sm:text-7xl tracking-tight select-none tabular-nums"
              aria-live="polite"
            >
              <span>{minutes}</span>
              <span className="animate-pulse opacity-80">:</span>
              <span>{seconds}</span>
              <span className="text-xl sm:text-3xl text-slate-500 font-medium">.{fraction}</span>
            </div>

            {isFinished ? (
              <div className="mt-2 text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Volume2 className="h-4 w-4" /> Sesi Drill Selesai!
              </div>
            ) : mode === "DRILL" ? (
              <div className="mt-2 text-xs font-mono font-semibold tracking-wider text-slate-400">
                {drillPhase === "WORK" ? "⚡ AKSI MAKSIMAL" : "☕ TARIK NAPAS / RECOVERY"}
              </div>
            ) : null}
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

          {/* Lap History List (Stopwatch mode) */}
          {mode === "STOPWATCH" && laps.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Catatan Lap ({laps.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs font-mono">
                {laps.map((lap) => {
                  const lapFmt = formatTimeDisplay(lap.lapTimeMs);
                  return (
                    <div
                      key={lap.index}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      <span className="text-slate-500 font-bold">#{lap.index}</span>
                      <span className="font-bold text-emerald-400">
                        {lapFmt.minutes}:{lapFmt.seconds}.{lapFmt.fraction}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
