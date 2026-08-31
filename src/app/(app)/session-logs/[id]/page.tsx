import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getSessionLogById } from "@/features/session-logs/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SessionLogVideoPlayer } from "@/features/session-logs/components/session-log-video-player";
import {
  ArrowLeft,
  Calendar,
  User,
  Video,
  MessageSquare,
  ChevronRight,
  Activity,
} from "lucide-react";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SessionLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const log = await getSessionLogById(ctx.organizationId, id);
  if (!log) {
    notFound();
  }

  const athleteInitials = log.athlete.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/session-logs">
            <Button variant="outline" size="xs" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                Catatan Sesi Latihan — {formatDate(log.sessionDate)}
              </h1>
              <Badge variant={log.athlete.isActive ? "success" : "outline"}>
                {log.athlete.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Dicatat oleh Coach {log.createdBy?.user?.name ?? "Pelatih"}
            </p>
          </div>
        </div>

        <Link href={`/athletes/${log.athlete.id}`}>
          <Button variant="outline" size="xs" className="gap-1">
            Profil Atlet <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Athlete Overview Card */}
        <Card>
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-accent" />
              Atlet Pelaksana
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar fallback={athleteInitials} size="md" className="h-10 w-10 border-2 border-accent/20" />
              <div>
                <Link
                  href={`/athletes/${log.athlete.id}`}
                  className="font-bold text-sm text-foreground hover:text-accent transition-colors"
                >
                  {log.athlete.fullName}
                </Link>
                <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <span>{log.athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}</span>
                  <span>·</span>
                  <span className="text-accent">{log.athlete.sportCategory ?? "Atletik"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Session Integration Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              Sesi Jadwal Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {log.scheduleSession ? (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {log.scheduleSession.title}
                  </h4>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {formatTime(log.scheduleSession.startTime)} — {formatTime(log.scheduleSession.endTime)}
                    {log.scheduleSession.location && ` · ${log.scheduleSession.location}`}
                  </p>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Terlaksana
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-muted">
                Catatan sesi mandiri (tidak terhubung langsung ke kalender jadwal).
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Execution Breakdown */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Rincian Aktivitas Latihan Aktual (Execution Log)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Aktivitas &amp; Gerakan Yang Dilakukan
            </h4>
            <div className="p-4 rounded-xl bg-surface-2/60 border border-border/40 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {log.activitiesDone}
            </div>
          </div>

          {log.coachFeedback && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Catatan Evaluasi &amp; Umpan Balik Pelatih
              </h4>
              <div className="p-4 rounded-xl bg-accent-bg/20 border border-accent/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {log.coachFeedback}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Recording Attachment Card */}
      {log.videoUrl && (
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4 text-accent" />
              Rekaman Video Pelaksanaan Sesi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <SessionLogVideoPlayer videoUrl={log.videoUrl} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
