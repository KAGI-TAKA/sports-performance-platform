"use client";

import * as React from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight, Video, X } from "lucide-react";

interface ReelItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  imageSrc: string;
  videoSrc: string;
  description: string;
}

export function TrainingReelCarousel() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [activeReel, setActiveReel] = React.useState<ReelItem | null>(null);

  const reels: ReelItem[] = [
    {
      id: "reel-1",
      title: "Acceleration & Sprint Mechanics",
      category: "Youth Athlete Performance",
      duration: "0:25",
      imageSrc: "/images/landing/reels/reel-1.jpg",
      videoSrc: "/videos/landing/training-video-1.mp4",
      description: "Observasi teknik akselerasi awal, efisiensi frekuensi langkah, dan reaksi cepat atlet muda di lapangan.",
    },
    {
      id: "reel-2",
      title: "Deceleration & Landing Control",
      category: "Movement Quality",
      duration: "0:30",
      imageSrc: "/images/landing/reels/reel-2.jpg",
      videoSrc: "/videos/landing/training-video-2.mp4",
      description: "Mekanika pengereman aman, single-leg control, dan stabilitas pendaratan untuk pencegahan cedera.",
    },
    {
      id: "reel-3",
      title: "Multilateral Literacy & Coordination",
      category: "Fundamental Movement",
      duration: "0:20",
      imageSrc: "/images/landing/reels/reel-3.jpg",
      videoSrc: "/videos/landing/training-video-3.mp4",
      description: "Eksplorasi gerak melempar, menangkap, kelincahan, dan keseimbangan dinamis anak usia pertumbuhan.",
    },
    {
      id: "reel-4",
      title: "Agility & Dynamic Balance",
      category: "Field Performance",
      duration: "0:28",
      imageSrc: "/images/landing/reels/reel-4.jpg",
      videoSrc: "/videos/landing/training-video-4.mp4",
      description: "Latihan kelincahan reaksi multi-arah, kontrol tubuh, dan sinkronisasi gerak atlet.",
    },
    {
      id: "reel-5",
      title: "Physical Literacy Drills",
      category: "Physical Literacy",
      duration: "0:22",
      imageSrc: "/images/landing/reels/reel-5.jpg",
      videoSrc: "/videos/landing/training-video-1.mp4",
      description: "Membangun postur tubuh stabil, kekuatan fungsional, dan keseimbangan dinamis.",
    },
    {
      id: "reel-6",
      title: "Coach-Athlete Mentorship",
      category: "Mentorship",
      duration: "0:24",
      imageSrc: "/images/landing/reels/reel-6.jpg",
      videoSrc: "/videos/landing/training-video-2.mp4",
      description: "Interaksi positif, bimbingan teknik presisi, dan arahan latihan personal langsung dari Coach Zulfi.",
    },
  ];

  const checkScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-[#0A101D] text-white relative overflow-hidden border-b border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Header with Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 border border-blue-800/60 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
              <Video className="h-3.5 w-3.5 text-blue-400" />
              <span>Training In Action • Dokumentasi Lapangan</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              DOKUMENTASI SESI &amp; KUALITAS GERAK
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Klik reel untuk memutar cuplikan video latihan fisik dan suasana pembinaan di lapangan bersama Coach Zulfi.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition cursor-pointer shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition cursor-pointer shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Reel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="group relative flex-none w-[280px] sm:w-[320px] aspect-[9/14] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 snap-start shadow-xl cursor-pointer hover:border-blue-500/80 hover:shadow-2xl hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-1.5"
            >
              {/* Background Reel Image */}
              <Image
                src={reel.imageSrc}
                alt={reel.title}
                fill
                sizes="320px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              {/* Top Reel Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 border border-blue-500/30 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {reel.category}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  {reel.duration}
                </span>
              </div>

              {/* Center Play Button with Pulse Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                  <Play className="h-6 w-6 ml-0.5 fill-white" />
                </div>
              </div>

              {/* Bottom Information */}
              <div className="absolute bottom-5 left-5 right-5 space-y-1.5 text-left">
                <div className="text-[10px] font-mono font-semibold text-slate-400">
                  REEL 0{idx + 1}
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug group-hover:text-blue-300 transition-colors">
                  {reel.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                  {reel.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
          <span>← Geser ke kiri/kanan untuk reel lainnya →</span>
        </div>
      </div>

      {/* Real Video Player Modal */}
      {activeReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveReel(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                  {activeReel.category}
                </span>
                <h4 className="font-display font-bold text-base sm:text-lg text-white">
                  {activeReel.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveReel(null)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Tutup video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Native HTML5 Video Player */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              <video
                src={activeReel.videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeReel.description}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
