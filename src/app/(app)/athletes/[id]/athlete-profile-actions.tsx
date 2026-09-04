"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleAthleteStatus } from "@/features/athletes/actions";
import { InjuryDialog } from "@/features/athletes/components/injury-dialog";
import { GuidanceDialogForm } from "@/features/guidance/components/guidance-dialog-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Power, ShieldAlert, Loader2 } from "lucide-react";

interface AthleteProfileActionsProps {
  athleteId: string;
  athleteName?: string;
  isActive: boolean;
  role: string;
}

export function AthleteProfileActions({
  athleteId,
  athleteName,
  isActive,
  role,
}: AthleteProfileActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showInjuryDialog, setShowInjuryDialog] = useState(false);

  const canModify = role !== "assistant_coach";

  function handleToggleStatus() {
    const actionName = isActive ? "menonaktifkan" : "mengaktifkan kembali";
    if (!confirm(`Apakah Anda yakin ingin ${actionName} atlet ini?`)) return;

    startTransition(async () => {
      const res = await toggleAthleteStatus(athleteId, !isActive);
      if (res.success) {
        toast.success(
          isActive ? "Atlet berhasil dinonaktifkan" : "Atlet berhasil diaktifkan kembali"
        );
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal mengubah status atlet");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <GuidanceDialogForm
        athletes={athleteName ? [{ id: athleteId, fullName: athleteName }] : []}
        defaultAthleteId={athleteId}
        triggerText="Beri Saran / Info"
      />

      <Button
        variant="outline"
        size="xs"
        onClick={() => setShowInjuryDialog(true)}
        className="gap-1 text-xs"
      >
        <ShieldAlert className="h-3.5 w-3.5 text-danger" />
        Catat Cedera
      </Button>

      <Link href={`/athletes/${athleteId}/edit`}>
        <Button variant="outline" size="xs" className="gap-1 text-xs">
          <Edit className="h-3.5 w-3.5" />
          Edit Profil
        </Button>
      </Link>

      {canModify && (
        <Button
          variant={isActive ? "destructive" : "default"}
          size="xs"
          disabled={isPending}
          onClick={handleToggleStatus}
          className="gap-1 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Power className="h-3.5 w-3.5" />
          )}
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      )}

      {showInjuryDialog && (
        <InjuryDialog
          athleteId={athleteId}
          open={showInjuryDialog}
          onOpenChange={setShowInjuryDialog}
        />
      )}
    </div>
  );
}
