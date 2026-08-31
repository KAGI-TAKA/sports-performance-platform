"use client";

import { useTransition } from "react";
import { deleteSessionLog } from "../actions";
import { SessionLogVideoPlayer } from "./session-log-video-player";
import { toast } from "sonner";
import {
  Calendar,
  User,
  Activity,
  MessageSquare,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface SessionLogCardProps {
  log: {
    id: string;
    sessionDate: Date;
    activitiesDone: string;
    coachFeedback: string | null;
    videoUrl: string | null;
    athlete: {
      id: string;
      fullName: string;
      jerseyNumber: number | null;
      position: string;
    };
    createdBy: {
      user: {
        name: string;
      };
    };
    scheduleSession: {
      id: string;
      title: string;
    } | null;
  };
}

export function SessionLogCard({ log }: SessionLogCardProps) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm("Hapus catatan sesi harian ini?")) return;

    startTransition(async () => {
      const res = await deleteSessionLog(log.id);
      if (res.success) {
        toast.success("Catatan sesi dihapus");
      } else {
        toast.error(res.error ?? "Gagal menghapus catatan sesi");
      }
    });
  }

  const formattedDate = new Date(log.sessionDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-4 shadow-sm hover:border-accent/40 transition space-y-3">
      <div className="space-y-3">
        {/* Card Header: Athlete & Date */}
        <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">
                {log.athlete.fullName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5 font-mono">
              <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <button
            disabled={isPending}
            onClick={handleDelete}
            className="p-1 rounded text-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Hapus Catatan Sesi"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Schedule session reference badge if linked */}
        {log.scheduleSession && (
          <div className="inline-flex items-center gap-1 rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
            <CheckCircle2 className="h-3 w-3" />
            Sesi: {log.scheduleSession.title}
          </div>
        )}

        {/* Activities Done */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted uppercase tracking-wider">
            <Activity className="h-3 w-3 text-accent" />
            Aktivitas Latihan
          </div>
          <p className="text-xs text-foreground bg-surface-2/60 p-2.5 rounded-lg leading-relaxed whitespace-pre-wrap">
            {log.activitiesDone}
          </p>
        </div>

        {/* Coach Feedback */}
        {log.coachFeedback && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted uppercase tracking-wider">
              <MessageSquare className="h-3 w-3 text-emerald-400" />
              Evaluasi Pelatih
            </div>
            <p className="text-xs text-secondary italic bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg leading-relaxed">
              &quot;{log.coachFeedback}&quot;
            </p>
          </div>
        )}

        {/* Video Player embedded if URL exists */}
        {log.videoUrl && <SessionLogVideoPlayer videoUrl={log.videoUrl} />}
      </div>

      {/* Footer info: Recorded by */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Oleh: {log.createdBy.user.name}
        </span>
      </div>
    </div>
  );
}
