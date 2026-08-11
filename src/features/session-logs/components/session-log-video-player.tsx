"use client";

import { Video, ExternalLink } from "lucide-react";

export function SessionLogVideoPlayer({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) return null;

  // Check if YouTube link
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  let embedUrl = videoUrl;

  if (isYouTube) {
    let videoId = "";
    if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] ?? "";
    } else if (videoUrl.includes("watch?v=")) {
      videoId = videoUrl.split("watch?v=")[1]?.split("&")[0] ?? "";
    }
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return (
    <div className="mt-2.5 rounded-lg border border-border bg-black/40 overflow-hidden">
      {isYouTube ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="Video Rekaman Latihan"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent truncate">
            <Video className="h-4 w-4 shrink-0" />
            <span className="truncate">Rekaman Video Latihan</span>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-accent/10 border border-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20 transition shrink-0"
          >
            Buka Video
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
