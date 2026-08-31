"use client";

import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  HelpCircle,
  Sparkles,
  Save,
  RotateCcw,
  MessageSquare,
  Lock,
  Loader2,
} from "lucide-react";
import type { AttendanceStatus, SessionAthleteAttendanceItem } from "../types";
import { calculateAttendanceMetrics } from "../engine";
import {
  batchMarkAttendanceAction,
  fetchSessionAttendanceAction,
} from "../actions";

interface AttendanceSessionDialogProps {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

interface LocalDraftItem {
  status: AttendanceStatus;
  notes: string;
}

export function AttendanceSessionDialog({
  sessionId,
  open,
  onOpenChange,
  onSaved,
}: AttendanceSessionDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Session Data & Roster State
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
    coachId: string;
    coachName: string;
    location: string | null;
  } | null>(null);
  const [roster, setRoster] = useState<SessionAthleteAttendanceItem[]>([]);
  const [isEditable, setIsEditable] = useState(true);

  // Local Editable Draft State: { [athleteId]: { status, notes } }
  const [draft, setDraft] = useState<Record<string, LocalDraftItem>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Quick Action Confirmation State
  const [quickActionConfirm, setQuickActionConfirm] = useState<"ALL_PRESENT" | "RESET_ALL" | null>(null);

  // Fetch session attendance data whenever dialog opens
  useEffect(() => {
    if (!open || !sessionId) {
      setSessionInfo(null);
      setRoster([]);
      setDraft({});
      setErrorMsg(null);
      setQuickActionConfirm(null);
      return;
    }

    setIsLoadingData(true);
    setErrorMsg(null);

    fetchSessionAttendanceAction(sessionId)
      .then((res) => {
        if (res.success && res.data) {
          setSessionInfo(res.data.session);
          setRoster(res.data.roster);
          setIsEditable(res.data.isEditable);

          // Initialize local draft state
          const initialDraft: Record<string, LocalDraftItem> = {};
          res.data.roster.forEach((r) => {
            initialDraft[r.athleteId] = {
              status: r.status,
              notes: r.notes || "",
            };
          });
          setDraft(initialDraft);
        } else {
          setErrorMsg(res.error || "Gagal memuat data presensi sesi");
        }
      })
      .catch((err) => {
        console.error("Error fetching session attendance:", err);
        setErrorMsg("Gagal menghubungi server untuk memuat presensi");
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [open, sessionId]);

  // Derived current metrics based on local draft
  const currentStatuses = roster.map(
    (a) => draft[a.athleteId]?.status || "UNMARKED"
  );
  const metrics = calculateAttendanceMetrics(currentStatuses);

  // Check if draft has unsaved changes compared to initial roster
  const hasChanges = roster.some((a) => {
    const d = draft[a.athleteId];
    if (!d) return false;
    return d.status !== a.status || d.notes !== (a.notes || "");
  });

  function handleStatusSelect(athleteId: string, status: AttendanceStatus) {
    if (!isEditable) return;
    setDraft((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status,
      },
    }));
  }

  function handleNotesChange(athleteId: string, notes: string) {
    if (!isEditable) return;
    setDraft((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        notes,
      },
    }));
  }

  function toggleNotes(athleteId: string) {
    setExpandedNotes((prev) => ({
      ...prev,
      [athleteId]: !prev[athleteId],
    }));
  }

  function applyMarkAllPresent() {
    if (!isEditable) return;
    const updatedDraft = { ...draft };
    roster.forEach((a) => {
      updatedDraft[a.athleteId] = {
        ...updatedDraft[a.athleteId],
        status: "PRESENT",
      };
    });
    setDraft(updatedDraft);
    setQuickActionConfirm(null);
    toast.info("Semua atlet ditandai Hadir dalam draf. Klik 'Simpan Presensi' untuk menerapkan.");
  }

  function applyResetAll() {
    if (!isEditable) return;
    const updatedDraft = { ...draft };
    roster.forEach((a) => {
      updatedDraft[a.athleteId] = {
        ...updatedDraft[a.athleteId],
        status: "UNMARKED",
        notes: "",
      };
    });
    setDraft(updatedDraft);
    setQuickActionConfirm(null);
    toast.info("Semua atlet di-reset ke Belum Ditandai dalam draf.");
  }

  async function handleSave() {
    if (!sessionId || !isEditable) return;

    const items = roster.map((a) => {
      const d = draft[a.athleteId];
      return {
        athleteId: a.athleteId,
        status: d?.status || "UNMARKED",
        notes: d?.notes?.trim() ? d.notes.trim() : null,
      };
    });

    startTransition(async () => {
      const res = await batchMarkAttendanceAction({
        sessionId,
        items,
      });

      if (res.success) {
        toast.success(`Presensi berhasil disimpan (${res.count} atlet)`);
        if (onSaved) onSaved();
        onOpenChange(false);
      } else {
        toast.error(res.error || "Gagal menyimpan presensi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-surface-1" onClose={() => onOpenChange(false)}>
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <DialogHeader className="p-5 pb-3 border-b border-border bg-surface-2/40 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-accent/15 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <DialogTitle className="text-base font-bold font-display text-foreground">
                  Presensi Sesi Latihan
                </DialogTitle>
                {sessionInfo && (
                  <Badge variant={sessionInfo.status === "COMPLETED" ? "success" : "outline"} className="text-[10px] py-0 px-2">
                    {sessionInfo.status === "COMPLETED" ? "Selesai" : sessionInfo.status === "CANCELLED" ? "Dibatalkan" : "Terjadwal"}
                  </Badge>
                )}
              </div>
              {sessionInfo && (
                <p className="text-xs font-bold text-foreground mt-1">
                  {sessionInfo.title}
                </p>
              )}
            </div>
          </div>

          {sessionInfo && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {new Date(sessionInfo.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(sessionInfo.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Pelatih: <strong className="text-foreground">{sessionInfo.coachName}</strong>
              </span>
              {sessionInfo.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {sessionInfo.location}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Read-Only Banner if not editable */}
          {!isEditable && !isLoadingData && sessionInfo && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                {sessionInfo.status === "CANCELLED"
                  ? "Sesi ini telah dibatalkan. Presensi berstatus hanya-baca."
                  : "Mode Lihat: Anda hanya memiliki wewenang mencatat presensi pada sesi yang Anda bimbing."}
              </span>
            </div>
          )}

          {/* Summary Chips Grid */}
          {!isLoadingData && roster.length > 0 && (
            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-muted mr-1">
                Ringkasan ({metrics.totalAthletes} Atlet):
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20">
                {metrics.presentCount} Hadir
              </span>
              {metrics.lateCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 font-bold border border-amber-500/20">
                  {metrics.lateCount} Terlambat
                </span>
              )}
              {metrics.excusedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 font-bold border border-blue-500/20">
                  {metrics.excusedCount} Izin
                </span>
              )}
              {metrics.absentCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 font-bold border border-rose-500/20">
                  {metrics.absentCount} Alpa
                </span>
              )}
              {metrics.rescheduledCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 font-bold border border-violet-500/20">
                  {metrics.rescheduledCount} Jadwal Ulang
                </span>
              )}
              {metrics.unmarkedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-700 font-bold border border-slate-500/20">
                  {metrics.unmarkedCount} Belum Ditandai
                </span>
              )}

              <span className="ml-auto font-bold text-accent font-mono">
                {metrics.attendedCount} / {metrics.totalAthletes} Hadir ({metrics.attendanceRate}%)
              </span>
            </div>
          )}
        </DialogHeader>

        {/* ── BODY / ROSTER LIST ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoadingData ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
              <p className="text-xs text-muted">Memuat daftar peserta sesi…</p>
            </div>
          ) : errorMsg ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-danger mx-auto" />
              <p className="text-sm font-semibold text-danger">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          ) : roster.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak Ada Atlet Terdaftar"
              description="Belum ada atlet yang didaftarkan pada sesi latihan ini."
              className="py-10"
            />
          ) : (
            <>
              {/* Quick Actions Toolbar */}
              {isEditable && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-2/60 border border-border text-xs">
                  <span className="text-[11px] font-semibold text-muted">
                    Aksi Cepat Presensi:
                  </span>

                  {quickActionConfirm === "ALL_PRESENT" ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in-0 duration-150">
                      <span className="text-[11px] font-bold text-emerald-700">
                        Tandai semua {roster.length} atlet hadir?
                      </span>
                      <Button
                        size="xs"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7"
                        onClick={applyMarkAllPresent}
                      >
                        Ya, Semua Hadir
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="h-7 text-muted"
                        onClick={() => setQuickActionConfirm(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : quickActionConfirm === "RESET_ALL" ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in-0 duration-150">
                      <span className="text-[11px] font-bold text-slate-700">
                        Reset semua ke Belum Ditandai?
                      </span>
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-danger hover:bg-danger/10"
                        onClick={applyResetAll}
                      >
                        Ya, Reset
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="h-7 text-muted"
                        onClick={() => setQuickActionConfirm(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setQuickActionConfirm("ALL_PRESENT")}
                        className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 h-7 text-[11px]"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Tandai Semua Hadir
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setQuickActionConfirm("RESET_ALL")}
                        className="text-muted hover:text-foreground h-7 text-[11px]"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Athlete Cards List (Field-Friendly UX) */}
              <div className="space-y-2.5">
                {roster.map((athleteItem, index) => {
                  const currentDraft = draft[athleteItem.athleteId] || {
                    status: athleteItem.status,
                    notes: athleteItem.notes || "",
                  };
                  const isNotesOpen = !!expandedNotes[athleteItem.athleteId] || !!currentDraft.notes;

                  return (
                    <div
                      key={athleteItem.athleteId}
                      className={`rounded-xl border p-3.5 transition-all space-y-3 ${
                        currentDraft.status === "PRESENT"
                          ? "bg-emerald-50/40 border-emerald-200/80 shadow-2xs"
                          : currentDraft.status === "LATE"
                          ? "bg-amber-50/40 border-amber-200/80 shadow-2xs"
                          : currentDraft.status === "EXCUSED"
                          ? "bg-blue-50/40 border-blue-200/80 shadow-2xs"
                          : currentDraft.status === "ABSENT"
                          ? "bg-rose-50/40 border-rose-200/80 shadow-2xs"
                          : currentDraft.status === "RESCHEDULED"
                          ? "bg-violet-50/40 border-violet-200/80 shadow-2xs"
                          : "bg-surface-1 border-border/80"
                      }`}
                    >
                      {/* Athlete Identity Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-xs text-accent shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-foreground truncate">
                                {athleteItem.athleteName}
                              </h4>
                              {athleteItem.jerseyNumber != null && (
                                <span className="font-mono text-[10px] text-muted font-semibold bg-surface-2 px-1.5 py-0.2 rounded">
                                  #{athleteItem.jerseyNumber}
                                </span>
                              )}
                            </div>
                            {athleteItem.checkInTime && currentDraft.status === "PRESENT" && (
                              <p className="text-[10px] text-emerald-700 font-mono">
                                Check-in: {new Date(athleteItem.checkInTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Note Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleNotes(athleteItem.athleteId)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            currentDraft.notes
                              ? "text-accent bg-accent/10 hover:bg-accent/20"
                              : "text-muted hover:text-foreground hover:bg-surface-2"
                          }`}
                          title="Tambah Catatan"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            {currentDraft.notes ? "Edit Catatan" : "Catatan"}
                          </span>
                        </button>
                      </div>

                      {/* Status Selector Control Bar (Field-Friendly Large Touch Targets >= 44px) */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                        {/* HADIR */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "PRESENT")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "PRESENT"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Hadir</span>
                        </button>

                        {/* TERLAMBAT */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "LATE")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "LATE"
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Terlambat</span>
                        </button>

                        {/* IZIN */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "EXCUSED")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "EXCUSED"
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Izin</span>
                        </button>

                        {/* ALPA */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "ABSENT")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "ABSENT"
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : "bg-white hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Alpa</span>
                        </button>

                        {/* JADWAL ULANG */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "RESCHEDULED")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "RESCHEDULED"
                              ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                              : "bg-white hover:bg-violet-50 text-slate-700 border-slate-200 hover:border-violet-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Reschedule</span>
                        </button>

                        {/* BELUM DITANDAI */}
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => handleStatusSelect(athleteItem.athleteId, "UNMARKED")}
                          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentDraft.status === "UNMARKED"
                              ? "bg-slate-600 text-white border-slate-600 shadow-xs"
                              : "bg-white hover:bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300"
                          } ${!isEditable ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span className="text-[10px] sm:text-[11px]">Belum</span>
                        </button>
                      </div>

                      {/* Optional Notes Input (Expands when note exists or button clicked) */}
                      {isNotesOpen && (
                        <div className="pt-2 animate-in fade-in-0 duration-150">
                          <Input
                            type="text"
                            placeholder="Alasan izin / kendala / catatan singkat…"
                            value={currentDraft.notes}
                            disabled={!isEditable}
                            onChange={(e) => handleNotesChange(athleteItem.athleteId, e.target.value)}
                            className="text-xs h-8 bg-white border-slate-300"
                            maxLength={500}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER / SAVE CONTROLS ─────────────────────────────────── */}
        <div className="p-4 border-t border-border bg-surface-2/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-muted flex items-center gap-2">
            {hasChanges && (
              <span className="inline-flex items-center gap-1 text-accent font-semibold">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Ada perubahan draf presensi belum tersimpan
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="min-h-[40px] px-4 text-xs font-semibold"
            >
              {isEditable ? "Batal" : "Tutup"}
            </Button>

            {isEditable && roster.length > 0 && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending || isLoadingData}
                className="bg-accent hover:bg-accent/90 text-white min-h-[40px] px-5 text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan…</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Presensi</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
