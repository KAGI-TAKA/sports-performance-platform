import {
  getPortalContextByToken,
  getPortalAthleteProfile,
  getPortalAthleteProgress,
  getPortalAthleteTrainingPlan,
  getPortalAthleteSchedule,
  getPortalAthleteSessionLogs,
  getPortalAthleteReports,
  getPortalAthleteAchievements,
} from "@/features/portal/queries";
import { PortalView } from "@/features/portal/components/portal-view";
import { ShieldAlert, Clock, Ban, UserX } from "lucide-react";

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;

  const auth = await getPortalContextByToken(token);

  if (!auth.success) {
    let title = "Link Akses Portal Tidak Valid";
    let message =
      "Link yang Anda buka tidak terdaftar dalam sistem. Silakan periksa kembali URL link akses Anda.";
    let icon = <ShieldAlert className="h-10 w-10 text-rose-500 mb-3" />;

    if (auth.error === "EXPIRED_TOKEN") {
      title = "Link Akses Portal Sudah Kedaluwarsa";
      message =
        "Masa berlaku link akses portal ini telah berakhir. Silakan minta link akses baru kepada pelatih Anda.";
      icon = <Clock className="h-10 w-10 text-amber-500 mb-3" />;
    } else if (auth.error === "REVOKED_TOKEN") {
      title = "Akses Portal Ini Sudah Dicabut";
      message =
        "Akses portal untuk link ini telah dicabut oleh pelatih. Silakan hubungi organisasi atau pelatih Anda.";
      icon = <Ban className="h-10 w-10 text-rose-500 mb-3" />;
    } else if (auth.error === "INACTIVE_ATHLETE") {
      title = "Profil Atlet Tidak Aktif";
      message =
        "Profil atlet tidak aktif atau sedang dinonaktifkan dalam sistem organisasi.";
      icon = <UserX className="h-10 w-10 text-slate-400 mb-3" />;
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-lg space-y-3">
          <div className="flex justify-center">{icon}</div>
          <h1 className="font-display text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Kinetiq Sports Performance Platform
          </div>
        </div>
      </div>
    );
  }

  const [profileData, progressData, planData, scheduleData, logsData, reportsData, achievementsData] =
    await Promise.all([
      getPortalAthleteProfile(token),
      getPortalAthleteProgress(token),
      getPortalAthleteTrainingPlan(token),
      getPortalAthleteSchedule(token),
      getPortalAthleteSessionLogs(token),
      getPortalAthleteReports(token),
      getPortalAthleteAchievements(token),
    ]);

  if (!profileData || !progressData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-lg space-y-2">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto mb-2" />
          <h1 className="font-display text-lg font-bold text-slate-900">
            Data Atlet Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-500">
            Data atlet tidak dapat dimuat. Pastikan atlet aktif dalam organisasi Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortalView
      context={auth.context}
      profile={profileData.profile}
      snapshot={profileData.latestSnapshot}
      progress={{
        overallScore: progressData.overallScore,
        overallGrade: progressData.overallGrade,
        trends: progressData.trends,
        totalAssessments: progressData.totalAssessments,
      }}
      trainingPlan={planData?.plan ?? null}
      schedule={scheduleData?.sessions ?? []}
      sessionLogs={logsData?.logs ?? []}
      reports={reportsData?.reports ?? []}
      achievements={achievementsData?.achievements ?? {
        starRating: 0,
        starLabel: "Belum Ada Evaluasi",
        totalAssessments: 0,
        completedSessions: 0,
        badges: [],
      }}
    />
  );
}
