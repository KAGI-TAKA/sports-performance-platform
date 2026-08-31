"use client";

import type { CoachGuidanceItem } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Pin,
  ExternalLink,
  Calendar,
  User,
  Heart,
  MessageCircle,
  FileText,
} from "lucide-react";

interface GuidanceFeedProps {
  guidances: CoachGuidanceItem[];
  emptyMessage?: string;
}

const CATEGORY_BADGES: Record<
  string,
  { label: string; color: "success" | "accent" | "warning" | "danger" | "outline"; icon: string }
> = {
  NUTRISI: { label: "Nutrisi & Hidrasi", color: "success", icon: "🍎" },
  LATIHAN_MANDIRI: { label: "Latihan Mandiri", color: "accent", icon: "🏃" },
  PENGUMUMAN: { label: "Pengumuman", color: "warning", icon: "📢" },
  KESEHATAN: { label: "Pemulihan & Cedera", color: "danger", icon: "🩹" },
  MOTIVASI: { label: "Motivasi Atlet", color: "accent", icon: "🔥" },
};

export function GuidanceFeed({
  guidances,
  emptyMessage = "Belum ada berita atau saran informasi terbaru dari Coach Zulfi.",
}: GuidanceFeedProps) {
  if (guidances.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center space-y-2">
        <Sparkles className="h-8 w-8 text-muted mx-auto" />
        <h4 className="font-bold text-sm text-foreground">Belum Ada Informasi Baru</h4>
        <p className="text-xs text-muted max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guidances.map((item) => {
        const cat = CATEGORY_BADGES[item.category] || {
          label: item.category,
          color: "accent",
          icon: "💡",
        };

        return (
          <article
            key={item.id}
            className={`rounded-2xl border bg-white p-5 shadow-xs transition-all space-y-3.5 ${
              item.isPinned
                ? "border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/20"
                : "border-border hover:border-indigo-300"
            }`}
          >
            {/* Post Header: Category & Date */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={cat.color} className="text-[10px] font-bold">
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </Badge>

                {item.athleteName && (
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    Khusus untuk {item.athleteName}
                  </span>
                )}

                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Pin className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Disematkan
                  </span>
                )}
              </div>

              <span className="text-[11px] text-muted flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Post Title */}
            <h3 className="font-display text-base font-bold text-foreground leading-snug">
              {item.title}
            </h3>

            {/* Post Body Content */}
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {item.content}
            </div>

            {/* External Link or Media (if provided) */}
            {item.linkUrl && (
              <div className="pt-2">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border px-3 py-1.5 text-xs font-semibold text-indigo-600 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka Link / Video Referensi</span>
                </a>
              </div>
            )}

            {/* Post Footer: Author */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-indigo-600" />
                Penulis: <strong className="text-foreground">{item.authorName}</strong>
              </span>

              <span className="text-[10px] text-indigo-500 font-semibold">
                Official Coach Zulfi Guide
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
