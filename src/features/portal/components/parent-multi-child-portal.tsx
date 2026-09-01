"use client";

import { useState, useTransition } from "react";
import { Users, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-lg space-y-3">
          <Users className="h-10 w-10 text-muted mx-auto mb-2" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Belum Ada Profil Atlet Terhubung
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            Akun orang tua atas nama <strong className="text-foreground">{parentName}</strong> belum memiliki atlet yang terhubung secara resmi dalam akademi ini. Silakan hubungi pelatih Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── PARENT MULTI-CHILD SWITCHER TOPBAR ─────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-border bg-surface-1/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground tracking-tight block">
                Portal Orang Tua • {parentName}
              </span>
              <span className="text-[10px] text-muted block">
                Pilih profil anak untuk melihat data perkembangan fisik &amp; presensi
              </span>
            </div>
          </div>

          {/* Child Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  disabled={loadingChild}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                    isSelected
                      ? "bg-brand text-brand-foreground border-brand shadow-xs"
                      : "bg-surface-2/60 text-secondary border-border hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{child.fullName}</span>
                  {child.sportCategory && (
                    <span className={`text-[10px] ${isSelected ? "text-brand-foreground/80" : "text-muted"}`}>
                      ({child.sportCategory})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHILD PORTAL VIEW ────────────────────────────────────────── */}
      {loadingChild ? (
        <div className="py-20 text-center text-xs text-muted animate-pulse">
          Memuat data perkembangan atlet...
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
        />
      ) : (
        <div className="py-20 text-center text-xs text-muted">
          Gagal memuat data atlet yang dipilih.
        </div>
      )}
    </div>
  );
}
