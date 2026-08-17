"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAthleteInjury } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

interface InjuryDialogProps {
  athleteId: string;
  athleteName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function InjuryDialog({
  athleteId,
  athleteName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: InjuryDialogProps) {
  const router = useRouter();
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      athleteId,
      injuryType: formData.get("injuryType") as string,
      description: (formData.get("description") as string) || undefined,
      injuryDate: new Date(formData.get("injuryDate") as string),
      recoveredAt: formData.get("recoveredAt")
        ? new Date(formData.get("recoveredAt") as string)
        : undefined,
      severity: (formData.get("severity") as "RINGAN" | "SEDANG" | "BERAT") || undefined,
    };

    try {
      const res = await addAthleteInjury(data);
      if (res.success) {
        toast.success("Catatan cedera berhasil ditambahkan");
        setIsOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Gagal mencatat cedera");
        toast.error(res.error ?? "Gagal mencatat cedera");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mencatat riwayat cedera.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : !isControlled ? (
        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsOpen(true)}
          className="gap-1 text-xs"
        >
          <ShieldAlert className="h-3.5 w-3.5 text-danger" />
          + Catat Cedera
        </Button>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-danger" />
              <DialogTitle className="text-base font-bold">
                Catat Riwayat Cedera {athleteName ? `— ${athleteName}` : ""}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
            {error && (
              <div className="rounded-md bg-danger-bg p-2.5 text-xs text-danger border border-danger/30 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block font-medium text-foreground mb-1">
                Jenis / Nama Cedera <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                name="injuryType"
                required
                placeholder="cth. Sprain Ankle Kanan / Hamstring Strain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Tanggal Cedera <span className="text-danger">*</span>
                </label>
                <Input type="date" name="injuryDate" required defaultValue={todayStr} />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Tingkat Keparahan
                </label>
                <Select name="severity" defaultValue="RINGAN">
                  <option value="RINGAN">Ringan</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="BERAT">Berat</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Tanggal Pulih (Kosongkan jika masih dalam pemulihan)
              </label>
              <Input type="date" name="recoveredAt" />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Deskripsi / Penanganan (Opsional)
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="cth. Istirahat 2 minggu, fisioterapi rutin 3x seminggu"
                className="w-full rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-white font-semibold gap-1.5"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Simpan Catatan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
