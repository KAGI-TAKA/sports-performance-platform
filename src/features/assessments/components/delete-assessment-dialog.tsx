"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAssessmentAction } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteAssessmentDialogProps {
  assessmentId: string;
  athleteName: string;
  assessmentDate: string;
  canDelete: boolean;
  compact?: boolean;
}

export function DeleteAssessmentDialog({
  assessmentId,
  athleteName,
  assessmentDate,
  canDelete,
  compact = false,
}: DeleteAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!canDelete) return null;

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteAssessmentAction(assessmentId);
      if (res.success) {
        toast.success("Assessment berhasil dihapus.");
        setOpen(false);
        router.push("/assessments");
      } else {
        toast.error(res.error ?? "Gagal menghapus assessment.");
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        onClick={() => setOpen(true)}
        className={compact 
          ? "gap-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition px-2" 
          : "gap-1.5 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition"}
        title="Hapus Assessment"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>{compact ? "Hapus" : "Hapus Assessment"}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Hapus Catatan Assessment
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-3 text-xs text-muted leading-relaxed">
            <p>
              Apakah Anda yakin ingin menghapus catatan assessment fisik untuk atlet{" "}
              <strong className="text-foreground">{athleteName}</strong> pada tanggal{" "}
              <strong className="text-foreground">{assessmentDate}</strong>?
            </p>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[11px] text-rose-600 dark:text-rose-400 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Tindakan ini tidak dapat dibatalkan:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] opacity-90">
                <li>Seluruh rincian skor item dan analisis radar chart akan dihapus.</li>
                <li>Laporan PDF terkait akan dihapus.</li>
                <li>Target capaian atlet yang terhubung akan dikembalikan ke status aktif.</li>
                <li>Data profil atlet dan akun pengguna <strong>tidak</strong> akan terhapus.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="p-4 bg-surface-2/40 border-t border-border flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size="xs"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Permanen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
