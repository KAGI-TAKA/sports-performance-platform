"use client";

import { useState, useTransition } from "react";
import { Users } from "lucide-react";
import { PortalView } from "./portal-view";
import type { ParentChildItem } from "../parent-queries";

interface ParentMultiChildPortalProps {
  children: ParentChildItem[];
  initialChildId: string;
  initialPortalData: any;
  parentName: string;
}

export function ParentMultiChildPortal({
  children,
  initialChildId,
  initialPortalData,
  parentName,
}: ParentMultiChildPortalProps) {
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [portalData, setPortalData] = useState(initialPortalData);
  const [loadingChild, setLoadingChild] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelectChild = async (childId: string) => {
    if (childId === selectedChildId) return;
    setSelectedChildId(childId);
    setLoadingChild(true);

    try {
      // Fetch data for selected child via server action / dynamic fetch
      const res = await fetch(`/api/portal/child?athleteId=${childId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.payload) {
          setPortalData(json.payload);
        }
      }
    } catch (e) {
      console.error("Gagal mengganti konteks atlet anak:", e);
    } finally {
      setLoadingChild(false);
    }
  };

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c38] p-8 text-center shadow-lg space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Belum Ada Profil Atlet Terhubung
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Akun orang tua atas nama <strong className="text-slate-900 dark:text-white">{parentName}</strong> belum memiliki atlet yang terhubung secara resmi dalam akademi ini. Silakan hubungi pelatih Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329]">
      {loadingChild ? (
        <div className="py-24 text-center text-xs text-slate-500 animate-pulse flex flex-col items-center justify-center gap-2 min-h-screen">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span>Memuat data perkembangan atlet...</span>
        </div>
      ) : portalData ? (
        <PortalView
          context={portalData.context}
          profile={portalData.profile}
          snapshot={portalData.snapshot}
          progress={portalData.progress}
          trainingPlan={portalData.trainingPlan}
          schedule={portalData.schedule}
          sessionLogs={portalData.sessionLogs}
          reports={portalData.reports}
          achievements={portalData.achievements}
          guidances={portalData.guidances}
          feedbackSessions={portalData.feedbackSessions}
          personalBests={portalData.personalBests}
          portalGoals={portalData.portalGoals}
          attendance={portalData.attendance}
          siblings={portalData.siblings || children}
          onSelectSibling={handleSelectChild}
          loadingSibling={loadingChild}
        />
      ) : (
        <div className="py-20 text-center text-xs text-slate-500">
          Gagal memuat data atlet yang dipilih.
        </div>
      )}
    </div>
  );
}
