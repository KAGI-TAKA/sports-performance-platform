"use client";

import {
  getWhatsAppShareLink,
  type AssessmentWhatsAppSummary,
} from "../utils/whatsapp-formatter";
import { MessageSquareShare } from "lucide-react";

interface WhatsAppShareButtonProps {
  summary: AssessmentWhatsAppSummary;
  parentPhone?: string | null;
  className?: string;
}

export function WhatsAppShareButton({
  summary,
  parentPhone,
  className = "",
}: WhatsAppShareButtonProps) {
  const shareUrl = getWhatsAppShareLink(summary, parentPhone ?? undefined);

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm ${className}`}
      title="Bagikan ringkasan laporan ke WhatsApp Orang Tua/Atlet"
    >
      <MessageSquareShare className="h-3.5 w-3.5" />
      Kirim WA
    </a>
  );
}
