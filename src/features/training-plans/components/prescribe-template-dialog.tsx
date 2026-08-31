"use client";

import { useState, useTransition } from "react";
import { prescribeTemplateToAthlete } from "../actions";
import { toast } from "sonner";
import { Copy, User, Calendar, Type, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
}

interface PrescribeTemplateDialogProps {
  templateId: string;
  templateTitle: string;
  athletes: AthleteOption[];
  trigger?: React.ReactNode;
}

export function PrescribeTemplateDialog({
  templateId,
  templateTitle,
  athletes,
  trigger,
}: PrescribeTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id ?? ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await prescribeTemplateToAthlete(templateId, formData);
      if (result.success) {
        toast.success("Template berhasil di-resepkan ke atlet!");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "Gagal meresepkan template");
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
          size="xs"
          className="gap-1 bg-accent hover:bg-accent/90 text-white font-semibold text-[11px]"
        >
          <Copy className="h-3 w-3" />
          Resepkan ke Atlet
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-accent" />
              <DialogTitle className="text-base font-bold">
                Resepkan Template Program
              </DialogTitle>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Copy template &quot;{templateTitle}&quot; menjadi program independen untuk atlet target.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
            {/* Target Athlete */}
            <div>
              <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted" />
                Pilih Atlet Target <span className="text-danger">*</span>
              </label>
              <Select
                name="athleteId"
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                required
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </Select>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-muted" />
                Judul Program Atlet (Opsional)
              </label>
              <Input
                type="text"
                name="title"
                placeholder={`cth. ${templateTitle} - [Nama Atlet]`}
              />
            </div>

            {/* Date Boundaries */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted" />
                  Tanggal Mulai
                </label>
                <Input type="date" name="startDate" />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted" />
                  Tanggal Selesai
                </label>
                <Input type="date" name="endDate" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
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
                Resepkan Program
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
