"use client";

import { useState, useTransition } from "react";
import { createScheduleSession, updateScheduleSession } from "../actions";
import { toast } from "sonner";
import { Plus, Calendar, Clock, User, Users, MapPin, AlignLeft, Dumbbell, Loader2 } from "lucide-react";
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

  // Selected state initialized directly from props
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>(
    () => initialSession?.athleteIds ?? []
  );
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    () => initialSession?.coachId ?? coaches[0]?.id ?? ""
  );
  const [athleteSearch, setAthleteSearch] = useState("");

  // Format default datetimes for HTML datetime-local input (YYYY-MM-DDTHH:mm)
  function toDateTimeLocalString(d?: Date): string {
    const target = d ? new Date(d) : new Date();
    if (!d) {
      target.setHours(15, 0, 0, 0);
    }
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    const hours = String(target.getHours()).padStart(2, "0");
    const minutes = String(target.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const defaultStartTimeStr = toDateTimeLocalString(initialSession?.startTime);
  const defaultEndTimeStr = toDateTimeLocalString(
    initialSession?.endTime ??
      (initialSession?.startTime
        ? new Date(new Date(initialSession.startTime).getTime() + 60 * 60 * 1000)
        : undefined)
  );

  function toggleAthlete(id: string) {
    setSelectedAthleteIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  const filteredAthletes = athletes.filter((a) =>
    a.fullName.toLowerCase().includes(athleteSearch.toLowerCase())
  );

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

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                          {a.jerseyNumber != null && (
                            <span className="text-[10px] text-muted font-mono">
                              #{a.jerseyNumber}
                            </span>
                          )}
                        </div>
                        {a.position && a.position !== "UNSPECIFIED" && (
                          <span className="text-[10px] text-muted">
                            {a.position.replace(/_/g, " ")}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Waktu Sesi (Start & End) */}
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
                {isEditing ? "Simpan Perubahan" : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
