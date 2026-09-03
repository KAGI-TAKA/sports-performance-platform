"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { reviewRescheduleRequestAction } from "../actions";

interface RescheduleReviewModalProps {
  request: {
    id: string;
    sessionId: string;
    sessionTitle: string;
    sessionDate: string;
    reason: string;
    coachName: string;
  } | null;
  onOpenChange: (open: boolean) => void;
  onApprovedAndEdit?: (sessionId: string) => void;
}

export function RescheduleReviewModal({
  request,
  onOpenChange,
  onApprovedAndEdit,
}: RescheduleReviewModalProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!request) return null;

  const handleReview = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await reviewRescheduleRequestAction(
        request.id,
        status,
        reviewNote
      );

      if (result.success) {
        toast.success(
          status === "APPROVED"
            ? "Permintaan reschedule disetujui."
            : "Permintaan reschedule ditolak."
        );
        onOpenChange(false);
        if (status === "APPROVED" && onApprovedAndEdit) {
          onApprovedAndEdit(request.sessionId);
        }
      } else {
        toast.error(result.error ?? "Gagal meninjau permintaan reschedule.");
      }
    });
  };

  return (
    <Dialog open={Boolean(request)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-1 border-border p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Tinjau Permohonan Reschedule
              </DialogTitle>
              <p className="text-xs text-muted">
                Diajukan oleh: <strong className="text-foreground">{request.coachName}</strong>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Detail Sesi & Alasan Asisten Pelatih */}
        <div className="rounded-xl bg-surface-2/60 border border-border p-3.5 space-y-2 text-xs">
          <div>
            <span className="text-[11px] text-muted block">Sesi Terkait:</span>
            <span className="font-bold text-foreground text-sm">{request.sessionTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted text-[11px]">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span>Jadwal Semula: {request.sessionDate}</span>
          </div>
          <div className="pt-2 border-t border-border/50">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block mb-1">
              Alasan Pengajuan dari Asisten:
            </span>
            <p className="text-xs italic text-foreground bg-surface-1 p-2.5 rounded-lg border border-border/60 leading-relaxed">
              &quot;{request.reason}&quot;
            </p>
          </div>
        </div>

        {/* Catatan Review Opsional */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Catatan Keputusan (Opsional untuk Asisten):
          </label>
          <Textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="cth. Disetujui, geser ke Sabtu pagi pk 08:00 / Ditolak karena jadwal sudah padat..."
            rows={2}
            className="text-xs resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs"
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleReview("REJECTED")}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
            Tolak
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleReview("APPROVED")}
            disabled={isPending}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
            Setujui Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
