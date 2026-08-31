"use client";

import { useState, useTransition } from "react";
import { createScheduleSession, updateScheduleSession } from "../actions";
import { previewRecurringScheduleAction } from "../recurrence-actions";
import type { RecurringSchedulePreview } from "../recurrence-engine";
import { RecurringSchedulePreviewModal } from "./recurring-schedule-preview-modal";
import { toDateTimeLocalString } from "../utils";
import { toast } from "sonner";
import { Plus, Calendar, Clock, User, Users, MapPin, AlignLeft, Dumbbell, Loader2, Repeat, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ScheduleStatus } from "@prisma/client";

export interface CoachOption {
  id: string;
  name: string;
}

export interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
}

export interface TrainingPlanOption {
  id: string;
  title: string;
  athleteId: string | null;
}

export interface InitialSessionData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  location: string | null;
  notes: string | null;
  coachId: string;
  athleteIds: string[];
  trainingPlanId?: string | null;
}

interface ScheduleDialogFormProps {
  coaches: CoachOption[];
  athletes: AthleteOption[];
  trainingPlans?: TrainingPlanOption[];
  initialSession?: InitialSessionData;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ScheduleDialogForm({
  coaches,
  athletes,
  trainingPlans = [],
  initialSession,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ScheduleDialogFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (val: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [isPending, startTransition] = useTransition();

  const isEditing = !!initialSession;

  const initialSlotType = (() => {
    const n = (initialSession?.notes || "").toLowerCase();
    if (n.includes("off") || n.includes("tutup") || n.includes("terkunci") || initialSession?.status === "CANCELLED") return "TERKUNCI";
    if (n.includes("fleksibel") || n.includes("reschedule") || n.includes("tentative") || n.includes("60%")) return "FLEKSIBEL";
    return "PASTI";
  })();

  const [slotType, setSlotType] = useState<"PASTI" | "FLEKSIBEL" | "TERKUNCI">(initialSlotType);
  const [scheduleMode, setScheduleMode] = useState<"SINGLE" | "RECURRING">("SINGLE");

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const fourWeeksLaterStr = (() => {
    const d = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const [startDateStr, setStartDateStr] = useState(todayStr);
  const [endDateStr, setEndDateStr] = useState(fourWeeksLaterStr);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
    new Date().getDay(),
  ]);
  const [recurringStartTime, setRecurringStartTime] = useState("16:00");
  const [recurringEndTime, setRecurringEndTime] = useState("17:30");

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<RecurringSchedulePreview | null>(null);
  const [recurringPayload, setRecurringPayload] = useState<{
    title: string;
    coachId: string;
    coachName?: string;
    athleteIds: string[];
    athleteNames?: string[];
    trainingPlanId?: string | null;
    trainingPlanTitle?: string;
    location?: string;
    notes?: string;
    startDateStr: string;
    endDateStr: string;
    weekdays: number[];
    startTimeStr: string;
    endTimeStr: string;
  } | null>(null);

  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>(
    () => initialSession?.athleteIds ?? []
  );
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    () => initialSession?.coachId ?? coaches[0]?.id ?? ""
  );
  const [athleteSearch, setAthleteSearch] = useState("");

  const [defaultStartTimeStr] = useState(() =>
    initialSession?.startTime
      ? toDateTimeLocalString(initialSession.startTime)
      : toDateTimeLocalString(new Date())
  );

  const [defaultEndTimeStr] = useState(() =>
    initialSession?.endTime
      ? toDateTimeLocalString(initialSession.endTime)
      : toDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000))
  );

  function toggleWeekday(dayIndex: number) {
    setSelectedWeekdays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  }

