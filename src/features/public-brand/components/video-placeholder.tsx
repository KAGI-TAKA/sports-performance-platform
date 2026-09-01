import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoPlaceholderProps {
  identifier: string;
  posterSrc?: string;
  posterAlt?: string;
  aspectRatio?: "video" | "wide" | "square" | "portrait";
  title?: string;
  subtitle?: string;
  className?: string;
}

export function VideoPlaceholder({
  identifier,
  posterSrc,
  posterAlt = "Training Video Preview",
  aspectRatio = "video",
  title = "VIDEO PLACEHOLDER",
  subtitle = "Replace with final athletic training footage",
  className = "",
}: VideoPlaceholderProps) {
  const aspectClasses = {
    video: "aspect-video",
    wide: "aspect-[21/9]",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
  };

  return (
    <div
      data-video-placeholder={identifier}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-neutral-950 text-white shadow-xl ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Poster Image Background */}
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt={posterAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
          priority={identifier === "hero"}
        />
      ) : (
        <div className="absolute inset-0 bg-radial from-slate-900 via-neutral-950 to-black" />
      )}

      {/* Cinematic Dark Navy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/30 transition-opacity duration-300 group-hover:opacity-75" />

      {/* Play Icon Trigger Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 ring-4 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500">
          <Play className="h-6 w-6 fill-white text-white ml-0.5" />
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/30 opacity-75 pointer-events-none" />
        </div>

        {/* Video Identifier Badge & Subtitle */}
        <div className="space-y-1 max-w-sm">
          <span className="inline-block rounded-full bg-white/10 backdrop-blur-md px-3 py-0.5 text-[10px] font-mono font-bold tracking-widest text-blue-300 uppercase border border-white/15">
            {title}
          </span>
          <p className="text-[11px] sm:text-xs text-neutral-300 font-medium leading-relaxed drop-shadow-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
