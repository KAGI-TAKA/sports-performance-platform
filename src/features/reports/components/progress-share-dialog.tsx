"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  X,
  MessageSquareShare,
  Copy,
  Check,
  FileDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
} from "lucide-react";
import {
  formatProgressWhatsAppSummary,
  getWhatsAppProgressShareLink,
  type ShareSafeProgressDTO,
} from "../utils/whatsapp-formatter";

interface ProgressShareDialogProps {
  data: ShareSafeProgressDTO;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressShareDialog({
  data,
  isOpen,
  onClose,
}: ProgressShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedMessage = formatProgressWhatsAppSummary(data);
  const whatsappUrl = getWhatsAppProgressShareLink(data);

  // Copy to clipboard with fallback
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedMessage);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = formattedMessage;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Graceful fallback: User can still copy from preview
      setCopied(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!data.latestAssessmentId) return;
    setIsDownloadingPdf(true);
    // Direct browser navigation to streaming PDF route
    window.open(`/api/assessments/${data.latestAssessmentId}/pdf`, "_blank");
    setTimeout(() => setIsDownloadingPdf(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-share-dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="progress-share-dialog-title"
                className="font-display text-sm sm:text-base font-bold text-foreground"
              >
                Bagikan Perkembangan Atlet
              </h2>
              <p className="text-[11px] text-muted">
                Ringkasan resmi orang tua &amp; staf pelatih (Share-Safe)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition"
            aria-label="Tutup Dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Athlete Summary Card */}
          <div className="p-3 rounded-xl bg-surface-2/60 border border-border/80 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-foreground">
                {data.athlete.fullName}
              </div>
              <div className="text-[11px] text-muted">
                {data.athlete.age} tahun • {data.period.assessmentDate}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-base font-bold text-accent">
                {data.overview.overallScore != null
                  ? `${data.overview.overallScore.toFixed(1)}%`
                  : "—"}
              </div>
              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                Grade {data.overview.overallGrade ?? "—"}
              </span>
            </div>
          </div>

          {/* WhatsApp Text Preview Box */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider">
              Preview Ringkasan Pesan (WhatsApp / Teks)
            </label>
            <div className="p-3.5 rounded-xl bg-surface-2/80 border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-all">
              {formattedMessage}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-2/30 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm min-h-[44px]"
          >
            <MessageSquareShare className="h-4 w-4" />
            <span>Kirim WhatsApp</span>
          </a>

          {/* 2. Copy Summary Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border px-4 py-2.5 text-xs font-bold text-foreground transition min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted" />
                <span>Salin Teks</span>
              </>
            )}
          </button>

          {/* 3. PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!data.latestAssessmentId || isDownloadingPdf}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm min-h-[44px]"
          >
            <FileDown className="h-4 w-4" />
            <span>{isDownloadingPdf ? "Memuat..." : "Unduh PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