  function toggleAthlete(id: string) {
    setSelectedAthleteIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  const filteredAthletes = athletes.filter((a) =>
    a.fullName.toLowerCase().includes(athleteSearch.toLowerCase())
  );

  async function handlePreviewRecurring(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get("title") as string) || "";
    if (!title || title.trim().length < 2) {
      toast.error("Judul sesi minimal 2 karakter");
      return;
    }

    if (selectedAthleteIds.length === 0) {
      toast.error("Pilih minimal 1 atlet");
      return;
    }

    if (selectedWeekdays.length === 0) {
      toast.error("Pilih minimal 1 hari dalam seminggu");
      return;
    }

    const trainingPlanIdVal = formData.get("trainingPlanId") as string;
    const effectivePlanId =
      trainingPlanIdVal && trainingPlanIdVal !== "NONE" ? trainingPlanIdVal : null;

    const rawNotes = (formData.get("notes") as string) || "";
    const cleanNotes = rawNotes
      .replace(/\[(90% Pasti|Fleksibel 60%|Off Jadwal \/ Terkunci|PASTI|FLEKSIBEL|TERKUNCI)\]\s*/gi, "")
      .trim();

    let finalNotes = cleanNotes;
    if (slotType === "FLEKSIBEL") {
      finalNotes = cleanNotes ? `[Fleksibel 60%] ${cleanNotes}` : "[Fleksibel 60%]";
    } else if (slotType === "TERKUNCI") {
      finalNotes = cleanNotes ? `[Off Jadwal / Terkunci] ${cleanNotes}` : "[Off Jadwal / Terkunci]";
    }

    const coachName = coaches.find((c) => c.id === selectedCoachId)?.name;
    const athleteNames = athletes
      .filter((a) => selectedAthleteIds.includes(a.id))
      .map((a) => a.fullName);
    const trainingPlanTitle = trainingPlans.find((p) => p.id === effectivePlanId)?.title;

    startTransition(async () => {
      const res = await previewRecurringScheduleAction({
        startDateStr,
        endDateStr,
        weekdays: selectedWeekdays,
        startTimeStr: recurringStartTime,
        endTimeStr: recurringEndTime,
        coachId: selectedCoachId,
        athleteIds: selectedAthleteIds,
        trainingPlanId: effectivePlanId,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      setRecurringPayload({
        title: title.trim(),
        coachId: selectedCoachId,
        coachName,
        athleteIds: selectedAthleteIds,
        athleteNames,
        trainingPlanId: effectivePlanId,
        trainingPlanTitle,
        location: (formData.get("location") as string) || undefined,
        notes: finalNotes || undefined,
        startDateStr,
        endDateStr,
        weekdays: selectedWeekdays,
        startTimeStr: recurringStartTime,
        endTimeStr: recurringEndTime,
      });
      setPreviewData(res.preview);
      setPreviewModalOpen(true);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedAthleteIds.length === 0) {
      toast.error("Pilih minimal 1 atlet");
      return;
    }

    selectedAthleteIds.forEach((id) => formData.append("athleteIds", id));
    formData.set("coachId", selectedCoachId);

    const rawNotes = (formData.get("notes") as string) || "";
    const cleanNotes = rawNotes
      .replace(/\[(90% Pasti|Fleksibel 60%|Off Jadwal \/ Terkunci|PASTI|FLEKSIBEL|TERKUNCI)\]\s*/gi, "")
      .trim();

    let finalNotes = cleanNotes;
    if (slotType === "FLEKSIBEL") {
      finalNotes = cleanNotes ? `[Fleksibel 60%] ${cleanNotes}` : "[Fleksibel 60%]";
    } else if (slotType === "TERKUNCI") {
      finalNotes = cleanNotes ? `[Off Jadwal / Terkunci] ${cleanNotes}` : "[Off Jadwal / Terkunci]";
    }
    formData.set("notes", finalNotes);

    startTransition(async () => {
      let result;
      if (isEditing && initialSession) {
        result = await updateScheduleSession(initialSession.id, formData);
      } else {
        result = await createScheduleSession(formData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Jadwal sesi latihan berhasil diperbarui"
            : "Jadwal sesi latihan berhasil dibuat"
        );
        setIsOpen(false);
        if (!isEditing) {
          setSelectedAthleteIds([]);
          form.reset();
        }
      } else {
        toast.error(result.error ?? "Gagal menyimpan jadwal");
      }
    });
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="gap-1.5 bg-accent hover:bg-accent/90 text-white text-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal Sesi
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Edit Jadwal Sesi Latihan" : "Buat Jadwal Sesi Latihan"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={scheduleMode === "RECURRING" ? handlePreviewRecurring : handleSubmit} className="space-y-4 text-xs">
            {/* Mode Pembuatan Sesi (Hanya saat membuat sesi baru) */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleMode("SINGLE")}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[40px] ${
                    scheduleMode === "SINGLE"
                      ? "bg-white text-indigo-700 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Sesi Sekali
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode("RECURRING")}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[40px] ${
                    scheduleMode === "RECURRING"
                      ? "bg-white text-indigo-700 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                  Sesi Berulang (Mingguan)
                </button>
              </div>
            )}

            {/* Judul Sesi */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Judul / Jenis Sesi <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                name="title"
                required
                defaultValue={initialSession?.title ?? ""}
                placeholder="cth. Private 1-on-1 Speed & Agility / Group Shooting Drill"
              />
            </div>

            {/* Pelatih & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted" />
                  Pelatih <span className="text-danger">*</span>
                </label>
                <Select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              {isEditing && (
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Status Sesi
                  </label>
                  <Select name="status" defaultValue={initialSession?.status ?? "SCHEDULED"}>
                    <option value="SCHEDULED">Terjadwal</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="NO_SHOW">Tidak Hadir (Absen)</option>
                  </Select>
                </div>
              )}
            </div>

            {/* Program Latihan Terhubung */}
            {trainingPlans.length > 0 && (
              <div>
                <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5 text-muted" />
                  Program Latihan Terhubung (Opsional)
                </label>
                <Select
                  name="trainingPlanId"
                  defaultValue={initialSession?.trainingPlanId ?? "NONE"}
                >
                  <option value="NONE">-- Tanpa Program Latihan --</option>
                  <optgroup label="Template Program Organisasi">
                    {trainingPlans
                      .filter((p) => !p.athleteId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          ✨ {p.title}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Program Khusus Atlet">
                    {trainingPlans
                      .filter((p) => p.athleteId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          👤 {p.title}
                        </option>
                      ))}
                  </optgroup>
                </Select>
              </div>
            )}

            {/* Atlet Selection (Multi-select with search) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-muted" />
                  Pilih Atlet (Private / Group) <span className="text-danger">*</span>
                </label>
                {selectedAthleteIds.length > 0 && (
                  <Badge variant="accent" className="text-[10px]">
                    {selectedAthleteIds.length} atlet terpilih
                  </Badge>
                )}
              </div>

              <Input
                type="text"
                placeholder="Cari nama atlet..."
                value={athleteSearch}
                onChange={(e) => setAthleteSearch(e.target.value)}
                className="mb-2 text-xs py-1"
              />

              <div className="max-h-36 overflow-y-auto rounded-md border border-border bg-surface-2/50 p-2 space-y-1 divide-y divide-border/30">
                {filteredAthletes.length === 0 ? (
                  <p className="text-muted text-center py-2 text-xs">
                    Tidak ada atlet ditemukan
                  </p>
                ) : (
                  filteredAthletes.map((a) => {
                    const isSelected = selectedAthleteIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-surface-2 cursor-pointer transition-colors select-none"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAthlete(a.id)}
                            className="rounded border-border text-accent focus:ring-accent"
                          />
                          <span className="font-medium text-foreground">
                            {a.fullName}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Waktu & Pengaturan Jadwal */}
            {scheduleMode === "SINGLE" ? (
              /* Single Session Date-Time */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted" />
                    Waktu Mulai <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="startTime"
                    defaultValue={defaultStartTimeStr}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted" />
                    Waktu Selesai <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="endTime"
                    defaultValue={defaultEndTimeStr}
                    required
                  />
                </div>
              </div>
            ) : (
              /* Recurring Weekly Schedule Configuration */
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-3">
                {/* Weekday Selector */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Pilih Hari Rutin Setiap Pekan <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {[
                      { index: 1, label: "Sen", full: "Senin" },
                      { index: 2, label: "Sel", full: "Selasa" },
                      { index: 3, label: "Rab", full: "Rabu" },
                      { index: 4, label: "Kam", full: "Kamis" },
                      { index: 5, label: "Jum", full: "Jumat" },
                      { index: 6, label: "Sab", full: "Sabtu" },
                      { index: 0, label: "Min", full: "Minggu" },
                    ].map((day) => {
                      const isChecked = selectedWeekdays.includes(day.index);
                      return (
                        <button
                          key={day.index}
                          type="button"
                          onClick={() => toggleWeekday(day.index)}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition min-h-[44px] flex flex-col items-center justify-center ${
                            isChecked
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span>{day.label}</span>
                          <span className="text-[9px] opacity-80 font-normal hidden sm:inline">{day.full}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Range Dates (Start & End Date) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Mulai Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Sampai Tanggal (Maks 12 Pekan) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={endDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Time range (HH:mm) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jam Mulai <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={recurringStartTime}
                      onChange={(e) => setRecurringStartTime(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jam Selesai <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={recurringEndTime}
                      onChange={(e) => setRecurringEndTime(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lokasi */}
            <div>
              <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted" />
                Lokasi (Opsional)
              </label>
              <Input
                type="text"
                name="location"
                defaultValue={initialSession?.location ?? ""}
                placeholder="cth. Power Up Gym / Lapangan B"
              />
            </div>

            {/* Sifat Ketersediaan Slot Timetable */}
            <div>
              <label className="block font-medium text-foreground mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  Sifat Ketersediaan Slot Timetable
                </span>
                <span className="text-[10px] text-muted">Ditampilkan di Weekly Timetable</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSlotType("PASTI")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                    slotType === "PASTI"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500"
                      : "border-border bg-surface-2/40 text-muted hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                    90% Pasti
                  </span>
                  <span className="text-[9.5px] opacity-75 mt-0.5 font-normal">Sesi Utama</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotType("FLEKSIBEL")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                    slotType === "FLEKSIBEL"
                      ? "border-sky-500 bg-sky-50 text-sky-950 font-bold ring-1 ring-sky-500"
                      : "border-border bg-surface-2/40 text-muted hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-sky-400 inline-block shrink-0" />
                    60% Fleksibel
                  </span>
                  <span className="text-[9.5px] opacity-75 mt-0.5 font-normal">Dapat Digeser</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotType("TERKUNCI")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                    slotType === "TERKUNCI"
                      ? "border-rose-500 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500"
                      : "border-border bg-surface-2/40 text-muted hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-rose-500 inline-block shrink-0" />
                    Off / Terkunci
                  </span>
                  <span className="text-[9.5px] opacity-75 mt-0.5 font-normal">Slot Libur / Full</span>
                </button>
              </div>
            </div>

            {/* Catatan Sesi */}
            <div>
              <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                <AlignLeft className="h-3.5 w-3.5 text-muted" />
                Catatan Sesi (Opsional)
              </label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={initialSession?.notes ?? ""}
                placeholder="Fokus instruksi, alat yang disiapkan, dsb."
                className="w-full rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-white font-semibold gap-1.5"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {scheduleMode === "RECURRING"
                  ? "Pratinjau & Buat Jadwal Berulang →"
                  : isEditing
                  ? "Simpan Perubahan"
                  : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recurring Schedule Preview Modal */}
      <RecurringSchedulePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        preview={previewData}
        formPayload={recurringPayload}
        onSuccess={() => {
          setIsOpen(false);
          setSelectedAthleteIds([]);
        }}
      />
    </>
  );
}

