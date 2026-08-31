"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingPickerProps {
  label: string;
  description?: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "Perlu Peningkatan",
  2: "Cukup",
  3: "Baik",
  4: "Sangat Baik",
  5: "Luar Biasa",
};

export function StarRatingPicker({
  label,
  description,
  value,
  onChange,
  disabled = false,
}: StarRatingPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeValue = hovered ?? value;
  const currentLabel = activeValue > 0 ? RATING_LABELS[activeValue] : "Pilih bintang (1–5)";

  return (
    <div className="space-y-1.5 p-3.5 rounded-xl bg-surface-2/50 border border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label className="text-xs font-bold text-foreground block">
          {label} <span className="text-danger">*</span>
        </label>
        <span
          className={`text-[11px] font-semibold transition-colors ${
            activeValue > 0 ? "text-amber-600 font-medium" : "text-muted"
          }`}
        >
          {currentLabel}
        </span>
      </div>

      {description && (
        <p className="text-[11px] text-muted leading-relaxed">
          {description}
        </p>
      )}

      {/* Star Touch-Friendly Buttons (Min 44px touch area) */}
      <div className="flex items-center gap-1 sm:gap-1.5 pt-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= activeValue;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={disabled}
              onClick={() => onChange(starIndex)}
              onMouseEnter={() => setHovered(starIndex)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${label}: ${starIndex} dari 5 bintang (${RATING_LABELS[starIndex]})`}
              className={`min-w-[44px] min-h-[44px] p-2 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isFilled
                  ? "text-amber-400 hover:scale-110"
                  : "text-slate-300 hover:text-amber-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer active:scale-95"}`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  isFilled ? "fill-amber-400 text-amber-400 drop-shadow-xs" : "text-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
